/**
 * suggest_fix tool — auto-correct CivUI validation violations.
 * Parses HTML with cheerio, applies DOM fixes for known rule violations,
 * then re-validates to report remaining issues.
 */
import { load, type CheerioAPI, type Cheerio } from 'cheerio';
import { validateForm } from '../validators/validate-form.js';
import { IDENTITY_FIELDS, ABBREVIATIONS } from '../validators/rules.js';
import type { Violation } from '../validators/rules.js';

export interface SuggestFixResult {
  originalHtml: string;
  fixedHtml: string;
  appliedFixes: string[];
  remainingViolations: Violation[];
}

type FixerFn = ($: CheerioAPI, violations: Violation[]) => string[];

/** Label components (single-value) — wrapped with civ-form-field. */
const LABEL_COMPONENTS = new Set([
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-date-picker',
  'civ-memorable-date',
  'civ-date-range-picker',
  'civ-yes-no',
  'civ-toggle',
  'civ-file-upload',
]);

/** Self-contained components that manage their own label — no wrapping needed. */
const SELF_CONTAINED_COMPONENTS = new Set([
  'civ-address',
  'civ-name',
  'civ-signature',
]);

/** Group components (use civ-form-fieldset with legend). */
const LEGEND_COMPONENTS = new Set([
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-segmented-control',
  'civ-fieldset',
]);

function kebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

const FIXERS: Record<string, FixerFn> = {
  'missing-label'($, violations) {
    const fixes: string[] = [];
    const relevant = violations.filter((v) => v.rule === 'missing-label');
    for (const v of relevant) {
      $(v.element).each((_, el) => {
        const $el = $(el);
        // Skip if already wrapped in civ-form-field or has label attr (self-contained)
        if ($el.parents('civ-form-field').length > 0) return;
        if ($el.attr('label') && SELF_CONTAINED_COMPONENTS.has(v.element)) return;
        const name = $el.attr('name') ?? '';
        const label = name
          ? name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : v.element.replace('civ-', '').replace(/-/g, ' ');
        // Remove label from the component if present
        $el.removeAttr('label');
        const required = $el.attr('required') !== undefined ? ' required' : '';
        $el.wrap(`<civ-form-field label="${label}"${required}></civ-form-field>`);
        fixes.push(`Wrapped <${v.element}> in <civ-form-field label="${label}">`);
      });
    }
    return fixes;
  },

  'missing-legend'($, violations) {
    const fixes: string[] = [];
    const relevant = violations.filter((v) => v.rule === 'missing-legend');
    for (const v of relevant) {
      $(v.element).each((_, el) => {
        const $el = $(el);
        // Skip if already wrapped in civ-form-fieldset
        if ($el.parents('civ-form-fieldset').length > 0) return;
        if ($el.attr('legend')) return;
        const name = $el.attr('name') ?? '';
        const legend = name
          ? name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : v.element.replace('civ-', '').replace(/-/g, ' ');
        const required = $el.attr('required') !== undefined ? ' required' : '';
        $el.wrap(`<civ-form-fieldset legend="${legend}"${required}></civ-form-fieldset>`);
        fixes.push(`Wrapped <${v.element}> in <civ-form-fieldset legend="${legend}">`);
      });
    }
    return fixes;
  },

  'deprecated-date-input'($) {
    const fixes: string[] = [];
    $('civ-date-input').each((_, el) => {
      const $el = $(el);
      // Get all attributes, separating wrapper props from component props
      const wrapperAttrs: Record<string, string> = {};
      const componentAttrs: Record<string, string> = {};
      const rawAttrs = el.type === 'tag' ? el.attribs : {};
      const wrapperPropNames = new Set(['label', 'hint', 'error', 'required-message']);
      for (const [k, v] of Object.entries(rawAttrs)) {
        if (wrapperPropNames.has(k)) {
          wrapperAttrs[k] = v;
        } else {
          componentAttrs[k] = v;
        }
      }
      // Replace tag with civ-memorable-date
      const newEl = $('<civ-memorable-date></civ-memorable-date>');
      for (const [k, v] of Object.entries(componentAttrs)) {
        newEl.attr(k, v);
      }
      newEl.html($el.html() ?? '');
      // Wrap with civ-form-field if there are wrapper attributes
      if (Object.keys(wrapperAttrs).length > 0) {
        const wrapperAttrStr = Object.entries(wrapperAttrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        const required = componentAttrs['required'] !== undefined ? ' required' : '';
        const wrapper = $(`<civ-form-field ${wrapperAttrStr}${required}></civ-form-field>`);
        wrapper.append(newEl);
        $el.replaceWith(wrapper);
      } else {
        $el.replaceWith(newEl);
      }
      fixes.push('Replaced <civ-date-input> with <civ-memorable-date> wrapped in <civ-form-field>');
    });
    return fixes;
  },

  'placeholder-as-label'($) {
    const fixes: string[] = [];
    LABEL_COMPONENTS.forEach((tag) => {
      $(tag).each((_, el) => {
        const $el = $(el);
        const placeholder = $el.attr('placeholder');
        const label = $el.attr('label');
        if (placeholder && (!label || label.trim() === '')) {
          // Remove label attr from component, wrap with civ-form-field if not already wrapped
          $el.removeAttr('label');
          if ($el.parents('civ-form-field').length === 0) {
            const required = $el.attr('required') !== undefined ? ' required' : '';
            $el.wrap(`<civ-form-field label="${placeholder}"${required}></civ-form-field>`);
            fixes.push(`Wrapped <${tag}> in <civ-form-field label="${placeholder}"> (from placeholder)`);
          } else {
            $el.closest('civ-form-field').attr('label', placeholder);
            fixes.push(`Set label="${placeholder}" on parent <civ-form-field> (from placeholder)`);
          }
        }
      });
    });
    return fixes;
  },

  'missing-required-message'($) {
    const fixes: string[] = [];
    const allTags = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    for (const tag of allTags) {
      if (tag === 'civ-fieldset') continue;
      $(tag).each((_, el) => {
        const $el = $(el);
        if ($el.attr('required') === undefined) return;
        // Check wrapper for required-message first
        const wrapper = $el.closest('civ-form-field, civ-form-fieldset');
        if (wrapper.length > 0) {
          if (!wrapper.attr('required-message')) {
            const label = wrapper.attr('label') ?? wrapper.attr('legend') ?? tag;
            wrapper.attr('required-message', `${label} is required`);
            fixes.push(`Added required-message to wrapper of <${tag}>`);
          }
        } else if (!$el.attr('required-message')) {
          const label = $el.attr('label') ?? $el.attr('legend') ?? tag;
          $el.attr('required-message', `${label} is required`);
          fixes.push(`Added required-message to <${tag}>`);
        }
      });
    }
    return fixes;
  },

  'orphaned-radio'($) {
    const fixes: string[] = [];
    const orphans: Cheerio<any>[] = [];
    $('civ-radio').each((_, el) => {
      if ($(el).parents('civ-radio-group').length === 0) {
        orphans.push($(el));
      }
    });
    if (orphans.length > 0) {
      const fieldset = $('<civ-form-fieldset legend="Select an option" required></civ-form-fieldset>');
      const group = $('<civ-radio-group name="radio-group" required></civ-radio-group>');
      fieldset.append(group);
      orphans[0].before(fieldset);
      for (const $orphan of orphans) {
        group.append($orphan);
      }
      fixes.push(`Wrapped ${orphans.length} orphaned <civ-radio> in <civ-form-fieldset>/<civ-radio-group>`);
    }
    return fixes;
  },

  'orphaned-segment'($) {
    const fixes: string[] = [];
    const orphans: Cheerio<any>[] = [];
    $('civ-segment').each((_, el) => {
      if ($(el).parents('civ-segmented-control').length === 0) {
        orphans.push($(el));
      }
    });
    if (orphans.length > 0) {
      const fieldset = $('<civ-form-fieldset legend="Options"></civ-form-fieldset>');
      const control = $('<civ-segmented-control name="segmented"></civ-segmented-control>');
      fieldset.append(control);
      orphans[0].before(fieldset);
      for (const $orphan of orphans) {
        control.append($orphan);
      }
      fixes.push(`Wrapped ${orphans.length} orphaned <civ-segment> in <civ-form-fieldset>/<civ-segmented-control>`);
    }
    return fixes;
  },

  'label-on-group'($) {
    const fixes: string[] = [];
    LEGEND_COMPONENTS.forEach((tag) => {
      $(tag).each((_, el) => {
        const $el = $(el);
        const label = $el.attr('label');
        if (label !== undefined) {
          $el.removeAttr('label');
          // Wrap with civ-form-fieldset using the label as legend
          if ($el.parents('civ-form-fieldset').length === 0) {
            const required = $el.attr('required') !== undefined ? ' required' : '';
            $el.wrap(`<civ-form-fieldset legend="${label}"${required}></civ-form-fieldset>`);
            fixes.push(`Moved label to <civ-form-fieldset legend="${label}"> wrapper on <${tag}>`);
          }
        }
      });
    });
    return fixes;
  },

  'legend-on-single'($) {
    const fixes: string[] = [];
    LABEL_COMPONENTS.forEach((tag) => {
      $(tag).each((_, el) => {
        const $el = $(el);
        const legend = $el.attr('legend');
        if (legend !== undefined) {
          $el.removeAttr('legend');
          // Wrap with civ-form-field using the legend as label
          if ($el.parents('civ-form-field').length === 0) {
            const required = $el.attr('required') !== undefined ? ' required' : '';
            $el.wrap(`<civ-form-field label="${legend}"${required}></civ-form-field>`);
            fixes.push(`Moved legend to <civ-form-field label="${legend}"> wrapper on <${tag}>`);
          }
        }
      });
    });
    return fixes;
  },

  'generic-required-message'($) {
    const fixes: string[] = [];
    const GENERIC_RE = /^(this field is required|required|field is required)$/i;
    // Check wrappers first
    $('civ-form-field, civ-form-fieldset').each((_, el) => {
      const $el = $(el);
      const msg = $el.attr('required-message');
      if (msg && GENERIC_RE.test(msg.trim())) {
        const label = $el.attr('label') ?? $el.attr('legend') ?? 'This field';
        $el.attr('required-message', `${label} is required`);
        fixes.push(`Replaced generic required-message on <${el.tagName}>`);
      }
    });
    // Check unwrapped components
    const allTags = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    for (const tag of allTags) {
      if (tag === 'civ-fieldset') continue;
      $(tag).each((_, el) => {
        const $el = $(el);
        const msg = $el.attr('required-message');
        if (msg && GENERIC_RE.test(msg.trim())) {
          const wrapper = $el.closest('civ-form-field, civ-form-fieldset');
          const label = wrapper.length > 0
            ? (wrapper.attr('label') ?? wrapper.attr('legend') ?? tag)
            : ($el.attr('label') ?? $el.attr('legend') ?? tag);
          $el.attr('required-message', `${label} is required`);
          fixes.push(`Replaced generic required-message on <${tag}>`);
        }
      });
    }
    return fixes;
  },

  'missing-hint-date'($) {
    const fixes: string[] = [];
    for (const [tag, hint] of [
      ['civ-memorable-date', 'For example: January 15 1990'],
      ['civ-date-picker', 'For example: 01/15/2024'],
    ] as const) {
      $(tag).each((_, el) => {
        const $el = $(el);
        const wrapper = $el.closest('civ-form-field');
        const target = wrapper.length > 0 ? wrapper : $el;
        if (!target.attr('hint')) {
          target.attr('hint', hint);
          fixes.push(`Added date format hint to ${wrapper.length > 0 ? '<civ-form-field>' : `<${tag}>`}`);
        }
      });
    }
    return fixes;
  },

  'missing-hint-ssn'($) {
    const fixes: string[] = [];
    $('civ-text-input').each((_, el) => {
      const $el = $(el);
      const name = $el.attr('name') ?? '';
      if (/ssn/i.test(name)) {
        const wrapper = $el.closest('civ-form-field');
        const target = wrapper.length > 0 ? wrapper : $el;
        if (!target.attr('hint')) {
          target.attr('hint', 'For example: 123 45 6789');
          fixes.push(`Added SSN format hint to ${wrapper.length > 0 ? '<civ-form-field>' : '<civ-text-input>'}`);
        }
      }
    });
    return fixes;
  },

  'missing-autocomplete'($) {
    const fixes: string[] = [];
    $('civ-text-input').each((_, el) => {
      const $el = $(el);
      const name = $el.attr('name') ?? '';
      if (!$el.attr('autocomplete')) {
        for (const { pattern, autocomplete } of IDENTITY_FIELDS) {
          if (pattern.test(name)) {
            $el.attr('autocomplete', autocomplete);
            fixes.push(`Added autocomplete="${autocomplete}" to <civ-text-input name="${name}">`);
            break;
          }
        }
      }
    });
    return fixes;
  },

  'abbreviation-in-label'($) {
    const fixes: string[] = [];
    // Check wrapper elements first
    $('civ-form-field, civ-form-fieldset').each((_, el) => {
      const $el = $(el);
      for (const prop of ['label', 'legend'] as const) {
        const text = $el.attr(prop);
        if (!text) continue;
        let fixed = text;
        for (const [abbr, expansion] of Object.entries(ABBREVIATIONS)) {
          fixed = fixed.replace(new RegExp(`\\b${abbr}\\b`, 'g'), expansion);
        }
        if (fixed !== text) {
          $el.attr(prop, fixed);
          fixes.push(`Expanded abbreviation in ${prop} on <${el.tagName}>`);
        }
      }
    });
    // Check unwrapped components (self-contained or legacy)
    const allTags = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    for (const tag of allTags) {
      $(tag).each((_, el) => {
        const $el = $(el);
        for (const prop of ['label', 'legend'] as const) {
          const text = $el.attr(prop);
          if (!text) continue;
          let fixed = text;
          for (const [abbr, expansion] of Object.entries(ABBREVIATIONS)) {
            fixed = fixed.replace(new RegExp(`\\b${abbr}\\b`, 'g'), expansion);
          }
          if (fixed !== text) {
            $el.attr(prop, fixed);
            fixes.push(`Expanded abbreviation in ${prop} on <${tag}>`);
          }
        }
      });
    }
    return fixes;
  },

  'comma-in-checkbox-value'($) {
    const fixes: string[] = [];
    $('civ-checkbox').each((_, el) => {
      const value = $(el).attr('value') ?? '';
      if (value.includes(',')) {
        $(el).attr('value', value.replace(/,/g, '-'));
        fixes.push(`Replaced commas with hyphens in <civ-checkbox> value`);
      }
    });
    return fixes;
  },

  'missing-name'($) {
    const fixes: string[] = [];
    const allTags = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    for (const tag of allTags) {
      if (tag === 'civ-fieldset') continue;
      $(tag).each((_, el) => {
        const $el = $(el);
        if (!$el.attr('name')) {
          // Check wrapper for label/legend first
          const wrapper = $el.closest('civ-form-field, civ-form-fieldset');
          const label = $el.attr('label') ?? $el.attr('legend')
            ?? (wrapper.length > 0 ? (wrapper.attr('label') ?? wrapper.attr('legend') ?? '') : '');
          const name = label ? kebab(label) : tag.replace('civ-', '');
          $el.attr('name', name);
          fixes.push(`Added name="${name}" to <${tag}>`);
        }
      });
    }
    return fixes;
  },

  'deprecated-focus-class'($) {
    const fixes: string[] = [];
    $('[class]').each((_, el) => {
      const cls = $(el).attr('class') ?? '';
      if (/focus:civ-outline/.test(cls)) {
        const fixed = cls
          .replace(/focus:civ-outline-\S+/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        $(el).attr('class', (fixed + ' focus-visible:civ-focus-ring').trim());
        fixes.push('Replaced deprecated focus:civ-outline with focus-visible:civ-focus-ring');
      }
    });
    return fixes;
  },

  'physical-css-property'($) {
    const fixes: string[] = [];
    const replacements: [RegExp, string][] = [
      [/civ-ml-/g, 'civ-ms-'],
      [/civ-mr-/g, 'civ-me-'],
      [/civ-pl-/g, 'civ-ps-'],
      [/civ-pr-/g, 'civ-pe-'],
      [/civ-border-l-/g, 'civ-border-s-'],
      [/civ-border-r-/g, 'civ-border-e-'],
      [/civ-rounded-l-/g, 'civ-rounded-s-'],
      [/civ-rounded-r-/g, 'civ-rounded-e-'],
      [/civ-rounded-l\b/g, 'civ-rounded-s'],
      [/civ-rounded-r\b/g, 'civ-rounded-e'],
    ];
    $('[class]').each((_, el) => {
      let cls = $(el).attr('class') ?? '';
      let changed = false;
      for (const [pattern, replacement] of replacements) {
        if (pattern.test(cls)) {
          cls = cls.replace(pattern, replacement);
          changed = true;
        }
      }
      if (changed) {
        $(el).attr('class', cls);
        fixes.push('Replaced physical CSS properties with logical equivalents');
      }
    });
    return fixes;
  },
};

/**
 * Auto-correct CivUI validation violations.
 *
 * @param html - CivUI HTML markup to fix
 * @param rules - Optional rule IDs to limit fixes to
 * @returns Fixed HTML with applied fixes and remaining violations
 */
export function suggestFix(
  html: string,
  rules?: string[],
): SuggestFixResult {
  const initial = validateForm(html);
  const allViolations = [...initial.errors, ...initial.warnings];

  // Filter to requested rules if specified
  const targetViolations = rules
    ? allViolations.filter((v) => rules.includes(v.rule))
    : allViolations;

  if (targetViolations.length === 0) {
    return {
      originalHtml: html,
      fixedHtml: html,
      appliedFixes: [],
      remainingViolations: allViolations,
    };
  }

  const $ = load(html, { xml: false });
  const appliedFixes: string[] = [];

  // Determine which fixers to run
  const ruleIds = rules
    ? new Set(rules)
    : new Set(targetViolations.map((v) => v.rule));

  for (const ruleId of ruleIds) {
    const fixer = FIXERS[ruleId];
    if (fixer) {
      const fixes = fixer($, targetViolations);
      appliedFixes.push(...fixes);
    }
  }

  const fixedHtml = $('body').html() ?? $.html();
  const revalidated = validateForm(fixedHtml);
  const remaining = [...revalidated.errors, ...revalidated.warnings];

  return {
    originalHtml: html,
    fixedHtml,
    appliedFixes,
    remainingViolations: remaining,
  };
}
