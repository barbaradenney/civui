/**
 * Tests for the pure helper functions in tools/schema-parity.ts.
 *
 * The CLI is gated behind `isCliInvocation()` so importing the module
 * here does not run main(). We exercise the parsers, normalization,
 * and platform-prop-name alternatives — the pieces that future schema /
 * platform changes are most likely to silently regress.
 */

import { describe, it, expect } from 'vitest';
import {
  parseLitPropsFromSource,
  parseLitEventsFromSource,
  parseSwiftPropNamesFromSource,
  parseKotlinPropNamesFromSource,
  parseDrupalPropNamesFromYaml,
  iosPropAlternatives,
  androidPropAlternatives,
  normalizeType,
  camelToSnake,
} from '../schema-parity.js';

describe('iosPropAlternatives', () => {
  it('always offers the bare name and the is-prefixed boolean variant', () => {
    expect(iosPropAlternatives('required')).toEqual(['required', 'isRequired']);
    expect(iosPropAlternatives('tile')).toEqual(['tile', 'isTile']);
  });

  it('renames `type` to `inputType` to avoid shadowing Swift\'s metatype keyword', () => {
    expect(iosPropAlternatives('type')).toContain('inputType');
  });

  it('renames `name` to `formName` to avoid colliding with View\'s a11y label', () => {
    expect(iosPropAlternatives('name')).toContain('formName');
  });

  it('maps HTML-attribute lowercase to native camelCase', () => {
    expect(iosPropAlternatives('maxlength')).toContain('maxLength');
    expect(iosPropAlternatives('minlength')).toContain('minLength');
    expect(iosPropAlternatives('inputmode')).toContain('inputMode');
  });
});

describe('androidPropAlternatives', () => {
  it('mirrors Lit prop names directly for the common case', () => {
    expect(androidPropAlternatives('required')).toEqual(['required']);
  });

  it('renames `type` to `inputType` (Kotlin reserves it less than Swift but we keep parity)', () => {
    expect(androidPropAlternatives('type')).toContain('inputType');
  });

  it('maps HTML-attribute lowercase to native camelCase', () => {
    expect(androidPropAlternatives('maxlength')).toContain('maxLength');
  });
});

describe('normalizeType', () => {
  it('treats `string` and `enum` as equivalent for diffing', () => {
    expect(normalizeType('string')).toBe(normalizeType('enum'));
  });

  it('preserves array as its own normalized token', () => {
    expect(normalizeType('array')).toBe('array');
  });

  it('lowercases other types', () => {
    expect(normalizeType('Boolean')).toBe('boolean');
    expect(normalizeType('NUMBER')).toBe('number');
  });
});

describe('camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('showMiddle')).toBe('show_middle');
    expect(camelToSnake('headingLevel')).toBe('heading_level');
  });

  it('leaves all-lowercase names alone', () => {
    expect(camelToSnake('required')).toBe('required');
  });

  it('handles consecutive capitals as one token', () => {
    expect(camelToSnake('parseURL')).toBe('parse_url');
  });
});

describe('parseLitPropsFromSource', () => {
  // Avoid inherited form prop names (label/value/required/...) here —
  // those are deliberately filtered out by parseLitPropsFromSource.
  const litFixture = `
    @customElement('civ-thing')
    export class CivThing extends CivBaseElement {
      @property({ type: String }) flavor = 'sweet';
      @property({ type: Boolean }) sparkly = false;
      @property({ type: Number, attribute: 'max-count' }) maxCount = 0;
      @property({ type: Array, attribute: false }) options: string[] = [];
    }
  `;

  it('extracts name + type for each @property', () => {
    const props = parseLitPropsFromSource(litFixture, false);
    const byName = new Map(props.map((p) => [p.name, p]));
    expect(byName.get('flavor')?.type).toBe('string');
    expect(byName.get('sparkly')?.type).toBe('boolean');
    expect(byName.get('maxCount')?.type).toBe('number');
    expect(byName.get('options')?.type).toBe('array');
  });

  it('captures the explicit `attribute:` override', () => {
    const props = parseLitPropsFromSource(litFixture, false);
    const byName = new Map(props.map((p) => [p.name, p]));
    expect(byName.get('maxCount')?.attribute).toBe('max-count');
    expect(byName.get('flavor')?.attribute).toBeUndefined();
  });

  it('filters out inherited form props (label, value, hint, ...)', () => {
    const fixtureWithInherited = `
      @property({ type: String }) label = '';
      @property({ type: String }) value = '';
      @property({ type: String }) flavor = 'sweet';
    `;
    const props = parseLitPropsFromSource(fixtureWithInherited, false);
    const names = props.map((p) => p.name);
    expect(names).toEqual(['flavor']);
  });

  it('filters out inherited boolean props when isBoolean=true', () => {
    const fixture = `
      @property({ type: Boolean, reflect: true }) checked = false;
      @property({ type: String }) description = '';
      @property({ type: String }) flavor = 'sweet';
    `;
    const namesWithFlag = parseLitPropsFromSource(fixture, true).map((p) => p.name);
    const namesWithoutFlag = parseLitPropsFromSource(fixture, false).map((p) => p.name);
    expect(namesWithFlag).toEqual(['flavor']);
    expect(namesWithoutFlag.sort()).toEqual(['checked', 'description', 'flavor']);
  });
});

describe('parseLitEventsFromSource', () => {
  it('extracts dispatch(this, ...) calls with inline detail keys', () => {
    const src = `
      this._handle = () => {
        dispatch(this, 'civ-thing', { value: 'x', count: 1 });
      };
    `;
    const events = parseLitEventsFromSource(src);
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('civ-thing');
    expect(events[0].detailKeys).toEqual(['count', 'value']);
    expect(events[0].detailUnknown).toBeFalsy();
  });

  it('extracts dispatchEvent(new CustomEvent(...)) calls', () => {
    const src = `
      this.dispatchEvent(new CustomEvent('civ-filter', {
        bubbles: true,
        detail: { query: this.q, count: this.results.length }
      }));
    `;
    const events = parseLitEventsFromSource(src);
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('civ-filter');
    expect(events[0].detailKeys).toEqual(['count', 'query']);
  });

  it('marks detailUnknown when the dispatch passes a variable, not a literal', () => {
    const src = `
      const detail = { ... };
      dispatch(this, 'civ-edit', detail);
    `;
    const events = parseLitEventsFromSource(src);
    expect(events[0].detailUnknown).toBe(true);
  });

  it('skips inherited civ-analytics / civ-reset events', () => {
    const src = `
      dispatch(this, 'civ-analytics', { event: 'click' });
      dispatch(this, 'civ-reset');
      dispatch(this, 'civ-input', { value: 'x' });
    `;
    const names = parseLitEventsFromSource(src).map((e) => e.name);
    expect(names).toEqual(['civ-input']);
  });
});

describe('parseSwiftPropNamesFromSource', () => {
  it('captures public var and public let declarations', () => {
    const src = `
      public struct CivThing: View {
        public var label: String
        public let isRequired: Bool
        public var weekStartsOn: Int
      }
    `;
    const names = parseSwiftPropNamesFromSource(src).sort();
    expect(names).toEqual(['isRequired', 'label', 'weekStartsOn']);
  });

  it('also picks up @Binding-decorated public vars', () => {
    const src = `
      @Binding public var value: String
      public var label: String
    `;
    expect(parseSwiftPropNamesFromSource(src).sort()).toEqual(['label', 'value']);
  });
});

describe('parseKotlinPropNamesFromSource', () => {
  it('extracts the @Composable function\'s parameter names', () => {
    const src = `
      @Composable
      fun CivThing(
        label: String = "",
        required: Boolean = false,
        modifier: Modifier = Modifier,
      ) { }
    `;
    const names = parseKotlinPropNamesFromSource(src, 'CivThing').sort();
    expect(names).toEqual(['label', 'modifier', 'required']);
  });

  it('strips backticks from reserved-word parameter names like `when`', () => {
    const src = `
      @Composable
      fun CivConditional(
        visible: Boolean,
        \`when\`: String = "",
        equals: String = "",
      ) { }
    `;
    const names = parseKotlinPropNamesFromSource(src, 'CivConditional');
    expect(names).toContain('when');
  });

  it('handles lambda-typed parameters with their own parens', () => {
    const src = `
      @Composable
      fun CivThing(
        label: String,
        onChange: (String) -> Unit = {},
        onComplete: (Boolean, Int) -> Unit = { _, _ -> },
      ) { }
    `;
    const names = parseKotlinPropNamesFromSource(src, 'CivThing').sort();
    expect(names).toEqual(['label', 'onChange', 'onComplete']);
  });

  it('returns empty when the named function is not present', () => {
    const src = `fun OtherThing() { }`;
    expect(parseKotlinPropNamesFromSource(src, 'CivThing')).toEqual([]);
  });
});

describe('parseDrupalPropNamesFromYaml', () => {
  it('extracts top-level keys under props.properties', () => {
    const yaml = `
name: Thing
props:
  type: object
  properties:
    label:
      type: string
    show_middle:
      type: boolean
      default: false
    max_count:
      type: integer
slots:
  default:
    title: Default
`;
    const names = parseDrupalPropNamesFromYaml(yaml).sort();
    expect(names).toEqual(['label', 'max_count', 'show_middle']);
  });

  it('does not bleed into the slots block when it shares ancestor indentation', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
slots:
  default:
    title: Default
`;
    expect(parseDrupalPropNamesFromYaml(yaml)).toEqual(['label']);
  });
});
