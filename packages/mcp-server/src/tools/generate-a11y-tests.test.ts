import { describe, it, expect } from 'vitest';
import { generateA11yTests } from './generate-a11y-tests.js';

describe('generateA11yTests', () => {
  it('generates valid test file structure', () => {
    const html = '<civ-form-field label="Name"><civ-text-input name="name"></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html);
    expect(result.code).toContain("import { describe, it, expect");
    expect(result.code).toContain("import { fixture, cleanupFixtures");
    expect(result.code).toContain("afterEach(cleanupFixtures)");
    expect(result.code).toContain("describe(");
  });

  it('generates aria-required test for required fields', () => {
    const html = '<civ-form-field label="Name" required><civ-text-input name="name" required></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html);
    expect(result.code).toContain('aria-required');
    expect(result.categories).toContain('aria-attributes');
  });

  it('generates aria-describedby test for fields with error', () => {
    const html = '<civ-form-field label="Name"><civ-text-input name="name" error="Required field"></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html);
    expect(result.code).toContain('aria-describedby');
    expect(result.code).toContain('role="alert"');
  });

  it('generates Tab keyboard test', () => {
    const html = `
      <civ-form-field label="Name"><civ-text-input name="name"></civ-text-input></civ-form-field>
      <civ-form-field label="Email"><civ-text-input name="email"></civ-text-input></civ-form-field>
    `;
    const result = generateA11yTests(html);
    expect(result.code).toContain('Tab');
    expect(result.categories).toContain('keyboard');
  });

  it('generates Enter/Space test for checkboxes', () => {
    const html = '<civ-checkbox label="Agree" name="agree"></civ-checkbox>';
    const result = generateA11yTests(html);
    expect(result.code).toContain('Enter/Space');
    expect(result.code).toContain('civ-checkbox');
  });

  it('generates arrow key test for radio groups', () => {
    const html = `
      <civ-form-fieldset legend="Color">
        <civ-radio-group name="color">
          <civ-radio label="Red" value="red"></civ-radio>
          <civ-radio label="Blue" value="blue"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>
    `;
    const result = generateA11yTests(html);
    expect(result.code).toContain('arrow key');
  });

  it('generates aria-live test for repeatable containers', () => {
    const html = `
      <div data-civ-repeatable="items" aria-live="polite">
        <civ-form-field label="Item"><civ-text-input name="items[0].name"></civ-text-input></civ-form-field>
        <button type="button" data-civ-repeatable-add>Add</button>
      </div>
    `;
    const result = generateA11yTests(html);
    expect(result.code).toContain('aria-live');
    expect(result.categories).toContain('announcements');
  });

  it('generates role="alert" test for error fields', () => {
    const html = '<civ-form-field label="Name"><civ-text-input name="name" error="Enter your name"></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html);
    expect(result.code).toContain('role="alert"');
    expect(result.categories).toContain('announcements');
  });

  it('generates heading hierarchy test', () => {
    const html = `
      <h2>Personal Info</h2>
      <civ-form-field label="Name"><civ-text-input name="name"></civ-text-input></civ-form-field>
      <h3>Contact</h3>
      <civ-form-field label="Email"><civ-text-input name="email"></civ-text-input></civ-form-field>
    `;
    const result = generateA11yTests(html);
    expect(result.code).toContain('heading hierarchy');
    expect(result.categories).toContain('semantics');
  });

  it('includes correct categories array', () => {
    const html = `
      <civ-form-field label="Name" required><civ-text-input name="name" required error="Required"></civ-text-input></civ-form-field>
      <button type="submit">Submit</button>
    `;
    const result = generateA11yTests(html);
    expect(result.categories).toContain('aria-attributes');
    expect(result.categories).toContain('keyboard');
  });

  it('testCount matches actual it() blocks', () => {
    const html = '<civ-form-field label="Name" required><civ-text-input name="name" required></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html);
    const itMatches = result.code.match(/\bit\(/g);
    expect(itMatches?.length).toBe(result.testCount);
  });

  it('uses suiteName for filename and describe', () => {
    const html = '<civ-form-field label="Name"><civ-text-input name="name"></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html, 'Contact Form');
    expect(result.filename).toBe('contact-form.a11y.test.ts');
    expect(result.code).toContain("describe('Contact Form");
  });

  it('generates color-independence test for error states', () => {
    const html = '<civ-form-field label="Name"><civ-text-input name="name" error="Enter your name"></civ-text-input></civ-form-field>';
    const result = generateA11yTests(html);
    expect(result.code).toContain('error states have text content');
    expect(result.categories).toContain('color-independence');
  });
});
