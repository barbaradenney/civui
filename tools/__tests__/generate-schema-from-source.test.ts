/**
 * Tests for tools/generate-schema-from-source.ts.
 *
 * Focus on the pure parsing function — the I/O side (locating Lit
 * source, writing schema files) is exercised when the tool runs.
 */

import { describe, it, expect } from 'vitest';
import { parseProperties, renderSchema } from '../generate-schema-from-source.js';

describe('parseProperties', () => {
  it('extracts a basic string property with default', () => {
    const src = `
@property({ type: String }) placeholder = '';
`;
    const props = parseProperties(src);
    expect(props).toHaveLength(1);
    expect(props[0]).toMatchObject({
      name: 'placeholder',
      type: 'string',
      default: '',
    });
  });

  it('extracts a boolean property with default', () => {
    const src = `
@property({ type: Boolean }) allowNegative = false;
`;
    const props = parseProperties(src);
    expect(props[0]).toMatchObject({
      name: 'allowNegative',
      type: 'boolean',
      default: false,
    });
  });

  it('extracts a number property with default', () => {
    const src = `
@property({ type: Number }) decimals = 2;
`;
    const props = parseProperties(src);
    expect(props[0]).toMatchObject({
      name: 'decimals',
      type: 'number',
      default: 2,
    });
  });

  it('captures the `attribute:` override when non-default', () => {
    // myProp default would be 'my-prop' — overriding to 'something-else' is non-default.
    const src = `
@property({ type: String, attribute: 'something-else' }) myProp = '';
`;
    const props = parseProperties(src);
    expect(props[0].attribute).toBe('something-else');
  });

  it('does not record `attribute:` when it matches the default camelCase → kebab-case mapping', () => {
    const src = `
@property({ type: String, attribute: 'place-holder' }) placeHolder = '';
`;
    // placeHolder → place-holder (Lit default), so attribute is redundant.
    const props = parseProperties(src);
    expect(props[0].attribute).toBeUndefined();
  });

  it('filters inherited base-class props (label, value, error, etc.)', () => {
    const src = `
@property({ type: String }) label = '';
@property({ type: String }) value = '';
@property({ type: String }) error = '';
@property({ type: Boolean }) required = false;
@property({ type: String }) placeholder = '';
`;
    const props = parseProperties(src);
    expect(props.map((p) => p.name)).toEqual(['placeholder']);
  });

  it('extracts the JSDoc description from the line above', () => {
    const src = `
    /** Maximum character length */
    @property({ type: Number }) maxlength = 100;
`;
    const props = parseProperties(src);
    expect(props[0].description).toBe('Maximum character length');
  });

  it('infers enum type from a union of string literals', () => {
    const src = `
@property({ type: String }) variant: 'primary' | 'secondary' = 'primary';
`;
    const props = parseProperties(src);
    expect(props[0].type).toBe('enum');
  });

  it('handles multiple @property declarations in sequence', () => {
    const src = `
@property({ type: String }) placeholder = '';
@property({ type: Boolean }) required = false;
@property({ type: Number }) maxlength = 100;
@property({ type: Boolean }) disabled = false;
`;
    const props = parseProperties(src);
    // disabled + required are inherited — only placeholder + maxlength survive.
    expect(props.map((p) => p.name).sort()).toEqual(['maxlength', 'placeholder']);
  });
});

describe('renderSchema', () => {
  it('produces a valid TypeScript module', () => {
    const src = renderSchema('civ-foo', [
      { name: 'bar', type: 'string', default: '' },
    ]);
    expect(src).toContain("name: 'civ-foo'");
    expect(src).toContain('export default schema');
    expect(src).toContain("type: 'string'");
  });

  it('adds a TODO for enum values', () => {
    const src = renderSchema('civ-foo', [
      { name: 'variant', type: 'enum' },
    ]);
    expect(src).toContain('values: [], // TODO');
  });

  it('emits the attribute override when present', () => {
    const src = renderSchema('civ-foo', [
      { name: 'hideCharCount', type: 'boolean', attribute: 'hide-char-count' },
    ]);
    expect(src).toContain("attribute: 'hide-char-count'");
  });

  it('emits the description when provided', () => {
    const src = renderSchema('civ-foo', [
      { name: 'maxlength', type: 'number', description: 'Maximum length' },
    ]);
    expect(src).toContain('"Maximum length"');
  });
});
