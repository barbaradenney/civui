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

/** Label components (single-value). */
const LABEL_COMPONENTS = new Set([
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-date-picker',
  'civ-memorable-date',
  'civ-date-range-picker',
  'civ-yes-no',
  'civ-checkbox',
  'civ-toggle',
  'civ-file-upload',
]);

/** Group components (use legend). */
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
        if ($el.attr('label')) return;
        const name = $el.attr('name') ?? '';
        const label = name
          ? name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : v.element.replace('civ-', '').replace(/-/g, ' ');
        $el.attr('label', label);
        fixes.push(`Added label="${label}" to <${v.element}>`);
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
        if ($el.attr('legend')) return;
        const name = $el.attr('name') ?? '';
        const legend = name
          ? name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : v.element.replace('civ-', '').replace(/-/g, ' ');
        $el.attr('legend', legend);
        fixes.push(`Added legend="${legend}" to <${v.element}>`);
      });
    }
    return fixes;
  },

  'deprecated-date-input'($) {
    const fixes: string[] = [];
    $('civ-date-input').each((_, el) => {
      const $el = $(el);
      // Get all attributes
      const attrs: Record<string, string> = {};
      const rawAttrs = el.type === 'tag' ? el.attribs : {};
      for (const [k, v] of Object.entries(rawAttrs)) {
        if (k === 'label') {
          attrs['legend'] = v;
        } else {
          attrs[k] = v;
        }
      }
      // Replace tag
      const newEl = $('<civ-memorable-date></civ-memorable-date>');
      for (const [k, v] of Object.entries(attrs)) {
        newEl.attr(k, v);
      }
      newEl.html($el.html() ?? '');
      $el.replaceWith(newEl);
      fixes.push('Replaced <civ-date-input> with <civ-memorable-date>');
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
          $el.attr('label', placeholder);
          fixes.push(`Copied placeholder to label on <${tag}>`);
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
        if (
          $el.attr('required') !== undefined &&
          !$el.attr('required-message')
        ) {
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
      const wrapper = $('<civ-radio-group legend="Select an option" name="radio-group"></civ-radio-group>');
      orphans[0].before(wrapper);
      for (const $orphan of orphans) {
        wrapper.append($orphan);
      }
      fixes.push(`Wrapped ${orphans.length} orphaned <civ-radio> in <civ-radio-group>`);
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
      const wrapper = $('<civ-segmented-control legend="Options" name="segmented"></civ-segmented-control>');
      orphans[0].before(wrapper);
      for (const $orphan of orphans) {
        wrapper.append($orphan);
      }
      fixes.push(`Wrapped ${orphans.length} orphaned <civ-segment> in <civ-segmented-control>`);
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
          if (!$el.attr('legend')) {
            $el.attr('legend', label);
          }
          fixes.push(`Swapped label→legend on <${tag}>`);
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
          if (!$el.attr('label')) {
            $el.attr('label', legend);
          }
          fixes.push(`Swapped legend→label on <${tag}>`);
        }
      });
    });
    return fixes;
  },

  'generic-required-message'($) {
    const fixes: string[] = [];
    const GENERIC_RE = /^(this field is required|required|field is required)$/i;
    const allTags = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    for (const tag of allTags) {
      if (tag === 'civ-fieldset') continue;
      $(tag).each((_, el) => {
        const $el = $(el);
        const msg = $el.attr('required-message');
        if (msg && GENERIC_RE.test(msg.trim())) {
          const label = $el.attr('label') ?? $el.attr('legend') ?? tag;
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
        if (!$(el).attr('hint')) {
          $(el).attr('hint', hint);
          fixes.push(`Added date format hint to <${tag}>`);
        }
      });
    }
    return fixes;
  },

  'missing-hint-ssn'($) {
    const fixes: string[] = [];
    $('civ-text-input').each((_, el) => {
      const name = $(el).attr('name') ?? '';
      if (/ssn/i.test(name) && !$(el).attr('hint')) {
        $(el).attr('hint', 'For example: 123 45 6789');
        fixes.push('Added SSN format hint to <civ-text-input>');
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
          const label = $el.attr('label') ?? $el.attr('legend') ?? '';
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
