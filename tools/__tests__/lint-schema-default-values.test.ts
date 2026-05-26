/**
 * Tests for tools/lint-schema-default-values.ts.
 *
 * The lint extracts default-value expressions from three platform source
 * languages (Swift init, Kotlin @Composable fun, Drupal SDC YAML) and
 * normalizes them to a canonical string for cross-platform comparison.
 * These unit tests pin the normalizer + each parser.
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeDefault,
  parseSwiftInitDefaults,
  parseKotlinFnDefaults,
  parseSdcDefaults,
} from '../lint-schema-default-values.js';

describe('normalizeDefault', () => {
  it('canonicalizes null-like literals to __nil__', () => {
    expect(normalizeDefault('nil')).toBe('__nil__');
    expect(normalizeDefault('null')).toBe('__nil__');
    expect(normalizeDefault('None')).toBe('__nil__');
  });

  it('passes booleans through unchanged', () => {
    expect(normalizeDefault('true')).toBe('true');
    expect(normalizeDefault('false')).toBe('false');
  });

  it('strips a trailing `.0` from numeric literals', () => {
    expect(normalizeDefault('0')).toBe('0');
    expect(normalizeDefault('0.0')).toBe('0');
    expect(normalizeDefault('1500')).toBe('1500');
    expect(normalizeDefault('-5')).toBe('-5');
  });

  it('unwraps SwiftUI .constant(X)', () => {
    expect(normalizeDefault('.constant(false)')).toBe('false');
    expect(normalizeDefault('Binding.constant(true)')).toBe('true');
    expect(normalizeDefault('.constant(0)')).toBe('0');
  });

  it('strips surrounding quotes from string literals', () => {
    expect(normalizeDefault('"primary"')).toBe('primary');
    expect(normalizeDefault("'primary'")).toBe('primary');
    expect(normalizeDefault('""')).toBe('');
  });

  it('strips Swift enum-case dot shorthand', () => {
    expect(normalizeDefault('.primary')).toBe('primary');
    expect(normalizeDefault('.full')).toBe('full');
  });

  it('lowercases Kotlin enum case references', () => {
    expect(normalizeDefault('TextButtonEmphasis.SECONDARY')).toBe('secondary');
    expect(normalizeDefault('CivInputType.Text')).toBe('text');
    expect(normalizeDefault('CivOrientation.Vertical')).toBe('vertical');
  });

  it('returns unrecognized expressions as-is', () => {
    expect(normalizeDefault('SomeFunction()')).toBe('SomeFunction()');
    expect(normalizeDefault('listOf("a","b")')).toBe('listOf("a","b")');
  });
});

describe('parseSwiftInitDefaults', () => {
  it('captures defaults from a single public init', () => {
    const src = `
public struct CivButton: View {
  public init(
      label: String,
      emphasis: ButtonEmphasis = .primary,
      disabled: Bool = false,
      type: String = "button"
  ) {
  }
}`;
    const defaults = parseSwiftInitDefaults(src);
    expect(defaults.get('emphasis')).toBe('.primary');
    expect(defaults.get('disabled')).toBe('false');
    expect(defaults.get('type')).toBe('"button"');
    expect(defaults.has('label')).toBe(false); // no default
  });

  it('skips parameters with no default', () => {
    const src = `
public init(
    label: String,
    href: String? = nil,
    value: Int
) { }`;
    const defaults = parseSwiftInitDefaults(src);
    expect(defaults.has('value')).toBe(false);
    expect(defaults.get('href')).toBe('nil');
    expect(defaults.has('label')).toBe(false);
  });

  it('handles tuple and closure-typed defaults', () => {
    const src = `
public init(
    onClick: (() -> Void)? = nil,
    range: ClosedRange<Int> = 0...100,
    color: Color = .primary
) { }`;
    const defaults = parseSwiftInitDefaults(src);
    expect(defaults.get('onClick')).toBe('nil');
    expect(defaults.get('range')).toBe('0...100');
    expect(defaults.get('color')).toBe('.primary');
  });

  it('first init wins when multiple init blocks exist', () => {
    const src = `
public init(label: String, emphasis: String = "primary") { }
public init(label: String, emphasis: String = "secondary") { }`;
    const defaults = parseSwiftInitDefaults(src);
    expect(defaults.get('emphasis')).toBe('"primary"');
  });
});

describe('parseKotlinFnDefaults', () => {
  it('captures defaults from a @Composable function', () => {
    const src = `
@Composable
fun CivButton(
    label: String,
    emphasis: String = "primary",
    danger: Boolean = false,
    iconStart: String = ""
) {
}`;
    const defaults = parseKotlinFnDefaults(src, 'CivButton');
    expect(defaults.get('emphasis')).toBe('"primary"');
    expect(defaults.get('danger')).toBe('false');
    expect(defaults.get('iconStart')).toBe('""');
    expect(defaults.has('label')).toBe(false);
  });

  it('returns empty map when function name is not found', () => {
    const src = `fun CivSomethingElse(label: String = "x") {}`;
    expect(parseKotlinFnDefaults(src, 'CivButton').size).toBe(0);
  });

  it('handles lambda-typed defaults', () => {
    const src = `
fun CivButton(
    label: String,
    onClick: (() -> Unit)? = null,
    onAnalytics: ((String, Map<String, Any>?) -> Unit)? = null
) {}`;
    const defaults = parseKotlinFnDefaults(src, 'CivButton');
    expect(defaults.get('onClick')).toBe('null');
    expect(defaults.get('onAnalytics')).toBe('null');
  });

  it('strips comments before parsing', () => {
    const src = `
fun CivButton(
    // emphasis controls visual treatment
    label: String,
    /* deprecated */
    emphasis: String = "primary",
    // type defaults to a regular click button
    type: String = "button"
) {}`;
    const defaults = parseKotlinFnDefaults(src, 'CivButton');
    expect(defaults.get('emphasis')).toBe('"primary"');
    expect(defaults.get('type')).toBe('"button"');
  });

  it('unquotes Kotlin backtick-escaped reserved-word parameter names', () => {
    const src = `
fun CivButton(
    label: String,
    \`when\`: String = "always"
) {}`;
    const defaults = parseKotlinFnDefaults(src, 'CivButton');
    expect(defaults.get('when')).toBe('"always"');
  });
});

describe('parseSdcDefaults', () => {
  it('captures defaults from a Drupal SDC YAML', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    variant:
      title: Variant
      type: string
      default: 'primary'
    danger:
      title: Danger
      type: boolean
      default: false
    rows:
      title: Rows
      type: integer
      default: 5
`;
    const defaults = parseSdcDefaults(yaml);
    expect(defaults.get('variant')).toBe(`'primary'`);
    expect(defaults.get('danger')).toBe('false');
    expect(defaults.get('rows')).toBe('5');
  });

  it('skips props without a default', () => {
    const yaml = `name: Foo
props:
  type: object
  properties:
    label:
      title: Label
      type: string
    variant:
      title: Variant
      type: string
      default: 'primary'
`;
    const defaults = parseSdcDefaults(yaml);
    expect(defaults.has('label')).toBe(false);
    expect(defaults.get('variant')).toBe(`'primary'`);
  });

  it('ignores defaults outside props.properties block', () => {
    // A top-level YAML key or a slot block could conceivably have a
    // `default:` line; the parser should only capture inside the
    // props.properties block.
    const yaml = `name: Foo
default: 'ignored'
props:
  type: object
  properties:
    variant:
      type: string
      default: 'primary'
slots:
  default:
    title: Default
    default: 'also-ignored'
`;
    const defaults = parseSdcDefaults(yaml);
    expect(defaults.size).toBe(1);
    expect(defaults.get('variant')).toBe(`'primary'`);
  });

  it('returns empty map for YAML with no props block', () => {
    const yaml = `name: Foo
description: 'No props block'
`;
    expect(parseSdcDefaults(yaml).size).toBe(0);
  });
});
