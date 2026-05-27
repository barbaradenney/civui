/**
 * generate_amendment_flow tool — generate a diff-based amendment request UI
 * that shows original vs amended values for government form submissions.
 */
import type { FormSchema } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface AmendmentFlowResult {
  html: string;
  javascript: string;
  features: string[];
  changedFields: string[];
  summary: string;
}

export function generateAmendmentFlow(
  schema: FormSchema,
  originalValues: Record<string, string>,
  amendedValues: Record<string, string>,
  options?: {
    requiresReason?: boolean;
    requiresApproval?: boolean;
  },
): AmendmentFlowResult {
  const requiresReason = options?.requiresReason ?? true;
  const requiresApproval = options?.requiresApproval ?? false;

  const features: string[] = ['amendment-flow', 'diff-view', 'del-ins-markup'];
  const changedFields: string[] = [];

  // Collect all fields from schema sections
  const allFields: Array<{ name: string; label: string }> = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      allFields.push({ name: field.name, label: field.label });
    }
  }

  // Determine which fields changed
  for (const field of allFields) {
    const original = originalValues[field.name] ?? '';
    const amended = amendedValues[field.name] ?? '';
    if (original !== amended) {
      changedFields.push(field.name);
    }
  }

  // Build HTML
  const htmlParts: string[] = [
    `<section data-civ-amendment>`,
    `  <h2>Amendment request</h2>`,
    `  <table data-civ-amendment-diff class="civ-w-full civ-border-collapse">`,
    `    <caption class="civ-sr-only">Changes to your submission</caption>`,
    `    <thead>`,
    `      <tr>`,
    `        <th scope="col">Field</th>`,
    `        <th scope="col">Original value</th>`,
    `        <th scope="col">New value</th>`,
    `      </tr>`,
    `    </thead>`,
    `    <tbody>`,
  ];

  for (const field of allFields) {
    const original = originalValues[field.name] ?? '';
    const amended = amendedValues[field.name] ?? '';
    const isChanged = original !== amended;

    if (isChanged) {
      htmlParts.push(
        `      <tr class="civ-bg-warning-lightest">`,
        `        <td>${escapeHtml(field.label)}</td>`,
        `        <td><del>${escapeHtml(original)}</del></td>`,
        `        <td><ins>${escapeHtml(amended)}</ins></td>`,
        `      </tr>`,
      );
    } else {
      htmlParts.push(
        `      <tr>`,
        `        <td>${escapeHtml(field.label)}</td>`,
        `        <td colspan="2">${escapeHtml(original)} (no change)</td>`,
        `      </tr>`,
      );
    }
  }

  htmlParts.push(`    </tbody>`, `  </table>`);

  if (requiresReason) {
    features.push('requires-reason');
    htmlParts.push(
      `  <civ-textarea label="Reason for amendment" name="amendment-reason" required rows="4" class="civ-mt-4"></civ-textarea>`,
    );
  }

  if (requiresApproval) {
    features.push('requires-approval');
    htmlParts.push(
      `  <div data-civ-amendment-approval class="civ-mt-4 civ-p-4 civ-bg-info-lightest civ-rounded" role="note">`,
      `    <p>This amendment requires approval before taking effect.</p>`,
      `  </div>`,
    );
  }

  htmlParts.push(
    `  <button type="button" data-civ-amendment-submit class="civ-mt-4 civ-px-4 civ-py-2 civ-rounded civ-bg-primary civ-text-white">Submit amendment</button>`,
  );

  htmlParts.push(`</section>`);

  // Build JavaScript
  const changedFieldsJson = JSON.stringify(changedFields);

  const jsLines: string[] = [
    '(function() {',
    '  var submitBtn = document.querySelector("[data-civ-amendment-submit]");',
    '  if (!submitBtn) { return; }',
    '',
    '  submitBtn.addEventListener("click", function() {',
    `    var changedFields = ${changedFieldsJson};`,
  ];

  if (requiresReason) {
    jsLines.push(
      '    var reasonEl = document.querySelector(\'[name="amendment-reason"]\');',
      '    var reason = reasonEl ? reasonEl.value || "" : "";',
    );
  } else {
    jsLines.push(
      '    var reason = "";',
    );
  }

  jsLines.push(
    '    submitBtn.dispatchEvent(new CustomEvent("civ-amendment-submit", {',
    '      bubbles: true,',
    '      detail: { changedFields: changedFields, reason: reason }',
    '    }));',
    '',
    '    var liveRegion = document.querySelector("[aria-live]");',
    '    if (!liveRegion) {',
    '      liveRegion = document.createElement("div");',
    '      liveRegion.setAttribute("aria-live", "polite");',
    '      liveRegion.setAttribute("class", "civ-sr-only");',
    '      document.body.appendChild(liveRegion);',
    '    }',
    '    liveRegion.textContent = "Amendment submitted with " + changedFields.length + " changes";',
    '  });',
    '})();',
  );

  const summary = `${changedFields.length} of ${allFields.length} fields changed`;

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features: [...new Set(features)],
    changedFields,
    summary,
  };
}
