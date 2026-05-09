/**
 * generate_conditional_reveal tool — show/hide field groups with
 * aria-expanded/aria-controls based on trigger field value.
 */
import { escapeHtml } from './html-utils.js';
import type { FormField } from '../schema/index.js';

export interface ConditionalRevealResult {
  html: string;
  javascript: string;
  features: string[];
  triggerField: string;
  revealedFieldNames: string[];
}

interface TriggerConfig {
  fieldName: string;
  value: string | string[];
  operator?: 'eq' | 'neq' | 'includes';
}

function renderFieldHtml(field: FormField): string {
  const name = escapeHtml(field.name);
  const label = escapeHtml(field.label);
  const hintAttr = field.hint ? ` hint="${escapeHtml(field.hint)}"` : '';
  const required = field.required ? ' required' : '';

  switch (field.type) {
    case 'textarea':
      return (
        `    <div class="civ-mb-4">\n` +
        `      <civ-form-field label="${label}"${hintAttr}${required}>\n` +
        `        <civ-textarea name="${name}" id="${name}"${required}></civ-textarea>\n` +
        `      </civ-form-field>\n` +
        `    </div>`
      );
    case 'select':
      return (
        `    <div class="civ-mb-4">\n` +
        `      <civ-form-field label="${label}"${hintAttr}${required}>\n` +
        `        <civ-select name="${name}" id="${name}"${required}>\n` +
        (field.options || [])
          .map(
            (o) =>
              `          <option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`,
          )
          .join('\n') +
        `\n        </civ-select>\n` +
        `      </civ-form-field>\n` +
        `    </div>`
      );
    case 'radio':
      return (
        `    <civ-radio-group legend="${label}"${hintAttr}${required} name="${name}">\n` +
        (field.options || [])
          .map(
            (o) =>
              `      <civ-radio value="${escapeHtml(o.value)}" label="${escapeHtml(o.label)}"></civ-radio>`,
          )
          .join('\n') +
        `\n    </civ-radio-group>`
      );
    case 'checkbox':
      // Standalone checkbox — self-contained, no wrapping
      return (
        `    <div class="civ-mb-4">\n` +
        `      <civ-checkbox name="${name}" label="${label}"${required}></civ-checkbox>\n` +
        `    </div>`
      );
    default:
      return (
        `    <div class="civ-mb-4">\n` +
        `      <civ-form-field label="${label}"${hintAttr}${required}>\n` +
        `        <civ-text-input name="${name}" id="${name}" type="${escapeHtml(field.type)}"${required}></civ-text-input>\n` +
        `      </civ-form-field>\n` +
        `    </div>`
      );
  }
}

export function generateConditionalReveal(
  trigger: TriggerConfig,
  revealedFields: FormField[],
  options?: { mode?: 'show' | 'hide' },
): ConditionalRevealResult {
  if (!trigger || !trigger.fieldName) {
    throw new Error('Trigger field configuration is required');
  }
  if (!revealedFields || revealedFields.length === 0) {
    throw new Error('At least one revealed field is required');
  }

  const mode = options?.mode ?? 'show';
  const operator = trigger.operator ?? 'eq';
  const triggerId = `trigger-${trigger.fieldName}`;
  const revealId = `reveal-${trigger.fieldName}`;
  const hiddenByDefault = mode === 'show';

  const features: string[] = [
    'conditional-reveal',
    'aria-expanded',
    'aria-controls',
    mode === 'show' ? 'show-mode' : 'hide-mode',
  ];

  const htmlParts: string[] = [];

  // Trigger field
  htmlParts.push(`<div data-civ-conditional-trigger>`);
  htmlParts.push(
    `  <div class="civ-mb-4">`,
    `    <label for="${escapeHtml(triggerId)}">${escapeHtml(trigger.fieldName)}</label>`,
    `    <civ-text-input name="${escapeHtml(trigger.fieldName)}" id="${escapeHtml(triggerId)}" aria-expanded="${!hiddenByDefault}" aria-controls="${escapeHtml(revealId)}"></civ-text-input>`,
    `  </div>`,
  );
  htmlParts.push(`</div>`);

  // Revealed fields container
  const hiddenAttr = hiddenByDefault ? ' hidden' : '';
  htmlParts.push(
    `<div data-civ-conditional id="${escapeHtml(revealId)}" aria-labelledby="${escapeHtml(triggerId)}"${hiddenAttr}>`,
  );

  const revealedFieldNames: string[] = [];
  for (const field of revealedFields) {
    htmlParts.push(renderFieldHtml(field));
    revealedFieldNames.push(field.name);
  }

  htmlParts.push(`</div>`);

  // JavaScript
  const triggerValueJson = JSON.stringify(trigger.value);
  const jsLines: string[] = [
    '(function() {',
    `  var trigger = document.getElementById(${JSON.stringify(triggerId)});`,
    `  var reveal = document.getElementById(${JSON.stringify(revealId)});`,
    '  if (!trigger || !reveal) return;',
    '',
    '  function evaluate(val) {',
    `    var target = ${triggerValueJson};`,
  ];

  if (operator === 'includes') {
    jsLines.push(
      '    if (Array.isArray(target)) { return target.indexOf(val) !== -1; }',
      '    return String(target).indexOf(val) !== -1;',
    );
  } else if (operator === 'neq') {
    jsLines.push('    return val !== target;');
  } else {
    jsLines.push('    return val === target;');
  }

  jsLines.push(
    '  }',
    '',
    '  function update() {',
    '    var val = trigger.value || "";',
    '    var match = evaluate(val);',
    `    var visible = ${mode === 'show' ? 'match' : '!match'};`,
    '    reveal.hidden = !visible;',
    '    trigger.setAttribute("aria-expanded", String(visible));',
    '    reveal.dispatchEvent(new CustomEvent("civ-conditional-change", {',
    '      bubbles: true,',
    '      detail: { visible: visible, triggerValue: val }',
    '    }));',
    '  }',
    '',
    '  trigger.addEventListener("input", update);',
    '  trigger.addEventListener("change", update);',
    '})();',
  );

  return {
    html: htmlParts.join('\n'),
    javascript: jsLines.join('\n'),
    features,
    triggerField: trigger.fieldName,
    revealedFieldNames,
  };
}
