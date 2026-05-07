/**
 * generate_progress_bar tool — standalone step progress indicator with
 * clickable navigation, step indicators, and aria-current.
 */
import { escapeHtml } from './html-utils.js';

export interface ProgressBarResult {
  html: string;
  javascript: string;
  features: string[];
  stepCount: number;
  currentIndex: number;
}

export function generateProgressBar(
  steps: Array<{ id: string; label: string }>,
  currentStep: string,
  options?: { clickable?: boolean },
): ProgressBarResult {
  if (!steps || steps.length === 0) {
    throw new Error('At least one step is required');
  }

  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  if (currentIndex === -1) {
    throw new Error(`Step "${currentStep}" not found in steps`);
  }

  const clickable = options?.clickable ?? false;
  const features: string[] = ['progress-bar', 'step-indicators', 'aria-current'];
  if (clickable) {
    features.push('clickable');
  }

  const htmlParts: string[] = [];
  htmlParts.push(`<nav data-civ-progress aria-label="Progress">`);
  htmlParts.push(`  <ol class="civ-flex civ-items-center civ-gap-2">`);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isComplete = i < currentIndex;
    const isCurrent = i === currentIndex;

    let statusClass = 'civ-bg-base-lighter civ-text-base';
    let indicator = `${i + 1}`;
    if (isComplete) {
      statusClass = 'civ-bg-success civ-text-white';
      indicator = '✓';
    } else if (isCurrent) {
      statusClass = 'civ-bg-primary civ-text-white';
    }

    const ariaCurrent = isCurrent ? ' aria-current="step"' : '';
    const dataAttrs = `data-civ-step="${escapeHtml(step.id)}" data-civ-step-index="${i}"`;

    if (clickable && isComplete) {
      htmlParts.push(
        `    <li ${dataAttrs}${ariaCurrent} class="civ-flex civ-items-center civ-gap-1">` +
          `<button type="button" data-civ-step-btn="${escapeHtml(step.id)}" class="civ-flex civ-items-center civ-gap-1 ${statusClass} civ-px-3 civ-py-1 civ-rounded-full">` +
          `<span aria-hidden="true">${indicator}</span> ${escapeHtml(step.label)}</button></li>`,
      );
    } else {
      htmlParts.push(
        `    <li ${dataAttrs}${ariaCurrent} class="civ-flex civ-items-center civ-gap-1 ${statusClass} civ-px-3 civ-py-1 civ-rounded-full">` +
          `<span aria-hidden="true">${indicator}</span> ${escapeHtml(step.label)}</li>`,
      );
    }
  }

  htmlParts.push(`  </ol>`);
  htmlParts.push(`</nav>`);

  // JavaScript
  const jsLines: string[] = ['(function() {'];

  if (clickable) {
    jsLines.push(
      '  var nav = document.querySelector("[data-civ-progress]");',
      '  if (nav) {',
      '    nav.addEventListener("click", function(e) {',
      '      var btn = e.target.closest("[data-civ-step-btn]");',
      '      if (!btn) return;',
      '      var step = btn.getAttribute("data-civ-step-btn");',
      '      var li = btn.closest("[data-civ-step-index]");',
      '      var index = li ? parseInt(li.getAttribute("data-civ-step-index"), 10) : -1;',
      '      nav.dispatchEvent(new CustomEvent("civ-progress-navigate", {',
      '        bubbles: true,',
      '        detail: { step: step, index: index }',
      '      }));',
      '    });',
      '  }',
    );
  }

  jsLines.push('})();');

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    stepCount: steps.length,
    currentIndex,
  };
}
