/**
 * Validation rules for CivUI form markup.
 * Each rule checks for Section 508 violations (errors) or best-practice issues (warnings).
 */
import type { CheerioAPI } from 'cheerio';

export interface Violation {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  element: string;
  fix: string;
}

export interface Rule {
  id: string;
  severity: 'error' | 'warning';
  description: string;
  check: ($: CheerioAPI, violations: Violation[], rawHtml?: string) => void;
}

/** Components that require a `label` attribute. */
const LABEL_COMPONENTS = [
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
] as const;

/** Components that require a `legend` attribute. */
const LEGEND_COMPONENTS = [
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-segmented-control',
  'civ-fieldset',
] as const;

/** All form-participating components (excludes civ-fieldset). */
const FORM_COMPONENTS = [
  ...LABEL_COMPONENTS,
  ...LEGEND_COMPONENTS.filter((c) => c !== 'civ-fieldset'),
] as const;

/** Common abbreviations that violate plain language guidelines. */
export const ABBREVIATIONS: Record<string, string> = {
  DOB: 'Date of birth',
  SSN: 'Social Security number',
  DOD: 'Department of Defense',
  VA: 'Department of Veterans Affairs',
  EIN: 'Employer Identification Number',
  TIN: 'Taxpayer Identification Number',
};

const ABBREVIATIONS_RE = /\b(DOB|SSN|DOD|VA|EIN|TIN)\b/;

/** Generic required messages that should be replaced with field-specific text. */
const GENERIC_REQUIRED = /^(this field is required|required|field is required)$/i;

/** Identity-related field name patterns that should have autocomplete. */
export const IDENTITY_FIELDS: { pattern: RegExp; autocomplete: string }[] = [
  { pattern: /(?:^|[-_])email(?:$|[-_])/i, autocomplete: 'email' },
  { pattern: /(?:^|[-_])phone(?:$|[-_])/i, autocomplete: 'tel' },
  { pattern: /(?:^|[-_])tel(?:$|[-_])/i, autocomplete: 'tel' },
  { pattern: /(?:^|[-_])first[-_]?name(?:$|[-_])/i, autocomplete: 'given-name' },
  { pattern: /(?:^|[-_])last[-_]?name(?:$|[-_])/i, autocomplete: 'family-name' },
  { pattern: /(?:^|[-_])address(?:$|[-_])/i, autocomplete: 'street-address' },
  { pattern: /(?:^|[-_])zip(?:$|[-_])/i, autocomplete: 'postal-code' },
  { pattern: /(?:^|[-_])zip[-_]?code(?:$|[-_])/i, autocomplete: 'postal-code' },
  { pattern: /(?:^|[-_])postal[-_]?code(?:$|[-_])/i, autocomplete: 'postal-code' },
];

/** Physical CSS properties that should use logical equivalents. */
const PHYSICAL_CSS = /civ-(ml|mr|pl|pr|border-l|border-r|rounded-l|rounded-r)-/;

// --- Error rules (Section 508 violations) ---

const missingLabel: Rule = {
  id: 'missing-label',
  severity: 'error',
  description: 'Label component missing required label attribute',
  check($, violations) {
    for (const tag of LABEL_COMPONENTS) {
      $(tag).each((_, el) => {
        const label = $(el).attr('label');
        if (!label || label.trim() === '') {
          // Check if wrapped in <civ-form-field> with a label (not for self-contained)
          const wrapper = $(el).closest('civ-form-field');
          const wrapperLabel = wrapper.length > 0 ? wrapper.attr('label') : undefined;
          if (wrapperLabel && wrapperLabel.trim() !== '') return;
          violations.push({
            rule: 'missing-label',
            severity: 'error',
            message: `<${tag}> is missing a label attribute`,
            element: tag,
            fix: `Add label="..." to <${tag}> or wrap in <civ-form-field label="...">`,
          });
        }
      });
    }
  },
};

const missingLegend: Rule = {
  id: 'missing-legend',
  severity: 'error',
  description: 'Group component missing required legend attribute',
  check($, violations) {
    for (const tag of LEGEND_COMPONENTS) {
      $(tag).each((_, el) => {
        const legend = $(el).attr('legend');
        if (!legend || legend.trim() === '') {
          // Check if wrapped in <civ-form-fieldset> with a legend
          const wrapper = $(el).closest('civ-form-fieldset');
          const wrapperLegend = wrapper.length > 0 ? wrapper.attr('legend') : undefined;
          if (wrapperLegend && wrapperLegend.trim() !== '') return;
          violations.push({
            rule: 'missing-legend',
            severity: 'error',
            message: `<${tag}> is missing a legend attribute`,
            element: tag,
            fix: `Add legend="..." to <${tag}> or wrap in <civ-form-fieldset legend="...">`,
          });
        }
      });
    }
  },
};

const deprecatedDateInput: Rule = {
  id: 'deprecated-date-input',
  severity: 'error',
  description: 'civ-date-input is deprecated',
  check($, violations) {
    $('civ-date-input').each(() => {
      violations.push({
        rule: 'deprecated-date-input',
        severity: 'error',
        message:
          '<civ-date-input> is deprecated due to Dragon, VoiceOver, and TalkBack issues',
        element: 'civ-date-input',
        fix: 'Use <civ-date-picker> for scheduling dates or <civ-memorable-date> for known dates',
      });
    });
  },
};

const placeholderAsLabel: Rule = {
  id: 'placeholder-as-label',
  severity: 'error',
  description: 'Placeholder used as sole label',
  check($, violations) {
    for (const tag of LABEL_COMPONENTS) {
      $(tag).each((_, el) => {
        const placeholder = $(el).attr('placeholder');
        const label = $(el).attr('label');
        if (placeholder && (!label || label.trim() === '')) {
          // Check if wrapped in <civ-form-field> with a label
          const wrapper = $(el).closest('civ-form-field');
          const wrapperLabel = wrapper.length > 0 ? wrapper.attr('label') : undefined;
          if (wrapperLabel && wrapperLabel.trim() !== '') return;
          violations.push({
            rule: 'placeholder-as-label',
            severity: 'error',
            message: `<${tag}> uses placeholder as sole label`,
            element: tag,
            fix: `Add a label attribute; placeholder is not accessible as a label`,
          });
        }
      });
    }
  },
};

const missingRequiredMessage: Rule = {
  id: 'missing-required-message',
  severity: 'error',
  description: 'Required field without required-message',
  check($, violations) {
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        const $el = $(el);
        if (
          $el.attr('required') !== undefined &&
          !$el.attr('required-message')
        ) {
          // Check if wrapper has required-message
          const wrapper = $el.closest('civ-form-field, civ-form-fieldset');
          if (wrapper.length > 0 && wrapper.attr('required-message')) return;
          violations.push({
            rule: 'missing-required-message',
            severity: 'error',
            message: `<${tag}> has required but no required-message`,
            element: tag,
            fix: `Add required-message="..." with field-specific error text`,
          });
        }
      });
    }
  },
};

const orphanedRadio: Rule = {
  id: 'orphaned-radio',
  severity: 'error',
  description: 'civ-radio not inside civ-radio-group',
  check($, violations) {
    $('civ-radio').each((_, el) => {
      if ($(el).parents('civ-radio-group').length === 0) {
        violations.push({
          rule: 'orphaned-radio',
          severity: 'error',
          message: '<civ-radio> is not inside a <civ-radio-group>',
          element: 'civ-radio',
          fix: 'Wrap <civ-radio> elements in <civ-radio-group>',
        });
      }
    });
  },
};

const orphanedSegment: Rule = {
  id: 'orphaned-segment',
  severity: 'error',
  description: 'civ-segment not inside civ-segmented-control',
  check($, violations) {
    $('civ-segment').each((_, el) => {
      if ($(el).parents('civ-segmented-control').length === 0) {
        violations.push({
          rule: 'orphaned-segment',
          severity: 'error',
          message: '<civ-segment> is not inside a <civ-segmented-control>',
          element: 'civ-segment',
          fix: 'Wrap <civ-segment> elements in <civ-segmented-control>',
        });
      }
    });
  },
};

const labelOnGroup: Rule = {
  id: 'label-on-group',
  severity: 'error',
  description: 'Group component using label instead of legend',
  check($, violations) {
    for (const tag of LEGEND_COMPONENTS) {
      $(tag).each((_, el) => {
        if ($(el).attr('label') !== undefined) {
          violations.push({
            rule: 'label-on-group',
            severity: 'error',
            message: `<${tag}> uses label instead of legend`,
            element: tag,
            fix: `Replace label with legend on <${tag}>`,
          });
        }
      });
    }
  },
};

const legendOnSingle: Rule = {
  id: 'legend-on-single',
  severity: 'error',
  description: 'Single-value component using legend instead of label',
  check($, violations) {
    for (const tag of LABEL_COMPONENTS) {
      $(tag).each((_, el) => {
        if ($(el).attr('legend') !== undefined) {
          violations.push({
            rule: 'legend-on-single',
            severity: 'error',
            message: `<${tag}> uses legend instead of label`,
            element: tag,
            fix: `Replace legend with label on <${tag}>`,
          });
        }
      });
    }
  },
};

/** Pattern matching key[N].field inside repeatable containers. */
const REPEATABLE_NAME_RE = /^[a-zA-Z_-]+\[\d+\]\./;

const duplicateName: Rule = {
  id: 'duplicate-name',
  severity: 'error',
  description: 'Multiple form components share the same name attribute',
  check($, violations) {
    const seen = new Map<string, string>();
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        const name = $(el).attr('name');
        if (!name) return;
        // Skip names matching key[N].field inside repeatable containers
        if (REPEATABLE_NAME_RE.test(name) && $(el).parents('[data-civ-repeatable]').length > 0) {
          return;
        }
        const prev = seen.get(name);
        if (prev) {
          violations.push({
            rule: 'duplicate-name',
            severity: 'error',
            message: `<${tag}> shares name="${name}" with <${prev}>`,
            element: tag,
            fix: `Give each form component a unique name attribute`,
          });
        } else {
          seen.set(name, tag);
        }
      });
    }
  },
};

const emptySelectOptions: Rule = {
  id: 'empty-select-options',
  severity: 'error',
  description: 'Select or combobox with no options',
  check($, violations) {
    for (const tag of ['civ-select', 'civ-combobox'] as const) {
      $(tag).each((_, el) => {
        const $el = $(el);
        const hasOptionsAttr = $el.attr('options') !== undefined;
        const hasChildOptions = $el.children('option').length > 0;
        const hasCascading = $el.attr('data-civ-options-from') !== undefined;
        if (!hasOptionsAttr && !hasChildOptions && !hasCascading) {
          violations.push({
            rule: 'empty-select-options',
            severity: 'error',
            message: `<${tag}> has no options`,
            element: tag,
            fix: `Add options attribute or child <option> elements to <${tag}>`,
          });
        }
      });
    }
  },
};

const radioGroupSingleOption: Rule = {
  id: 'radio-group-single-option',
  severity: 'error',
  description: 'Radio group with fewer than 2 options',
  check($, violations) {
    $('civ-radio-group').each((_, el) => {
      const childCount = $(el).find('civ-radio').length;
      if (childCount < 2) {
        violations.push({
          rule: 'radio-group-single-option',
          severity: 'error',
          message: `<civ-radio-group> has ${childCount} radio option${childCount === 1 ? '' : 's'} (minimum 2)`,
          element: 'civ-radio-group',
          fix: 'A radio group must have at least 2 options; use a checkbox for a single boolean choice',
        });
      }
    });
  },
};

// --- Warning rules (best practices) ---

const genericRequiredMessage: Rule = {
  id: 'generic-required-message',
  severity: 'warning',
  description: 'Generic required-message should be field-specific',
  check($, violations) {
    // Check wrappers
    $('civ-form-field, civ-form-fieldset').each((_, el) => {
      const msg = $(el).attr('required-message');
      if (msg && GENERIC_REQUIRED.test(msg.trim())) {
        const tag = (el as unknown as { tagName: string }).tagName ?? 'civ-form-field';
        violations.push({
          rule: 'generic-required-message',
          severity: 'warning',
          message: `<${tag}> has generic required-message "${msg}"`,
          element: tag,
          fix: 'Use field-specific text, e.g., "Enter your full name"',
        });
      }
    });
    // Check unwrapped components
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        const msg = $(el).attr('required-message');
        if (msg && GENERIC_REQUIRED.test(msg.trim())) {
          violations.push({
            rule: 'generic-required-message',
            severity: 'warning',
            message: `<${tag}> has generic required-message "${msg}"`,
            element: tag,
            fix: 'Use field-specific text, e.g., "Enter your full name"',
          });
        }
      });
    }
  },
};

const missingHintDate: Rule = {
  id: 'missing-hint-date',
  severity: 'warning',
  description: 'Date component missing hint with expected format',
  check($, violations) {
    for (const tag of ['civ-memorable-date', 'civ-date-picker'] as const) {
      $(tag).each((_, el) => {
        if (!$(el).attr('hint')) {
          // Check wrapper for hint
          const wrapper = $(el).closest('civ-form-field, civ-form-fieldset');
          if (wrapper.length > 0 && wrapper.attr('hint')) return;
          violations.push({
            rule: 'missing-hint-date',
            severity: 'warning',
            message: `<${tag}> is missing a hint showing expected date format`,
            element: tag,
            fix:
              tag === 'civ-memorable-date'
                ? 'Add hint="For example: January 15 1990"'
                : 'Add hint="For example: 01/15/2024"',
          });
        }
      });
    }
  },
};

const missingHintSsn: Rule = {
  id: 'missing-hint-ssn',
  severity: 'warning',
  description: 'SSN field missing hint with expected format',
  check($, violations) {
    $('civ-text-input').each((_, el) => {
      const name = $(el).attr('name') ?? '';
      if (/ssn/i.test(name) && !$(el).attr('hint')) {
        // Check wrapper for hint
        const wrapper = $(el).closest('civ-form-field');
        if (wrapper.length > 0 && wrapper.attr('hint')) return;
        violations.push({
          rule: 'missing-hint-ssn',
          severity: 'warning',
          message: '<civ-text-input> with SSN name is missing a hint',
          element: 'civ-text-input',
          fix: 'Add hint="For example: 123 45 6789"',
        });
      }
    });
  },
};

const missingAutocomplete: Rule = {
  id: 'missing-autocomplete',
  severity: 'warning',
  description: 'Identity field missing autocomplete attribute',
  check($, violations) {
    $('civ-text-input').each((_, el) => {
      const name = $(el).attr('name') ?? '';
      if (!$(el).attr('autocomplete')) {
        for (const { pattern, autocomplete } of IDENTITY_FIELDS) {
          if (pattern.test(name)) {
            violations.push({
              rule: 'missing-autocomplete',
              severity: 'warning',
              message: `<civ-text-input name="${name}"> is missing autocomplete`,
              element: 'civ-text-input',
              fix: `Add autocomplete="${autocomplete}"`,
            });
            break;
          }
        }
      }
    });
  },
};

const abbreviationInLabel: Rule = {
  id: 'abbreviation-in-label',
  severity: 'warning',
  description: 'Label contains abbreviation instead of plain language',
  check($, violations) {
    // Check wrappers
    $('civ-form-field, civ-form-fieldset').each((_, el) => {
      const label = $(el).attr('label') ?? $(el).attr('legend') ?? '';
      const match = ABBREVIATIONS_RE.exec(label);
      if (match) {
        const tag = (el as unknown as { tagName: string }).tagName ?? 'civ-form-field';
        violations.push({
          rule: 'abbreviation-in-label',
          severity: 'warning',
          message: `<${tag}> label contains abbreviation "${match[1]}"`,
          element: tag,
          fix: 'Use plain language: "Date of birth" not "DOB", "Social Security number" not "SSN"',
        });
      }
    });
    // Check unwrapped components
    const allComponents = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    for (const tag of allComponents) {
      $(tag).each((_, el) => {
        const label = $(el).attr('label') ?? $(el).attr('legend') ?? '';
        const match = ABBREVIATIONS_RE.exec(label);
        if (match) {
          violations.push({
            rule: 'abbreviation-in-label',
            severity: 'warning',
            message: `<${tag}> label contains abbreviation "${match[1]}"`,
            element: tag,
            fix: 'Use plain language: "Date of birth" not "DOB", "Social Security number" not "SSN"',
          });
        }
      });
    }
  },
};

const commaInCheckboxValue: Rule = {
  id: 'comma-in-checkbox-value',
  severity: 'warning',
  description: 'Checkbox value contains comma which breaks internal delimiter',
  check($, violations) {
    $('civ-checkbox').each((_, el) => {
      const value = $(el).attr('value') ?? '';
      if (value.includes(',')) {
        violations.push({
          rule: 'comma-in-checkbox-value',
          severity: 'warning',
          message: `<civ-checkbox> value "${value}" contains a comma`,
          element: 'civ-checkbox',
          fix: 'Remove commas from checkbox values — they break the internal delimiter in checkbox-group',
        });
      }
    });
  },
};

const missingName: Rule = {
  id: 'missing-name',
  severity: 'warning',
  description: 'Form-participating component missing name attribute',
  check($, violations) {
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        if (!$(el).attr('name')) {
          violations.push({
            rule: 'missing-name',
            severity: 'warning',
            message: `<${tag}> is missing a name attribute`,
            element: tag,
            fix: `Add name="..." to <${tag}> for form submission`,
          });
        }
      });
    }
  },
};

const nestedFieldset: Rule = {
  id: 'nested-fieldset',
  severity: 'warning',
  description: 'Fieldset nested inside another fieldset',
  check($, violations) {
    $('civ-fieldset').each((_, el) => {
      if ($(el).parents('civ-fieldset').length > 0) {
        violations.push({
          rule: 'nested-fieldset',
          severity: 'warning',
          message: '<civ-fieldset> is nested inside another <civ-fieldset>',
          element: 'civ-fieldset',
          fix: 'Avoid nesting fieldsets; use headings or separate sections instead',
        });
      }
    });
  },
};

const largeRadioGroup: Rule = {
  id: 'large-radio-group',
  severity: 'warning',
  description: 'Radio group with more than 7 options',
  check($, violations) {
    $('civ-radio-group').each((_, el) => {
      const childCount = $(el).find('civ-radio').length;
      if (childCount > 7) {
        violations.push({
          rule: 'large-radio-group',
          severity: 'warning',
          message: `<civ-radio-group> has ${childCount} options (more than 7)`,
          element: 'civ-radio-group',
          fix: 'Consider using <civ-select> or <civ-combobox> for more than 7 options',
        });
      }
    });
  },
};

const missingFormWrapper: Rule = {
  id: 'missing-form-wrapper',
  severity: 'warning',
  description: 'Form component not inside a form wrapper',
  check($, violations) {
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        const $el = $(el);
        if (
          $el.parents('civ-form').length === 0 &&
          $el.parents('form').length === 0
        ) {
          violations.push({
            rule: 'missing-form-wrapper',
            severity: 'warning',
            message: `<${tag}> is not inside a <civ-form> or <form>`,
            element: tag,
            fix: 'Wrap form components in <civ-form> for error summary and submission handling',
          });
        }
      });
    }
  },
};

const excessiveFileSize: Rule = {
  id: 'excessive-file-size',
  severity: 'warning',
  description: 'File upload with max-size exceeding 25 MB',
  check($, violations) {
    $('civ-file-upload').each((_, el) => {
      const maxSize = $(el).attr('max-size');
      if (maxSize) {
        const bytes = parseInt(maxSize, 10);
        if (!isNaN(bytes) && bytes > 25 * 1024 * 1024) {
          violations.push({
            rule: 'excessive-file-size',
            severity: 'warning',
            message: `<civ-file-upload> has max-size of ${Math.round(bytes / (1024 * 1024))} MB (exceeds 25 MB)`,
            element: 'civ-file-upload',
            fix: 'Consider limiting max-size to 25 MB or less for government forms',
          });
        }
      }
    });
  },
};

const toggleWithoutDefault: Rule = {
  id: 'toggle-without-default',
  severity: 'warning',
  description: 'Toggle without explicit value attribute',
  check($, violations) {
    $('civ-toggle').each((_, el) => {
      if ($(el).attr('value') === undefined) {
        violations.push({
          rule: 'toggle-without-default',
          severity: 'warning',
          message: '<civ-toggle> has no explicit value attribute',
          element: 'civ-toggle',
          fix: 'Add value="true" or another explicit default value to <civ-toggle>',
        });
      }
    });
  },
};

const deprecatedFocusClass: Rule = {
  id: 'deprecated-focus-class',
  severity: 'warning',
  description: 'Uses deprecated focus:civ-outline class',
  check($, violations) {
    $('[class]').each((_, el) => {
      const cls = $(el).attr('class') ?? '';
      if (/focus:civ-outline/.test(cls)) {
        const tag = (el as unknown as { tagName: string }).tagName ?? 'unknown';
        violations.push({
          rule: 'deprecated-focus-class',
          severity: 'warning',
          message: `<${tag}> uses deprecated focus:civ-outline class`,
          element: tag,
          fix: 'Replace with focus-visible:civ-focus-ring',
        });
      }
    });
  },
};

const physicalCssProperty: Rule = {
  id: 'physical-css-property',
  severity: 'warning',
  description: 'Uses physical CSS property instead of logical equivalent',
  check($, violations) {
    $('[class]').each((_, el) => {
      const cls = $(el).attr('class') ?? '';
      if (PHYSICAL_CSS.test(cls)) {
        const tag = (el as unknown as { tagName: string }).tagName ?? 'unknown';
        violations.push({
          rule: 'physical-css-property',
          severity: 'warning',
          message: `<${tag}> uses physical CSS property instead of logical equivalent`,
          element: tag,
          fix: 'Use logical properties for RTL safety: civ-ms-/civ-me- instead of civ-ml-/civ-mr-, civ-ps-/civ-pe- instead of civ-pl-/civ-pr-, civ-border-s/civ-border-e, civ-rounded-s/civ-rounded-e',
        });
      }
    });
  },
};

const readingLevel: Rule = {
  id: 'reading-level',
  severity: 'warning',
  description: 'Labels and hints use complex language (high reading level)',
  check($, violations) {
    const allComponents = [...LABEL_COMPONENTS, ...LEGEND_COMPONENTS];
    const words: string[] = [];

    // Collect text from wrappers
    $('civ-form-field, civ-form-fieldset').each((_, el) => {
      const label = $(el).attr('label') ?? $(el).attr('legend') ?? '';
      const hint = $(el).attr('hint') ?? '';
      for (const text of [label, hint]) {
        if (text.trim()) {
          words.push(...text.trim().split(/\s+/));
        }
      }
    });

    // Collect text from unwrapped components
    for (const tag of allComponents) {
      $(tag).each((_, el) => {
        const label = $(el).attr('label') ?? $(el).attr('legend') ?? '';
        const hint = $(el).attr('hint') ?? '';
        for (const text of [label, hint]) {
          if (text.trim()) {
            words.push(...text.trim().split(/\s+/));
          }
        }
      });
    }

    if (words.length === 0) return;

    const avgWordLength =
      words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / words.length;
    const avgWordsPerSentence = words.length;

    if (avgWordLength > 6 && avgWordsPerSentence > 15) {
      violations.push({
        rule: 'reading-level',
        severity: 'warning',
        message: `Form labels have high reading complexity (avg word length: ${avgWordLength.toFixed(1)} chars, ${words.length} total words)`,
        element: 'form',
        fix: 'Use plain language: shorter words and simpler sentences in labels and hints',
      });
    }
  },
};

const missingInputmode: Rule = {
  id: 'missing-inputmode',
  severity: 'warning',
  description: 'Numeric-entry field missing inputmode attribute',
  check($, violations) {
    $('civ-text-input').each((_, el) => {
      const $el = $(el);
      const type = $el.attr('type') ?? '';
      const name = $el.attr('name') ?? '';

      if (
        (type === 'tel' || /ssn|zip|phone|postal/i.test(name)) &&
        !$el.attr('inputmode')
      ) {
        violations.push({
          rule: 'missing-inputmode',
          severity: 'warning',
          message: `<civ-text-input name="${name}"> should have an inputmode attribute for mobile keyboard optimization`,
          element: 'civ-text-input',
          fix: type === 'tel'
            ? 'Add inputmode="tel"'
            : 'Add inputmode="numeric"',
        });
      }
    });
  },
};

const formLength: Rule = {
  id: 'form-length',
  severity: 'warning',
  description: 'Form or fieldset has too many fields',
  check($, violations) {
    const formSelector = FORM_COMPONENTS.join(', ');

    // Check civ-form and form elements without fieldsets
    $('civ-form, form').each((_, el) => {
      const $el = $(el);
      // Count direct form fields not inside a fieldset
      let directCount = 0;
      $el.find(formSelector).each((_, field) => {
        if ($(field).closest('civ-fieldset').length === 0) {
          directCount++;
        }
      });

      if (directCount > 20) {
        violations.push({
          rule: 'form-length',
          severity: 'warning',
          message: `Form has ${directCount} fields without fieldset grouping (more than 20)`,
          element: (el as unknown as { tagName: string }).tagName ?? 'form',
          fix: 'Break the form into logical sections using <civ-fieldset> with descriptive legends',
        });
      }
    });

    // Check each fieldset for too many direct children
    $('civ-fieldset').each((_, el) => {
      const $el = $(el);
      let directChildFields = 0;
      $el.find(formSelector).each((_, field) => {
        const closestFieldset = $(field).closest('civ-fieldset');
        if (closestFieldset.length && closestFieldset[0] === el) {
          directChildFields++;
        }
      });

      if (directChildFields > 7) {
        const legend = $el.attr('legend') ?? 'unnamed';
        violations.push({
          rule: 'form-length',
          severity: 'warning',
          message: `<civ-fieldset legend="${legend}"> has ${directChildFields} direct form fields (more than 7)`,
          element: 'civ-fieldset',
          fix: 'Consider splitting this fieldset into smaller logical groups',
        });
      }
    });
  },
};

// --- Repeatable / conditional rules ---

const repeatableMissingKey: Rule = {
  id: 'repeatable-missing-key',
  severity: 'error',
  description: 'Repeatable container missing key attribute value',
  check($, violations) {
    $('[data-civ-repeatable]').each((_, el) => {
      const key = $(el).attr('data-civ-repeatable');
      if (!key || key.trim() === '') {
        violations.push({
          rule: 'repeatable-missing-key',
          severity: 'error',
          message: '[data-civ-repeatable] has empty attribute value',
          element: 'div',
          fix: 'Set data-civ-repeatable to the array key, e.g., data-civ-repeatable="dependents"',
        });
      }
    });
  },
};

const repeatableMissingButtons: Rule = {
  id: 'repeatable-missing-buttons',
  severity: 'error',
  description: 'Repeatable container missing add or remove buttons',
  check($, violations) {
    $('[data-civ-repeatable]').each((_, el) => {
      const $el = $(el);
      const key = $el.attr('data-civ-repeatable') ?? '';
      if (!key) return; // already caught by repeatable-missing-key
      const hasAdd = $el.find('[data-civ-repeatable-add]').length > 0;
      const hasRemove = $el.find('[data-civ-repeatable-remove]').length > 0;
      if (!hasAdd) {
        violations.push({
          rule: 'repeatable-missing-buttons',
          severity: 'error',
          message: `[data-civ-repeatable="${key}"] is missing an add button`,
          element: 'div',
          fix: 'Add a <button data-civ-repeatable-add> inside the repeatable container',
        });
      }
      if (!hasRemove) {
        violations.push({
          rule: 'repeatable-missing-buttons',
          severity: 'error',
          message: `[data-civ-repeatable="${key}"] is missing a remove button`,
          element: 'div',
          fix: 'Add a <button data-civ-repeatable-remove> inside each repeatable item',
        });
      }
    });
  },
};

/** Extract all field references from a condition attribute value (handles JSON compound). */
function extractFieldRefs(attrValue: string): string[] {
  const refs: string[] = [];

  // Try JSON compound condition
  if (attrValue.trimStart().startsWith('{')) {
    try {
      const parsed = JSON.parse(attrValue);
      extractFieldRefsFromCondition(parsed, refs);
      return refs;
    } catch {
      // Fall through to simple parsing
    }
  }

  // Simple condition — extract the field reference
  const match = attrValue.match(/^([a-zA-Z0-9_.-]+)/);
  if (match) refs.push(match[1]);
  return refs;
}

function extractFieldRefsFromCondition(cond: unknown, refs: string[]): void {
  if (!cond || typeof cond !== 'object') return;
  const obj = cond as Record<string, unknown>;

  if ('field' in obj && typeof obj.field === 'string') {
    refs.push(obj.field);
    return;
  }

  if (Array.isArray(obj.allOf)) {
    for (const c of obj.allOf) extractFieldRefsFromCondition(c, refs);
  }
  if (Array.isArray(obj.anyOf)) {
    for (const c of obj.anyOf) extractFieldRefsFromCondition(c, refs);
  }
}

const conditionalTargetMissing: Rule = {
  id: 'conditional-target-missing',
  severity: 'error',
  description: 'Conditional attribute references a field name that does not exist in the form',
  check($, violations) {
    // Collect all field names in the form
    const fieldNames = new Set<string>();
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        const name = $(el).attr('name');
        if (name) fieldNames.add(name);
      });
    }

    const attrs = ['data-civ-show-when', 'data-civ-hide-when', 'data-civ-require-when'] as const;
    for (const attrName of attrs) {
      $(`[${attrName}]`).each((_, el) => {
        const val = $(el).attr(attrName) ?? '';
        const refs = extractFieldRefs(val);
        for (const refField of refs) {
          if (!fieldNames.has(refField)) {
            violations.push({
              rule: 'conditional-target-missing',
              severity: 'error',
              message: `${attrName} references field "${refField}" which does not exist in the form`,
              element: (el as unknown as { tagName: string }).tagName ?? 'unknown',
              fix: `Ensure a form component with name="${refField}" exists in the form`,
            });
          }
        }
      });
    }
  },
};

const repeatableNoAriaLive: Rule = {
  id: 'repeatable-no-aria-live',
  severity: 'warning',
  description: 'Repeatable container missing aria-live attribute',
  check($, violations) {
    $('[data-civ-repeatable]').each((_, el) => {
      if (!$(el).attr('aria-live')) {
        violations.push({
          rule: 'repeatable-no-aria-live',
          severity: 'warning',
          message: '[data-civ-repeatable] is missing aria-live attribute',
          element: 'div',
          fix: 'Add aria-live="polite" to the repeatable container for screen reader announcements',
        });
      }
    });
  },
};

const repeatableNoMin: Rule = {
  id: 'repeatable-no-min',
  severity: 'warning',
  description: 'Repeatable container missing minimum item count',
  check($, violations) {
    $('[data-civ-repeatable]').each((_, el) => {
      if (!$(el).attr('data-civ-repeatable-min')) {
        violations.push({
          rule: 'repeatable-no-min',
          severity: 'warning',
          message: '[data-civ-repeatable] is missing data-civ-repeatable-min attribute',
          element: 'div',
          fix: 'Add data-civ-repeatable-min="0" or another appropriate minimum',
        });
      }
    });
  },
};

// --- Wizard rules ---

const wizardMissingProgress: Rule = {
  id: 'wizard-missing-progress',
  severity: 'error',
  description: 'Wizard step containers found but no progress indicator',
  check($, violations) {
    const hasSteps = $('[data-civ-step]').length > 0;
    const hasProgress = $('[data-civ-progress]').length > 0;
    if (hasSteps && !hasProgress) {
      violations.push({
        rule: 'wizard-missing-progress',
        severity: 'error',
        message: 'Form has [data-civ-step] containers but no [data-civ-progress] indicator',
        element: 'div',
        fix: 'Add a <nav data-civ-progress> element with step titles for screen reader users',
      });
    }
  },
};

const wizardStepGap: Rule = {
  id: 'wizard-step-gap',
  severity: 'warning',
  description: 'Wizard has non-contiguous step numbers',
  check($, violations) {
    const stepNums: number[] = [];
    $('[data-civ-step]').each((_, el) => {
      const val = $(el).attr('data-civ-step');
      if (val !== undefined) stepNums.push(parseInt(val, 10));
    });
    if (stepNums.length < 2) return;
    stepNums.sort((a, b) => a - b);
    for (let i = 1; i < stepNums.length; i++) {
      if (stepNums[i] !== stepNums[i - 1] + 1) {
        violations.push({
          rule: 'wizard-step-gap',
          severity: 'warning',
          message: `Wizard steps are not contiguous: found steps ${stepNums.join(', ')}`,
          element: 'div',
          fix: 'Use sequential step numbers starting from 0: 0, 1, 2, ...',
        });
        return;
      }
    }
  },
};

const wizardStepNoFields: Rule = {
  id: 'wizard-step-no-fields',
  severity: 'warning',
  description: 'Wizard step contains no form fields',
  check($, violations) {
    const formSelector = FORM_COMPONENTS.join(', ');
    $('[data-civ-step]').each((_, el) => {
      const $el = $(el);
      const stepNum = $el.attr('data-civ-step') ?? '?';
      const fieldCount = $el.find(formSelector).length;
      if (fieldCount === 0) {
        violations.push({
          rule: 'wizard-step-no-fields',
          severity: 'warning',
          message: `Wizard step ${stepNum} contains no form fields`,
          element: 'div',
          fix: 'Add form fields to this step or remove the empty step',
        });
      }
    });
  },
};

// --- Cascading / table rules ---

const cascadingSourceMissing: Rule = {
  id: 'cascading-source-missing',
  severity: 'error',
  description: 'Cascading options source field does not exist in the form',
  check($, violations) {
    const fieldNames = new Set<string>();
    for (const tag of FORM_COMPONENTS) {
      $(tag).each((_, el) => {
        const name = $(el).attr('name');
        if (name) fieldNames.add(name);
      });
    }

    $('[data-civ-options-from]').each((_, el) => {
      const parentField = $(el).attr('data-civ-options-from') ?? '';
      if (parentField && !fieldNames.has(parentField)) {
        violations.push({
          rule: 'cascading-source-missing',
          severity: 'error',
          message: `data-civ-options-from references field "${parentField}" which does not exist in the form`,
          element: (el as unknown as { tagName: string }).tagName ?? 'unknown',
          fix: `Ensure a form component with name="${parentField}" exists in the form`,
        });
      }
    });
  },
};

const cascadingEmptyMap: Rule = {
  id: 'cascading-empty-map',
  severity: 'warning',
  description: 'Cascading options map has no entries',
  check($, violations) {
    $('[data-civ-options-from]').each((_, el) => {
      const childName = $(el).attr('name') ?? '';
      const mapScript = $(`script[data-civ-options-map="${childName}"]`);
      if (mapScript.length) {
        try {
          const map = JSON.parse(mapScript.text() || '{}');
          if (Object.keys(map).length === 0) {
            violations.push({
              rule: 'cascading-empty-map',
              severity: 'warning',
              message: `Cascading options map for "${childName}" has no entries`,
              element: (el as unknown as { tagName: string }).tagName ?? 'unknown',
              fix: 'Add parent value → options entries to the cascading options map',
            });
          }
        } catch {
          violations.push({
            rule: 'cascading-empty-map',
            severity: 'warning',
            message: `Cascading options map for "${childName}" contains invalid JSON`,
            element: (el as unknown as { tagName: string }).tagName ?? 'unknown',
            fix: 'Ensure the script[data-civ-options-map] contains valid JSON',
          });
        }
      }
    });
  },
};

const tableLayoutNotRepeatable: Rule = {
  id: 'table-layout-not-repeatable',
  severity: 'warning',
  description: 'Table layout used without repeatable container',
  check($, violations) {
    $('[data-civ-layout="table"]').each((_, el) => {
      if (!$(el).attr('data-civ-repeatable')) {
        violations.push({
          rule: 'table-layout-not-repeatable',
          severity: 'warning',
          message: 'data-civ-layout="table" is used without data-civ-repeatable',
          element: (el as unknown as { tagName: string }).tagName ?? 'unknown',
          fix: 'Add data-civ-repeatable="key" to the table layout container',
        });
      }
    });
  },
};

// --- Section 508 additional rules ---

const imgMissingAlt: Rule = {
  id: 'img-missing-alt',
  severity: 'error',
  description: 'Image element missing alt attribute',
  check($, violations) {
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined) {
        violations.push({
          rule: 'img-missing-alt',
          severity: 'error',
          message: '<img> is missing alt attribute (use alt="" for decorative images)',
          element: 'img',
          fix: 'Add alt="description" for informative images or alt="" for decorative images',
        });
      }
    });
  },
};

const headingHierarchy: Rule = {
  id: 'heading-hierarchy',
  severity: 'warning',
  description: 'Heading levels skip a level (e.g., h1 to h3)',
  check($, violations) {
    const headings: number[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const tag = (el as unknown as { tagName: string }).tagName?.toLowerCase() ?? '';
      const level = parseInt(tag.replace('h', ''), 10);
      if (!isNaN(level)) headings.push(level);
    });

    for (let i = 1; i < headings.length; i++) {
      if (headings[i] > headings[i - 1] + 1) {
        violations.push({
          rule: 'heading-hierarchy',
          severity: 'warning',
          message: `Heading hierarchy skips from h${headings[i - 1]} to h${headings[i]}`,
          element: `h${headings[i]}`,
          fix: `Use sequential heading levels (h${headings[i - 1]} → h${headings[i - 1] + 1})`,
        });
        return; // Report once
      }
    }
  },
};

/** Link text patterns that provide no context. */
const VAGUE_LINK_TEXT = /^(click here|here|read more|learn more|more|link|this)$/i;

const vagueLinkText: Rule = {
  id: 'vague-link-text',
  severity: 'warning',
  description: 'Link text is vague and not descriptive',
  check($, violations) {
    $('a').each((_, el) => {
      const text = $(el).text().trim();
      if (VAGUE_LINK_TEXT.test(text)) {
        violations.push({
          rule: 'vague-link-text',
          severity: 'warning',
          message: `Link text "${text}" is not descriptive`,
          element: 'a',
          fix: 'Use descriptive link text that makes sense out of context, e.g., "View your claim status" instead of "Click here"',
        });
      }
    });
  },
};

const positiveTabindex: Rule = {
  id: 'positive-tabindex',
  severity: 'error',
  description: 'Element has positive tabindex which disrupts natural tab order',
  check($, violations) {
    $('[tabindex]').each((_, el) => {
      const val = $(el).attr('tabindex');
      if (val !== undefined) {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0) {
          const tag = (el as unknown as { tagName: string }).tagName ?? 'unknown';
          violations.push({
            rule: 'positive-tabindex',
            severity: 'error',
            message: `<${tag}> has tabindex="${num}" which disrupts natural tab order`,
            element: tag,
            fix: 'Use tabindex="0" for focusable elements or tabindex="-1" for programmatic focus. Never use positive tabindex values.',
          });
        }
      }
    });
  },
};

const missingLangAttribute: Rule = {
  id: 'missing-lang',
  severity: 'warning',
  description: 'HTML element missing lang attribute',
  check($, violations, rawHtml) {
    // Only flag if the raw source contains an explicit <html> tag.
    // Cheerio wraps all fragments in <html>, so we check the original input.
    if (!rawHtml || !/<html[\s>]/i.test(rawHtml)) return;
    const html = $('html');
    if (html.length > 0 && !html.attr('lang')) {
      violations.push({
        rule: 'missing-lang',
        severity: 'warning',
        message: '<html> is missing lang attribute',
        element: 'html',
        fix: 'Add lang="en" (or appropriate language) to the <html> element',
      });
    }
  },
};

const missingRoleAlert: Rule = {
  id: 'missing-role-alert',
  severity: 'warning',
  description: 'Error message container missing role="alert"',
  check($, violations) {
    // Check for elements that look like error containers but lack role="alert"
    $('[class*="error"], [class*="Error"]').each((_, el) => {
      const $el = $(el);
      const tag = (el as unknown as { tagName: string }).tagName ?? 'unknown';
      // Only flag non-CivUI elements (CivUI components handle role="alert" internally)
      if (tag.startsWith('civ-')) return;
      const role = $el.attr('role');
      const ariaLive = $el.attr('aria-live');
      if (!role && !ariaLive && $el.text().trim()) {
        violations.push({
          rule: 'missing-role-alert',
          severity: 'warning',
          message: `Error container <${tag}> is missing role="alert" or aria-live`,
          element: tag,
          fix: 'Add role="alert" to error message containers for screen reader announcement',
        });
      }
    });
  },
};

/** All validation rules. */
export const RULES: Rule[] = [
  // Errors
  missingLabel,
  missingLegend,
  deprecatedDateInput,
  placeholderAsLabel,
  missingRequiredMessage,
  orphanedRadio,
  orphanedSegment,
  labelOnGroup,
  legendOnSingle,
  duplicateName,
  emptySelectOptions,
  radioGroupSingleOption,
  repeatableMissingKey,
  repeatableMissingButtons,
  conditionalTargetMissing,
  wizardMissingProgress,
  cascadingSourceMissing,
  imgMissingAlt,
  positiveTabindex,
  // Warnings
  genericRequiredMessage,
  missingHintDate,
  missingHintSsn,
  missingAutocomplete,
  abbreviationInLabel,
  commaInCheckboxValue,
  missingName,
  nestedFieldset,
  largeRadioGroup,
  missingFormWrapper,
  excessiveFileSize,
  toggleWithoutDefault,
  deprecatedFocusClass,
  physicalCssProperty,
  readingLevel,
  missingInputmode,
  formLength,
  repeatableNoAriaLive,
  repeatableNoMin,
  wizardStepGap,
  wizardStepNoFields,
  cascadingEmptyMap,
  tableLayoutNotRepeatable,
  headingHierarchy,
  vagueLinkText,
  missingLangAttribute,
  missingRoleAlert,
];
