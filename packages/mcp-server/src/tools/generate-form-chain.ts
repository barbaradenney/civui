/**
 * generate_form_chain tool — generate a multi-form chain UI with step navigation,
 * data carry-over between forms, and dependency-based locking.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface FormChainResult {
  html: string;
  javascript: string;
  features: string[];
  steps: Array<{ ref: string; label: string; dependsOn: string[] }>;
  dataMap: Record<string, Record<string, string>>;
}

/**
 * Generate a multi-form chain UI from a FormSchema with formChain configuration.
 * Produces step navigation, content placeholder, navigation buttons, and
 * companion JavaScript for step transitions and data carry-over.
 */
export function generateFormChain(
  schema: FormSchema,
  options?: { currentStep?: number; completedSteps?: string[] },
): FormChainResult {
  if (!schema.formChain) {
    throw new Error('Schema must have a formChain configuration');
  }

  const config = schema.formChain;
  const currentStep = options?.currentStep ?? 0;
  const completedSteps = options?.completedSteps ?? [];

  const features: string[] = ['form-chain', 'step-navigation'];

  // Build steps summary
  const steps = config.forms.map((form) => ({
    ref: form.schemaRef,
    label: form.label,
    dependsOn: form.dependsOn ?? [],
  }));

  // Build dataMap — only entries that have dataMapping
  const dataMap: Record<string, Record<string, string>> = {};
  for (const form of config.forms) {
    if (form.dataMapping && Object.keys(form.dataMapping).length > 0) {
      dataMap[form.schemaRef] = form.dataMapping;
    }
  }

  if (Object.keys(dataMap).length > 0) {
    features.push('data-carry-over');
  }

  const hasLockedSteps = config.forms.some(
    (form) => form.dependsOn && form.dependsOn.length > 0,
  );
  if (hasLockedSteps) {
    features.push('locked-steps');
  }

  // Determine completed set for quick lookup
  const completedSet = new Set(completedSteps);

  // Generate step list items
  const stepItems: string[] = [];
  for (let i = 0; i < config.forms.length; i++) {
    const form = config.forms[i];
    const ref = form.schemaRef;
    const label = escapeHtml(form.label);
    const isCompleted = completedSet.has(ref);
    const isCurrent = i === currentStep;
    const deps = form.dependsOn ?? [];
    const isLocked = deps.length > 0 && deps.some((d) => !completedSet.has(d));

    let inner: string;
    if (isCompleted) {
      inner =
        `<span class="civ-text-success" aria-hidden="true">\u2713</span> ${label} <span class="civ-sr-only">(completed)</span>`;
    } else if (isCurrent) {
      inner = `<span aria-current="step" class="civ-font-bold">${label}</span>`;
    } else if (isLocked) {
      inner =
        `<span class="civ-text-base-dark" aria-hidden="true">\uD83D\uDD12</span> ${label} <span class="civ-sr-only">(locked)</span>`;
    } else {
      inner = label;
    }

    stepItems.push(
      `    <li data-civ-chain-step="${escapeHtml(ref)}">${inner}</li>`,
    );
  }

  // Determine button labels
  const isLastStep = currentStep >= config.forms.length - 1;
  const nextLabel = isLastStep ? 'Submit all' : 'Next';
  const backDisabled = currentStep === 0 ? ' disabled' : '';

  // Assemble HTML
  const htmlParts: string[] = [
    `<nav data-civ-form-chain aria-label="Form steps" class="civ-mb-6">`,
    `  <ol class="civ-flex civ-gap-4 civ-list-none civ-p-0">`,
    ...stepItems,
    `  </ol>`,
    `  <div data-civ-chain-content class="civ-mt-4"></div>`,
    `  <div data-civ-chain-nav class="civ-mt-4 civ-button-row">`,
    `    <button type="button" data-civ-chain-prev class="civ-px-4 civ-py-2 civ-rounded civ-border"${backDisabled}>Back</button>`,
    `    <button type="button" data-civ-chain-next class="civ-px-4 civ-py-2 civ-rounded civ-bg-primary civ-text-white">${nextLabel}</button>`,
    `  </div>`,
    `</nav>`,
  ];

  const html = htmlParts.join('\n');

  // Generate JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  var chainEl = document.querySelector("[data-civ-form-chain]");',
    '  if (!chainEl) return;',
    '',
    '  var steps = ' + JSON.stringify(steps) + ';',
    '  var dataMapping = ' + JSON.stringify(dataMap) + ';',
    '  var currentStep = ' + currentStep + ';',
    '  var completedSteps = ' + JSON.stringify(completedSteps) + ';',
    '',
    '  function isLocked(step) {',
    '    if (!step.dependsOn || step.dependsOn.length === 0) return false;',
    '    return step.dependsOn.some(function(dep) {',
    '      return completedSteps.indexOf(dep) === -1;',
    '    });',
    '  }',
    '',
    '  function updateStepIndicators() {',
    '    steps.forEach(function(step, i) {',
    '      var li = chainEl.querySelector("[data-civ-chain-step=\'" + step.ref + "\']");',
    '      if (!li) return;',
    '      var completed = completedSteps.indexOf(step.ref) !== -1;',
    '      var current = i === currentStep;',
    '      var locked = isLocked(step);',
    '      if (completed) {',
    '        li.innerHTML = \'<span class="civ-text-success" aria-hidden="true">\\u2713</span> \' + step.label + \' <span class="civ-sr-only">(completed)</span>\';',
    '      } else if (current) {',
    '        li.innerHTML = \'<span aria-current="step" class="civ-font-bold">\' + step.label + \'</span>\';',
    '      } else if (locked) {',
    '        li.innerHTML = \'<span class="civ-text-base-dark" aria-hidden="true">\\uD83D\\uDD12</span> \' + step.label + \' <span class="civ-sr-only">(locked)</span>\';',
    '      } else {',
    '        li.textContent = step.label;',
    '      }',
    '    });',
    '',
    '    // Update back button',
    '    var backBtn = chainEl.querySelector("[data-civ-chain-prev]");',
    '    if (backBtn) backBtn.disabled = currentStep === 0;',
    '',
    '    // Update next button label',
    '    var nextBtn = chainEl.querySelector("[data-civ-chain-next]");',
    '    if (nextBtn) {',
    '      nextBtn.textContent = currentStep >= steps.length - 1 ? "Submit all" : "Next";',
    '    }',
    '',
    '    // Disable next if next step is locked',
    '    if (nextBtn && currentStep < steps.length - 1) {',
    '      nextBtn.disabled = isLocked(steps[currentStep + 1]);',
    '    }',
    '  }',
    '',
    '  function carryOverData(targetRef) {',
    '    var mapping = dataMapping[targetRef];',
    '    if (!mapping) return;',
    '    Object.keys(mapping).forEach(function(targetField) {',
    '      var sourceField = mapping[targetField];',
    '      var sourceEl = document.querySelector("[name=\'" + sourceField + "\']");',
    '      var targetEl = document.querySelector("[name=\'" + targetField + "\']");',
    '      if (sourceEl && targetEl) {',
    '        targetEl.value = sourceEl.value;',
    '      }',
    '    });',
    '  }',
    '',
    '  // Next button click',
    '  var nextBtn = chainEl.querySelector("[data-civ-chain-next]");',
    '  if (nextBtn) {',
    '    nextBtn.addEventListener("click", function() {',
    '      if (currentStep >= steps.length - 1) {',
    '        chainEl.dispatchEvent(new CustomEvent("civ-chain-navigate", {',
    '          bubbles: true,',
    '          detail: { from: steps[currentStep].ref, to: null, direction: "forward" }',
    '        }));',
    '        return;',
    '      }',
    '      var nextIndex = currentStep + 1;',
    '      if (isLocked(steps[nextIndex])) return;',
    '      var fromRef = steps[currentStep].ref;',
    '      var toRef = steps[nextIndex].ref;',
    '      if (completedSteps.indexOf(fromRef) === -1) {',
    '        completedSteps.push(fromRef);',
    '      }',
    '      currentStep = nextIndex;',
    '      carryOverData(toRef);',
    '      chainEl.dispatchEvent(new CustomEvent("civ-chain-navigate", {',
    '        bubbles: true,',
    '        detail: { from: fromRef, to: toRef, direction: "forward" }',
    '      }));',
    '      updateStepIndicators();',
    '    });',
    '  }',
    '',
    '  // Back button click',
    '  var backBtn = chainEl.querySelector("[data-civ-chain-prev]");',
    '  if (backBtn) {',
    '    backBtn.addEventListener("click", function() {',
    '      if (currentStep <= 0) return;',
    '      var fromRef = steps[currentStep].ref;',
    '      currentStep = currentStep - 1;',
    '      var toRef = steps[currentStep].ref;',
    '      chainEl.dispatchEvent(new CustomEvent("civ-chain-navigate", {',
    '        bubbles: true,',
    '        detail: { from: fromRef, to: toRef, direction: "backward" }',
    '      }));',
    '      updateStepIndicators();',
    '    });',
    '  }',
    '',
    '  updateStepIndicators();',
    '})();',
  ];

  return {
    html,
    javascript: jsLines.join('\n'),
    features,
    steps,
    dataMap,
  };
}
