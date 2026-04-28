import { describe, it, expect } from 'vitest';
import { generateTests } from './generate-tests.js';

const SAMPLE_HTML = `
<civ-form>
  <civ-form-field label="Full name" required>
    <civ-text-input name="full-name" required required-message="Enter your name"></civ-text-input>
  </civ-form-field>
  <civ-form-field label="Email">
    <civ-text-input name="email" type="email"></civ-text-input>
  </civ-form-field>
  <civ-form-fieldset legend="Branch">
    <civ-radio-group name="branch">
      <civ-radio label="Army" value="army"></civ-radio>
      <civ-radio label="Navy" value="navy"></civ-radio>
    </civ-radio-group>
  </civ-form-fieldset>
  <civ-form-field label="State">
    <civ-select name="state">
      <option value="CA">California</option>
    </civ-select>
  </civ-form-field>
</civ-form>
`;

describe('generateTests', () => {
  it('generates valid file structure with imports and afterEach', () => {
    const result = generateTests(SAMPLE_HTML, 'VeteranForm');
    expect(result.code).toContain("import { describe, it, expect, afterEach, vi } from 'vitest'");
    expect(result.code).toContain(
      "import { fixture, cleanupFixtures, elementUpdated, pressKey, typeText } from '@civui/test-utils'",
    );
    expect(result.code).toContain('afterEach(cleanupFixtures)');
  });

  it('generates a describe block with the suite name', () => {
    const result = generateTests(SAMPLE_HTML, 'VeteranForm');
    expect(result.code).toContain("describe('VeteranForm'");
  });

  it('includes a rendering test', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).toContain("it('renders the form'");
    expect(result.code).toContain('expect(el).toBeDefined()');
  });

  it('generates label tests for each component', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).toContain('civ-text-input[name="full-name"] has label');
    expect(result.code).toContain('civ-text-input[name="email"] has label');
    expect(result.code).toContain('civ-radio-group[name="branch"] has legend');
    expect(result.code).toContain('civ-select[name="state"] has label');
  });

  it('generates required tests only for required fields', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).toContain('civ-text-input[name="full-name"] is required');
    expect(result.code).not.toContain('civ-text-input[name="email"] is required');
    expect(result.code).not.toContain('civ-select[name="state"] is required');
  });

  it('generates event tests for each component', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).toContain('fires civ-change');
    expect(result.code).toContain("addEventListener('civ-change'");
  });

  it('includes keyboard navigation test', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).toContain('supports keyboard navigation');
  });

  it('returns accurate testCount', () => {
    const result = generateTests(SAMPLE_HTML);
    // 1 render + 4 label + 1 required + 4 event + 1 keyboard = 11
    expect(result.testCount).toBe(11);
  });

  it('generates a kebab-case filename', () => {
    const result = generateTests(SAMPLE_HTML, 'VeteranBenefitsForm');
    expect(result.filename).toBe('veteran-benefits-form.test.ts');
  });

  it('defaults suite name to "Form"', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).toContain("describe('Form'");
    expect(result.filename).toBe('form.test.ts');
  });

  it('does not include child civ-radio as separate components', () => {
    const result = generateTests(SAMPLE_HTML);
    expect(result.code).not.toContain('civ-radio[name=');
  });
});
