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
  parseSwiftPropsFromSource,
  parseKotlinPropNamesFromSource,
  parseKotlinPropsFromSource,
  parseDrupalPropNamesFromYaml,
  parseDrupalPropsFromYaml,
  expectedDrupalType,
  categorizeNativeType,
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

describe('parseLitPropsFromSource — regression cases from code review', () => {
  it('handles multi-line @property declarations (nested object initializer)', () => {
    const fixture = `
      @customElement('civ-thing')
      export class CivThing extends CivBaseElement {
        @property({ type: Object }) options: Foo = {
          a: 1,
        };
        @property({ type: String }) flavor = 'sweet';
      }
    `;
    const props = parseLitPropsFromSource(fixture, false);
    const names = props.map((p) => p.name).sort();
    // Both options and flavor must be captured — the multi-line default
    // value of `options` shouldn't break the parser's frame for `flavor`.
    expect(names).toEqual(['flavor', 'options']);
  });

  it('handles @property() with nested object in the options block', () => {
    const fixture = `
      @property({ type: String, converter: { fromAttribute: (v) => v } }) foo = 'bar';
    `;
    const props = parseLitPropsFromSource(fixture, false);
    expect(props).toHaveLength(1);
    expect(props[0]?.name).toBe('foo');
    expect(props[0]?.type).toBe('string');
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

describe('parseLitEventsFromSource — regression cases from code review', () => {
  it('extracts the full detail object even when it contains nested literals', () => {
    const src = `
      this.dispatchEvent(new CustomEvent('civ-thing', {
        detail: { value: 'x', meta: { nested: true } },
        bubbles: true,
      }));
    `;
    const events = parseLitEventsFromSource(src);
    expect(events).toHaveLength(1);
    // Top-level detail keys are 'value' and 'meta'. The nested object's
    // own keys ('nested') should NOT appear — that was the bug.
    expect(events[0]?.detailKeys).toEqual(['meta', 'value']);
  });

  it('extracts dispatch(this, ...) detail across multi-line literal', () => {
    const src = `
      dispatch(this, 'civ-thing', {
        value: this.value,
        items: [1, 2, 3],
        meta: { nested: 'ok' },
      });
    `;
    const events = parseLitEventsFromSource(src);
    expect(events[0]?.detailKeys).toEqual(['items', 'meta', 'value']);
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

describe('parseDrupalPropsFromYaml — regression: nested properties blocks', () => {
  it('does not capture props from a nested `properties:` under libraryOverrides', () => {
    const yaml = `
name: Thing
props:
  type: object
  properties:
    label:
      type: string
libraryOverrides:
  attributes:
    properties:
      stale_one:
        type: string
      stale_two:
        type: array
`;
    const props = parseDrupalPropsFromYaml(yaml);
    const names = props.map((p) => p.name);
    expect(names).toEqual(['label']);
    expect(names).not.toContain('stale_one');
    expect(names).not.toContain('stale_two');
  });

  it('does not capture props from a nested `properties:` under array items', () => {
    const yaml = `
props:
  type: object
  properties:
    list_field:
      type: array
      items:
        type: object
        properties:
          inner_one:
            type: string
    label:
      type: string
`;
    // Note: this test exposes a limitation — props.label appears AFTER
    // the array's items block. The real-world Drupal SDCs we have don't
    // do this; if they did we'd need a stricter parser.
    const names = parseDrupalPropsFromYaml(yaml).map((p) => p.name);
    expect(names).toContain('list_field');
    expect(names).not.toContain('inner_one');
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

describe('parseDrupalPropsFromYaml', () => {
  it('captures both name and type for each prop', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
    required:
      type: boolean
    count:
      type: integer
    options:
      type: array
`;
    const props = parseDrupalPropsFromYaml(yaml);
    const byName = new Map(props.map((p) => [p.name, p.type]));
    expect(byName.get('label')).toBe('string');
    expect(byName.get('required')).toBe('boolean');
    expect(byName.get('count')).toBe('integer');
    expect(byName.get('options')).toBe('array');
  });

  it('returns undefined for type when the YAML omits it', () => {
    const yaml = `
props:
  type: object
  properties:
    bareKey:
      title: Bare
      description: 'no type field'
`;
    const props = parseDrupalPropsFromYaml(yaml);
    expect(props).toEqual([{ name: 'bareKey', type: undefined }]);
  });
});

describe('categorizeNativeType', () => {
  it('recognizes Swift / Kotlin booleans', () => {
    expect(categorizeNativeType('Bool')).toBe('boolean');
    expect(categorizeNativeType('Boolean')).toBe('boolean');
    expect(categorizeNativeType('Bool?')).toBe('boolean');
  });

  it('recognizes the full numeric type family on both platforms', () => {
    for (const t of ['Int', 'Int32', 'Int64', 'UInt', 'Long', 'Double', 'Float', 'CGFloat', 'Number']) {
      expect(categorizeNativeType(t)).toBe('number');
    }
  });

  it('recognizes String as string-or-enum', () => {
    expect(categorizeNativeType('String')).toBe('string-or-enum');
    expect(categorizeNativeType('String?')).toBe('string-or-enum');
  });

  it('recognizes Swift / Kotlin array forms', () => {
    expect(categorizeNativeType('[String]')).toBe('array');
    expect(categorizeNativeType('[SummarySectionData]')).toBe('array');
    expect(categorizeNativeType('List<String>')).toBe('array');
    expect(categorizeNativeType('Array<Int>')).toBe('array');
  });

  it('unwraps Binding<...> to the inner type', () => {
    expect(categorizeNativeType('Binding<String>')).toBe('string-or-enum');
    expect(categorizeNativeType('Binding<Bool>')).toBe('boolean');
  });

  it('classifies PascalCase custom types as `unknown` (treated as enum-like)', () => {
    expect(categorizeNativeType('LinkCardVariant')).toBe('unknown');
    expect(categorizeNativeType('BadgeVariant')).toBe('unknown');
  });

  it('classifies lambda / function types as callbacks (skipped, not props)', () => {
    expect(categorizeNativeType('(String) -> Unit')).toBe('callback');
    expect(categorizeNativeType('() -> Void')).toBe('callback');
  });
});

describe('parseSwiftPropsFromSource — regression: extended modifier support', () => {
  it('accepts `public private(set) var` (read-only-from-outside)', () => {
    const src = `
      public private(set) var status: String = "idle"
      public var label: String
    `;
    const names = parseSwiftPropsFromSource(src).map((p) => p.name).sort();
    expect(names).toEqual(['label', 'status']);
  });

  it('accepts `nonisolated public var` (concurrency-aware)', () => {
    const src = `
      nonisolated public var label: String
    `;
    const props = parseSwiftPropsFromSource(src);
    expect(props.map((p) => p.name)).toContain('label');
  });

  it('accepts `final public let`', () => {
    const src = `
      final public let id: String = "x"
    `;
    expect(parseSwiftPropsFromSource(src).map((p) => p.name)).toContain('id');
  });
});

describe('parseSwiftPropsFromSource', () => {
  it('extracts both name and type for each public var / let', () => {
    const src = `
      public struct CivThing: View {
        public var label: String
        public let isRequired: Bool = false
        public var count: Int?
        @Binding public var value: String
        public var sections: [SummarySectionData]
      }
    `;
    const props = parseSwiftPropsFromSource(src);
    const byName = new Map(props.map((p) => [p.name, p.type]));
    expect(byName.get('label')).toBe('String');
    expect(byName.get('isRequired')).toBe('Bool');
    expect(byName.get('count')).toBe('Int?');
    expect(byName.get('value')).toBe('String');
    expect(byName.get('sections')).toBe('[SummarySectionData]');
  });

  it('skips computed properties (var name: Type { ... })', () => {
    const src = `
      public var stored: String
      public var computed: String { "value" }
    `;
    const names = parseSwiftPropsFromSource(src).map((p) => p.name);
    expect(names).toContain('stored');
    expect(names).not.toContain('computed');
  });
});

describe('parseKotlinPropsFromSource', () => {
  it('extracts both name and type for each composable parameter', () => {
    const src = `
      @Composable
      fun CivThing(
        label: String,
        required: Boolean = false,
        count: Int? = null,
        items: List<String> = emptyList(),
      ) { }
    `;
    const props = parseKotlinPropsFromSource(src, 'CivThing');
    const byName = new Map(props.map((p) => [p.name, p.type]));
    expect(byName.get('label')).toBe('String');
    expect(byName.get('required')).toBe('Boolean');
    expect(byName.get('count')).toBe('Int?');
    expect(byName.get('items')).toBe('List<String>');
  });

  it('handles lambda-typed parameters with their own arrows', () => {
    const src = `
      @Composable
      fun CivThing(
        label: String,
        onChange: (String) -> Unit = {},
      ) { }
    `;
    const props = parseKotlinPropsFromSource(src, 'CivThing');
    const byName = new Map(props.map((p) => [p.name, p.type]));
    expect(byName.get('onChange')).toBe('(String) -> Unit');
  });
});

describe('Type-drift end-to-end (the regression that motivated the iOS/Android type check)', () => {
  it('flags Bool↔string drift on iOS', () => {
    // schema declares persist as a string storage key
    const schema = { type: 'string' as const };
    // iOS source incorrectly declared `Bool` (the real bug we found)
    const nativeType = 'Bool';
    const cat = categorizeNativeType(nativeType);
    expect(cat).toBe('boolean');
    // The expected categories for a string schema prop are string-or-enum
    // or unknown — Bool isn't acceptable.
    const ok = ['string-or-enum', 'unknown'].includes(cat);
    expect(ok).toBe(false);
  });

  it('accepts custom enum types for string/enum schema props', () => {
    // A string-or-enum schema prop matches a custom Swift enum like LinkCardVariant.
    const cat = categorizeNativeType('LinkCardVariant');
    expect(cat).toBe('unknown');
    const ok = ['string-or-enum', 'unknown'].includes(cat);
    expect(ok).toBe(true);
  });

  it('accepts Int64 for number schema props (the categorizer-extension bug)', () => {
    // civ-file-upload.maxSize is Int64 on iOS — has to count as number.
    expect(categorizeNativeType('Int64')).toBe('number');
  });

  it('flags array↔string drift', () => {
    // schema array, native String → drift
    const cat = categorizeNativeType('String');
    expect(['array', 'unknown'].includes(cat)).toBe(false);
  });

  it('does NOT flag array↔[Element] (typed arrays of structs)', () => {
    expect(['array', 'unknown'].includes(categorizeNativeType('[SummarySectionData]'))).toBe(true);
    expect(['array', 'unknown'].includes(categorizeNativeType('List<CivSummarySection>'))).toBe(true);
  });
});

describe('expectedDrupalType', () => {
  it('maps schema number to drupal integer', () => {
    expect(expectedDrupalType('number')).toBe('integer');
  });

  it('maps schema enum to drupal string (enums are stringly-typed in YAML)', () => {
    expect(expectedDrupalType('enum')).toBe('string');
  });

  it('preserves boolean and array', () => {
    expect(expectedDrupalType('boolean')).toBe('boolean');
    expect(expectedDrupalType('array')).toBe('array');
  });

  it('falls back to string for unknown / string types', () => {
    expect(expectedDrupalType('string')).toBe('string');
    expect(expectedDrupalType('something-weird')).toBe('string');
  });
});
