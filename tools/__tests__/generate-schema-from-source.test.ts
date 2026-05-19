/**
 * Tests for tools/generate-schema-from-source.ts.
 *
 * Focus on the pure parsing function — the I/O side (locating Lit
 * source, writing schema files) is exercised when the tool runs.
 */

import { describe, it, expect } from 'vitest';
import { parseProperties, parseDispatchedEvents, renderSchema } from '../generate-schema-from-source.js';

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

  it('filters PresetInputWrapper text-input props only when the base class is used', () => {
    // Without PresetInputWrapper, `placeholder` should NOT be filtered.
    const withoutMixin = `
export class CivFoo extends CivFormElement {
  @property({ type: String }) placeholder = '';
}
`;
    expect(parseProperties(withoutMixin).map((p) => p.name)).toContain('placeholder');

    // With PresetInputWrapper, `placeholder` IS filtered (the wrapper forwards it).
    const withMixin = `
export class CivSsn extends PresetInputWrapper {
  @property({ type: String }) placeholder = '';
  @property({ type: String }) customProp = '';
}
`;
    const filtered = parseProperties(withMixin).map((p) => p.name);
    expect(filtered).not.toContain('placeholder');
    expect(filtered).toContain('customProp');
  });

  it('filters CivBooleanFormElement props only when that base class is used', () => {
    const withoutBoolean = `
export class CivFoo extends CivFormElement {
  @property({ type: Boolean }) checked = false;
}
`;
    // Plain CivFormElement components might define `checked` as their own prop.
    expect(parseProperties(withoutBoolean).map((p) => p.name)).toContain('checked');

    const withBoolean = `
export class CivToggle extends CivBooleanFormElement {
  @property({ type: Boolean }) checked = false;
  @property({ type: String }) variant = 'default';
}
`;
    const filtered = parseProperties(withBoolean).map((p) => p.name);
    expect(filtered).not.toContain('checked');
    expect(filtered).toContain('variant');
  });
});

describe('parseDispatchedEvents', () => {
  it('extracts events from dispatch(this, ...) calls', () => {
    const src = `
this.dispatchEvent(...);
dispatch(this, 'civ-foo', { detail: { x: 1 } });
dispatch(this, 'civ-bar');
`;
    expect(parseDispatchedEvents(src)).toEqual(['civ-bar', 'civ-foo']);
  });

  it('extracts events from new CustomEvent() calls', () => {
    const src = `const e = new CustomEvent('civ-toggle', { detail: { open: true } });`;
    expect(parseDispatchedEvents(src)).toEqual(['civ-toggle']);
  });

  it('filters out base-class events (civ-input, civ-change, civ-analytics, civ-reset)', () => {
    const src = `
dispatch(this, 'civ-input');
dispatch(this, 'civ-change');
dispatch(this, 'civ-analytics');
dispatch(this, 'civ-reset');
dispatch(this, 'civ-custom');
`;
    expect(parseDispatchedEvents(src)).toEqual(['civ-custom']);
  });

  it('deduplicates repeated dispatches of the same event', () => {
    const src = `
dispatch(this, 'civ-toggle');
dispatch(this, 'civ-toggle');
`;
    expect(parseDispatchedEvents(src)).toEqual(['civ-toggle']);
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

  it('emits passed events as entries in the events block', () => {
    const src = renderSchema('civ-foo', [], { events: ['civ-toggle', 'civ-dismiss'] });
    expect(src).toContain("'civ-toggle':");
    expect(src).toContain("'civ-dismiss':");
    expect(src).toContain('TODO: fill in event detail keys');
  });

  it('branches a11y + form + renderOrder for CivBaseElement (non-form) components', () => {
    const src = renderSchema('civ-foo', [], { extends: 'CivBaseElement', category: 'ui' });
    expect(src).toContain("extends: 'CivBaseElement'");
    expect(src).toContain("category: 'ui'");
    expect(src).toContain("role: 'group'");
    expect(src).toContain("requiredIndicator: 'none'");
    expect(src).toContain('formAssociated: false');
    expect(src).toContain("resetBehavior: 'none'");
    // Container/slot render shape, not label/hint/error/input
    expect(src).toContain("type: 'container'");
    expect(src).toContain("type: 'slot'");
  });

  it('keeps form-control defaults for CivFormElement components', () => {
    const src = renderSchema('civ-foo', [], { extends: 'CivFormElement', category: 'form-control' });
    expect(src).toContain("extends: 'CivFormElement'");
    expect(src).toContain("role: 'textbox'");
    expect(src).toContain('formAssociated: true');
  });
});
