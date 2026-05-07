/**
 * generate_help_panel tool — contextual help in sidebar, inline, or tooltip modes.
 */
import { escapeHtml } from './html-utils.js';

export interface HelpPanelResult {
  html: string;
  javascript: string;
  features: string[];
  sectionCount: number;
}

interface HelpSection {
  id: string;
  heading: string;
  body: string;
  relatedFields?: string[];
}

function generateSidebar(sections: HelpSection[]): { html: string; js: string } {
  const htmlParts: string[] = [];

  htmlParts.push(
    `<button type="button" data-civ-help-toggle class="civ-px-3 civ-py-1 civ-bg-primary civ-text-white civ-rounded" aria-expanded="false" aria-controls="civ-help-sidebar">Help</button>`,
  );
  htmlParts.push(
    `<aside data-civ-help-panel id="civ-help-sidebar" class="civ-border-s civ-p-4" hidden>`,
  );
  htmlParts.push(`  <h2 class="civ-text-lg civ-font-bold civ-mb-4">Help</h2>`);

  for (const section of sections) {
    htmlParts.push(
      `  <details data-civ-help-section="${escapeHtml(section.id)}">`,
      `    <summary class="civ-font-bold civ-cursor-pointer civ-py-2">${escapeHtml(section.heading)}</summary>`,
      `    <div class="civ-p-2 civ-text-sm">${escapeHtml(section.body)}</div>`,
      `  </details>`,
    );
  }

  htmlParts.push(`</aside>`);

  const jsLines = [
    '  var toggleBtn = document.querySelector("[data-civ-help-toggle]");',
    '  var sidebar = document.getElementById("civ-help-sidebar");',
    '  if (toggleBtn && sidebar) {',
    '    toggleBtn.addEventListener("click", function() {',
    '      var isOpen = sidebar.hidden;',
    '      sidebar.hidden = !isOpen;',
    '      toggleBtn.setAttribute("aria-expanded", String(isOpen));',
    '      if (isOpen) {',
    '        sidebar.dispatchEvent(new CustomEvent("civ-help-open", { bubbles: true }));',
    '      } else {',
    '        sidebar.dispatchEvent(new CustomEvent("civ-help-close", { bubbles: true }));',
    '      }',
    '    });',
    '  }',
  ];

  return { html: htmlParts.join('\n'), js: jsLines.join('\n') };
}

function generateInline(sections: HelpSection[]): { html: string; js: string } {
  const htmlParts: string[] = [];

  for (const section of sections) {
    const linkId = `help-link-${section.id}`;
    const contentId = `help-content-${section.id}`;

    htmlParts.push(
      `<div data-civ-help-inline="${escapeHtml(section.id)}" class="civ-mb-4">`,
      `  <button type="button" id="${escapeHtml(linkId)}" data-civ-help-expand="${escapeHtml(section.id)}" class="civ-text-primary civ-underline civ-text-sm" aria-expanded="false" aria-controls="${escapeHtml(contentId)}">More info: ${escapeHtml(section.heading)}</button>`,
      `  <div id="${escapeHtml(contentId)}" class="civ-p-2 civ-mt-1 civ-bg-info-lighter civ-rounded civ-text-sm" hidden>`,
      `    <p>${escapeHtml(section.body)}</p>`,
      `  </div>`,
      `</div>`,
    );
  }

  const jsLines = [
    '  var expandBtns = document.querySelectorAll("[data-civ-help-expand]");',
    '  for (var i = 0; i < expandBtns.length; i++) {',
    '    expandBtns[i].addEventListener("click", function() {',
    '      var id = this.getAttribute("data-civ-help-expand");',
    '      var content = document.getElementById("help-content-" + id);',
    '      if (!content) return;',
    '      var isOpen = content.hidden;',
    '      content.hidden = !isOpen;',
    '      this.setAttribute("aria-expanded", String(isOpen));',
    '      if (isOpen) {',
    '        content.dispatchEvent(new CustomEvent("civ-help-open", { bubbles: true }));',
    '      } else {',
    '        content.dispatchEvent(new CustomEvent("civ-help-close", { bubbles: true }));',
    '      }',
    '    });',
    '  }',
  ];

  return { html: htmlParts.join('\n'), js: jsLines.join('\n') };
}

function generateTooltip(sections: HelpSection[]): { html: string; js: string } {
  const htmlParts: string[] = [];

  for (const section of sections) {
    const tooltipId = `tooltip-${section.id}`;
    htmlParts.push(
      `<span class="civ-relative civ-inline-flex civ-items-center civ-gap-1">`,
      `  <button type="button" data-civ-help-trigger="${escapeHtml(section.id)}" aria-describedby="${escapeHtml(tooltipId)}" class="civ-rounded-full civ-w-5 civ-h-5 civ-bg-info civ-text-white civ-text-xs civ-inline-flex civ-items-center civ-justify-center">?</button>`,
      `  <div role="tooltip" id="${escapeHtml(tooltipId)}" class="civ-absolute civ-p-2 civ-bg-base-darkest civ-text-white civ-rounded civ-text-sm civ-max-w-xs" hidden>${escapeHtml(section.body)}</div>`,
      `</span>`,
    );
  }

  const jsLines = [
    '  var triggers = document.querySelectorAll("[data-civ-help-trigger]");',
    '  for (var i = 0; i < triggers.length; i++) {',
    '    (function(btn) {',
    '      var id = btn.getAttribute("data-civ-help-trigger");',
    '      var tip = document.getElementById("tooltip-" + id);',
    '      if (!tip) return;',
    '      function show() { tip.hidden = false; tip.dispatchEvent(new CustomEvent("civ-help-open", { bubbles: true })); }',
    '      function hide() { tip.hidden = true; tip.dispatchEvent(new CustomEvent("civ-help-close", { bubbles: true })); }',
    '      btn.addEventListener("mouseenter", show);',
    '      btn.addEventListener("focus", show);',
    '      btn.addEventListener("mouseleave", hide);',
    '      btn.addEventListener("blur", hide);',
    '      btn.addEventListener("keydown", function(e) {',
    '        if (e.key === "Escape") hide();',
    '      });',
    '    })(triggers[i]);',
    '  }',
  ];

  return { html: htmlParts.join('\n'), js: jsLines.join('\n') };
}

export function generateHelpPanel(
  sections: HelpSection[],
  options?: { mode?: 'sidebar' | 'inline' | 'tooltip' },
): HelpPanelResult {
  if (!sections || sections.length === 0) {
    throw new Error('At least one help section is required');
  }

  const mode = options?.mode ?? 'sidebar';
  const features: string[] = ['help-panel', mode];

  let generated: { html: string; js: string };

  switch (mode) {
    case 'inline':
      generated = generateInline(sections);
      features.push('collapsible');
      break;
    case 'tooltip':
      generated = generateTooltip(sections);
      features.push('keyboard-dismiss');
      break;
    case 'sidebar':
    default:
      generated = generateSidebar(sections);
      features.push('collapsible');
      break;
  }

  const jsLines: string[] = [
    '(function() {',
    generated.js,
    '})();',
  ];

  return {
    html: generated.html,
    javascript: jsLines.join('\n'),
    features,
    sectionCount: sections.length,
  };
}
