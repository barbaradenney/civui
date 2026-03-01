import { describe, it, expect } from 'vitest';
import { extractStrings } from './extract-strings.js';

describe('extractStrings', () => {
  it('extracts label, hint, error, and required-message', () => {
    const html = `
      <civ-text-input
        name="full-name"
        label="Full name"
        hint="Enter your legal name"
        error="Name is required"
        required-message="Please enter your full name"
      ></civ-text-input>
    `;
    const result = extractStrings(html);
    expect(result.strings['full-name.label']).toBe('Full name');
    expect(result.strings['full-name.hint']).toBe('Enter your legal name');
    expect(result.strings['full-name.error']).toBe('Name is required');
    expect(result.strings['full-name.required-message']).toBe('Please enter your full name');
  });

  it('extracts placeholder', () => {
    const html = '<civ-text-input name="email" label="Email" placeholder="you@example.com"></civ-text-input>';
    const result = extractStrings(html);
    expect(result.strings['email.placeholder']).toBe('you@example.com');
  });

  it('extracts legend from group components', () => {
    const html = `
      <civ-radio-group name="branch" legend="Branch of service">
        <civ-radio label="Army" value="army"></civ-radio>
        <civ-radio label="Navy" value="navy"></civ-radio>
      </civ-radio-group>
    `;
    const result = extractStrings(html);
    expect(result.strings['branch.legend']).toBe('Branch of service');
  });

  it('extracts option labels from radio group children', () => {
    const html = `
      <civ-radio-group name="color" legend="Color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `;
    const result = extractStrings(html);
    expect(result.strings['color.option.red']).toBe('Red');
    expect(result.strings['color.option.blue']).toBe('Blue');
  });

  it('extracts option labels from checkbox group children', () => {
    const html = `
      <civ-checkbox-group name="toppings" legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `;
    const result = extractStrings(html);
    expect(result.strings['toppings.option.cheese']).toBe('Cheese');
    expect(result.strings['toppings.option.pepperoni']).toBe('Pepperoni');
  });

  it('keys follow {name}.{attribute} format', () => {
    const html = '<civ-textarea name="comments" label="Comments" hint="Optional"></civ-textarea>';
    const result = extractStrings(html);
    const keys = Object.keys(result.strings);
    for (const key of keys) {
      expect(key).toMatch(/^[^.]+\.[^.]+$/);
    }
  });

  it('returns correct count', () => {
    const html = `
      <civ-text-input name="a" label="Label A" hint="Hint A"></civ-text-input>
      <civ-text-input name="b" label="Label B"></civ-text-input>
    `;
    const result = extractStrings(html);
    expect(result.count).toBe(3);
  });

  it('skips elements without name attribute', () => {
    const html = '<civ-text-input label="No name"></civ-text-input>';
    const result = extractStrings(html);
    expect(result.count).toBe(0);
  });

  it('skips empty attribute values', () => {
    const html = '<civ-text-input name="test" label="" hint="Valid"></civ-text-input>';
    const result = extractStrings(html);
    expect(result.strings['test.label']).toBeUndefined();
    expect(result.strings['test.hint']).toBe('Valid');
  });
});
