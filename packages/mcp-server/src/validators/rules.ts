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
  check: ($: CheerioAPI, violations: Violation[]) => void;
}

/** Components that require a `label` attribute. */
const LABEL_COMPONENTS = [
  'civ-text-input',
  'civ-textarea',
  'civ-select',
  'civ-combobox',
  'civ-date-picker',
  'civ-checkbox',
  'civ-toggle',
  'civ-file-upload',
] as const;

/** Components that require a `legend` attribute. */
const LEGEND_COMPONENTS = [
  'civ-radio-group',
  'civ-checkbox-group',
  'civ-memorable-date',
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
          violations.push({
            rule: 'missing-label',
            severity: 'error',
            message: `<${tag}> is missing a label attribute`,
            element: tag,
            fix: `Add label="..." to <${tag}>`,
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
          violations.push({
            rule: 'missing-legend',
            severity: 'error',
            message: `<${tag}> is missing a legend attribute`,
            element: tag,
            fix: `Add legend="..." to <${tag}>`,
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
        if (!hasOptionsAttr && !hasChildOptions) {
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
];
