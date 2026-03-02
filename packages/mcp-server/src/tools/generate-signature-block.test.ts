import { describe, it, expect } from 'vitest';
import { generateSignatureBlock } from './generate-signature-block.js';
import type { FormSchema } from '../schema/index.js';

const minimalSchema: FormSchema = { sections: [] };

function schemaWithSignature(
  overrides?: Partial<FormSchema['signature']>,
): FormSchema {
  return {
    sections: [],
    signature: {
      type: 'drawn',
      legalText: 'Schema-level legal text.',
      witnessRequired: true,
      dateRequired: true,
      printNameRequired: true,
      ...overrides,
    },
  };
}

describe('generateSignatureBlock', () => {
  it('returns html, javascript, features, and fields', () => {
    const result = generateSignatureBlock(minimalSchema);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('fields');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(Array.isArray(result.fields)).toBe(true);
  });

  it('HTML has data-civ-signature fieldset with legend', () => {
    const result = generateSignatureBlock(minimalSchema);
    expect(result.html).toContain('<fieldset data-civ-signature>');
    expect(result.html).toContain('<legend>Signature</legend>');
    expect(result.html).toContain('</fieldset>');
  });

  it('default type is typed — generates civ-text-input with name="signature"', () => {
    const result = generateSignatureBlock(minimalSchema);
    expect(result.html).toContain('civ-text-input');
    expect(result.html).toContain('name="signature"');
    expect(result.fields).toContain('signature');
  });

  it('legal text renders in blockquote with role="note"', () => {
    const result = generateSignatureBlock(minimalSchema);
    expect(result.html).toContain('<blockquote role="note"');
    expect(result.html).toContain('</blockquote>');
  });

  it('default legal text is used when none provided', () => {
    const result = generateSignatureBlock(minimalSchema);
    expect(result.html).toContain(
      'I certify that the information provided is true and correct to the best of my knowledge.',
    );
  });

  it('custom legalText from options overrides default', () => {
    const customText = 'I solemnly declare under penalty of perjury.';
    const result = generateSignatureBlock(minimalSchema, { legalText: customText });
    expect(result.html).toContain(customText);
    expect(result.html).not.toContain(
      'I certify that the information provided is true and correct',
    );
  });

  it('typed signature: features include signature and typed-signature', () => {
    const result = generateSignatureBlock(minimalSchema, { type: 'typed' });
    expect(result.features).toContain('signature');
    expect(result.features).toContain('typed-signature');
  });

  it('drawn signature: generates canvas element with data-civ-signature-pad', () => {
    const result = generateSignatureBlock(minimalSchema, { type: 'drawn' });
    expect(result.html).toContain('<canvas data-civ-signature-pad');
    expect(result.html).toContain('aria-label="Signature drawing area"');
    expect(result.html).toContain('name="signature-data"');
    expect(result.fields).toContain('signature-data');
  });

  it('drawn signature: features include drawn-signature and canvas', () => {
    const result = generateSignatureBlock(minimalSchema, { type: 'drawn' });
    expect(result.features).toContain('drawn-signature');
    expect(result.features).toContain('canvas');
  });

  it('checkbox signature: generates civ-checkbox with name="signature-agree"', () => {
    const result = generateSignatureBlock(minimalSchema, { type: 'checkbox' });
    expect(result.html).toContain('civ-checkbox');
    expect(result.html).toContain('name="signature-agree"');
    expect(result.features).toContain('checkbox-signature');
    expect(result.fields).toContain('signature-agree');
  });

  it('printNameRequired adds print-name input and feature', () => {
    const result = generateSignatureBlock(minimalSchema, { printNameRequired: true });
    expect(result.html).toContain('name="signature-print-name"');
    expect(result.html).toContain('label="Printed name"');
    expect(result.features).toContain('print-name');
    expect(result.fields).toContain('signature-print-name');
  });

  it('dateRequired adds date input and feature', () => {
    const result = generateSignatureBlock(minimalSchema, { dateRequired: true });
    expect(result.html).toContain('name="signature-date"');
    expect(result.html).toContain('label="Date"');
    expect(result.features).toContain('date-field');
    expect(result.fields).toContain('signature-date');
  });

  it('witnessRequired adds witness fieldset and feature', () => {
    const result = generateSignatureBlock(minimalSchema, { witnessRequired: true });
    expect(result.html).toContain('<fieldset data-civ-witness>');
    expect(result.html).toContain('<legend>Witness</legend>');
    expect(result.html).toContain('name="witness-name"');
    expect(result.html).toContain('name="witness-date"');
    expect(result.features).toContain('witness');
    expect(result.fields).toContain('witness-name');
    expect(result.fields).toContain('witness-date');
  });

  it('schema signature config is used as defaults, with options overriding', () => {
    // Schema sets type=drawn, legalText, witnessRequired, dateRequired, printNameRequired
    const schema = schemaWithSignature();

    // Without options — schema config is used
    const resultFromSchema = generateSignatureBlock(schema);
    expect(resultFromSchema.html).toContain('data-civ-signature-pad');
    expect(resultFromSchema.html).toContain('Schema-level legal text.');
    expect(resultFromSchema.features).toContain('witness');
    expect(resultFromSchema.features).toContain('date-field');
    expect(resultFromSchema.features).toContain('print-name');

    // Options override schema config
    const resultOverridden = generateSignatureBlock(schema, {
      type: 'typed',
      legalText: 'Overridden text.',
      witnessRequired: false,
    });
    expect(resultOverridden.html).toContain('name="signature"');
    expect(resultOverridden.html).not.toContain('data-civ-signature-pad');
    expect(resultOverridden.html).toContain('Overridden text.');
    expect(resultOverridden.html).not.toContain('Schema-level legal text.');
    expect(resultOverridden.features).not.toContain('witness');
    // dateRequired and printNameRequired still come from schema
    expect(resultOverridden.features).toContain('date-field');
    expect(resultOverridden.features).toContain('print-name');
  });
});
