import { describe, it, expect } from 'vitest';
import { generateAddressBlock, US_STATES, US_TERRITORIES, MILITARY_ADDRESSES } from './generate-address-block.js';

describe('generateAddressBlock', () => {
  it('returns html, javascript, features, fields, and section properties', () => {
    const result = generateAddressBlock();
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('fields');
    expect(result).toHaveProperty('section');
  });

  it('HTML contains data-civ-address-block fieldset', () => {
    const result = generateAddressBlock();
    expect(result.html).toContain('<fieldset data-civ-address-block');
    expect(result.html).toContain('</fieldset>');
  });

  it('default legend is "Mailing address"', () => {
    const result = generateAddressBlock();
    expect(result.html).toContain('Mailing address');
    expect(result.section.heading).toBe('Mailing address');
  });

  it('custom label overrides legend', () => {
    const result = generateAddressBlock({ label: 'Home address' });
    expect(result.html).toContain('Home address');
    expect(result.html).not.toContain('Mailing address');
    expect(result.section.heading).toBe('Home address');
  });

  it('generates all 5 address fields (street-1, street-2, city, state, zip)', () => {
    const result = generateAddressBlock();
    expect(result.fields).toEqual(['street-1', 'street-2', 'city', 'state', 'zip']);
    expect(result.html).toContain('name="street-1"');
    expect(result.html).toContain('name="street-2"');
    expect(result.html).toContain('name="city"');
    expect(result.html).toContain('name="state"');
    expect(result.html).toContain('name="zip"');
  });

  it('ZIP has correct pattern attribute', () => {
    const result = generateAddressBlock();
    expect(result.html).toContain('pattern="^\\d{5}(-\\d{4})?$"');
  });

  it('street-1, city, state, zip are required', () => {
    const result = generateAddressBlock();
    // Check that required fields are marked required in the section
    const requiredFields = result.section.fields
      .filter((f) => f.required)
      .map((f) => f.name);
    expect(requiredFields).toContain('street-1');
    expect(requiredFields).toContain('city');
    expect(requiredFields).toContain('state');
    expect(requiredFields).toContain('zip');
    // street-2 should NOT be required
    expect(requiredFields).not.toContain('street-2');
  });

  it('fields have correct autocomplete attributes', () => {
    const result = generateAddressBlock();
    expect(result.html).toContain('autocomplete="address-line1"');
    expect(result.html).toContain('autocomplete="address-line2"');
    expect(result.html).toContain('autocomplete="address-level2"');
    expect(result.html).toContain('autocomplete="address-level1"');
    expect(result.html).toContain('autocomplete="postal-code"');
  });

  it('US_STATES has 50 entries', () => {
    expect(US_STATES).toHaveLength(50);
  });

  it('US_TERRITORIES has 6 entries (DC, AS, GU, MP, PR, VI)', () => {
    expect(US_TERRITORIES).toHaveLength(6);
    const codes = US_TERRITORIES.map((t) => t.value);
    expect(codes).toEqual(['DC', 'AS', 'GU', 'MP', 'PR', 'VI']);
  });

  it('MILITARY_ADDRESSES has 3 entries (AA, AE, AP)', () => {
    expect(MILITARY_ADDRESSES).toHaveLength(3);
    const codes = MILITARY_ADDRESSES.map((m) => m.value);
    expect(codes).toEqual(['AA', 'AE', 'AP']);
  });

  it('includeTerritories adds territories to state options and feature', () => {
    const result = generateAddressBlock({ includeTerritories: true });
    expect(result.features).toContain('territories');
    expect(result.html).toContain('District of Columbia');
    expect(result.html).toContain('Puerto Rico');
    // Section state field should include territory options
    const stateField = result.section.fields.find((f) => f.name === 'state');
    expect(stateField).toBeDefined();
    const stateOptions = (stateField as any).options as Array<{ value: string; label: string }>;
    const optionValues = stateOptions.map((o) => o.value);
    expect(optionValues).toContain('DC');
    expect(optionValues).toContain('PR');
  });

  it('includeMilitary adds military addresses to options and feature', () => {
    const result = generateAddressBlock({ includeMilitary: true });
    expect(result.features).toContain('military-addresses');
    expect(result.html).toContain('Armed Forces Americas');
    expect(result.html).toContain('Armed Forces Europe');
    expect(result.html).toContain('Armed Forces Pacific');
    // Section state field should include military options
    const stateField = result.section.fields.find((f) => f.name === 'state');
    expect(stateField).toBeDefined();
    const stateOptions = (stateField as any).options as Array<{ value: string; label: string }>;
    const optionValues = stateOptions.map((o) => o.value);
    expect(optionValues).toContain('AA');
    expect(optionValues).toContain('AE');
    expect(optionValues).toContain('AP');
  });

  it('section returns valid FormSection with 5 fields', () => {
    const result = generateAddressBlock();
    expect(result.section.heading).toBe('Mailing address');
    expect(result.section.fields).toHaveLength(5);
    const fieldNames = result.section.fields.map((f) => f.name);
    expect(fieldNames).toEqual(['street-1', 'street-2', 'city', 'state', 'zip']);
  });
});
