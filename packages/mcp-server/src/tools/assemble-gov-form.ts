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
import type { GovFormResult } from './generate-gov-form.js';

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
    // Combined prefill review (only entered from the signed-in path when
    // there's actual prefill data; the signed-in click hands off to
    // 'hub' directly when there's nothing to confirm).
    { id: 'prefill', html: result.pages.prefill.html },
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
  ${cdnBase === 'local'
    ? `<script type="module" src="../src/civui.ts"></script>`
    : `<link rel="stylesheet" href="${cdnBase}/core/dist/styles/civ.css">
  <script type="module" src="${cdnBase}/core/dist/index.js"></script>
  <script type="module" src="${cdnBase}/inputs/dist/index.js"></script>
  <script type="module" src="${cdnBase}/controls/dist/index.js"></script>
  <script type="module" src="${cdnBase}/compound/dist/index.js"></script>
  <script type="module" src="${cdnBase}/form-patterns/dist/index.js"></script>
  <script type="module" src="${cdnBase}/actions/dist/index.js"></script>
  <script type="module" src="${cdnBase}/overlays/dist/index.js"></script>
  <script type="module" src="${cdnBase}/layout/dist/index.js"></script>
  <script type="module" src="${cdnBase}/navigation/dist/index.js"></script>
  <script type="module" src="${cdnBase}/feedback/dist/index.js"></script>`}
</head>
<body>
  <main id="main-content" class="civ-p-6" style="max-width: 720px; margin: 0 auto;">

${pagesHtml}

  </main>

  <script>
    // Wait for custom elements to be defined before wiring events
    function onReady(fn) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(fn, 100));
      } else {
        setTimeout(fn, 100);
      }
    }
    onReady(function() {
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

    // Intro page — two start paths
    var samplePrefill = {
      fullName: { value: 'Jane M. Doe', source: 'profile', locked: true },
      dateOfBirth: { value: 'March 15, 1985', source: 'profile', locked: true },
      ssn: { value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789', source: 'profile', locked: true },
      homePhone: { value: '(555) 123-4567', source: 'profile' },
      mobilePhone: { value: '(555) 987-6543', source: 'profile' },
      email: { value: 'jane.doe@example.com', source: 'profile' },
      mailingAddress: { value: '123 Main St, Springfield, IL 62701', source: 'profile' },
    };

    // The start buttons render as <a href="#"> so the design system's
    // .civ-btn--link styling underlines the label (visual cue that
    // they navigate). The href is decorative — preventDefault keeps
    // the browser from following it, and our router picks the actual
    // destination from runtime state (prefill data presence).
    document.querySelector('[data-start-signed-in]')?.addEventListener('click', function(e) {
      e.preventDefault();
      // Apply prefill first so the combined review page has content
      // before we route there. If there's nothing to confirm, hand off
      // straight to the hub.
      var hasPrefill = false;
      if (typeof window.civApplyPrefill === 'function') {
        hasPrefill = window.civApplyPrefill(samplePrefill) === true;
      }
      showPage(hasPrefill ? 'prefill' : 'hub');
    });

    document.querySelector('[data-start-guest]')?.addEventListener('click', function(e) {
      e.preventDefault();
      showPage('hub');
    });

    // "Back to task list" links — inside form steps and standalone
    document.querySelectorAll('civ-link[variant="back"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('hub')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showPage('hub');
        });
      }
    });

    // Task list — navigate when clicking a list item
    document.querySelectorAll('civ-list-item[data-chapter-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        const chapterId = item.getAttribute('data-chapter-id');
        if (chapterId && item.hasAttribute('href')) {
          e.preventDefault();
          showPage(chapterId);
        }
      });
    });

    // Chapter completion — listen for civ-form-step complete events
    document.querySelectorAll('[data-chapter]').forEach(chapter => {
      const chapterId = chapter.dataset.chapter;

      // civ-form-step fires civ-step-complete when all steps pass validation
      const formStep = chapter.querySelector('civ-form-step');
      if (formStep) {
        formStep.addEventListener('civ-step-complete', () => {
          completedChapters.add(chapterId);
          updateTaskList();
          showPage('hub');
        });
      }

      // Repeatable sections (no form-step) — use Save and continue button
      if (!formStep) {
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

      // Update each chapter row by data-chapter-id
      CHAPTERS.forEach(chapterId => {
        const item = document.querySelector('civ-list-item[data-chapter-id="' + chapterId + '"]');
        if (!item) return;

        if (completedChapters.has(chapterId)) {
          setItemStatus(item, 'complete', '#/' + chapterId);
          doneCount++;
        } else if (!nextUnlocked) {
          setItemStatus(item, 'not-started', '#/' + chapterId);
          nextUnlocked = true;
        } else {
          setItemStatus(item, 'cannot-start', null);
        }
      });

      // Update review row (marked with data-review)
      const reviewItem = document.querySelector('civ-list-item[data-review]');
      if (reviewItem) {
        if (doneCount >= totalChapters) {
          setItemStatus(reviewItem, 'not-started', '#/review');
        } else {
          setItemStatus(reviewItem, 'cannot-start', null);
        }
      }

      // Update progress bar
      const progressBar = document.querySelector('civ-progress-percent');
      if (progressBar) {
        const pct = Math.round((doneCount / totalChapters) * 100);
        progressBar.setAttribute('value', String(pct));
        progressBar.setAttribute('status', doneCount + ' of ' + totalChapters + ' sections complete');
      }
    }

    const TASK_STATUS_MAP = {
      'not-started': { label: 'Not started', variant: 'info', style: 'secondary' },
      'in-progress': { label: 'In progress', variant: 'info', style: 'primary' },
      'complete': { label: 'Complete', variant: 'success', style: 'primary' },
      'cannot-start': { label: 'Cannot start yet', variant: 'neutral', style: 'secondary' },
      'error': { label: 'Has errors', variant: 'error', style: 'secondary' },
      'review': { label: 'Needs review', variant: 'warning', style: 'primary' },
    };

    function setItemStatus(item, status, href) {
      const badge = item.querySelector('civ-badge');
      const def = TASK_STATUS_MAP[status];
      if (badge && def) {
        badge.setAttribute('label', def.label);
        badge.setAttribute('variant', def.variant);
        badge.setAttribute('badge-style', def.style);
      }
      if (href) {
        item.setAttribute('href', href);
      } else {
        item.removeAttribute('href');
      }
      // The chevron icon in the start slot is hidden on every row by
      // default — only the row marked data-task-active shows it.
      // "Not started" is the single next-up task: in chapter rows it's
      // the first incomplete chapter, in the review row it's the
      // ready-to-review state once every chapter is complete.
      if (status === 'not-started') {
        item.setAttribute('data-task-active', '');
      } else {
        item.removeAttribute('data-task-active');
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

    // ── Prefill Support ────────────────────────────────────────────

    /**
     * Apply prefill data to the form. Sets prefillData on civ-form
     * elements (which handle field values and locked state), populates
     * each chapter's prefill-review (for partial-prefill chapters the
     * user later opens from the hub), and aggregates the data into the
     * combined prefill page that the signed-in entry routes to.
     *
     * Returns true when there was at least one prefilled field, so the
     * caller can route to the combined page; false means "nothing to
     * confirm, send the user straight to the hub."
     *
     * @param {Record<string, {value: string, source: string, locked?: boolean}>} prefillData
     * @returns {boolean}
     */
    window.civApplyPrefill = function(prefillData) {
      if (!prefillData || Object.keys(prefillData).length === 0) return false;

      // Delegate field value setting to civ-form components
      document.querySelectorAll('civ-form').forEach(function(form) {
        form.prefillData = prefillData;
      });

      // Aggregated sections for the combined prefill review page. Each
      // entry maps one chapter to its list of prefilled label/value
      // pairs, plus whether that chapter is fully prefilled (in which
      // case the combined Continue button marks it Complete).
      var combinedSections = [];
      var fullyPrefilledChapterIds = [];

      // Populate per-chapter prefill review summaries (still shown when
      // the user opens a chapter directly from the hub, e.g. a partial
      // chapter that needs the form steps).
      document.querySelectorAll('[data-prefill-review]').forEach(function(review) {
        var chapterFieldNames = (review.getAttribute('data-chapter-fields') || '').split(',').filter(Boolean);
        var prefillItems = [];

        chapterFieldNames.forEach(function(name) {
          var pf = prefillData[name];
          if (!pf || !pf.value) return;
          var chapter = review.closest('[data-chapter]');
          var formField = chapter && (chapter.querySelector('[data-civ-form-field][name="' + name + '"]'));
          var label = formField ? (formField.getAttribute('label') || formField.getAttribute('legend') || name) : name;
          var chapterId = chapter ? chapter.getAttribute('data-chapter') : '';
          prefillItems.push({ label: label, value: String(pf.value), editHref: pf.locked ? '' : '#/' + chapterId });
        });

        if (prefillItems.length === 0) return;

        var reviewChapter = review.closest('[data-chapter]');
        var chapterIdForReview = reviewChapter ? reviewChapter.getAttribute('data-chapter') : null;
        var allPrefilled = prefillItems.length === chapterFieldNames.length;
        var allLocked = chapterFieldNames.every(function(n) { return prefillData[n] && prefillData[n].locked; });

        // Per-chapter summary content (in case the user opens this
        // chapter directly). No section-level Edit — every row carries
        // its own editHref above, so the heading + row would otherwise
        // duplicate the same affordance.
        var summary = review.querySelector('[data-prefill-summary]');
        if (summary) {
          summary.sections = [{ heading: '', locked: allLocked, items: prefillItems }];
        }

        // Show per-chapter prefill review, hide form steps.
        review.hidden = false;
        var steps = review.parentElement && review.parentElement.querySelector('[data-chapter-steps]');
        if (steps) steps.hidden = true;

        // Update body copy to match what Continue actually does.
        var hint = review.querySelector('[data-prefill-hint]');
        if (hint) {
          hint.textContent = allPrefilled
            ? 'If this information is accurate, press continue to finish this section.'
            : 'If this information is accurate, press continue to fill out the rest of this section.';
        }

        // Per-chapter Continue: same UX as the combined page for the
        // single-chapter case — full-prefill → mark complete + hub,
        // partial-prefill → form steps for the rest.
        var continueBtn = review.querySelector('[data-prefill-continue]');
        if (continueBtn) {
          continueBtn.addEventListener('click', function() {
            if (allPrefilled && chapterIdForReview) {
              completedChapters.add(chapterIdForReview);
              updateTaskList();
              showPage('hub');
              return;
            }
            review.hidden = true;
            if (steps) steps.hidden = false;
          });
        }

        // Mark the hub row as prefilled for downstream styling.
        var listItem = document.querySelector('civ-list-item[data-chapter-id="' + chapterIdForReview + '"]');
        if (listItem) listItem.setAttribute('data-prefilled', '');

        // Aggregate for the combined page. Heading is the chapter
        // title (from CHAPTER_HEADINGS); per-row Edit links on each
        // item (set above via prefillItems[i].editHref) are the only
        // Edit affordance — no section-heading Edit, so the user
        // sees a single, consistent edit pattern per row rather
        // than redundant heading + row controls.
        var heading = CHAPTER_HEADINGS[chapterIdForReview] || chapterIdForReview;
        combinedSections.push({
          heading: heading,
          locked: allLocked,
          items: prefillItems,
        });
        if (allPrefilled && chapterIdForReview) {
          fullyPrefilledChapterIds.push(chapterIdForReview);
        }
      });

      if (combinedSections.length === 0) return false;

      // Push aggregated data into the combined-prefill page.
      var combinedSummary = document.querySelector('[data-prefill-combined-summary]');
      if (combinedSummary) {
        combinedSummary.sections = combinedSections;
      }

      // Combined Continue: mark every fully-prefilled chapter Complete
      // in one shot, then route the user to the task list. Partial
      // chapters stay Not started — when the user opens one, the
      // per-chapter prefill review surfaces the partial data and the
      // form steps for what's left.
      var combinedContinue = document.querySelector('[data-prefill-combined-continue]');
      if (combinedContinue && !combinedContinue.dataset.civPrefillBound) {
        combinedContinue.dataset.civPrefillBound = '1';
        combinedContinue.addEventListener('click', function() {
          fullyPrefilledChapterIds.forEach(function(id) { completedChapters.add(id); });
          updateTaskList();
          showPage('hub');
        });
      }

      return true;
    };

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
    }); // end onReady
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
 * in React — the form steps, validation, and progress are all handled by
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
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/form-patterns';
import '@civui/actions';
import '@civui/overlays';
import '@civui/layout';
import '@civui/actions';
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

  // Maps a task status to props for <civ-badge>.
  const statusBadgeProps = (status: string) => {
    const map: Record<string, { label: string; variant: string; 'badge-style': string; 'with-icon': boolean }> = {
      'not-started': { label: 'Not started', variant: 'info', 'badge-style': 'secondary', 'with-icon': true },
      'in-progress': { label: 'In progress', variant: 'info', 'badge-style': 'primary', 'with-icon': true },
      'complete': { label: 'Complete', variant: 'success', 'badge-style': 'primary', 'with-icon': true },
      'cannot-start': { label: 'Cannot start yet', variant: 'neutral', 'badge-style': 'secondary', 'with-icon': true },
      'error': { label: 'Has errors', variant: 'error', 'badge-style': 'secondary', 'with-icon': true },
      'review': { label: 'Needs review', variant: 'warning', 'badge-style': 'primary', 'with-icon': true },
    };
    return map[status] || map['not-started'];
  };

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

          <civ-progress-percent
            value={progress}
            label="Application progress"
            status={\`\${completed.size} of ${chapters.length} sections complete\`}
          />

          <h3 className="civ-heading-md civ-mt-6 civ-mb-2">Fill out your application</h3>
          <civ-list dividers>
${chapters.map((ch, i) => `            <civ-list-item
              data-chapter-id="${ch.id}"
              href={canNavigate('${ch.id}') ? '#/${ch.id}' : undefined}
              onClick={() => canNavigate('${ch.id}') && navigate('${ch.id}')}
            >
              <span className="civ-block civ-font-bold">${escapeHtml(ch.heading)}</span>
              <span className="civ-block civ-text-sm civ-text-muted">${escapeHtml((ch as any).hint || '')}</span>
              <civ-badge data-list-item-end {...statusBadgeProps(chapterStatus('${ch.id}', ${i}))} />
            </civ-list-item>`).join('\n')}
          </civ-list>

          <h3 className="civ-heading-md civ-mt-6 civ-mb-2">Review and submit</h3>
          <civ-list dividers>
            <civ-list-item
              data-review
              href={allComplete ? '#/review' : undefined}
              onClick={() => allComplete && navigate('review')}
            >
              <span className="civ-block civ-font-bold">Review your application</span>
              {!allComplete && <span className="civ-block civ-text-sm civ-text-muted">Complete all sections before reviewing</span>}
              <civ-badge data-list-item-end {...statusBadgeProps(allComplete ? 'not-started' : 'cannot-start')} />
            </civ-list-item>
          </civ-list>
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
    const formStep = ref.current.querySelector('civ-form-step');
    if (formStep) {
      const handler = () => onComplete();
      formStep.addEventListener('civ-step-complete', handler);
      cleanups.push(() => formStep.removeEventListener('civ-step-complete', handler));
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
function buildComplexFeaturesHtml(complex?: GovFormResult['complex']): {
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
        const item = document.querySelector('civ-list-item[data-chapter-id="' + rule.chapterId + '"]');
        if (item) item.hidden = !show;
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
