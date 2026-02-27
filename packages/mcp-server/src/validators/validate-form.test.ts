import { describe, it, expect } from 'vitest';
import { validateForm } from './validate-form.js';
import { RULES } from './rules.js';

describe('validateForm', () => {
  // ---- Meta ----

  it('has 18 rules total (9 errors + 9 warnings)', () => {
    const errors = RULES.filter((r) => r.severity === 'error');
    const warnings = RULES.filter((r) => r.severity === 'warning');
    expect(errors).toHaveLength(9);
    expect(warnings).toHaveLength(9);
    expect(RULES).toHaveLength(18);
  });

  it('returns valid:true and empty arrays for valid markup', () => {
    const html = `
      <civ-text-input label="Full name" name="fullName" required required-message="Enter your full name" autocomplete="name"></civ-text-input>
    `;
    const result = validateForm(html);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.summary).toBe('No issues found.');
  });

  it('returns valid:true for empty HTML string', () => {
    const result = validateForm('');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.summary).toBe('No issues found.');
  });

  // ---- Error rules ----

  describe('missing-label', () => {
    it('flags civ-text-input without label', () => {
      const result = validateForm('<civ-text-input name="x"></civ-text-input>');
      const v = result.errors.find((e) => e.rule === 'missing-label');
      expect(v).toBeDefined();
      expect(v!.element).toBe('civ-text-input');
    });

    it('flags civ-textarea without label', () => {
      const result = validateForm('<civ-textarea name="x"></civ-textarea>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-textarea')).toBe(true);
    });

    it('flags civ-select without label', () => {
      const result = validateForm('<civ-select name="x"></civ-select>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-select')).toBe(true);
    });

    it('flags civ-checkbox without label', () => {
      const result = validateForm('<civ-checkbox name="x"></civ-checkbox>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-checkbox')).toBe(true);
    });

    it('flags civ-toggle without label', () => {
      const result = validateForm('<civ-toggle name="x"></civ-toggle>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-toggle')).toBe(true);
    });

    it('flags civ-file-upload without label', () => {
      const result = validateForm('<civ-file-upload name="x"></civ-file-upload>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-file-upload')).toBe(true);
    });

    it('flags civ-combobox without label', () => {
      const result = validateForm('<civ-combobox name="x"></civ-combobox>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-combobox')).toBe(true);
    });

    it('flags civ-date-picker without label', () => {
      const result = validateForm('<civ-date-picker name="x"></civ-date-picker>');
      expect(result.errors.some((e) => e.rule === 'missing-label' && e.element === 'civ-date-picker')).toBe(true);
    });

    it('does not flag when label is present', () => {
      const result = validateForm('<civ-text-input label="Name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'missing-label')).toHaveLength(0);
    });

    it('flags empty label as missing', () => {
      const result = validateForm('<civ-text-input label="" name="x"></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'missing-label')).toBe(true);
    });
  });

  describe('missing-legend', () => {
    it('flags civ-radio-group without legend', () => {
      const result = validateForm('<civ-radio-group name="x"></civ-radio-group>');
      expect(result.errors.some((e) => e.rule === 'missing-legend' && e.element === 'civ-radio-group')).toBe(true);
    });

    it('flags civ-checkbox-group without legend', () => {
      const result = validateForm('<civ-checkbox-group name="x"></civ-checkbox-group>');
      expect(result.errors.some((e) => e.rule === 'missing-legend' && e.element === 'civ-checkbox-group')).toBe(true);
    });

    it('flags civ-memorable-date without legend', () => {
      const result = validateForm('<civ-memorable-date name="x"></civ-memorable-date>');
      expect(result.errors.some((e) => e.rule === 'missing-legend' && e.element === 'civ-memorable-date')).toBe(true);
    });

    it('flags civ-segmented-control without legend', () => {
      const result = validateForm('<civ-segmented-control name="x"></civ-segmented-control>');
      expect(result.errors.some((e) => e.rule === 'missing-legend' && e.element === 'civ-segmented-control')).toBe(true);
    });

    it('flags civ-fieldset without legend', () => {
      const result = validateForm('<civ-fieldset></civ-fieldset>');
      expect(result.errors.some((e) => e.rule === 'missing-legend' && e.element === 'civ-fieldset')).toBe(true);
    });

    it('does not flag when legend is present', () => {
      const result = validateForm('<civ-radio-group legend="Choose one" name="x"></civ-radio-group>');
      expect(result.errors.filter((e) => e.rule === 'missing-legend')).toHaveLength(0);
    });
  });

  describe('deprecated-date-input', () => {
    it('flags civ-date-input', () => {
      const result = validateForm('<civ-date-input label="Date" name="x"></civ-date-input>');
      const v = result.errors.find((e) => e.rule === 'deprecated-date-input');
      expect(v).toBeDefined();
      expect(v!.element).toBe('civ-date-input');
    });

    it('does not flag civ-date-picker', () => {
      const result = validateForm('<civ-date-picker label="Date" name="x" hint="mm/dd/yyyy"></civ-date-picker>');
      expect(result.errors.filter((e) => e.rule === 'deprecated-date-input')).toHaveLength(0);
    });
  });

  describe('placeholder-as-label', () => {
    it('flags placeholder without label', () => {
      const result = validateForm('<civ-text-input placeholder="Enter name" name="x"></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'placeholder-as-label')).toBe(true);
    });

    it('does not flag placeholder with label', () => {
      const result = validateForm('<civ-text-input label="Name" placeholder="Enter name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'placeholder-as-label')).toHaveLength(0);
    });
  });

  describe('missing-required-message', () => {
    it('flags required without required-message', () => {
      const result = validateForm('<civ-text-input label="Name" name="x" required></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'missing-required-message')).toBe(true);
    });

    it('does not flag required with required-message', () => {
      const result = validateForm('<civ-text-input label="Name" name="x" required required-message="Enter your name"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'missing-required-message')).toHaveLength(0);
    });

    it('does not flag non-required field', () => {
      const result = validateForm('<civ-text-input label="Name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'missing-required-message')).toHaveLength(0);
    });
  });

  describe('orphaned-radio', () => {
    it('flags civ-radio outside civ-radio-group', () => {
      const result = validateForm('<civ-radio label="Option A" value="a"></civ-radio>');
      expect(result.errors.some((e) => e.rule === 'orphaned-radio')).toBe(true);
    });

    it('does not flag civ-radio inside civ-radio-group', () => {
      const result = validateForm(`
        <civ-radio-group legend="Pick one" name="x">
          <civ-radio label="Option A" value="a"></civ-radio>
        </civ-radio-group>
      `);
      expect(result.errors.filter((e) => e.rule === 'orphaned-radio')).toHaveLength(0);
    });
  });

  describe('orphaned-segment', () => {
    it('flags civ-segment outside civ-segmented-control', () => {
      const result = validateForm('<civ-segment label="Tab 1" value="1"></civ-segment>');
      expect(result.errors.some((e) => e.rule === 'orphaned-segment')).toBe(true);
    });

    it('does not flag civ-segment inside civ-segmented-control', () => {
      const result = validateForm(`
        <civ-segmented-control legend="View" name="x">
          <civ-segment label="Tab 1" value="1"></civ-segment>
        </civ-segmented-control>
      `);
      expect(result.errors.filter((e) => e.rule === 'orphaned-segment')).toHaveLength(0);
    });
  });

  describe('label-on-group', () => {
    it('flags group component using label instead of legend', () => {
      const result = validateForm('<civ-radio-group label="Pick one" name="x"></civ-radio-group>');
      expect(result.errors.some((e) => e.rule === 'label-on-group')).toBe(true);
    });

    it('does not flag group component with legend', () => {
      const result = validateForm('<civ-radio-group legend="Pick one" name="x"></civ-radio-group>');
      expect(result.errors.filter((e) => e.rule === 'label-on-group')).toHaveLength(0);
    });
  });

  describe('legend-on-single', () => {
    it('flags single component using legend instead of label', () => {
      const result = validateForm('<civ-text-input legend="Name" name="x"></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'legend-on-single')).toBe(true);
    });

    it('does not flag single component with label', () => {
      const result = validateForm('<civ-text-input label="Name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'legend-on-single')).toHaveLength(0);
    });
  });

  // ---- Warning rules ----

  describe('generic-required-message', () => {
    it('flags "This field is required"', () => {
      const result = validateForm('<civ-text-input label="Name" name="x" required required-message="This field is required"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'generic-required-message')).toBe(true);
    });

    it('flags "Required" (case insensitive)', () => {
      const result = validateForm('<civ-text-input label="Name" name="x" required required-message="Required"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'generic-required-message')).toBe(true);
    });

    it('does not flag field-specific message', () => {
      const result = validateForm('<civ-text-input label="Name" name="x" required required-message="Enter your full name"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'generic-required-message')).toHaveLength(0);
    });
  });

  describe('missing-hint-date', () => {
    it('flags civ-memorable-date without hint', () => {
      const result = validateForm('<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>');
      expect(result.warnings.some((w) => w.rule === 'missing-hint-date')).toBe(true);
    });

    it('flags civ-date-picker without hint', () => {
      const result = validateForm('<civ-date-picker label="Appointment" name="appt"></civ-date-picker>');
      expect(result.warnings.some((w) => w.rule === 'missing-hint-date')).toBe(true);
    });

    it('does not flag date component with hint', () => {
      const result = validateForm('<civ-memorable-date legend="Date of birth" name="dob" hint="For example: January 15 1990"></civ-memorable-date>');
      expect(result.warnings.filter((w) => w.rule === 'missing-hint-date')).toHaveLength(0);
    });
  });

  describe('missing-hint-ssn', () => {
    it('flags SSN field without hint', () => {
      const result = validateForm('<civ-text-input label="Social Security number" name="ssn"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'missing-hint-ssn')).toBe(true);
    });

    it('does not flag SSN field with hint', () => {
      const result = validateForm('<civ-text-input label="Social Security number" name="ssn" hint="For example: 123 45 6789"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'missing-hint-ssn')).toHaveLength(0);
    });

    it('does not flag non-SSN field', () => {
      const result = validateForm('<civ-text-input label="Full name" name="fullName"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'missing-hint-ssn')).toHaveLength(0);
    });
  });

  describe('missing-autocomplete', () => {
    it('flags email field without autocomplete', () => {
      const result = validateForm('<civ-text-input label="Email" name="email"></civ-text-input>');
      const w = result.warnings.find((w) => w.rule === 'missing-autocomplete');
      expect(w).toBeDefined();
      expect(w!.fix).toContain('email');
    });

    it('flags phone field without autocomplete', () => {
      const result = validateForm('<civ-text-input label="Phone" name="phone"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'missing-autocomplete')).toBe(true);
    });

    it('flags zip field without autocomplete', () => {
      const result = validateForm('<civ-text-input label="ZIP code" name="zip"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'missing-autocomplete')).toBe(true);
    });

    it('does not flag field with autocomplete', () => {
      const result = validateForm('<civ-text-input label="Email" name="email" autocomplete="email"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'missing-autocomplete')).toHaveLength(0);
    });

    it('does not false-positive on "username"', () => {
      const result = validateForm('<civ-text-input label="Username" name="username"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'missing-autocomplete')).toHaveLength(0);
    });

    it('does not false-positive on "companyName"', () => {
      const result = validateForm('<civ-text-input label="Company" name="companyName"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'missing-autocomplete')).toHaveLength(0);
    });

    it('flags first-name field without autocomplete', () => {
      const result = validateForm('<civ-text-input label="First name" name="first-name"></civ-text-input>');
      const w = result.warnings.find((w) => w.rule === 'missing-autocomplete');
      expect(w).toBeDefined();
      expect(w!.fix).toContain('given-name');
    });
  });

  describe('abbreviation-in-label', () => {
    it('flags DOB in label', () => {
      const result = validateForm('<civ-text-input label="DOB" name="dob"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'abbreviation-in-label')).toBe(true);
    });

    it('flags SSN in legend', () => {
      const result = validateForm('<civ-fieldset legend="SSN Information"></civ-fieldset>');
      expect(result.warnings.some((w) => w.rule === 'abbreviation-in-label')).toBe(true);
    });

    it('does not flag plain language', () => {
      const result = validateForm('<civ-text-input label="Date of birth" name="dob"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'abbreviation-in-label')).toHaveLength(0);
    });

    it('does not flag ID (common in gov forms)', () => {
      const result = validateForm('<civ-text-input label="Claim ID number" name="claimId"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'abbreviation-in-label')).toHaveLength(0);
    });
  });

  describe('comma-in-checkbox-value', () => {
    it('flags checkbox value with comma', () => {
      const result = validateForm('<civ-checkbox label="Opt" value="a,b" name="x"></civ-checkbox>');
      expect(result.warnings.some((w) => w.rule === 'comma-in-checkbox-value')).toBe(true);
    });

    it('does not flag checkbox without comma', () => {
      const result = validateForm('<civ-checkbox label="Opt" value="ab" name="x"></civ-checkbox>');
      expect(result.warnings.filter((w) => w.rule === 'comma-in-checkbox-value')).toHaveLength(0);
    });
  });

  describe('missing-name', () => {
    it('flags form component without name', () => {
      const result = validateForm('<civ-text-input label="Name"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'missing-name')).toBe(true);
    });

    it('does not flag component with name', () => {
      const result = validateForm('<civ-text-input label="Name" name="fullName"></civ-text-input>');
      expect(result.warnings.filter((w) => w.rule === 'missing-name')).toHaveLength(0);
    });
  });

  describe('deprecated-focus-class', () => {
    it('flags focus:civ-outline class', () => {
      const result = validateForm('<div class="focus:civ-outline-2"></div>');
      expect(result.warnings.some((w) => w.rule === 'deprecated-focus-class')).toBe(true);
    });

    it('does not flag focus-visible:civ-focus-ring', () => {
      const result = validateForm('<div class="focus-visible:civ-focus-ring"></div>');
      expect(result.warnings.filter((w) => w.rule === 'deprecated-focus-class')).toHaveLength(0);
    });
  });

  describe('physical-css-property', () => {
    it('flags civ-ml-* class', () => {
      const result = validateForm('<div class="civ-ml-2"></div>');
      expect(result.warnings.some((w) => w.rule === 'physical-css-property')).toBe(true);
    });

    it('flags civ-mr-* class', () => {
      const result = validateForm('<div class="civ-mr-4"></div>');
      expect(result.warnings.some((w) => w.rule === 'physical-css-property')).toBe(true);
    });

    it('flags civ-pl-* class', () => {
      const result = validateForm('<div class="civ-pl-2"></div>');
      expect(result.warnings.some((w) => w.rule === 'physical-css-property')).toBe(true);
    });

    it('flags civ-border-r-* class', () => {
      const result = validateForm('<div class="civ-border-r-2"></div>');
      expect(result.warnings.some((w) => w.rule === 'physical-css-property')).toBe(true);
    });

    it('flags civ-rounded-l class', () => {
      const result = validateForm('<div class="civ-rounded-l-md"></div>');
      expect(result.warnings.some((w) => w.rule === 'physical-css-property')).toBe(true);
    });

    it('does not flag logical properties', () => {
      const result = validateForm('<div class="civ-ms-2 civ-me-4 civ-ps-2 civ-border-s-2 civ-rounded-s-md"></div>');
      expect(result.warnings.filter((w) => w.rule === 'physical-css-property')).toHaveLength(0);
    });
  });

  // ---- Summary ----

  describe('summary', () => {
    it('pluralizes correctly for 1 error', () => {
      const result = validateForm('<civ-date-input label="Date" name="x"></civ-date-input>');
      expect(result.summary).toContain('1 error');
      expect(result.summary).not.toContain('1 errors');
    });

    it('pluralizes correctly for multiple errors', () => {
      const result = validateForm(`
        <civ-date-input></civ-date-input>
        <civ-text-input name="x"></civ-text-input>
      `);
      expect(result.summary).toMatch(/\d+ errors/);
    });

    it('includes both errors and warnings in summary', () => {
      const result = validateForm('<civ-text-input name="email"></civ-text-input>');
      expect(result.summary).toContain('error');
      expect(result.summary).toContain('warning');
    });
  });
});
