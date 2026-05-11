import { describe, it, expect } from 'vitest';
import { validateForm } from './validate-form.js';
import { RULES } from './rules.js';

describe('validateForm', () => {
  // ---- Meta ----

  it('has 45 rules total (18 errors + 27 warnings)', () => {
    const errors = RULES.filter((r) => r.severity === 'error');
    const warnings = RULES.filter((r) => r.severity === 'warning');
    expect(errors).toHaveLength(18);
    expect(warnings).toHaveLength(27);
    expect(RULES).toHaveLength(45);
  });

  it('returns valid:true and empty arrays for valid markup', () => {
    const html = `
      <civ-form>
        <civ-text-input label="Full name" required-message="Enter your full name" name="fullName" required autocomplete="name"></civ-text-input>
      </civ-form>
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

    it('does not flag when label is on wrapper', () => {
      const result = validateForm('<civ-text-input label="Name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'missing-label')).toHaveLength(0);
    });

    it('does not flag when label is directly on self-contained component', () => {
      const result = validateForm('<civ-checkbox label="Agree" name="x"></civ-checkbox>');
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

    it('does not flag when legend is on wrapper', () => {
      const result = validateForm('<civ-form-fieldset legend="Choose one"><civ-radio-group name="x"></civ-radio-group></civ-form-fieldset>');
      expect(result.errors.filter((e) => e.rule === 'missing-legend')).toHaveLength(0);
    });

    it('does not flag when legend is directly on component', () => {
      const result = validateForm('<civ-radio-group legend="Choose one" name="x"></civ-radio-group>');
      expect(result.errors.filter((e) => e.rule === 'missing-legend')).toHaveLength(0);
    });
  });

  describe('placeholder-as-label', () => {
    it('flags placeholder without label', () => {
      const result = validateForm('<civ-text-input placeholder="Enter name" name="x"></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'placeholder-as-label')).toBe(true);
    });

    it('does not flag placeholder when wrapper has label', () => {
      const result = validateForm('<civ-text-input label="Name" placeholder="Enter name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'placeholder-as-label')).toHaveLength(0);
    });
  });

  describe('missing-required-message', () => {
    it('flags required without required-message', () => {
      const result = validateForm('<civ-text-input label="Name" name="x" required></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'missing-required-message')).toBe(true);
    });

    it('does not flag required with required-message on wrapper', () => {
      const result = validateForm('<civ-text-input label="Name" required-message="Enter your name" name="x" required></civ-text-input>');
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
        <civ-form-fieldset legend="Pick one">
          <civ-radio-group name="x">
            <civ-radio label="Option A" value="a"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>
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
        <civ-form-fieldset legend="View">
          <civ-segmented-control name="x">
            <civ-segment label="Tab 1" value="1"></civ-segment>
          </civ-segmented-control>
        </civ-form-fieldset>
      `);
      expect(result.errors.filter((e) => e.rule === 'orphaned-segment')).toHaveLength(0);
    });
  });

  describe('label-on-group', () => {
    it('flags group component using label instead of legend', () => {
      const result = validateForm('<civ-radio-group label="Pick one" name="x"></civ-radio-group>');
      expect(result.errors.some((e) => e.rule === 'label-on-group')).toBe(true);
    });

    it('does not flag group component with legend on wrapper', () => {
      const result = validateForm('<civ-form-fieldset legend="Pick one"><civ-radio-group name="x"></civ-radio-group></civ-form-fieldset>');
      expect(result.errors.filter((e) => e.rule === 'label-on-group')).toHaveLength(0);
    });
  });

  describe('legend-on-single', () => {
    it('flags single component using legend instead of label', () => {
      const result = validateForm('<civ-text-input legend="Name" name="x"></civ-text-input>');
      expect(result.errors.some((e) => e.rule === 'legend-on-single')).toBe(true);
    });

    it('does not flag single component with label on wrapper', () => {
      const result = validateForm('<civ-text-input label="Name" name="x"></civ-text-input>');
      expect(result.errors.filter((e) => e.rule === 'legend-on-single')).toHaveLength(0);
    });
  });

  // ---- Warning rules ----

  describe('generic-required-message', () => {
    it('flags "This field is required" on wrapper', () => {
      const result = validateForm('<civ-text-input label="Name" required-message="This field is required" name="x" required></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'generic-required-message')).toBe(true);
    });

    it('flags "Required" (case insensitive) on wrapper', () => {
      const result = validateForm('<civ-text-input label="Name" required-message="Required" name="x" required></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'generic-required-message')).toBe(true);
    });

    it('does not flag field-specific message on wrapper', () => {
      const result = validateForm('<civ-text-input label="Name" required-message="Enter your full name" name="x" required></civ-text-input>');
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

    it('does not flag date component with hint set directly', () => {
      const result = validateForm('<civ-memorable-date legend="Date of birth" hint="For example: January 15 1990" name="dob"></civ-memorable-date>');
      expect(result.warnings.filter((w) => w.rule === 'missing-hint-date')).toHaveLength(0);
    });
  });

  describe('missing-hint-ssn', () => {
    it('flags SSN field without hint', () => {
      const result = validateForm('<civ-text-input label="Social Security number" name="ssn"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'missing-hint-ssn')).toBe(true);
    });

    it('does not flag SSN field with hint on wrapper', () => {
      const result = validateForm('<civ-text-input label="Social Security number" hint="For example: 123 45 6789" name="ssn"></civ-text-input>');
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
    it('flags DOB in wrapper label', () => {
      const result = validateForm('<civ-text-input label="DOB" name="dob"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'abbreviation-in-label')).toBe(true);
    });

    it('flags SSN in fieldset legend', () => {
      const result = validateForm('<civ-fieldset legend="SSN Information"></civ-fieldset>');
      expect(result.warnings.some((w) => w.rule === 'abbreviation-in-label')).toBe(true);
    });

    it('does not flag plain language on wrapper', () => {
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

  // ---- New error rules ----

  describe('duplicate-name', () => {
    it('flags two components with the same name', () => {
      const result = validateForm(`
        <civ-text-input label="First" name="field1"></civ-text-input>
        <civ-textarea label="Second" name="field1"></civ-textarea>
      `);
      expect(result.errors.some((e) => e.rule === 'duplicate-name')).toBe(true);
    });

    it('does not flag unique names', () => {
      const result = validateForm(`
        <civ-text-input label="First" name="field1"></civ-text-input>
        <civ-text-input label="Second" name="field2"></civ-text-input>
      `);
      expect(result.errors.filter((e) => e.rule === 'duplicate-name')).toHaveLength(0);
    });

    it('does not flag components without name', () => {
      const result = validateForm(`
        <civ-text-input label="First"></civ-text-input>
        <civ-text-input label="Second"></civ-text-input>
      `);
      expect(result.errors.filter((e) => e.rule === 'duplicate-name')).toHaveLength(0);
    });
  });

  describe('empty-select-options', () => {
    it('flags civ-select without options', () => {
      const result = validateForm('<civ-select label="Topic" name="topic"></civ-select>');
      expect(result.errors.some((e) => e.rule === 'empty-select-options')).toBe(true);
    });

    it('flags civ-combobox without options', () => {
      const result = validateForm('<civ-combobox label="State" name="state"></civ-combobox>');
      expect(result.errors.some((e) => e.rule === 'empty-select-options')).toBe(true);
    });

    it('does not flag civ-select with options attr', () => {
      const html = `<civ-select label="Topic" name="topic" options='[{"value":"a","label":"A"}]'></civ-select>`;
      const result = validateForm(html);
      expect(result.errors.filter((e) => e.rule === 'empty-select-options')).toHaveLength(0);
    });

    it('does not flag civ-select with child options', () => {
      const result = validateForm(`
        <civ-select label="Topic" name="topic">
            <option value="a">A</option>
          </civ-select>
      `);
      expect(result.errors.filter((e) => e.rule === 'empty-select-options')).toHaveLength(0);
    });
  });

  describe('radio-group-single-option', () => {
    it('flags radio group with 0 radios', () => {
      const result = validateForm('<civ-form-fieldset legend="Pick"><civ-radio-group name="x"></civ-radio-group></civ-form-fieldset>');
      expect(result.errors.some((e) => e.rule === 'radio-group-single-option')).toBe(true);
    });

    it('flags radio group with 1 radio', () => {
      const result = validateForm(`
        <civ-form-fieldset legend="Pick">
          <civ-radio-group name="x">
            <civ-radio label="Only" value="only"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>
      `);
      expect(result.errors.some((e) => e.rule === 'radio-group-single-option')).toBe(true);
    });

    it('does not flag radio group with 2 radios', () => {
      const result = validateForm(`
        <civ-form-fieldset legend="Pick">
          <civ-radio-group name="x">
            <civ-radio label="A" value="a"></civ-radio>
            <civ-radio label="B" value="b"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>
      `);
      expect(result.errors.filter((e) => e.rule === 'radio-group-single-option')).toHaveLength(0);
    });
  });

  // ---- New warning rules ----

  describe('nested-fieldset', () => {
    it('flags nested civ-fieldset', () => {
      const result = validateForm(`
        <civ-fieldset legend="Outer">
          <civ-fieldset legend="Inner">
            <civ-text-input label="Name" name="x"></civ-text-input>
          </civ-fieldset>
        </civ-fieldset>
      `);
      expect(result.warnings.some((w) => w.rule === 'nested-fieldset')).toBe(true);
    });

    it('does not flag non-nested fieldsets', () => {
      const result = validateForm(`
        <civ-fieldset legend="Section 1">
          <civ-text-input label="Name" name="x"></civ-text-input>
        </civ-fieldset>
        <civ-fieldset legend="Section 2">
          <civ-text-input label="Email" name="y"></civ-text-input>
        </civ-fieldset>
      `);
      expect(result.warnings.filter((w) => w.rule === 'nested-fieldset')).toHaveLength(0);
    });
  });

  describe('large-radio-group', () => {
    it('flags radio group with 8 options', () => {
      const radios = Array.from({ length: 8 }, (_, i) =>
        `<civ-radio label="Opt ${i}" value="${i}"></civ-radio>`
      ).join('\n');
      const result = validateForm(`
        <civ-form-fieldset legend="Pick"><civ-radio-group name="x">${radios}</civ-radio-group></civ-form-fieldset>
      `);
      expect(result.warnings.some((w) => w.rule === 'large-radio-group')).toBe(true);
    });

    it('does not flag radio group with 7 options', () => {
      const radios = Array.from({ length: 7 }, (_, i) =>
        `<civ-radio label="Opt ${i}" value="${i}"></civ-radio>`
      ).join('\n');
      const result = validateForm(`
        <civ-form-fieldset legend="Pick"><civ-radio-group name="x">${radios}</civ-radio-group></civ-form-fieldset>
      `);
      expect(result.warnings.filter((w) => w.rule === 'large-radio-group')).toHaveLength(0);
    });
  });

  describe('missing-form-wrapper', () => {
    it('flags component not inside form', () => {
      const result = validateForm('<civ-text-input label="Name" name="x"></civ-text-input>');
      expect(result.warnings.some((w) => w.rule === 'missing-form-wrapper')).toBe(true);
    });

    it('does not flag component inside civ-form', () => {
      const result = validateForm(`
        <civ-form>
          <civ-text-input label="Name" name="x"></civ-text-input>
        </civ-form>
      `);
      expect(result.warnings.filter((w) => w.rule === 'missing-form-wrapper')).toHaveLength(0);
    });

    it('does not flag component inside native form', () => {
      const result = validateForm(`
        <form>
          <civ-text-input label="Name" name="x"></civ-text-input>
        </form>
      `);
      expect(result.warnings.filter((w) => w.rule === 'missing-form-wrapper')).toHaveLength(0);
    });
  });

  describe('excessive-file-size', () => {
    it('flags max-size > 25 MB', () => {
      const thirtyMB = 30 * 1024 * 1024;
      const result = validateForm(`<civ-file-upload label="Upload" name="doc" max-size="${thirtyMB}"></civ-file-upload>`);
      expect(result.warnings.some((w) => w.rule === 'excessive-file-size')).toBe(true);
    });

    it('does not flag max-size <= 25 MB', () => {
      const twentyMB = 20 * 1024 * 1024;
      const result = validateForm(`<civ-file-upload label="Upload" name="doc" max-size="${twentyMB}"></civ-file-upload>`);
      expect(result.warnings.filter((w) => w.rule === 'excessive-file-size')).toHaveLength(0);
    });

    it('does not flag file-upload without max-size', () => {
      const result = validateForm('<civ-file-upload label="Upload" name="doc"></civ-file-upload>');
      expect(result.warnings.filter((w) => w.rule === 'excessive-file-size')).toHaveLength(0);
    });
  });

  describe('toggle-without-default', () => {
    it('flags toggle without value', () => {
      const result = validateForm('<civ-toggle label="Notify" name="x"></civ-toggle>');
      expect(result.warnings.some((w) => w.rule === 'toggle-without-default')).toBe(true);
    });

    it('does not flag toggle with value', () => {
      const result = validateForm('<civ-toggle label="Notify" name="x" value="true"></civ-toggle>');
      expect(result.warnings.filter((w) => w.rule === 'toggle-without-default')).toHaveLength(0);
    });
  });

  // ---- ValidationConfig ----

  describe('ValidationConfig', () => {
    it('suppressRules removes specified rules', () => {
      const html = '<civ-text-input name="x"></civ-text-input>';
      const full = validateForm(html);
      expect(full.errors.some((e) => e.rule === 'missing-label')).toBe(true);

      const suppressed = validateForm(html, { suppressRules: ['missing-label'] });
      expect(suppressed.errors.filter((e) => e.rule === 'missing-label')).toHaveLength(0);
    });

    it('promoteWarnings promotes warnings to errors', () => {
      const html = '<civ-text-input label="Name" name="email"></civ-text-input>';
      const full = validateForm(html);
      expect(full.warnings.some((w) => w.rule === 'missing-autocomplete')).toBe(true);
      expect(full.errors.filter((e) => e.rule === 'missing-autocomplete')).toHaveLength(0);

      const promoted = validateForm(html, { promoteWarnings: ['missing-autocomplete'] });
      expect(promoted.errors.some((e) => e.rule === 'missing-autocomplete')).toBe(true);
      expect(promoted.warnings.filter((w) => w.rule === 'missing-autocomplete')).toHaveLength(0);
    });

    it('suppressRules and promoteWarnings work together', () => {
      const html = '<civ-text-input label="Name" name="email"></civ-text-input>';
      const result = validateForm(html, {
        suppressRules: ['missing-form-wrapper'],
        promoteWarnings: ['missing-autocomplete'],
      });
      expect(result.warnings.filter((w) => w.rule === 'missing-form-wrapper')).toHaveLength(0);
      expect(result.errors.some((e) => e.rule === 'missing-autocomplete')).toBe(true);
    });

    it('empty config has no effect', () => {
      const html = '<civ-text-input label="Name" name="x"></civ-text-input>';
      const noConfig = validateForm(html);
      const emptyConfig = validateForm(html, {});
      expect(emptyConfig.errors).toEqual(noConfig.errors);
      expect(emptyConfig.warnings).toEqual(noConfig.warnings);
    });
  });

  // ---- Summary ----

  describe('summary', () => {
    it('pluralizes correctly for 1 error', () => {
      // A bare text-input without a form-field wrapper produces exactly 1 error (missing-label)
      const result = validateForm('<civ-form><civ-text-input name="x"></civ-text-input></civ-form>');
      expect(result.summary).toContain('1 error');
      expect(result.summary).not.toContain('1 errors');
    });

    it('pluralizes correctly for multiple errors', () => {
      const result = validateForm(`
        <civ-text-input name="a"></civ-text-input>
        <civ-text-input name="b"></civ-text-input>
      `);
      expect(result.summary).toMatch(/\d+ errors/);
    });

    it('includes both errors and warnings in summary', () => {
      const result = validateForm('<civ-text-input name="email"></civ-text-input>');
      expect(result.summary).toContain('error');
      expect(result.summary).toContain('warning');
    });
  });

  // ---- Form steps rules ----

  describe('form-steps-missing-progress', () => {
    it('flags step containers without progress indicator', () => {
      const html = `
        <civ-form>
          <div data-civ-step="0">
            <civ-text-input label="Name" required-message="Name is required" name="name" required></civ-text-input>
          </div>
          <div data-civ-step="1">
            <civ-text-input label="Email" required-message="Email is required" name="email" required></civ-text-input>
          </div>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.errors.some((e) => e.rule === 'form-steps-missing-progress')).toBe(true);
    });

    it('does not flag when progress indicator is present', () => {
      const html = `
        <civ-form>
          <nav data-civ-progress aria-label="Progress">
            <ol><li data-civ-progress-step="0">Step 1</li><li data-civ-progress-step="1">Step 2</li></ol>
          </nav>
          <div data-civ-step="0">
            <civ-text-input label="Name" required-message="Name is required" name="name" required></civ-text-input>
          </div>
          <div data-civ-step="1">
            <civ-text-input label="Email" required-message="Email is required" name="email" required></civ-text-input>
          </div>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.errors.some((e) => e.rule === 'form-steps-missing-progress')).toBe(false);
    });
  });

  describe('form-steps-step-gap', () => {
    it('flags non-contiguous step numbers', () => {
      const html = `
        <civ-form>
          <nav data-civ-progress aria-label="Progress"><ol><li>S1</li><li>S3</li></ol></nav>
          <div data-civ-step="0"><civ-text-input label="A" required-message="A is required" name="a" required></civ-text-input></div>
          <div data-civ-step="2"><civ-text-input label="B" required-message="B is required" name="b" required></civ-text-input></div>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.warnings.some((w) => w.rule === 'form-steps-step-gap')).toBe(true);
    });
  });

  describe('form-steps-step-no-fields', () => {
    it('flags empty form step', () => {
      const html = `
        <civ-form>
          <nav data-civ-progress aria-label="Progress"><ol><li>S1</li><li>S2</li></ol></nav>
          <div data-civ-step="0"><civ-text-input label="A" required-message="A is required" name="a" required></civ-text-input></div>
          <div data-civ-step="1"></div>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.warnings.some((w) => w.rule === 'form-steps-step-no-fields')).toBe(true);
    });
  });

  // ---- Cascading rules ----

  describe('cascading-source-missing', () => {
    it('flags when parent field does not exist', () => {
      const html = `
        <civ-form>
          <civ-select label="County" name="county" data-civ-options-from="nonexistent"></civ-select>
          <script type="application/json" data-civ-options-map="county">{"CA":[]}</script>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.errors.some((e) => e.rule === 'cascading-source-missing')).toBe(true);
    });

    it('does not flag when parent field exists', () => {
      const html = `
        <civ-form>
          <civ-select label="State" name="state" options='[{"value":"CA","label":"CA"}]'></civ-select>
          <civ-select label="County" name="county" data-civ-options-from="state"></civ-select>
          <script type="application/json" data-civ-options-map="county">{"CA":[{"value":"la","label":"LA"}]}</script>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.errors.some((e) => e.rule === 'cascading-source-missing')).toBe(false);
    });
  });

  describe('cascading-empty-map', () => {
    it('warns when options map is empty', () => {
      const html = `
        <civ-form>
          <civ-select label="State" name="state" options='[{"value":"CA","label":"CA"}]'></civ-select>
          <civ-select label="County" name="county" data-civ-options-from="state"></civ-select>
          <script type="application/json" data-civ-options-map="county">{}</script>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.warnings.some((w) => w.rule === 'cascading-empty-map')).toBe(true);
    });

    it('does not warn when options map has entries', () => {
      const html = `
        <civ-form>
          <civ-select label="State" name="state" options='[{"value":"CA","label":"CA"}]'></civ-select>
          <civ-select label="County" name="county" data-civ-options-from="state"></civ-select>
          <script type="application/json" data-civ-options-map="county">{"CA":[{"value":"la","label":"LA"}]}</script>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.warnings.some((w) => w.rule === 'cascading-empty-map')).toBe(false);
    });
  });

  describe('empty-select-options with cascading', () => {
    it('does not flag select with data-civ-options-from', () => {
      const html = `
        <civ-form>
          <civ-select label="State" name="state" options='[{"value":"CA","label":"CA"}]'></civ-select>
          <civ-select label="County" name="county" data-civ-options-from="state"></civ-select>
          <script type="application/json" data-civ-options-map="county">{"CA":[{"value":"la","label":"LA"}]}</script>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.errors.some((e) => e.rule === 'empty-select-options' && e.message.includes('county'))).toBe(false);
    });
  });

  // ---- Table rules ----

  describe('table-layout-not-repeatable', () => {
    it('warns when table layout is used without repeatable', () => {
      const html = `
        <civ-form>
          <div data-civ-layout="table">
            <table><tbody><tr><td><civ-text-input label="X" name="x"></civ-text-input></td></tr></tbody></table>
          </div>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.warnings.some((w) => w.rule === 'table-layout-not-repeatable')).toBe(true);
    });

    it('does not warn when table layout has repeatable', () => {
      const html = `
        <civ-form>
          <div data-civ-repeatable="items" data-civ-layout="table" aria-live="polite">
            <table><tbody><tr data-civ-repeatable-item><td><civ-text-input aria-label="X" name="items[0].x"></civ-text-input></td><td><button type="button" data-civ-repeatable-remove>Remove</button></td></tr></tbody></table>
            <button type="button" data-civ-repeatable-add>Add</button>
          </div>
        </civ-form>
      `;
      const result = validateForm(html);
      expect(result.warnings.some((w) => w.rule === 'table-layout-not-repeatable')).toBe(false);
    });
  });

  // ---- New Section 508 rules ----

  describe('img-missing-alt', () => {
    it('flags img without alt attribute', () => {
      const result = validateForm('<img src="photo.jpg">');
      expect(result.errors.some((e) => e.rule === 'img-missing-alt')).toBe(true);
    });

    it('passes img with alt text', () => {
      const result = validateForm('<img src="photo.jpg" alt="Veteran signing form">');
      expect(result.errors.some((e) => e.rule === 'img-missing-alt')).toBe(false);
    });

    it('passes img with empty alt (decorative)', () => {
      const result = validateForm('<img src="divider.png" alt="">');
      expect(result.errors.some((e) => e.rule === 'img-missing-alt')).toBe(false);
    });
  });

  describe('heading-hierarchy', () => {
    it('flags skipped heading levels (h1 to h3)', () => {
      const result = validateForm('<h1>Title</h1><h3>Section</h3>');
      expect(result.warnings.some((w) => w.rule === 'heading-hierarchy')).toBe(true);
    });

    it('passes sequential heading levels', () => {
      const result = validateForm('<h1>Title</h1><h2>Section</h2><h3>Sub</h3>');
      expect(result.warnings.some((w) => w.rule === 'heading-hierarchy')).toBe(false);
    });

    it('passes single heading', () => {
      const result = validateForm('<h2>Only heading</h2>');
      expect(result.warnings.some((w) => w.rule === 'heading-hierarchy')).toBe(false);
    });
  });

  describe('vague-link-text', () => {
    it('flags "click here" link text', () => {
      const result = validateForm('<a href="/info">click here</a>');
      expect(result.warnings.some((w) => w.rule === 'vague-link-text')).toBe(true);
    });

    it('flags "read more" link text', () => {
      const result = validateForm('<a href="/info">Read More</a>');
      expect(result.warnings.some((w) => w.rule === 'vague-link-text')).toBe(true);
    });

    it('passes descriptive link text', () => {
      const result = validateForm('<a href="/status">View your claim status</a>');
      expect(result.warnings.some((w) => w.rule === 'vague-link-text')).toBe(false);
    });
  });

  describe('positive-tabindex', () => {
    it('flags positive tabindex', () => {
      const result = validateForm('<div tabindex="5">Focusable</div>');
      expect(result.errors.some((e) => e.rule === 'positive-tabindex')).toBe(true);
    });

    it('passes tabindex="0"', () => {
      const result = validateForm('<div tabindex="0">Focusable</div>');
      expect(result.errors.some((e) => e.rule === 'positive-tabindex')).toBe(false);
    });

    it('passes tabindex="-1"', () => {
      const result = validateForm('<div tabindex="-1">Programmatic</div>');
      expect(result.errors.some((e) => e.rule === 'positive-tabindex')).toBe(false);
    });
  });

  describe('missing-lang', () => {
    it('flags html element without lang', () => {
      const result = validateForm('<html><body><p>Text</p></body></html>');
      expect(result.warnings.some((w) => w.rule === 'missing-lang')).toBe(true);
    });

    it('passes html element with lang', () => {
      const result = validateForm('<html lang="en"><body><p>Text</p></body></html>');
      expect(result.warnings.some((w) => w.rule === 'missing-lang')).toBe(false);
    });

    it('does not flag fragments without html element', () => {
      const result = validateForm('<div><p>Fragment</p></div>');
      expect(result.warnings.some((w) => w.rule === 'missing-lang')).toBe(false);
    });
  });

  describe('missing-role-alert', () => {
    it('flags error container without role="alert"', () => {
      const result = validateForm('<div class="error-message">Something went wrong</div>');
      expect(result.warnings.some((w) => w.rule === 'missing-role-alert')).toBe(true);
    });

    it('passes error container with role="alert"', () => {
      const result = validateForm('<div class="error-message" role="alert">Something went wrong</div>');
      expect(result.warnings.some((w) => w.rule === 'missing-role-alert')).toBe(false);
    });

    it('skips CivUI components (they handle role internally)', () => {
      const result = validateForm('<civ-alert class="error-banner">Error</civ-alert>');
      expect(result.warnings.some((w) => w.rule === 'missing-role-alert')).toBe(false);
    });
  });
});
