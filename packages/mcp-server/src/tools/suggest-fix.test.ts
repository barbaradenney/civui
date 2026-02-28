import { describe, it, expect } from 'vitest';
import { suggestFix } from './suggest-fix.js';

describe('suggestFix', () => {
  it('returns original HTML unchanged when no violations', () => {
    const html = '<civ-form><civ-text-input label="Name" name="name" autocomplete="name"></civ-text-input></civ-form>';
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

  it('adds missing legend attribute', () => {
    const html = '<civ-radio-group name="choice"><civ-radio label="A" value="a"></civ-radio><civ-radio label="B" value="b"></civ-radio></civ-radio-group>';
    const result = suggestFix(html, ['missing-legend']);
    expect(result.appliedFixes.length).toBeGreaterThan(0);
    expect(result.fixedHtml).toContain('legend=');
  });

  it('replaces deprecated civ-date-input with civ-memorable-date', () => {
    const html = '<civ-date-input label="Birth date" name="dob"></civ-date-input>';
    const result = suggestFix(html, ['deprecated-date-input']);
    expect(result.appliedFixes.some((f) => f.includes('civ-memorable-date'))).toBe(true);
    expect(result.fixedHtml).toContain('civ-memorable-date');
    expect(result.fixedHtml).not.toContain('civ-date-input');
  });

  it('copies placeholder to label when placeholder-as-label', () => {
    const html = '<civ-text-input placeholder="Enter name" name="name"></civ-text-input>';
    const result = suggestFix(html, ['placeholder-as-label']);
    expect(result.fixedHtml).toContain('label="Enter name"');
  });

  it('adds required-message for required fields', () => {
    const html = '<civ-text-input label="Email" name="email" required></civ-text-input>';
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

  it('swaps label→legend on group components', () => {
    const html = '<civ-radio-group label="Pick one" name="x"><civ-radio label="A" value="a"></civ-radio><civ-radio label="B" value="b"></civ-radio></civ-radio-group>';
    const result = suggestFix(html, ['label-on-group']);
    expect(result.fixedHtml).toContain('legend="Pick one"');
  });

  it('swaps legend→label on single components', () => {
    const html = '<civ-text-input legend="Full name" name="name"></civ-text-input>';
    const result = suggestFix(html, ['legend-on-single']);
    expect(result.fixedHtml).toContain('label="Full name"');
  });

  it('replaces generic required-message with field-specific', () => {
    const html = '<civ-text-input label="Email" name="email" required required-message="Required"></civ-text-input>';
    const result = suggestFix(html, ['generic-required-message']);
    expect(result.fixedHtml).toContain('required-message="Email is required"');
  });

  it('adds date format hints', () => {
    const html = '<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>';
    const result = suggestFix(html, ['missing-hint-date']);
    expect(result.fixedHtml).toContain('hint="For example: January 15 1990"');
  });

  it('adds SSN format hint', () => {
    const html = '<civ-text-input label="Social Security number" name="ssn"></civ-text-input>';
    const result = suggestFix(html, ['missing-hint-ssn']);
    expect(result.fixedHtml).toContain('hint="For example: 123 45 6789"');
  });

  it('adds autocomplete to identity fields', () => {
    const html = '<civ-text-input label="Email address" name="email"></civ-text-input>';
    const result = suggestFix(html, ['missing-autocomplete']);
    expect(result.fixedHtml).toContain('autocomplete="email"');
  });

  it('expands abbreviations in labels', () => {
    const html = '<civ-text-input label="DOB" name="dob"></civ-text-input>';
    const result = suggestFix(html, ['abbreviation-in-label']);
    expect(result.fixedHtml).toContain('Date of birth');
    expect(result.fixedHtml).not.toContain('label="DOB"');
  });

  it('replaces commas in checkbox values', () => {
    const html = '<civ-checkbox label="Option" value="a,b" name="x"></civ-checkbox>';
    const result = suggestFix(html, ['comma-in-checkbox-value']);
    expect(result.fixedHtml).toContain('value="a-b"');
  });

  it('adds name from label when missing', () => {
    const html = '<civ-text-input label="Full Name"></civ-text-input>';
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
