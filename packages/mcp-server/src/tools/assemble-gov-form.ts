/**
 * assemble_gov_form tool — assembles a complete single-page HTML application
 * from a GovFormResult.
 *
 * Outputs one self-contained HTML file with:
 * - All pages (intro, hub, chapters, review, confirmation)
 * - Hash-based routing to show/hide pages
 * - Task list status tracking
 * - Review page auto-populated from form data
 * - Select/combobox options populated on init
 * - Session persistence via civ-form persist
 * - Submit handler skeleton
 */

import { escapeHtml } from './html-utils.js';
import { generateGovForm } from './generate-gov-form.js';

export interface AssembleResult {
  /** HTML output (when format is 'html'). */
  html?: string;
  /** React TSX files (when format is 'react'). */
  files?: Array<{ path: string; content: string }>;
  /** File path where the HTML was saved for preview (html format only). */
  previewPath?: string;
  pageCount: number;
  features: string[];
}

/**
 * Assemble a complete form application from a form number.
 */
export async function assembleGovForm(formNumber: string, options?: {
  /** Output format: 'html' (single HTML file) or 'react' (TSX components). */
  format?: 'html' | 'react';
  /** Base URL for CivUI assets. Defaults to unpkg CDN. */
  cdnBase?: string;
  /** API endpoint for form submission. */
  submitAction?: string;
  /** Write HTML to a temp file and return the path for browser preview. */
  preview?: boolean;
}): Promise<AssembleResult> {
  const format = options?.format || 'html';

  if (format === 'react') {
    return assembleReactForm(formNumber, options);
  }

  const result = await generateGovForm(formNumber);
  const cdnBase = options?.cdnBase || 'https://unpkg.com/@civui';
  const submitAction = options?.submitAction || '/api/submit';

  // Build complex features HTML if present
  const complexHtml = buildComplexFeaturesHtml(result.complex);

  const allPages = [
    { id: 'intro', html: result.pages.intro.html },
    { id: 'hub', html: result.taskListHub.html + complexHtml.hubInsert },
    ...result.pages.chapters.map(ch => ({ id: ch.id, html: complexHtml.chapterWrap(ch.id, ch.html) })),
    { id: 'review', html: result.pages.review.html },
    { id: 'confirmation', html: result.pages.confirmation.html },
  ];

  const pageCount = allPages.length;

  // Collect chapter-level JavaScript (field stepping, etc.)
  const chapterJs = result.pages.chapters
    .filter(ch => ch.javascript)
    .map(ch => ch.javascript)
    .join('\n\n');

  const pagesHtml = allPages
    .map(p => `    <section data-page="${escapeHtml(p.id)}" ${p.id !== 'intro' ? 'hidden' : ''}>\n${p.html}\n    </section>`)
    .join('\n\n');

  const chapterIds = result.pages.chapters.map(ch => `'${ch.id}'`).join(', ');
  const chapterHeadings = result.pages.chapters
    .map(ch => `    '${ch.id}': '${escapeHtml(ch.heading)}'`)
    .join(',\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(result.title)} | VA Form ${escapeHtml(result.formNumber)}</title>

  <!-- CivUI Design System -->
  <link rel="stylesheet" href="${cdnBase}/core/dist/styles/civ.css">
  <script type="module" src="${cdnBase}/core/dist/index.js"></script>
  <script type="module" src="${cdnBase}/forms/dist/index.js"></script>
  <script type="module" src="${cdnBase}/ui/dist/index.js"></script>
  <script type="module" src="${cdnBase}/navigation/dist/index.js"></script>
  <script type="module" src="${cdnBase}/feedback/dist/index.js"></script>
</head>
<body>
  <main id="main-content" class="civ-p-6" style="max-width: 720px; margin: 0 auto;">

${pagesHtml}

  </main>

  <script>
    // ── Page Router ──────────────────────────────────────────────
    const CHAPTERS = [${chapterIds}];
    const CHAPTER_HEADINGS = {
${chapterHeadings}
    };

    const completedChapters = new Set();
    let currentPage = 'intro';

    function showPage(pageId) {
      document.querySelectorAll('[data-page]').forEach(el => {
        el.hidden = el.dataset.page !== pageId;
      });
      currentPage = pageId;
      window.scrollTo(0, 0);

      // Update URL hash
      if (pageId !== 'intro') {
        history.replaceState(null, '', '#/' + pageId);
      } else {
        history.replaceState(null, '', location.pathname);
      }
    }

    // Handle hash navigation
    function handleHash() {
      const hash = location.hash.replace('#/', '');
      if (hash && document.querySelector('[data-page="' + hash + '"]')) {
        showPage(hash);
      }
    }
    window.addEventListener('hashchange', handleHash);
    if (location.hash) handleHash();

    // ── Navigation Button Wiring ─────────────────────────────────

    // "Start your application" button on intro page
    document.querySelector('[data-page="intro"] civ-button')?.addEventListener('click', () => {
      showPage('hub');
    });

    // "Back to task list" links — inside wizards and standalone
    document.querySelectorAll('civ-link[variant="back"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('hub')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showPage('hub');
        });
      }
    });

    // Task list — navigate when clicking a task
    document.querySelectorAll('civ-task').forEach(task => {
      task.addEventListener('click', (e) => {
        const chapterId = task.getAttribute('data-chapter-id');
        const status = task.getAttribute('status');
        if (chapterId && status !== 'cannot-start') {
          e.preventDefault();
          showPage(chapterId);
        }
      });
    });

    // Chapter completion — listen for civ-form-step complete events
    document.querySelectorAll('[data-chapter]').forEach(chapter => {
      const chapterId = chapter.dataset.chapter;

      // civ-form-step fires civ-step-complete when all steps pass validation
      const wizard = chapter.querySelector('civ-form-step');
      if (wizard) {
        wizard.addEventListener('civ-step-complete', () => {
          completedChapters.add(chapterId);
          updateTaskList();
          showPage('hub');
        });
      }

      // Repeatable sections (no wizard) — use Save and continue button
      if (!wizard) {
        chapter.querySelectorAll('civ-button').forEach(btn => {
          const label = btn.getAttribute('label') || '';
          if (label === 'Save and continue') {
            btn.addEventListener('click', () => {
              completedChapters.add(chapterId);
              updateTaskList();
              showPage('hub');
            });
          }
        });
      }
    });

    // Review page buttons
    const reviewPage = document.querySelector('[data-chapter="review-submit"]');
    if (reviewPage) {
      const reviewBtns = reviewPage.querySelectorAll('civ-button');
      reviewBtns.forEach(btn => {
        const label = btn.getAttribute('label') || '';
        if (label === 'Back') {
          btn.addEventListener('click', () => showPage('hub'));
        }
        if (label === 'Submit application') {
          btn.addEventListener('click', () => handleSubmit());
        }
      });
    }

    // ── Task List Status Tracking ────────────────────────────────

    function updateTaskList() {
      const totalChapters = CHAPTERS.length;
      let doneCount = 0;
      let nextUnlocked = false;

      // Update each chapter task by data-chapter-id
      CHAPTERS.forEach(chapterId => {
        const task = document.querySelector('civ-task[data-chapter-id="' + chapterId + '"]');
        if (!task) return;

        if (completedChapters.has(chapterId)) {
          task.setAttribute('status', 'complete');
          task.setAttribute('href', '#/' + chapterId);
          doneCount++;
        } else if (!nextUnlocked) {
          task.setAttribute('status', 'not-started');
          task.setAttribute('href', '#/' + chapterId);
          nextUnlocked = true;
        } else {
          task.setAttribute('status', 'cannot-start');
          task.removeAttribute('href');
        }
      });

      // Update review task (last task, no data-chapter-id)
      const reviewTask = document.querySelector('civ-task:not([data-chapter-id])');
      if (reviewTask) {
        if (doneCount >= totalChapters) {
          reviewTask.setAttribute('status', 'not-started');
          reviewTask.setAttribute('href', '#/review');
        } else {
          reviewTask.setAttribute('status', 'cannot-start');
          reviewTask.removeAttribute('href');
        }
      }

      // Update progress bar
      const progressBar = document.querySelector('civ-progress-bar');
      if (progressBar) {
        const pct = Math.round((doneCount / totalChapters) * 100);
        progressBar.setAttribute('value', String(pct));
        progressBar.setAttribute('status', doneCount + ' of ' + totalChapters + ' sections complete');
      }
    }

    // ── Review Page Population ────────────────────────────────────

    function populateReview() {
      const summary = document.querySelector('[data-va-review]');
      if (!summary) return;

      const sections = CHAPTERS.map(id => {
        const chapter = document.querySelector('[data-chapter="' + id + '"]');
        if (!chapter) return null;

        const items = [];
        const fields = chapter.querySelectorAll('[data-civ-form-field]');
        fields.forEach(field => {
          const label = field.getAttribute('label') || field.getAttribute('legend') || '';
          const value = field.value || '';
          if (label && value) {
            items.push({ label, value: String(value) });
          }
        });

        return {
          heading: CHAPTER_HEADINGS[id] || id,
          editHref: '#/' + id,
          items: items.length > 0 ? items : [{ label: 'Status', value: completedChapters.has(id) ? 'Complete' : 'Not started' }]
        };
      }).filter(Boolean);

      summary.sections = sections;
    }

    // Populate review when navigating to it
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-chapter="review-submit"]')?.parentElement?.hidden) {
        populateReview();
      }
    });
    const reviewSection = document.querySelector('[data-page="review"]');
    if (reviewSection) {
      observer.observe(reviewSection, { attributes: true, attributeFilter: ['hidden'] });
    }

    ${complexHtml.script}

    // ── Form Submission ──────────────────────────────────────────

    async function handleSubmit() {
      // Collect all form data
      const formData = {};
      document.querySelectorAll('[data-civ-form-field]').forEach(field => {
        const name = field.getAttribute('name');
        const value = field.value;
        if (name && value) formData[name] = value;
      });

      try {
        const response = await fetch('${submitAction}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showPage('confirmation');
        } else {
          alert('Submission failed. Please try again.');
        }
      } catch (err) {
        // For demo/development: show confirmation anyway
        showPage('confirmation');
      }
    }

    // ── Chapter Field Stepping ──────────────────────────────────
    ${chapterJs}
  </script>
</body>
</html>`;

  let previewPath: string | undefined;

  if (options?.preview) {
    const { writeFileSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    const filename = `civui-${result.formNumber.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    previewPath = join(tmpdir(), filename);
    writeFileSync(previewPath, html, 'utf-8');
  }

  return {
    html,
    previewPath,
    pageCount,
    features: [...result.features, 'single-page-app', 'hash-routing', 'auto-persist'],
  };
}

/**
 * Assemble a React (TSX) multi-page form application.
 *
 * Uses the same generated HTML as the HTML format, rendered via
 * dangerouslySetInnerHTML. CivUI web components work as custom elements
 * in React — the wizard, validation, and progress are all handled by
 * the components themselves. React manages page routing and task state.
 */
async function assembleReactForm(formNumber: string, options?: {
  cdnBase?: string;
  submitAction?: string;
}): Promise<AssembleResult> {
  const result = await generateGovForm(formNumber);
  const submitAction = options?.submitAction || '/api/submit';
  const chapters = result.pages.chapters;
  const chapterIds = chapters.map(ch => `'${ch.id}'`).join(', ');

  const chapterImports = chapters
    .map(ch => `import ${toPascal(ch.id)}Chapter from './chapters/${toPascal(ch.id)}';`)
    .join('\n');

  const chapterRoutes = chapters
    .map(ch => `        {currentPage === '${ch.id}' && <${toPascal(ch.id)}Chapter onBack={() => navigate('hub')} onComplete={() => completeChapter('${ch.id}')} />}`)
    .join('\n');

  // Main App component
  const appTsx = `import React, { useState, useCallback, useMemo } from 'react';
${chapterImports}
import IntroPage from './pages/IntroPage';
import ReviewPage from './pages/ReviewPage';
import ConfirmationPage from './pages/ConfirmationPage';

import '@civui/core';
import '@civui/forms';
import '@civui/ui';
import '@civui/navigation';
import '@civui/feedback';
import '@civui/core/styles/civ.css';

const CHAPTERS = [${chapterIds}] as const;
type ChapterId = typeof CHAPTERS[number];
type PageId = 'intro' | 'hub' | ChapterId | 'review' | 'confirmation';

export default function ${toPascal(formNumber)}App() {
  const [currentPage, setCurrentPage] = useState<PageId>('intro');
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const navigate = useCallback((page: PageId) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const completeChapter = useCallback((id: string) => {
    setCompleted(prev => new Set(prev).add(id));
    navigate('hub');
  }, [navigate]);

  // Sequential unlocking: first incomplete chapter is active, rest locked
  const chapterStatus = useCallback((id: string, index: number): string => {
    if (completed.has(id)) return 'complete';
    // First incomplete chapter
    const firstIncomplete = CHAPTERS.findIndex(c => !completed.has(c));
    if (index === firstIncomplete) return 'not-started';
    return 'cannot-start';
  }, [completed]);

  const canNavigate = useCallback((id: string): boolean => {
    if (completed.has(id)) return true;
    const firstIncomplete = CHAPTERS.findIndex(c => !completed.has(c));
    return CHAPTERS[firstIncomplete] === id;
  }, [completed]);

  const allComplete = completed.size >= CHAPTERS.length;
  const progress = Math.round((completed.size / CHAPTERS.length) * 100);

  const handleSubmit = useCallback(async () => {
    try {
      const formData: Record<string, any> = {};
      document.querySelectorAll('[data-civ-form-field]').forEach((field: any) => {
        if (field.name && field.value) formData[field.name] = field.value;
      });
      await fetch('${submitAction}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch { /* demo mode */ }
    navigate('confirmation');
  }, [navigate]);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      {currentPage === 'intro' && (
        <IntroPage onStart={() => navigate('hub')} />
      )}

      {currentPage === 'hub' && (
        <div>
          <civ-page-header>
            <h1 data-heading className="civ-heading-xl">${escapeHtml(result.title)}</h1>
            <span data-subheading>VA Form ${escapeHtml(result.formNumber)}</span>
          </civ-page-header>

          <civ-progress-bar
            value={progress}
            label="Application progress"
            status={\`\${completed.size} of ${chapters.length} sections complete\`}
          />

          <civ-task-list>
            <civ-task-group>
              <h3 data-task-group-heading className="civ-heading-md">Fill out your application</h3>
${chapters.map((ch, i) => `              <civ-task
                label="${escapeHtml(ch.heading)}"
                hint="${escapeHtml((ch as any).hint || '')}"
                href={canNavigate('${ch.id}') ? '#/${ch.id}' : undefined}
                status={chapterStatus('${ch.id}', ${i})}
                onClick={() => canNavigate('${ch.id}') && navigate('${ch.id}')}
              />`).join('\n')}
            </civ-task-group>
            <civ-task-group>
              <h3 data-task-group-heading className="civ-heading-md">Review and submit</h3>
              <civ-task
                label="Review your application"
                hint={allComplete ? '' : 'Complete all sections before reviewing'}
                status={allComplete ? 'not-started' : 'cannot-start'}
                href={allComplete ? '#/review' : undefined}
                onClick={() => allComplete && navigate('review')}
              />
            </civ-task-group>
          </civ-task-list>
        </div>
      )}

${chapterRoutes}

      {currentPage === 'review' && (
        <ReviewPage onBack={() => navigate('hub')} onSubmit={handleSubmit} />
      )}

      {currentPage === 'confirmation' && (
        <ConfirmationPage />
      )}
    </main>
  );
}
`;

  // Page components — render generated HTML, wire events via ref+useEffect
  const introTsx = `import React, { useRef, useEffect } from 'react';

const HTML = ${JSON.stringify(result.pages.intro.html)};

export default function IntroPage({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const btn = ref.current?.querySelector('civ-button');
    if (!btn) return;
    const handler = () => onStart();
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, [onStart]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
`;

  // Chapters — civ-form-step handles stepping/validation, we just listen for complete
  const chapterFiles = chapters.map(ch => ({
    path: `src/chapters/${toPascal(ch.id)}.tsx`,
    content: `import React, { useRef, useEffect } from 'react';

const HTML = ${JSON.stringify(ch.html)};

export default function ${toPascal(ch.id)}Chapter({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cleanups: Array<() => void> = [];

    // civ-form-step fires civ-step-complete when all steps validated
    const wizard = ref.current.querySelector('civ-form-step');
    if (wizard) {
      const handler = () => onComplete();
      wizard.addEventListener('civ-step-complete', handler);
      cleanups.push(() => wizard.removeEventListener('civ-step-complete', handler));
    }

    // Back link
    ref.current.querySelectorAll('civ-link[variant="back"]').forEach((link: Element) => {
      const handler = (e: Event) => { e.preventDefault(); onBack(); };
      link.addEventListener('click', handler);
      cleanups.push(() => link.removeEventListener('click', handler));
    });

    return () => cleanups.forEach(fn => fn());
  }, [onBack, onComplete]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
`,
  }));

  const reviewTsx = `import React, { useRef, useEffect } from 'react';

const HTML = ${JSON.stringify(result.pages.review.html)};

export default function ReviewPage({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cleanups: Array<() => void> = [];

    ref.current.querySelectorAll('civ-button').forEach((btn: Element) => {
      const label = btn.getAttribute('label') || '';
      if (label === 'Submit application') {
        const handler = () => onSubmit();
        btn.addEventListener('click', handler);
        cleanups.push(() => btn.removeEventListener('click', handler));
      }
    });

    ref.current.querySelectorAll('civ-link[variant="back"]').forEach((link: Element) => {
      const handler = (e: Event) => { e.preventDefault(); onBack(); };
      link.addEventListener('click', handler);
      cleanups.push(() => link.removeEventListener('click', handler));
    });

    return () => cleanups.forEach(fn => fn());
  }, [onBack, onSubmit]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
`;

  const confirmationTsx = `import React from 'react';

const HTML = ${JSON.stringify(result.pages.confirmation.html)};

export default function ConfirmationPage() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
`;

  const files = [
    { path: `src/${toPascal(formNumber)}App.tsx`, content: appTsx },
    { path: 'src/pages/IntroPage.tsx', content: introTsx },
    ...chapterFiles,
    { path: 'src/pages/ReviewPage.tsx', content: reviewTsx },
    { path: 'src/pages/ConfirmationPage.tsx', content: confirmationTsx },
  ];

  return {
    files,
    pageCount: files.length,
    features: [...result.features, 'react', 'typescript', 'multi-file'],
  };
}

/**
 * Build HTML fragments from complex form features (workflow, delegation, feedback, lock matrix).
 */
function buildComplexFeaturesHtml(complex?: import('./generate-gov-form.js').GovFormResult['complex']): {
  hubInsert: string;
  chapterWrap: (chapterId: string, html: string) => string;
  script: string;
} {
  if (!complex) {
    return {
      hubInsert: '',
      chapterWrap: (_id, html) => html,
      script: '',
    };
  }

  const hubParts: string[] = [];
  const scriptParts: string[] = [];

  // Workflow status banner goes above the task list in the hub
  if (complex.workflowUi) {
    hubParts.push(`\n  <!-- Workflow Status -->\n  ${complex.workflowUi.html}`);
    scriptParts.push(complex.workflowUi.javascript);
  }

  // Delegation section goes after the task list
  if (complex.delegationHtml) {
    hubParts.push(`\n  <!-- Delegation / Representative -->\n  ${complex.delegationHtml}`);
  }

  // Feedback panel is shown on chapters when in reviewer mode
  let feedbackHtml = '';
  let feedbackJs = '';
  if (complex.feedbackHtml) {
    feedbackHtml = complex.feedbackHtml.html;
    feedbackJs = complex.feedbackHtml.javascript;
    scriptParts.push(feedbackJs);
  }

  // Lock matrix — generate data attributes for role-based visibility
  if (complex.lockMatrix) {
    scriptParts.push(`// Lock matrix summary:\n// ${complex.lockMatrix.summary.replace(/\n/g, '\n// ')}`);
  }

  // Dynamic chapter visibility rules
  if (complex.dynamicChapters && complex.dynamicChapters.length > 0) {
    const rules = complex.dynamicChapters.map(dc =>
      `  { chapterId: '${dc.chapterId}', field: '${dc.showWhen.field}', op: '${dc.showWhen.operator}', value: '${dc.showWhen.value}' }`
    ).join(',\n');
    scriptParts.push(`
    // Dynamic chapter visibility
    const DYNAMIC_CHAPTER_RULES = [
${rules}
    ];
    function applyDynamicChapters() {
      for (const rule of DYNAMIC_CHAPTER_RULES) {
        const field = document.querySelector('[name="' + rule.field + '"]');
        const val = field?.value ?? '';
        let show = false;
        if (rule.op === 'eq') show = val === rule.value;
        else if (rule.op === 'neq') show = val !== rule.value;
        else if (rule.op === 'includes') show = val.includes(rule.value);
        const chapter = document.querySelector('[data-chapter="' + rule.chapterId + '"]');
        if (chapter) chapter.closest('[data-page]').hidden = !show;
        // Also update task list item
        const task = document.querySelector('civ-task[href="#/' + rule.chapterId + '"]');
        if (task) task.hidden = !show;
      }
    }
    document.addEventListener('civ-change', applyDynamicChapters);
    applyDynamicChapters();`);
  }

  return {
    hubInsert: hubParts.join('\n'),
    chapterWrap: (_id: string, html: string) => {
      // Add feedback panel to each chapter if available
      if (feedbackHtml) {
        return html + `\n  <!-- Feedback Panel -->\n  ${feedbackHtml}`;
      }
      return html;
    },
    script: scriptParts.length > 0 ? `\n    // ── Complex Form Features ──────────────────────────────\n    ${scriptParts.join('\n\n    ')}` : '',
  };
}

/** Convert kebab-case or form number to PascalCase. */
function toPascal(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}
