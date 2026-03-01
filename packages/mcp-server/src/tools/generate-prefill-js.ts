/**
 * generate_prefill_js tool — generate client-side JavaScript to prefill
 * a CivUI form from a values object (for save-and-resume).
 */
import type { FormSchema } from '../schema/index.js';

export interface PrefillJsResult {
  javascript: string;
  fieldCount: number;
  repeatableKeys: string[];
}

/**
 * Generate client-side JavaScript that populates form fields from a values object.
 * Handles text inputs, radio groups, checkbox groups, selects, and toggles.
 * Also includes a `window.civSerializeForm()` function for save-resume serialization.
 */
export function generatePrefillJs(
  schema: FormSchema,
  values: Record<string, string | string[]>,
): PrefillJsResult {
  const repeatableKeys: string[] = [];

  for (const section of schema.sections) {
    if (section.repeatable && section.repeatableKey) {
      repeatableKeys.push(section.repeatableKey);
    }
  }

  const fieldCount = Object.keys(values).length;

  // Build the prefill IIFE
  // Escape '<' to prevent </script> breakout when embedded in HTML script tags
  const valuesJson = JSON.stringify(values).replace(/</g, '\\u003c');
  const javascript = `(function() {
  'use strict';

  var values = ${valuesJson};

  function setFieldValue(name, value) {
    var el = document.querySelector('[name="' + name + '"]');
    if (!el) return false;
    var tag = el.tagName.toLowerCase();

    // Radio group
    if (tag === 'civ-radio-group') {
      var radio = el.querySelector('civ-radio[value="' + value + '"]');
      if (radio) radio.setAttribute('checked', '');
      if ('value' in el) el.value = value;
      return true;
    }

    // Checkbox group (multi-value)
    if (tag === 'civ-checkbox-group') {
      var vals = Array.isArray(value) ? value : [value];
      vals.forEach(function(v) {
        var cb = el.querySelector('civ-checkbox[value="' + v + '"]');
        if (cb) cb.setAttribute('checked', '');
      });
      return true;
    }

    // Select
    if (tag === 'civ-select' || tag === 'civ-combobox') {
      el.setAttribute('value', Array.isArray(value) ? value[0] : value);
      if ('value' in el) el.value = Array.isArray(value) ? value[0] : value;
      return true;
    }

    // Toggle / checkbox
    if (tag === 'civ-toggle' || tag === 'civ-checkbox') {
      if (value === 'true' || value === 'on' || value === '1') {
        el.setAttribute('checked', '');
      } else {
        el.removeAttribute('checked');
      }
      return true;
    }

    // Text inputs, textarea, date-picker, memorable-date, file-upload
    el.setAttribute('value', Array.isArray(value) ? value.join(', ') : value);
    if ('value' in el) el.value = Array.isArray(value) ? value.join(', ') : value;
    return true;
  }

  // Populate fields
  Object.keys(values).forEach(function(name) {
    setFieldValue(name, values[name]);
  });

  // Serialize form for save-resume
  window.civSerializeForm = function(formSelector) {
    var form = document.querySelector(formSelector || 'civ-form');
    if (!form) return {};
    var result = {};
    form.querySelectorAll('[name]').forEach(function(el) {
      var name = el.getAttribute('name');
      var tag = el.tagName.toLowerCase();
      if (tag === 'civ-checkbox-group') {
        var checked = [];
        el.querySelectorAll('civ-checkbox[checked]').forEach(function(cb) {
          checked.push(cb.getAttribute('value') || '');
        });
        result[name] = checked;
      } else if (tag === 'civ-toggle' || tag === 'civ-checkbox') {
        result[name] = el.hasAttribute('checked') ? 'true' : 'false';
      } else {
        result[name] = el.value || el.getAttribute('value') || '';
      }
    });
    return result;
  };
})();`;

  return { javascript, fieldCount, repeatableKeys };
}
