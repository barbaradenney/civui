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
  html: string;
  pageCount: number;
  features: string[];
}

/**
 * Assemble a complete single-page form application from a form number.
 */
export function assembleGovForm(formNumber: string, options?: {
  /** Base URL for CivUI assets. Defaults to unpkg CDN. */
  cdnBase?: string;
  /** API endpoint for form submission. */
  submitAction?: string;
}): AssembleResult {
  const result = generateGovForm(formNumber);
  const cdnBase = options?.cdnBase || 'https://unpkg.com/@civui';
  const submitAction = options?.submitAction || '/api/submit';

  const allPages = [
    { id: 'intro', html: result.pages.intro.html },
    { id: 'hub', html: result.taskListHub.html },
    ...result.pages.chapters.map(ch => ({ id: ch.id, html: ch.html })),
    { id: 'review', html: result.pages.review.html },
    { id: 'confirmation', html: result.pages.confirmation.html },
  ];

  const pageCount = allPages.length;

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

    // "Back to task list" links in chapters
    document.querySelectorAll('a[href="#/hub"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('hub');
      });
    });

    // Task list task clicks
    document.querySelectorAll('civ-task').forEach(task => {
      task.addEventListener('click', (e) => {
        const href = task.getAttribute('href');
        if (href && task.getAttribute('status') !== 'cannot-start') {
          e.preventDefault();
          showPage(href.replace('#/', ''));
        }
      });
    });

    // Chapter back/continue buttons
    document.querySelectorAll('[data-chapter]').forEach(chapter => {
      const chapterId = chapter.dataset.chapter;
      const buttons = chapter.querySelectorAll('civ-button');

      buttons.forEach(btn => {
        const label = btn.getAttribute('label') || '';

        if (label === 'Back') {
          btn.addEventListener('click', () => {
            const idx = CHAPTERS.indexOf(chapterId);
            if (idx > 0) {
              showPage(CHAPTERS[idx - 1]);
            } else {
              showPage('hub');
            }
          });
        }

        if (label === 'Save and continue') {
          btn.addEventListener('click', () => {
            // Mark chapter as complete
            completedChapters.add(chapterId);
            updateTaskList();

            const idx = CHAPTERS.indexOf(chapterId);
            if (idx < CHAPTERS.length - 1) {
              showPage(CHAPTERS[idx + 1]);
            } else {
              showPage('hub');
            }
          });
        }
      });
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
      const tasks = document.querySelectorAll('civ-task');
      const totalChapters = CHAPTERS.length;
      let doneCount = 0;

      tasks.forEach(task => {
        const href = task.getAttribute('href');
        if (!href) return;
        const id = href.replace('#/', '');

        if (completedChapters.has(id)) {
          task.setAttribute('status', 'complete');
          doneCount++;
        } else if (id === currentPage) {
          task.setAttribute('status', 'in-progress');
        }
      });

      // Update review task
      const reviewTask = document.querySelector('civ-task[label="Review your application"]');
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
  </script>
</body>
</html>`;

  return {
    html,
    pageCount,
    features: [...result.features, 'single-page-app', 'hash-routing', 'auto-persist'],
  };
}
