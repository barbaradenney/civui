/**
 * generate_gov_form tool — generates a complete government form from a form number.
 *
 * Composes: intro page → task list hub → chapter pages → review page → confirmation page.
 * Uses shared chapter templates from gov-chapters.ts and form definitions from gov-form-registry.ts.
 */

import { escapeHtml, slugify } from './html-utils.js';
import { getFormDefinition, getFormNumbers } from '../resources/gov-form-registry.js';
import { getChapter, type GovChapterMeta } from '../resources/gov-chapters.js';
import { generateIntroPage } from './generate-intro-page.js';
import type { FormField, FormSchema } from '../schema/index.js';

export interface GovFormPage {
  id: string;
  heading: string;
  html: string;
  javascript: string;
}

export interface GovFormResult {
  formNumber: string;
  title: string;
  pages: {
    intro: { html: string; javascript: string };
    chapters: GovFormPage[];
    review: { html: string; javascript: string };
    confirmation: { html: string; javascript: string };
  };
  taskListHub: { html: string };
  features: string[];
  fieldCount: number;
  chapterCount: number;

  /** Complex form extras (populated when form has workflow/delegation/feedback config). */
  complex?: {
    /** Workflow status banner + transition buttons HTML. */
    workflowUi?: { html: string; javascript: string };
    /** Delegation/representative section HTML. */
    delegationHtml?: string;
    /** Feedback panel HTML (reviewer mode). */
    feedbackHtml?: { html: string; javascript: string };
    /** Role-based permission matrix. */
    lockMatrix?: { summary: string };
    /** Dynamic chapter rules. */
    dynamicChapters?: Array<{ chapterId: string; showWhen: { field: string; operator: string; value: string } }>;
    /** Actor definitions. */
    actors?: Array<{ id: string; label: string }>;
  };
}

/**
 * Generate a complete government form by form number.
 */
export async function generateGovForm(formNumber: string): Promise<GovFormResult> {
  const form = getFormDefinition(formNumber);
  if (!form) {
    const available = getFormNumbers().join(', ');
    throw new Error(`Unknown form: ${formNumber}. Available forms: ${available}`);
  }

  // Resolve chapters: shared + custom, in order
  const resolvedChapters = resolveChapters(form);

  // Generate intro page
  const intro = generateIntroPage(form);

  // Generate chapter pages
  const chapterPages = resolvedChapters
    .filter(ch => ch.id !== 'review-submit')
    .map(ch => generateChapterPage(ch, form));

  // Generate review page
  const review = generateReviewPage(form, resolvedChapters);

  // Generate confirmation page
  const confirmation = generateConfirmationPage(form);

  // Generate task list hub
  const taskListHub = generateTaskListHub(form, resolvedChapters);

  // Count fields
  let fieldCount = 0;
  for (const ch of resolvedChapters) {
    fieldCount += ch.section.fields.length;
  }

  const features = [
    'gov-form',
    'intro-page',
    'task-list-hub',
    'form-steps',
    'review-page',
    'confirmation-page',
    'signature',
  ];
  if (form.eligibility) features.push('eligibility-screener');

  // ── Complex form features ──────────────────────────────
  let complex: GovFormResult['complex'];

  if (form.workflow || form.delegation || form.feedback) {
    complex = {};

    // Build a FormSchema for the existing tools
    const schema = buildFormSchema(form, resolvedChapters);

    if (form.workflow) {
      features.push('workflow', 'multi-actor');
      const { generateWorkflowUi } = await importWorkflowUi();
      const workflowResult = generateWorkflowUi(schema);
      complex.workflowUi = { html: workflowResult.html, javascript: workflowResult.javascript };
    }

    if (form.delegation) {
      features.push('delegation', 'representative');
      const { generateDelegationSections } = await importDelegation();
      const delegationResult = generateDelegationSections(schema);
      complex.delegationHtml = delegationResult.attestationHtml;
    }

    if (form.feedback || form.workflow?.states.some(s => s.allowsFeedback)) {
      features.push('feedback', 'reviewer-comments');
      const { generateFeedbackUi } = await importFeedback();
      const feedbackResult = generateFeedbackUi(schema, { mode: 'reviewer' });
      complex.feedbackHtml = { html: feedbackResult.html, javascript: feedbackResult.javascript };
    }

    if (form.workflow && form.actors) {
      const { generateLockMatrix } = await importLockMatrix();
      const lockResult = generateLockMatrix(schema);
      complex.lockMatrix = { summary: lockResult.summary };
    }

    if (form.dynamicChapters) {
      complex.dynamicChapters = form.dynamicChapters;
    }

    if (form.actors) {
      complex.actors = form.actors;
    }
  }

  return {
    formNumber: form.formNumber,
    title: form.title,
    pages: {
      intro,
      chapters: chapterPages,
      review,
      confirmation,
    },
    taskListHub,
    features,
    fieldCount,
    chapterCount: chapterPages.length,
    complex,
  };
}

/** Resolve shared + custom chapters in correct order. */
function resolveChapters(form: ReturnType<typeof getFormDefinition> & {}): Array<GovChapterMeta & { id: string }> {
  // Start with shared chapters
  const chapters: Array<GovChapterMeta & { id: string }> = form.chapters.map(id => getChapter(id));

  if (!form.customChapters) return chapters;

  // Insert custom chapters by afterChapter reference (handles chaining)
  const remaining = [...form.customChapters];
  let passes = 0;
  while (remaining.length > 0 && passes < 10) {
    passes++;
    const unresolved: typeof remaining = [];

    for (const custom of remaining) {
      if (!custom.afterChapter) {
        // No afterChapter — insert before review-submit
        const reviewIndex = chapters.findIndex(ch => ch.id === 'review-submit');
        const insertAt = reviewIndex >= 0 ? reviewIndex : chapters.length;
        chapters.splice(insertAt, 0, {
          id: custom.id as any,
          heading: custom.heading,
          hint: custom.hint,
          section: custom.section,
        });
      } else {
        const afterIndex = chapters.findIndex(ch => ch.id === custom.afterChapter);
        if (afterIndex >= 0) {
          chapters.splice(afterIndex + 1, 0, {
            id: custom.id as any,
            heading: custom.heading,
            hint: custom.hint,
            section: custom.section,
          });
        } else {
          unresolved.push(custom); // Try again on next pass
        }
      }
    }

    remaining.length = 0;
    remaining.push(...unresolved);
  }

  return chapters;
}

/** Generate HTML for a single chapter page with one field per step. */
function generateChapterPage(chapter: GovChapterMeta, form: ReturnType<typeof getFormDefinition> & {}): GovFormPage {
  const isRepeatable = chapter.section.repeatable;
  const chapterSlug = slugify(chapter.id);
  const formSlug = slugify(form.formNumber);

  // Repeatable sections stay as one page — splitting doesn't make sense
  if (isRepeatable) {
    const fields = chapter.section.fields.map(f => renderField(f)).join('\n');
    const html = `<!-- Chapter: ${escapeHtml(chapter.heading)} -->
<div data-chapter="${escapeHtml(chapter.id)}">
  <nav class="civ-mb-4">
    <civ-link href="#/hub" variant="back" label="Back to task list" class="civ-block"></civ-link>
  </nav>

  <civ-page-header>
    <span data-eyebrow>${escapeHtml(form.title)}</span>
    <h2 data-heading class="civ-heading-lg">${escapeHtml(chapter.heading)}</h2>
    <span data-subheading>VA Form ${escapeHtml(form.formNumber)}</span>
  </civ-page-header>

  <civ-form persist="${formSlug}-${chapterSlug}">
    <civ-repeater
      legend="${escapeHtml(chapter.heading)}"
      name="${chapterSlug}"
      item-label="${chapterSlug.replace(/-/g, ' ')}"
      mode="detail"
      min="${chapter.section.repeatableMin ?? 1}"
      max="${chapter.section.repeatableMax ?? 20}"
    >
${fields}
    </civ-repeater>

    <div class="civ-mt-6">
      <civ-button label="Save and continue"></civ-button>
    </div>
  </civ-form>
</div>`;
    return { id: chapter.id, heading: chapter.heading, html, javascript: '' };
  }

  // One field per step — each field gets its own data-step wrapper
  const fieldSteps = chapter.section.fields.map(f => {
    const fieldHtml = renderField(f);
    // Extract label for step indicator
    let stepLabel = f.label;
    if (f.label.startsWith('component:')) {
      const legendMatch = f.hint?.match(/legend="([^"]+)"/);
      stepLabel = legendMatch ? legendMatch[1] : f.name;
    }
    return `    <div data-step data-step-label="${escapeHtml(stepLabel)}">
${fieldHtml}
    </div>`;
  }).join('\n');

  // Build the list of field names for this chapter (used by prefill JS)
  const fieldNames = chapter.section.fields.map(f => {
    if (f.label.startsWith('component:')) return f.name;
    return f.name;
  });

  const html = `<!-- Chapter: ${escapeHtml(chapter.heading)} -->
<div data-chapter="${escapeHtml(chapter.id)}">
  <civ-link href="#/hub" variant="back" label="Back to task list" class="civ-mb-4 civ-block"></civ-link>

  <civ-page-header>
    <span data-eyebrow>${escapeHtml(form.title)}</span>
    <h2 data-heading class="civ-heading-lg">${escapeHtml(chapter.heading)}</h2>
    <span data-subheading>VA Form ${escapeHtml(form.formNumber)}</span>
  </civ-page-header>

  <!-- Prefill review (hidden by default, shown by runtime JS when prefill data exists) -->
  <div data-prefill-review hidden data-chapter-fields="${fieldNames.join(',')}">
    <civ-alert variant="info" alert-style="secondary" heading="We've prefilled some of your information" label="We pulled this information from your account. If any of this is wrong, you can correct it here."></civ-alert>
    <civ-summary data-prefill-summary></civ-summary>
    <p class="civ-mt-4">If this information is accurate, press continue to fill out the rest of the form.</p>
    <div class="civ-mt-4">
      <civ-button label="Continue" data-prefill-continue></civ-button>
    </div>
  </div>

  <div data-chapter-steps>
    <civ-form-step complete-label="Save and continue">
${fieldSteps}
    </civ-form-step>
  </div>
</div>`;

  const javascript = ''; // No custom JS needed — civ-form-step handles everything

  return {
    id: chapter.id,
    heading: chapter.heading,
    html,
    javascript,
  };
}

/** Render a single form field as CivUI component HTML. */
function renderField(field: FormField): string {
  // Handle compound component markers (self-contained — no wrapping needed)
  if (field.label.startsWith('component:')) {
    const componentTag = field.label.replace('component:', '');
    const props = field.hint?.replace('component-props:', '') || '';
    return `      <${componentTag} name="${escapeHtml(field.name)}" ${props}></${componentTag}>`;
  }

  // Wrapper attributes: label, hint, required, disabled
  const wrapperAttrs = [
    field.hint ? `hint="${escapeHtml(field.hint)}"` : '',
    field.required ? 'required' : '',
  ].filter(Boolean).join(' ');

  // Child attributes: name, autocomplete, inputmode, maxlength, placeholder (NOT label/hint)
  const childAttrs = [
    `name="${escapeHtml(field.name)}"`,
    field.required ? 'required' : '',
    field.autocomplete ? `autocomplete="${escapeHtml(field.autocomplete)}"` : '',
    field.inputmode ? `inputmode="${escapeHtml(field.inputmode)}"` : '',
    field.maxlength ? `maxlength="${field.maxlength}"` : '',
    field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
  ].filter(Boolean).join('\n          ');

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'password':
    case 'search':
    case 'url':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-text-input
          ${childAttrs}
          type="${field.type}"
        ></civ-text-input>
      </civ-form-field>`;

    case 'ssn':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-text-input
          ${childAttrs}
          type="tel"
          mask="ssn"
          validate="ssn"
        ></civ-text-input>
      </civ-form-field>`;

    case 'zip':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-text-input
          ${childAttrs}
          type="tel"
          mask="zip"
          validate="zip"
        ></civ-text-input>
      </civ-form-field>`;

    case 'textarea':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-textarea
          ${childAttrs}
          ${field.rows ? `rows="${field.rows}"` : ''}
        ></civ-textarea>
      </civ-form-field>`;

    case 'select':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-select
          ${childAttrs}
        ></civ-select>
      </civ-form-field>`;

    case 'combobox':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-combobox
          ${childAttrs}
        ></civ-combobox>
      </civ-form-field>`;

    case 'radio': {
      const radioOptions = (field.options || [])
        .map(o => `          <civ-radio label="${escapeHtml(o.label)}" value="${escapeHtml(o.value)}"></civ-radio>`)
        .join('\n');
      return `      <civ-form-fieldset legend="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-radio-group
          name="${escapeHtml(field.name)}"
          ${field.required ? 'required' : ''}
        >
${radioOptions}
        </civ-radio-group>
      </civ-form-fieldset>`;
    }

    case 'checkbox':
      // Standalone checkbox — self-contained, no wrapping needed
      return `      <civ-checkbox
        label="${escapeHtml(field.label)}"
        name="${escapeHtml(field.name)}"
        ${field.required ? 'required' : ''}
      ></civ-checkbox>`;

    case 'checkbox-group': {
      const checkOptions = (field.options || [])
        .map(o => `          <civ-checkbox label="${escapeHtml(o.label)}" value="${escapeHtml(o.value)}"></civ-checkbox>`)
        .join('\n');
      return `      <civ-form-fieldset legend="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-checkbox-group
          name="${escapeHtml(field.name)}"
          ${field.required ? 'required' : ''}
        >
${checkOptions}
        </civ-checkbox-group>
      </civ-form-fieldset>`;
    }

    case 'memorable-date':
      return `      <civ-form-fieldset legend="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-memorable-date
          name="${escapeHtml(field.name)}"
          ${field.required ? 'required' : ''}
        ></civ-memorable-date>
      </civ-form-fieldset>`;

    case 'date':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-date-picker
          ${childAttrs}
        ></civ-date-picker>
      </civ-form-field>`;

    case 'file':
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-file-upload
          ${childAttrs}
          ${field.accept ? `accept="${escapeHtml(field.accept)}"` : ''}
          ${field.multiple ? 'multiple' : ''}
          ${field.maxSize ? `max-size="${field.maxSize}"` : ''}
          ${field.maxFiles ? `max-files="${field.maxFiles}"` : ''}
        ></civ-file-upload>
      </civ-form-field>`;

    case 'toggle':
      // Self-contained — no wrapping needed
      return `      <civ-toggle
        label="${escapeHtml(field.label)}"
        name="${escapeHtml(field.name)}"
        ${field.required ? 'required' : ''}
        ${field.hint ? `hint="${escapeHtml(field.hint)}"` : ''}
      ></civ-toggle>`;

    default:
      return `      <civ-form-field label="${escapeHtml(field.label)}" ${wrapperAttrs}>
        <civ-text-input
          ${childAttrs}
        ></civ-text-input>
      </civ-form-field>`;
  }
}

/** Generate the review page with summary + signature. */
function generateReviewPage(form: ReturnType<typeof getFormDefinition> & {}, chapters: Array<GovChapterMeta>): { html: string; javascript: string } {
  const chapterIds = chapters
    .filter(ch => ch.id !== 'review-submit')
    .map(ch => `    { heading: '${escapeHtml(ch.heading)}', editHref: '#/${slugify(ch.id)}', items: [] }`)
    .join(',\n');

  const html = `<!-- Review Page -->
<div data-chapter="review-submit">
  <civ-link href="#/hub" variant="back" label="Back to task list" class="civ-mb-4 civ-block"></civ-link>

  <civ-page-header>
    <span data-eyebrow>${escapeHtml(form.title)}</span>
    <h2 data-heading class="civ-heading-xl">Review your application</h2>
    <span data-subheading>VA Form ${escapeHtml(form.formNumber)}</span>
  </civ-page-header>

  <civ-summary heading="" data-va-review></civ-summary>

  <civ-signature
    legend="Statement of truth"
    name="signature"
    statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
    required
  ></civ-signature>

  <div class="civ-mt-6">
    <civ-button label="Submit application"></civ-button>
  </div>
</div>`;

  const javascript = `// Review page — populate summary sections from form data
const reviewSummary = document.querySelector('[data-va-review]');
if (reviewSummary) {
  reviewSummary.sections = [
${chapterIds}
  ];
}`;

  return { html, javascript };
}

/** Generate the confirmation page. */
function generateConfirmationPage(form: ReturnType<typeof getFormDefinition> & {}): { html: string; javascript: string } {
  const html = `<!-- Confirmation Page -->
<div data-page="confirmation">
  <civ-page-header>
    <h1 data-heading class="civ-heading-xl">${escapeHtml(form.title)}</h1>
    <span data-subheading>VA Form ${escapeHtml(form.formNumber)}</span>
  </civ-page-header>

  <civ-alert variant="success" heading="We've received your application">
    Confirmation text goes here.
  </civ-alert>

  <p class="civ-text-muted civ-mt-6">Confirmation details go here.</p>
</div>`;

  const javascript = '';

  return { html, javascript };
}

/** Generate the task list hub page. */
function generateTaskListHub(form: ReturnType<typeof getFormDefinition> & {}, chapters: Array<GovChapterMeta>): { html: string } {
  const filteredChapters = chapters.filter(ch => ch.id !== 'review-submit');
  const chapterTasks = filteredChapters
    .map((ch, i) => {
      // Only the first chapter starts as navigable; rest are locked until unlocked
      const href = i === 0 ? ` href="#/${slugify(ch.id)}"` : '';
      const status = i === 0 ? 'not-started' : 'cannot-start';
      return `      <civ-task
        data-chapter-id="${slugify(ch.id)}"
        label="${escapeHtml(ch.heading)}"
        hint="${escapeHtml(ch.hint)}"${href}
        status="${status}"
      ></civ-task>`;
    })
    .join('\n');

  const html = `<!-- Task List Hub -->
<div data-page="hub">
  <civ-page-header>
    <h1 data-heading class="civ-heading-xl">${escapeHtml(form.title)}</h1>
    <span data-subheading>VA Form ${escapeHtml(form.formNumber)}</span>
  </civ-page-header>

  <civ-progress-bar
    value="0"
    label="Application progress"
    status="0 of ${chapters.filter(ch => ch.id !== 'review-submit').length} sections complete"
  ></civ-progress-bar>

  <civ-task-list>
    <civ-task-group>
      <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
${chapterTasks}
    </civ-task-group>

    <civ-task-group>
      <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
      <civ-task
        label="Review your application"
        hint="Complete all sections before reviewing"
        status="cannot-start"
      ></civ-task>
    </civ-task-group>
  </civ-task-list>
</div>`;

  return { html };
}

/** Build a FormSchema from a GovFormDefinition for use with existing tools. */
function buildFormSchema(form: ReturnType<typeof getFormDefinition> & {}, chapters: Array<GovChapterMeta>): FormSchema {
  const schema: FormSchema = {
    title: form.title,
    description: form.description,
    action: '/api/submit',
    method: 'POST',
    sections: chapters.map(ch => ch.section),
  };

  if (form.workflow) {
    (schema as any).workflow = form.workflow;
  }
  if (form.actors) {
    (schema as any).actors = form.actors;
  }
  if (form.delegation) {
    (schema as any).delegation = form.delegation;
  }
  if (form.feedback) {
    (schema as any).feedback = form.feedback;
  }

  return schema;
}

// Dynamic imports for complex form tools (avoids circular deps)
async function importWorkflowUi() {
  return import('./generate-workflow-ui.js');
}
async function importDelegation() {
  return import('./generate-delegation-sections.js');
}
async function importFeedback() {
  return import('./generate-feedback-ui.js');
}
async function importLockMatrix() {
  return import('./generate-lock-matrix.js');
}
