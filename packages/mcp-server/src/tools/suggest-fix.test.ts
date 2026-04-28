import { describe, it, expect } from 'vitest';
import { suggestFix } from './suggest-fix.js';

describe('suggestFix', () => {
  it('returns original HTML unchanged when no violations', () => {
    const html = '<civ-form><civ-form-field label="Name"><civ-text-input name="name" autocomplete="name"></civ-text-input></civ-form-field></civ-form>';
    const result = suggestFix(html);
    expect(result.appliedFixes).toHaveLength(0);
    expect(result.fixedHtml).toContain('label="Name"');
  });

  it('adds missing label attribute', () => {
    const html = '<civ-text-input name="full-name"></civ-text-input>';
    const result = suggestFix(html, ['missing-label']);
    expect(result.appliedFixes.length).toBeGreaterThan(0);
    expect(result.fixedHtml).toContain('label=');
  });

  it('wraps group component with civ-form-fieldset for missing legend', () => {
    const html = '<civ-radio-group name="choice"><civ-radio label="A" value="a"></civ-radio><civ-radio label="B" value="b"></civ-radio></civ-radio-group>';
    const result = suggestFix(html, ['missing-legend']);
    expect(result.appliedFixes.length).toBeGreaterThan(0);
    expect(result.fixedHtml).toContain('legend=');
  });

  it('replaces deprecated civ-date-input with civ-memorable-date in wrapper', () => {
    const html = '<civ-form-field label="Birth date"><civ-date-input name="dob"></civ-date-input></civ-form-field>';
    const result = suggestFix(html, ['deprecated-date-input']);
    expect(result.appliedFixes.some((f) => f.includes('civ-memorable-date'))).toBe(true);
    expect(result.fixedHtml).toContain('civ-memorable-date');
    expect(result.fixedHtml).not.toContain('civ-date-input');
  });

  it('wraps with civ-form-field using placeholder as label', () => {
    const html = '<civ-text-input placeholder="Enter name" name="name"></civ-text-input>';
    const result = suggestFix(html, ['placeholder-as-label']);
    expect(result.fixedHtml).toContain('label="Enter name"');
    expect(result.fixedHtml).toContain('civ-form-field');
  });

  it('adds required-message for required fields on wrapper', () => {
    const html = '<civ-form-field label="Email" required><civ-text-input name="email" required></civ-text-input></civ-form-field>';
    const result = suggestFix(html, ['missing-required-message']);
    expect(result.fixedHtml).toContain('required-message="Email is required"');
  });

  it('wraps orphaned radios in radio-group', () => {
    const html = '<civ-radio label="A" value="a"></civ-radio><civ-radio label="B" value="b"></civ-radio>';
    const result = suggestFix(html, ['orphaned-radio']);
    expect(result.fixedHtml).toContain('civ-radio-group');
  });

  it('wraps orphaned segments in segmented-control', () => {
    const html = '<civ-segment label="Tab 1" value="1"></civ-segment><civ-segment label="Tab 2" value="2"></civ-segment>';
    const result = suggestFix(html, ['orphaned-segment']);
    expect(result.fixedHtml).toContain('civ-segmented-control');
  });

  it('wraps group with civ-form-fieldset when label used instead of legend', () => {
    const html = '<civ-radio-group label="Pick one" name="x"><civ-radio label="A" value="a"></civ-radio><civ-radio label="B" value="b"></civ-radio></civ-radio-group>';
    const result = suggestFix(html, ['label-on-group']);
    expect(result.fixedHtml).toContain('legend="Pick one"');
    expect(result.fixedHtml).toContain('civ-form-fieldset');
  });

  it('wraps single component with civ-form-field when legend used instead of label', () => {
    const html = '<civ-text-input legend="Full name" name="name"></civ-text-input>';
    const result = suggestFix(html, ['legend-on-single']);
    expect(result.fixedHtml).toContain('label="Full name"');
    expect(result.fixedHtml).toContain('civ-form-field');
  });

  it('replaces generic required-message with field-specific on wrapper', () => {
    const html = '<civ-form-field label="Email" required required-message="Required"><civ-text-input name="email" required></civ-text-input></civ-form-field>';
    const result = suggestFix(html, ['generic-required-message']);
    expect(result.fixedHtml).toContain('required-message="Email is required"');
  });

  it('adds date format hints to wrapper', () => {
    const html = '<civ-form-field label="Date of birth"><civ-memorable-date name="dob"></civ-memorable-date></civ-form-field>';
    const result = suggestFix(html, ['missing-hint-date']);
    expect(result.fixedHtml).toContain('hint="For example: January 15 1990"');
  });

  it('adds SSN format hint to wrapper', () => {
    const html = '<civ-form-field label="Social Security number"><civ-text-input name="ssn"></civ-text-input></civ-form-field>';
    const result = suggestFix(html, ['missing-hint-ssn']);
    expect(result.fixedHtml).toContain('hint="For example: 123 45 6789"');
  });

  it('adds autocomplete to identity fields', () => {
    const html = '<civ-form-field label="Email address"><civ-text-input name="email"></civ-text-input></civ-form-field>';
    const result = suggestFix(html, ['missing-autocomplete']);
    expect(result.fixedHtml).toContain('autocomplete="email"');
  });

  it('expands abbreviations in wrapper labels', () => {
    const html = '<civ-form-field label="DOB"><civ-text-input name="dob"></civ-text-input></civ-form-field>';
    const result = suggestFix(html, ['abbreviation-in-label']);
    expect(result.fixedHtml).toContain('Date of birth');
    expect(result.fixedHtml).not.toContain('label="DOB"');
  });

  it('replaces commas in checkbox values', () => {
    const html = '<civ-checkbox label="Option" value="a,b" name="x"></civ-checkbox>';
    const result = suggestFix(html, ['comma-in-checkbox-value']);
    expect(result.fixedHtml).toContain('value="a-b"');
  });

  it('adds name from wrapper label when missing', () => {
    const html = '<civ-form-field label="Full Name"><civ-text-input></civ-text-input></civ-form-field>';
    const result = suggestFix(html, ['missing-name']);
    expect(result.fixedHtml).toContain('name="full-name"');
  });

  it('replaces deprecated focus class', () => {
    const html = '<div class="focus:civ-outline-2 civ-p-2"></div>';
    const result = suggestFix(html, ['deprecated-focus-class']);
    expect(result.fixedHtml).toContain('focus-visible:civ-focus-ring');
    expect(result.fixedHtml).not.toContain('focus:civ-outline-2');
  });

  it('replaces physical CSS with logical properties', () => {
    const html = '<div class="civ-ml-2 civ-pr-4"></div>';
    const result = suggestFix(html, ['physical-css-property']);
    expect(result.fixedHtml).toContain('civ-ms-2');
    expect(result.fixedHtml).toContain('civ-pe-4');
  });

  it('only applies requested rules when rules param is set', () => {
    const html = '<civ-text-input name="email"></civ-text-input>';
    const result = suggestFix(html, ['missing-label']);
    // Should fix missing-label but not missing-autocomplete
    expect(result.appliedFixes.some((f) => f.includes('label'))).toBe(true);
    // autocomplete was not requested so it should remain as a remaining violation
    expect(result.remainingViolations.some((v) => v.rule === 'missing-autocomplete')).toBe(true);
  });

  it('re-validates after fixes and returns remaining violations', () => {
    const html = '<civ-text-input name="email"></civ-text-input>';
    const result = suggestFix(html, ['missing-label']);
    // After fixing missing-label, there may still be other violations
    expect(Array.isArray(result.remainingViolations)).toBe(true);
  });
});
