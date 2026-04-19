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
import type { FormField } from '../schema/index.js';

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
}

/**
 * Generate a complete government form by form number.
 */
export function generateGovForm(formNumber: string): GovFormResult {
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

/** Generate HTML for a single chapter page. */
function generateChapterPage(chapter: GovChapterMeta, form: ReturnType<typeof getFormDefinition> & {}): GovFormPage {
  const fields = chapter.section.fields.map(f => renderField(f)).join('\n');
  const isRepeatable = chapter.section.repeatable;

  let body: string;
  if (isRepeatable) {
    body = `    <civ-repeater
      legend="${escapeHtml(chapter.heading)}"
      name="${slugify(chapter.id)}"
      item-label="${slugify(chapter.id).replace(/-/g, ' ')}"
      mode="detail"
      min="${chapter.section.repeatableMin ?? 1}"
      max="${chapter.section.repeatableMax ?? 20}"
    >
${fields}
    </civ-repeater>`;
  } else {
    body = `    <h2 class="civ-heading-lg">${escapeHtml(chapter.heading)}</h2>
${fields}`;
  }

  const html = `<!-- Chapter: ${escapeHtml(chapter.heading)} -->
<div data-chapter="${escapeHtml(chapter.id)}">
  <a href="#/hub" class="civ-link civ-mb-4 civ-block">
    <civ-icon name="arrow-left" size="sm"></civ-icon>
    Back to task list
  </a>

  <civ-form persist="${slugify(form.formNumber)}-${slugify(chapter.id)}">
${body}

    <div class="civ-flex civ-justify-between civ-mt-6">
      <civ-button variant="secondary" label="Back"></civ-button>
      <civ-button label="Save and continue"></civ-button>
    </div>
  </civ-form>
</div>`;

  const javascript = `// Chapter: ${chapter.heading}
// Form persistence is handled by civ-form persist attribute`;

  return {
    id: chapter.id,
    heading: chapter.heading,
    html,
    javascript,
  };
}

/** Render a single form field as CivUI component HTML. */
function renderField(field: FormField): string {
  // Handle compound component markers
  if (field.label.startsWith('component:')) {
    const componentTag = field.label.replace('component:', '');
    const props = field.hint?.replace('component-props:', '') || '';
    return `      <${componentTag} name="${escapeHtml(field.name)}" ${props}></${componentTag}>`;
  }

  const common = [
    `label="${escapeHtml(field.label)}"`,
    `name="${escapeHtml(field.name)}"`,
    field.required ? 'required' : '',
    field.hint ? `hint="${escapeHtml(field.hint)}"` : '',
    field.autocomplete ? `autocomplete="${escapeHtml(field.autocomplete)}"` : '',
    field.inputmode ? `inputmode="${escapeHtml(field.inputmode)}"` : '',
    field.maxlength ? `maxlength="${field.maxlength}"` : '',
    field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
  ].filter(Boolean).join('\n        ');

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'password':
    case 'search':
    case 'url':
      return `      <civ-text-input
        ${common}
        type="${field.type}"
      ></civ-text-input>`;

    case 'ssn':
      return `      <civ-text-input
        ${common}
        type="tel"
        mask="ssn"
        validate="ssn"
      ></civ-text-input>`;

    case 'zip':
      return `      <civ-text-input
        ${common}
        type="tel"
        mask="zip"
        validate="zip"
      ></civ-text-input>`;

    case 'textarea':
      return `      <civ-textarea
        ${common}
        ${field.rows ? `rows="${field.rows}"` : ''}
      ></civ-textarea>`;

    case 'select':
      return `      <civ-select
        ${common}
      ></civ-select>`;

    case 'combobox':
      return `      <civ-combobox
        ${common}
      ></civ-combobox>`;

    case 'radio':
      const radioOptions = (field.options || [])
        .map(o => `        <civ-radio label="${escapeHtml(o.label)}" value="${escapeHtml(o.value)}"></civ-radio>`)
        .join('\n');
      return `      <civ-radio-group
        legend="${escapeHtml(field.label)}"
        name="${escapeHtml(field.name)}"
        ${field.required ? 'required' : ''}
      >
${radioOptions}
      </civ-radio-group>`;

    case 'checkbox':
      return `      <civ-checkbox
        ${common}
      ></civ-checkbox>`;

    case 'checkbox-group':
      const checkOptions = (field.options || [])
        .map(o => `        <civ-checkbox label="${escapeHtml(o.label)}" value="${escapeHtml(o.value)}"></civ-checkbox>`)
        .join('\n');
      return `      <civ-checkbox-group
        legend="${escapeHtml(field.label)}"
        name="${escapeHtml(field.name)}"
        ${field.required ? 'required' : ''}
      >
${checkOptions}
      </civ-checkbox-group>`;

    case 'memorable-date':
      return `      <civ-memorable-date
        legend="${escapeHtml(field.label)}"
        name="${escapeHtml(field.name)}"
        ${field.required ? 'required' : ''}
        ${field.hint ? `hint="${escapeHtml(field.hint)}"` : ''}
      ></civ-memorable-date>`;

    case 'date':
      return `      <civ-date-picker
        ${common}
      ></civ-date-picker>`;

    case 'file':
      return `      <civ-file-upload
        ${common}
        ${field.accept ? `accept="${escapeHtml(field.accept)}"` : ''}
        ${field.multiple ? 'multiple' : ''}
        ${field.maxSize ? `max-size="${field.maxSize}"` : ''}
        ${field.maxFiles ? `max-files="${field.maxFiles}"` : ''}
      ></civ-file-upload>`;

    case 'toggle':
      return `      <civ-toggle
        ${common}
      ></civ-toggle>`;

    default:
      return `      <civ-text-input
        ${common}
      ></civ-text-input>`;
  }
}

/** Generate the review page with summary + signature. */
function generateReviewPage(_form: ReturnType<typeof getFormDefinition> & {}, chapters: Array<GovChapterMeta>): { html: string; javascript: string } {
  const chapterIds = chapters
    .filter(ch => ch.id !== 'review-submit')
    .map(ch => `    { heading: '${escapeHtml(ch.heading)}', editHref: '#/${slugify(ch.id)}', items: [] }`)
    .join(',\n');

  const html = `<!-- Review Page -->
<div data-chapter="review-submit">
  <a href="#/hub" class="civ-link civ-mb-4 civ-block">
    <civ-icon name="arrow-left" size="sm"></civ-icon>
    Back to task list
  </a>

  <h2 class="civ-heading-xl">Review your application</h2>

  <civ-summary heading="" data-va-review></civ-summary>

  <civ-signature
    legend="Statement of truth"
    name="signature"
    statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
    required
  ></civ-signature>

  <div class="civ-flex civ-justify-between civ-mt-6">
    <civ-button variant="secondary" label="Back"></civ-button>
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
  const nextStepsHtml = form.nextSteps
    .map(step => `    <li>${escapeHtml(step)}</li>`)
    .join('\n');

  const html = `<!-- Confirmation Page -->
<div data-page="confirmation">
  <civ-alert variant="success" heading="We've received your application">
    You submitted your ${escapeHtml(form.title.toLowerCase())} application.
    Your confirmation number will be sent to your email address.
  </civ-alert>

  <civ-summary heading="What you submitted" data-va-confirmation></civ-summary>

  <h3 class="civ-heading-md">What happens next</h3>
  <ul class="civ-mb-6">
${nextStepsHtml}
  </ul>

  <civ-button label="Print this page" variant="secondary" onclick="window.print()"></civ-button>

  <civ-divider></civ-divider>

  <h3 class="civ-heading-md">Need help?</h3>
  <p>Call us at <a href="tel:18008271000" class="civ-link">800-827-1000</a>
  (TTY: 711). We're here Monday through Friday, 8:00 a.m. to 9:00 p.m. ET.</p>
</div>`;

  const javascript = `// Confirmation page — populate from submission data`;

  return { html, javascript };
}

/** Generate the task list hub page. */
function generateTaskListHub(form: ReturnType<typeof getFormDefinition> & {}, chapters: Array<GovChapterMeta>): { html: string } {
  const chapterTasks = chapters
    .filter(ch => ch.id !== 'review-submit')
    .map(ch => `      <civ-task
        label="${escapeHtml(ch.heading)}"
        href="#/${slugify(ch.id)}"
        status="not-started"
        hint="${escapeHtml(ch.hint)}"
      ></civ-task>`)
    .join('\n');

  const html = `<!-- Task List Hub -->
<div data-page="hub">
  <h1 class="civ-heading-xl">${escapeHtml(form.title)}</h1>
  <p class="civ-text-muted civ-mb-4">VA Form ${escapeHtml(form.formNumber)}</p>

  <civ-progress-bar
    value="0"
    label="Application progress"
    status="0 of ${chapters.filter(ch => ch.id !== 'review-submit').length} sections complete"
  ></civ-progress-bar>

  <civ-task-list>
    <civ-task-group heading="Fill out your application">
${chapterTasks}
    </civ-task-group>

    <civ-task-group heading="Review and submit">
      <civ-task
        label="Review your application"
        status="cannot-start"
        hint="Complete all sections before reviewing"
      ></civ-task>
    </civ-task-group>
  </civ-task-list>
</div>`;

  return { html };
}
