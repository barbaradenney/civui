/**
 * generate_companion_js tool — generate client-side JavaScript for
 * repeatable sections, conditional visibility, wizard navigation,
 * and compound conditions in CivUI forms.
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

function generateRepeatableJs(key: string, min?: number, max?: number, isTable?: boolean): string {
  const safeKey = sanitizeKey(key);
  if (isTable) {
    return generateTableRepeatableJs(safeKey, min, max);
  }
  return `
  // Repeatable section: ${safeKey}
  (function() {
    var container = document.querySelector('[data-civ-repeatable="${safeKey}"]');
    if (!container) return;

    var addBtn = container.querySelector('[data-civ-repeatable-add]');
    var min = ${min ?? 0};
    var max = ${max ?? 'Infinity'};

    function getItems() {
      return container.querySelectorAll(':scope > civ-fieldset, :scope > [data-civ-repeatable-item]');
    }

    function reindex() {
      var items = getItems();
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

function generateTableRepeatableJs(safeKey: string, min?: number, max?: number): string {
  return `
  // Table repeatable section: ${safeKey}
  (function() {
    var container = document.querySelector('[data-civ-repeatable="${safeKey}"]');
    if (!container) return;

    var addBtn = container.querySelector('[data-civ-repeatable-add]');
    var tbody = container.querySelector('tbody');
    var min = ${min ?? 0};
    var max = ${max ?? 'Infinity'};

    function getItems() {
      return tbody ? tbody.querySelectorAll('tr[data-civ-repeatable-item]') : [];
    }

    function reindex() {
      var items = getItems();
      items.forEach(function(item, idx) {
        item.querySelectorAll('[name]').forEach(function(el) {
          el.setAttribute('name', el.getAttribute('name').replace(/${safeKey}\\[\\d+\\]/, '${safeKey}[' + idx + ']'));
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
        clone.querySelectorAll('[name]').forEach(function(el) {
          if (el.setAttribute) el.setAttribute('value', '');
          if ('value' in el) el.value = '';
        });
        if (tbody) tbody.appendChild(clone);
        reindex();
        announce('Row added. Total rows: ' + getItems().length);
        var firstInput = clone.querySelector('[name]');
        if (firstInput && firstInput.focus) firstInput.focus();
      });
    }

    container.addEventListener('click', function(e) {
      var removeBtn = e.target.closest('[data-civ-repeatable-remove]');
      if (!removeBtn) return;
      var items = getItems();
      if (items.length <= min) return;
      var item = removeBtn.closest('tr[data-civ-repeatable-item]');
      if (item) {
        var itemIndex = Array.prototype.indexOf.call(items, item);
        item.remove();
        reindex();
        var remaining = getItems();
        announce('Row removed. Total rows: ' + remaining.length);
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
      // Compound JSON conditions
      if (attr.charAt(0) === '{') {
        try { return JSON.parse(attr); } catch(e) {}
      }
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

    function evaluate(cond, getValue) {
      if (!cond) return true;
      // Compound: allOf / anyOf
      if (cond.allOf) {
        return cond.allOf.every(function(c) { return evaluate(c, getValue); });
      }
      if (cond.anyOf) {
        return cond.anyOf.some(function(c) { return evaluate(c, getValue); });
      }
      var value = getValue(cond.field);
      switch (cond.op || cond.operator) {
        case 'eq': return value === (cond.value || cond.val);
        case 'neq': return value !== (cond.value || cond.val);
        case 'in': return (cond.value || []).indexOf(value) !== -1;
        case 'notIn': return (cond.value || []).indexOf(value) === -1;
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
        var visible = evaluate(cond, getFieldValue);
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
        var hidden = evaluate(cond, getFieldValue);
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
      // Compound JSON conditions
      if (attr.charAt(0) === '{') {
        try { return JSON.parse(attr); } catch(e) {}
      }
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

    function evaluate(cond, getValue) {
      if (!cond) return false;
      // Compound: allOf / anyOf
      if (cond.allOf) {
        return cond.allOf.every(function(c) { return evaluate(c, getValue); });
      }
      if (cond.anyOf) {
        return cond.anyOf.some(function(c) { return evaluate(c, getValue); });
      }
      var value = getValue(cond.field);
      switch (cond.op || cond.operator) {
        case 'eq': return value === (cond.value || cond.val);
        case 'neq': return value !== (cond.value || cond.val);
        case 'in': return (cond.value || []).indexOf(value) !== -1;
        case 'notIn': return (cond.value || []).indexOf(value) === -1;
        case 'exists': return value !== undefined && value !== null && value !== '';
        case 'notExists': return value === undefined || value === null || value === '';
        default: return false;
      }
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
        var shouldRequire = evaluate(cond, getFieldValue);
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

function generateCascadingOptionsJs(): string {
  return `
  // Cascading/dependent options
  (function() {
    var SAFE_NAME = /^[a-zA-Z0-9_\\-\\.\\[\\]]+$/;

    var selects = document.querySelectorAll('[data-civ-options-from]');
    selects.forEach(function(child) {
      var parentName = child.getAttribute('data-civ-options-from');
      var childName = child.getAttribute('name');
      if (!parentName || !childName) return;
      if (!SAFE_NAME.test(parentName) || !SAFE_NAME.test(childName)) return;

      var mapScript = document.querySelector('script[data-civ-options-map="' + childName + '"]');
      if (!mapScript) return;
      var map = {};
      try { map = JSON.parse(mapScript.textContent || '{}'); } catch(e) {}

      function updateOptions() {
        var parentEl = document.querySelector('[name="' + parentName + '"]');
        var parentVal = parentEl ? (parentEl.value || parentEl.getAttribute('value') || '') : '';
        var options = map[parentVal] || [];

        // Clear existing options
        if (child.setAttribute) child.setAttribute('value', '');
        if ('value' in child) child.value = '';

        // Set new options as JSON attribute
        child.setAttribute('options', JSON.stringify(options));

        // Dispatch change to trigger downstream updates
        child.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '' }, bubbles: true }));
      }

      document.addEventListener('civ-change', function(e) {
        var target = e.target;
        if (target && target.getAttribute && target.getAttribute('name') === parentName) {
          updateOptions();
        }
      });
      updateOptions();
    });
  })();`;
}

export function generateWizardJs(stepCount: number): string {
  return `
  // Multi-step wizard navigation
  (function() {
    var stepCount = ${stepCount};
    var current = 0;

    var steps = document.querySelectorAll('[data-civ-step]');
    var progressSteps = document.querySelectorAll('[data-civ-progress-step]');
    var prevBtn = document.querySelector('[data-civ-step-prev]');
    var nextBtn = document.querySelector('[data-civ-step-next]');

    function showStep(idx) {
      steps.forEach(function(s, i) {
        if (i === idx) {
          s.removeAttribute('hidden');
        } else {
          s.setAttribute('hidden', '');
        }
      });
      progressSteps.forEach(function(p, i) {
        if (i === idx) {
          p.setAttribute('aria-current', 'step');
        } else {
          p.removeAttribute('aria-current');
        }
      });
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) {
        nextBtn.textContent = idx === stepCount - 1 ? 'Submit' : 'Next';
      }
      current = idx;
      // Update hash for history
      history.replaceState(null, '', '#step-' + idx);
      // Screen reader announcement
      var title = progressSteps[idx] ? progressSteps[idx].textContent : 'Step ' + (idx + 1);
      announceStep(title);
      // Focus management: focus the first focusable input in the new step
      var target = steps[idx];
      if (target) {
        var firstInput = target.querySelector('[name]');
        if (firstInput && firstInput.focus) firstInput.focus();
      }
    }

    function announceStep(title) {
      var region = document.querySelector('[aria-live]');
      if (!region) {
        region = document.createElement('div');
        region.setAttribute('aria-live', 'polite');
        region.className = 'civ-sr-only';
        document.body.appendChild(region);
      }
      region.textContent = title;
    }

    function validateCurrentStep() {
      var currentStep = steps[current];
      if (!currentStep) return true;
      var invalid = currentStep.querySelectorAll('[required]:not([disabled])');
      var allValid = true;
      invalid.forEach(function(el) {
        var val = el.value || el.getAttribute('value') || '';
        if (!val) allValid = false;
      });
      return allValid;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (!validateCurrentStep()) return;
        if (current < stepCount - 1) {
          showStep(current + 1);
        } else {
          // Last step — submit the form
          var form = nextBtn.closest('civ-form') || nextBtn.closest('form');
          if (form && form.requestSubmit) form.requestSubmit();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (current > 0) showStep(current - 1);
      });
    }

    // Handle initial hash
    var hash = window.location.hash;
    var hashMatch = hash.match(/^#step-(\\d+)$/);
    if (hashMatch) {
      var idx = parseInt(hashMatch[1], 10);
      if (idx >= 0 && idx < stepCount) showStep(idx);
    }

    showStep(current);
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
      jsParts.push(generateRepeatableJs(section.repeatableKey!, section.repeatableMin, section.repeatableMax, section.layout === 'table'));
    }
  }

  // Check for conditional visibility (field-level or section-level)
  const hasVisibleWhen = schema.sections.some((s) =>
    s.fields.some((f) => f.visibleWhen) || s.visibleWhen,
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

  // Check for cascading options
  const hasCascading = schema.sections.some((s) =>
    s.fields.some((f) => f.optionsFrom),
  );
  if (hasCascading) {
    features.push('cascading-options');
    jsParts.push(generateCascadingOptionsJs());
  }

  // Check for wizard steps
  if (schema.steps && schema.steps.length > 0) {
    features.push('wizard');
    jsParts.push(generateWizardJs(schema.steps.length));
  }

  if (jsParts.length === 0) {
    return { javascript: '', features: [] };
  }

  const javascript = `(function() {\n  'use strict';${jsParts.join('\n')}\n})();`;

  return { javascript, features };
}
