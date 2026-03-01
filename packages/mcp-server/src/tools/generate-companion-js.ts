/**
 * generate_companion_js tool — generate client-side JavaScript for
 * repeatable sections and conditional visibility in CivUI forms.
 */
import type { FormSchema } from '../schema/index.js';

export interface CompanionJsResult {
  javascript: string;
  features: string[];
}

const SAFE_KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

function sanitizeKey(key: string): string {
  if (!SAFE_KEY_PATTERN.test(key)) {
    throw new Error(`Invalid repeatableKey "${key}": must match ${SAFE_KEY_PATTERN}`);
  }
  return key;
}

function generateRepeatableJs(key: string, min?: number, max?: number): string {
  const safeKey = sanitizeKey(key);
  return `
  // Repeatable section: ${safeKey}
  (function() {
    const container = document.querySelector('[data-civ-repeatable="${safeKey}"]');
    if (!container) return;

    const addBtn = container.querySelector('[data-civ-repeatable-add]');
    const min = ${min ?? 0};
    const max = ${max ?? 'Infinity'};

    function getItems() {
      return container.querySelectorAll(':scope > civ-fieldset, :scope > [data-civ-repeatable-item]');
    }

    function reindex() {
      const items = getItems();
      items.forEach(function(item, idx) {
        item.querySelectorAll('[name]').forEach(function(el) {
          el.setAttribute('name', el.getAttribute('name').replace(/${safeKey}\\[\\d+\\]/, '${safeKey}[' + idx + ']'));
        });
        item.querySelectorAll('[id]').forEach(function(el) {
          el.setAttribute('id', el.getAttribute('id').replace(/${safeKey}-\\d+/, '${safeKey}-' + idx));
        });
      });
      updateButtons();
    }

    function updateButtons() {
      var count = getItems().length;
      if (addBtn) addBtn.disabled = count >= max;
      container.querySelectorAll('[data-civ-repeatable-remove]').forEach(function(btn) {
        btn.disabled = count <= min;
      });
    }

    function announce(msg) {
      var region = container.closest('[aria-live]') || container;
      if (region.getAttribute('aria-live')) {
        var span = document.createElement('span');
        span.className = 'civ-sr-only';
        span.textContent = msg;
        region.appendChild(span);
        setTimeout(function() { span.remove(); }, 1000);
      }
    }

    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var items = getItems();
        if (items.length >= max) return;
        var template = items[items.length - 1];
        var clone = template.cloneNode(true);
        // Clear values in clone
        clone.querySelectorAll('[name]').forEach(function(el) {
          if (el.setAttribute) el.setAttribute('value', '');
          if ('value' in el) el.value = '';
        });
        container.insertBefore(clone, addBtn);
        reindex();
        announce('Item added. Total items: ' + getItems().length);
        // Focus first input in new item
        var firstInput = clone.querySelector('[name]');
        if (firstInput && firstInput.focus) firstInput.focus();
      });
    }

    container.addEventListener('click', function(e) {
      var removeBtn = e.target.closest('[data-civ-repeatable-remove]');
      if (!removeBtn) return;
      var items = getItems();
      if (items.length <= min) return;
      var item = removeBtn.closest('civ-fieldset') || removeBtn.closest('[data-civ-repeatable-item]') || removeBtn.parentElement;
      if (item && item !== container) {
        var itemIndex = Array.prototype.indexOf.call(items, item);
        item.remove();
        reindex();
        var remaining = getItems();
        announce('Item removed. Total items: ' + remaining.length);
        // Focus management: focus previous item, next item, or add button
        if (remaining.length > 0) {
          var focusIdx = itemIndex > 0 ? itemIndex - 1 : 0;
          var focusTarget = remaining[focusIdx] && remaining[focusIdx].querySelector('[name]');
          if (focusTarget && focusTarget.focus) focusTarget.focus();
        } else if (addBtn) {
          addBtn.focus();
        }
      }
    });

    updateButtons();
  })();`;
}

function generateConditionalVisibilityJs(): string {
  return `
  // Conditional visibility
  (function() {
    function parseCondition(attr) {
      if (!attr) return null;
      if (attr.endsWith(' exists')) return { field: attr.replace(/ exists$/, ''), op: 'exists' };
      if (attr.endsWith(' notExists')) return { field: attr.replace(/ notExists$/, ''), op: 'notExists' };
      var inMatch = attr.match(/^(.+?) in (.+)$/);
      if (inMatch) return { field: inMatch[1], op: 'in', value: inMatch[2].split(',') };
      var notInMatch = attr.match(/^(.+?) notIn (.+)$/);
      if (notInMatch) return { field: notInMatch[1], op: 'notIn', value: notInMatch[2].split(',') };
      var neqMatch = attr.match(/^(.+?)!=(.+)$/);
      if (neqMatch) return { field: neqMatch[1], op: 'neq', value: neqMatch[2] };
      var eqMatch = attr.match(/^(.+?)=(.+)$/);
      if (eqMatch) return { field: eqMatch[1], op: 'eq', value: eqMatch[2] };
      return null;
    }

    function evaluate(cond, value) {
      if (!cond) return true;
      switch (cond.op) {
        case 'eq': return value === cond.value;
        case 'neq': return value !== cond.value;
        case 'in': return cond.value.indexOf(value) !== -1;
        case 'notIn': return cond.value.indexOf(value) === -1;
        case 'exists': return value !== undefined && value !== null && value !== '';
        case 'notExists': return value === undefined || value === null || value === '';
        default: return true;
      }
    }

    function getFieldValue(name) {
      var el = document.querySelector('[name="' + name + '"]');
      if (!el) return undefined;
      return el.value || el.getAttribute('value') || '';
    }

    function updateVisibility() {
      document.querySelectorAll('[data-civ-show-when]').forEach(function(el) {
        var cond = parseCondition(el.getAttribute('data-civ-show-when'));
        var val = cond ? getFieldValue(cond.field) : undefined;
        var visible = evaluate(cond, val);
        el.style.display = visible ? '' : 'none';
        // Disable hidden required fields
        if (!visible) {
          el.querySelectorAll('[required]').forEach(function(req) { req.disabled = true; });
        } else {
          el.querySelectorAll('[disabled]').forEach(function(req) {
            if (req.hasAttribute('required')) req.disabled = false;
          });
        }
      });

      document.querySelectorAll('[data-civ-hide-when]').forEach(function(el) {
        var cond = parseCondition(el.getAttribute('data-civ-hide-when'));
        var val = cond ? getFieldValue(cond.field) : undefined;
        var hidden = evaluate(cond, val);
        el.style.display = hidden ? 'none' : '';
        if (hidden) {
          el.querySelectorAll('[required]').forEach(function(req) { req.disabled = true; });
        } else {
          el.querySelectorAll('[disabled]').forEach(function(req) {
            if (req.hasAttribute('required')) req.disabled = false;
          });
        }
      });
    }

    document.addEventListener('civ-change', updateVisibility);
    updateVisibility();
  })();`;
}

function generateConditionalRequiredJs(): string {
  return `
  // Conditional required
  (function() {
    function parseCondition(attr) {
      if (!attr) return null;
      var eqMatch = attr.match(/^(.+?)=(.+)$/);
      if (eqMatch) return { field: eqMatch[1], op: 'eq', value: eqMatch[2] };
      var neqMatch = attr.match(/^(.+?)!=(.+)$/);
      if (neqMatch) return { field: neqMatch[1], op: 'neq', value: neqMatch[2] };
      return null;
    }

    function getFieldValue(name) {
      var el = document.querySelector('[name="' + name + '"]');
      if (!el) return undefined;
      return el.value || el.getAttribute('value') || '';
    }

    function updateRequired() {
      document.querySelectorAll('[data-civ-require-when]').forEach(function(el) {
        var cond = parseCondition(el.getAttribute('data-civ-require-when'));
        if (!cond) return;
        var val = getFieldValue(cond.field);
        var shouldRequire = cond.op === 'eq' ? val === cond.value : val !== cond.value;
        if (shouldRequire) {
          el.setAttribute('required', '');
        } else {
          el.removeAttribute('required');
        }
      });
    }

    document.addEventListener('civ-change', updateRequired);
    updateRequired();
  })();`;
}

/**
 * Generate client-side JavaScript for a form schema's complex patterns.
 */
export function generateCompanionJs(schema: FormSchema): CompanionJsResult {
  const features: string[] = [];
  const jsParts: string[] = [];

  // Check for repeatable sections
  const repeatableSections = schema.sections.filter((s) => s.repeatable && s.repeatableKey);
  if (repeatableSections.length > 0) {
    features.push('repeatable');
    for (const section of repeatableSections) {
      jsParts.push(generateRepeatableJs(section.repeatableKey!, section.repeatableMin, section.repeatableMax));
    }
  }

  // Check for conditional visibility
  const hasVisibleWhen = schema.sections.some((s) =>
    s.fields.some((f) => f.visibleWhen),
  );
  if (hasVisibleWhen) {
    features.push('conditional-visibility');
    jsParts.push(generateConditionalVisibilityJs());
  }

  // Check for conditional required
  const hasRequiredWhen = schema.sections.some((s) =>
    s.fields.some((f) => f.requiredWhen),
  );
  if (hasRequiredWhen) {
    features.push('conditional-required');
    jsParts.push(generateConditionalRequiredJs());
  }

  if (jsParts.length === 0) {
    return { javascript: '', features: [] };
  }

  const javascript = `(function() {\n  'use strict';${jsParts.join('\n')}\n})();`;

  return { javascript, features };
}
