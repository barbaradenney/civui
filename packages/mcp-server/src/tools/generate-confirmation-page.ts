/**
 * generate_confirmation_page tool — generate an HTML confirmation page
 * after a form submission, including submission summary, next steps,
 * and print/copy controls.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml, deterministicHex } from './html-utils.js';

export interface ConfirmationPageResult {
  html: string;
  javascript: string;
  features: string[];
  confirmationNumber: string;
}

function formatValue(value: string | string[] | undefined): string {
  if (value === undefined || value === '') return '<em>Not provided</em>';
  if (Array.isArray(value)) {
    return value.length > 0 ? escapeHtml(value.join(', ')) : '<em>Not provided</em>';
  }
  return escapeHtml(value);
}

/**
 * Generate an HTML confirmation page for a submitted form.
 */
export function generateConfirmationPage(
  schema: FormSchema,
  submissionData: Record<string, string | string[]>,
  options?: {
    showNextSteps?: boolean;
    nextSteps?: string[];
    agency?: string;
  },
): ConfirmationPageResult {
  const seed = (schema.title ?? '') + Object.keys(submissionData).length;
  const confirmationNumber = `CIV-${deterministicHex(seed)}`;

  const features: string[] = [
    'confirmation-page',
    'submission-summary',
    'printable',
    'clipboard',
  ];

  const showNextSteps = options?.showNextSteps !== false;
  if (showNextSteps) {
    features.push('next-steps');
  }
  if (options?.agency) {
    features.push('agency-header');
  }

  const parts: string[] = [];

  // --- Outer wrapper ---
  parts.push('<div data-civ-confirmation>');

  // --- Success banner ---
  parts.push(
    '  <div class="civ-bg-success-lightest civ-border-s-4 civ-border-success civ-p-4 civ-mb-6" role="status">',
  );
  parts.push('    <h2>Your form has been submitted</h2>');
  parts.push(
    `    <p data-civ-confirmation-number>Confirmation number: <strong>${escapeHtml(confirmationNumber)}</strong></p>`,
  );
  if (options?.agency) {
    parts.push(`    <p>Agency: ${escapeHtml(options.agency)}</p>`);
  }
  parts.push('  </div>');

  // --- Submission summary ---
  for (const section of schema.sections) {
    const heading = section.heading;
    if (heading) {
      parts.push(`  <h3>${escapeHtml(heading)}</h3>`);
    }
    parts.push('  <dl>');
    for (const field of section.fields) {
      const val = submissionData[field.name];
      parts.push(`    <dt>${escapeHtml(field.label)}</dt>`);
      parts.push(`    <dd>${formatValue(val)}</dd>`);
    }
    parts.push('  </dl>');
  }

  // --- Next steps ---
  if (showNextSteps) {
    const defaultSteps = [
      'We will review your submission',
      'You will receive a decision within 10 business days',
      'Check your email for updates',
    ];
    const steps = options?.nextSteps ?? defaultSteps;

    parts.push('  <h3>What happens next</h3>');
    parts.push('  <ol>');
    for (const step of steps) {
      parts.push(`    <li>${escapeHtml(step)}</li>`);
    }
    parts.push('  </ol>');
  }

  // --- Action buttons ---
  parts.push(
    '  <button type="button" data-civ-print class="civ-mt-4 civ-px-4 civ-py-2 civ-rounded civ-border">Print this page</button>',
  );
  parts.push(
    '  <button type="button" data-civ-copy-confirmation class="civ-ms-2 civ-px-4 civ-py-2 civ-rounded civ-border">Copy confirmation number</button>',
  );

  parts.push('</div>');

  const html = parts.join('\n');

  // --- JavaScript ---
  const javascript = [
    '(function () {',
    '  var container = document.querySelector("[data-civ-confirmation]");',
    '  if (!container) return;',
    '',
    '  var printBtn = container.querySelector("[data-civ-print]");',
    '  if (printBtn) {',
    '    printBtn.addEventListener("click", function () {',
    '      window.print();',
    '    });',
    '  }',
    '',
    '  var copyBtn = container.querySelector("[data-civ-copy-confirmation]");',
    '  if (copyBtn) {',
    '    copyBtn.addEventListener("click", function () {',
    `      navigator.clipboard.writeText(${JSON.stringify(confirmationNumber)}).then(function () {`,
    '        var liveRegion = document.createElement("div");',
    '        liveRegion.setAttribute("role", "status");',
    '        liveRegion.setAttribute("aria-live", "polite");',
    '        liveRegion.className = "civ-sr-only";',
    '        liveRegion.textContent = "Confirmation number copied to clipboard";',
    '        container.appendChild(liveRegion);',
    '        setTimeout(function () { liveRegion.remove(); }, 3000);',
    '      });',
    '    });',
    '  }',
    '})();',
  ].join('\n');

  return { html, javascript, features, confirmationNumber };
}
