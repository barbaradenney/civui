/**
 * generate_repeatable_section tool — add-another patterns for household
 * members, employment history, etc. with reindexing and ARIA announcements.
 */
import type { FormSchema, FormField } from '../schema/index.js';
import { escapeHtml } from './html-utils.js';

export interface RepeatableSectionResult {
  html: string;
  javascript: string;
  features: string[];
  fields: string[];
  sectionHeading: string;
}

function renderFieldHtml(field: FormField, index: number): string {
  const label = escapeHtml(field.label);
  const name = `${escapeHtml(field.name)}[${index}]`;
  const hint = field.hint ? ` hint="${escapeHtml(field.hint)}"` : '';
  const req = field.required ? ' required' : '';

  switch (field.type) {
    case 'textarea':
      return `      <civ-form-field label="${label}"${hint}${req}>\n        <civ-textarea name="${name}"${req}></civ-textarea>\n      </civ-form-field>`;
    case 'select': {
      const opts = (field.options || [])
        .map((o) => `          <option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`)
        .join('\n');
      return `      <civ-form-field label="${label}"${hint}${req}>\n        <civ-select name="${name}"${req}>\n${opts}\n        </civ-select>\n      </civ-form-field>`;
    }
    case 'radio':
      return `      <civ-form-fieldset legend="${label}"${hint}${req}>\n        <civ-radio-group name="${name}"${req}></civ-radio-group>\n      </civ-form-fieldset>`;
    case 'checkbox':
      // Standalone checkbox — self-contained, no wrapping
      return `      <civ-checkbox label="${label}" name="${name}"${req}></civ-checkbox>`;
    default:
      return `      <civ-form-field label="${label}"${hint}${req}>\n        <civ-text-input name="${name}" type="${escapeHtml(field.type)}"${req}></civ-text-input>\n      </civ-form-field>`;
  }
}

export function generateRepeatableSection(
  schema: FormSchema,
  sectionIndex: number,
  options?: {
    minRepeats?: number;
    maxRepeats?: number;
    addLabel?: string;
    removeLabel?: string;
  },
): RepeatableSectionResult {
  if (!schema.sections || sectionIndex < 0 || sectionIndex >= schema.sections.length) {
    throw new Error(`Invalid section index: ${sectionIndex}`);
  }

  const section = schema.sections[sectionIndex];
  const minRepeats = options?.minRepeats ?? 1;
  const maxRepeats = options?.maxRepeats ?? Infinity;
  const addLabel = options?.addLabel ?? 'Add another';
  const removeLabel = options?.removeLabel ?? 'Remove';
  const heading = section.heading ?? `Section ${sectionIndex + 1}`;

  const features: string[] = ['repeatable-section', 'add-remove', 'reindex', 'aria-live'];
  const fieldNames = section.fields.map((f) => f.name);

  const htmlParts: string[] = [];

  htmlParts.push(`<div data-civ-repeatable data-civ-min="${minRepeats}" data-civ-max="${maxRepeats === Infinity ? '' : maxRepeats}">`);
  htmlParts.push(`  <h3 class="civ-text-lg civ-font-bold civ-mb-4">${escapeHtml(heading)}</h3>`);

  // Initial item
  htmlParts.push(`  <fieldset data-civ-repeat-item data-civ-index="0" class="civ-border civ-p-4 civ-mb-4 civ-rounded">`);
  htmlParts.push(`    <legend>${escapeHtml(heading)} 1</legend>`);

  for (const field of section.fields) {
    htmlParts.push(renderFieldHtml(field, 0));
  }

  if (minRepeats < 1) {
    htmlParts.push(
      `    <button type="button" data-civ-repeat-remove class="civ-text-error civ-underline civ-text-sm" aria-label="${escapeHtml(removeLabel)} ${escapeHtml(heading)} 1">${escapeHtml(removeLabel)}</button>`,
    );
  }

  htmlParts.push(`  </fieldset>`);

  // Counter and add button
  htmlParts.push(`  <p class="civ-text-sm civ-mb-2"><span data-civ-repeat-count>1</span> item(s)</p>`);
  htmlParts.push(
    `  <button type="button" data-civ-repeat-add class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">${escapeHtml(addLabel)}</button>`,
  );

  // Announcer
  htmlParts.push(`  <div aria-live="polite" data-civ-repeat-announcer class="civ-sr-only"></div>`);

  htmlParts.push(`</div>`);

  // JavaScript
  const jsLines: string[] = [
    '(function() {',
    '  var container = document.querySelector("[data-civ-repeatable]");',
    '  if (!container) return;',
    `  var minRepeats = ${minRepeats};`,
    `  var maxRepeats = ${maxRepeats === Infinity ? 'Infinity' : maxRepeats};`,
    '  var addBtn = container.querySelector("[data-civ-repeat-add]");',
    '  var countEl = container.querySelector("[data-civ-repeat-count]");',
    '  var announcer = container.querySelector("[data-civ-repeat-announcer]");',
    '',
    '  function getItems() {',
    '    return container.querySelectorAll("[data-civ-repeat-item]");',
    '  }',
    '',
    '  function reindex() {',
    '    var items = getItems();',
    '    for (var i = 0; i < items.length; i++) {',
    '      items[i].setAttribute("data-civ-index", i);',
    '      var legend = items[i].querySelector("legend");',
    `      if (legend) legend.textContent = ${JSON.stringify(heading)} + " " + (i + 1);`,
    '      var inputs = items[i].querySelectorAll("[name]");',
    '      for (var j = 0; j < inputs.length; j++) {',
    '        var n = inputs[j].getAttribute("name");',
    '        if (n) inputs[j].setAttribute("name", n.replace(/\\[\\d+\\]/, "[" + i + "]"));',
    '      }',
    `      var rmBtn = items[i].querySelector("[data-civ-repeat-remove]");`,
    `      if (rmBtn) rmBtn.setAttribute("aria-label", ${JSON.stringify(removeLabel)} + " " + ${JSON.stringify(heading)} + " " + (i + 1));`,
    '    }',
    '    if (countEl) countEl.textContent = items.length;',
    '  }',
    '',
    '  function announce(msg) {',
    '    if (announcer) announcer.textContent = msg;',
    '  }',
    '',
    '  if (addBtn) {',
    '    addBtn.addEventListener("click", function() {',
    '      var items = getItems();',
    '      if (items.length >= maxRepeats) return;',
    '      var template = items[items.length - 1];',
    '      var clone = template.cloneNode(true);',
    '      // Clear values in clone',
    '      var inputs = clone.querySelectorAll("input, textarea, select");',
    '      for (var i = 0; i < inputs.length; i++) { inputs[i].value = ""; }',
    '      // Add remove button if not present',
    '      if (!clone.querySelector("[data-civ-repeat-remove]")) {',
    `        var rmBtn = document.createElement("button");`,
    '        rmBtn.type = "button";',
    '        rmBtn.setAttribute("data-civ-repeat-remove", "");',
    `        rmBtn.className = "civ-text-error civ-underline civ-text-sm";`,
    `        rmBtn.textContent = ${JSON.stringify(removeLabel)};`,
    `        rmBtn.setAttribute("aria-label", ${JSON.stringify(removeLabel)} + " " + ${JSON.stringify(heading)} + " " + (items.length + 1));`,
    '        clone.appendChild(rmBtn);',
    '      }',
    '      template.parentNode.insertBefore(clone, addBtn.previousElementSibling);',
    '      reindex();',
    '      announce("Item added. " + getItems().length + " items total.");',
    '      container.dispatchEvent(new CustomEvent("civ-repeat-change", { bubbles: true, detail: { count: getItems().length } }));',
    '    });',
    '  }',
    '',
    '  container.addEventListener("click", function(e) {',
    '    var rmBtn = e.target.closest("[data-civ-repeat-remove]");',
    '    if (!rmBtn) return;',
    '    var items = getItems();',
    '    if (items.length <= minRepeats) return;',
    '    var item = rmBtn.closest("[data-civ-repeat-item]");',
    '    if (item) item.remove();',
    '    reindex();',
    '    announce("Item removed. " + getItems().length + " items total.");',
    '    container.dispatchEvent(new CustomEvent("civ-repeat-change", { bubbles: true, detail: { count: getItems().length } }));',
    '  });',
    '})();',
  ];

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    fields: fieldNames,
    sectionHeading: heading,
  };
}
