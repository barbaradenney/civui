/**
 * Tests for tools/sync-drupal-twig.ts pure helpers.
 *
 * Focus: how the regenerator translates SDC prop entries into Twig
 * `{% if %}` lines, and how the slot list is parsed from YAML.
 */

import { describe, it, expect } from 'vitest';
import {
  htmlAttrFor,
  renderTwigLine,
  snakeToKebab,
  parseSdcPropsFromYaml,
  parseSdcSlotsFromYaml,
} from '../sync-drupal-twig.js';

describe('snakeToKebab', () => {
  it('converts snake_case to kebab-case', () => {
    expect(snakeToKebab('hide_middle')).toBe('hide-middle');
    expect(snakeToKebab('max_count')).toBe('max-count');
  });

  it('leaves single-word names alone', () => {
    expect(snakeToKebab('label')).toBe('label');
  });
});

describe('htmlAttrFor', () => {
  it('uses the schema\'s attribute override when one matches the snake key', () => {
    // schema: validateType → attribute: 'validate'; SDC stores it as 'validate' (snake form 'validate').
    expect(htmlAttrFor('validate', { validateType: 'validate' })).toBe('validate');
  });

  it('uses the schema attribute when the snake key is its underscored form', () => {
    // schema: hideMiddle → attribute: 'hide-middle'; SDC stores it as 'hide_middle'.
    expect(htmlAttrFor('hide_middle', { hideMiddle: 'hide-middle' })).toBe('hide-middle');
  });

  it('falls back to snake→kebab conversion when no schema attribute applies', () => {
    expect(htmlAttrFor('hide_middle', {})).toBe('hide-middle');
    expect(htmlAttrFor('label', {})).toBe('label');
  });
});

describe('renderTwigLine', () => {
  it('renders booleans as bare attribute toggles', () => {
    const line = renderTwigLine({ key: 'required', type: 'boolean' }, 'required');
    expect(line).toBe('  {% if required %}required{% endif %}');
  });

  it('renders strings with a quoted value interpolation', () => {
    const line = renderTwigLine({ key: 'placeholder', type: 'string' }, 'placeholder');
    expect(line).toBe('  {% if placeholder %}placeholder="{{ placeholder }}"{% endif %}');
  });

  it('uses the resolved attribute name even when it differs from the SDC key', () => {
    // SDC stores it as `hide_middle`, HTML attribute is `hide-middle`.
    const line = renderTwigLine({ key: 'hide_middle', type: 'boolean' }, 'hide-middle');
    expect(line).toBe('  {% if hide_middle %}hide-middle{% endif %}');
  });

  it('JSON-encodes arrays with single-quoted attribute values', () => {
    // Array attributes need json_encode|raw so the web component's
    // prop converters can parse them. Double-quoted attribute values
    // would break on embedded double-quotes inside JSON.
    const line = renderTwigLine({ key: 'disabled_slots', type: 'array' }, 'disabled-slots');
    expect(line).toBe(`  {% if disabled_slots %}disabled-slots='{{ disabled_slots|json_encode|raw }}'{% endif %}`);
  });
});

describe('parseSdcPropsFromYaml', () => {
  it('captures the prop type for each prop', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
    required:
      type: boolean
      default: false
    count:
      type: integer
`;
    const props = parseSdcPropsFromYaml(yaml);
    const byKey = new Map(props.map((p) => [p.key, p.type]));
    expect(byKey.get('label')).toBe('string');
    expect(byKey.get('required')).toBe('boolean');
    expect(byKey.get('count')).toBe('integer');
  });

  it('stops at the next sibling section (does not bleed into slots)', () => {
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
    const keys = parseSdcPropsFromYaml(yaml).map((p) => p.key);
    expect(keys).toEqual(['label']);
  });
});

describe('parseSdcSlotsFromYaml', () => {
  it('extracts top-level slot names', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
slots:
  default:
    title: Default
  footer:
    title: Footer
`;
    expect(parseSdcSlotsFromYaml(yaml).sort()).toEqual(['default', 'footer']);
  });

  it('returns an empty list when there is no slots block', () => {
    const yaml = `
props:
  type: object
  properties:
    label:
      type: string
`;
    expect(parseSdcSlotsFromYaml(yaml)).toEqual([]);
  });

  it('preserves declaration order (regression: list-item start/default/end)', () => {
    // The Twig regenerator emits `{% block %}` for each slot in the order
    // returned here; that order becomes the visual page order. A list-item
    // with `start` declared AFTER `default` would render its leading slot
    // below the body — almost always wrong.
    const yaml = `
slots:
  start:
    title: Start
  default:
    title: Default
  end:
    title: End
`;
    expect(parseSdcSlotsFromYaml(yaml)).toEqual(['start', 'default', 'end']);
  });

  it('does NOT alphabetize — order is taken straight from the YAML', () => {
    const yaml = `
slots:
  zeta:
    title: Z
  alpha:
    title: A
  middle:
    title: M
`;
    expect(parseSdcSlotsFromYaml(yaml)).toEqual(['zeta', 'alpha', 'middle']);
  });
});
