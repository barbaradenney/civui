/**
 * Tests for the schema methods{} block — added in the same change that
 * wired civ-form-autosave's imperative API into the schema spec.
 *
 * The validator lives in `packages/schema/src/validate.ts` and is run
 * by `pnpm validate:schemas` against every checked-in component schema.
 * Co-locating these tests in `tools/` keeps the schema package free of
 * its own test infrastructure (no extra vitest config, no separate
 * dist target) while still locking in the validation behavior.
 */
import { describe, it, expect } from 'vitest';
import { validateSchema } from '../../packages/schema/src/validate.js';

function base(overrides: Record<string, unknown> = {}): unknown {
  return {
    $schema: '1.0',
    name: 'civ-x',
    description: 'A test component.',
    category: 'ui',
    extends: 'CivBaseElement',
    isGroup: false,
    props: {},
    events: {},
    a11y: { role: 'group', requiredIndicator: 'none', errorAnnouncement: 'polite' },
    renderOrder: [{ type: 'container' }],
    form: { valueMode: 'string', formAssociated: false, resetBehavior: 'restore-default-value' },
    ...overrides,
  };
}

describe('schema validator — methods{} block', () => {
  it('accepts a schema with no methods at all (back-compat)', () => {
    const errs = validateSchema(base()).filter(e => e.severity === 'error');
    expect(errs).toEqual([]);
  });

  it('accepts a well-formed methods block', () => {
    const errs = validateSchema(base({
      methods: {
        saveNow: { description: 'Force a save', returns: 'Promise<void>' },
        describeLastSave: {
          description: 'Localized last-save string',
          params: [{ name: 'now', type: 'number', description: 'Reference timestamp', optional: true }],
          returns: 'string',
        },
      },
    })).filter(e => e.severity === 'error');
    expect(errs).toEqual([]);
  });

  it('flags a non-object methods value', () => {
    const errs = validateSchema(base({ methods: 'not an object' }));
    expect(errs.some(e => e.path === 'methods' && e.severity === 'error')).toBe(true);
  });

  it('warns on non-camelCase method names', () => {
    const warnings = validateSchema(base({
      methods: { 'save-now': { description: 'd', returns: 'void' } },
    })).filter(e => e.severity === 'warning');
    expect(warnings.some(w => w.path === 'methods.save-now')).toBe(true);
  });

  it('errors on unknown return type', () => {
    const errs = validateSchema(base({
      methods: { foo: { description: 'd', returns: 'BadType' } },
    })).filter(e => e.severity === 'error');
    expect(errs.some(e => e.path === 'methods.foo.returns')).toBe(true);
  });

  it('errors on unknown param type', () => {
    const errs = validateSchema(base({
      methods: {
        foo: { description: 'd', params: [{ name: 'x', type: 'date', description: 'd' }] },
      },
    })).filter(e => e.severity === 'error');
    expect(errs.some(e => e.path === 'methods.foo.params[0].type')).toBe(true);
  });

  it('errors when params is not an array', () => {
    const errs = validateSchema(base({
      methods: { foo: { description: 'd', params: { name: 'x' } } },
    })).filter(e => e.severity === 'error');
    expect(errs.some(e => e.path === 'methods.foo.params')).toBe(true);
  });

  it('errors when a parameter is missing a name', () => {
    const errs = validateSchema(base({
      methods: { foo: { description: 'd', params: [{ type: 'string', description: 'd' }] },
    } })).filter(e => e.severity === 'error');
    expect(errs.some(e => e.path === 'methods.foo.params[0].name')).toBe(true);
  });

  it('warns when a method is missing its description', () => {
    const warnings = validateSchema(base({
      methods: { foo: { returns: 'void' } },
    })).filter(e => e.severity === 'warning');
    expect(warnings.some(w => w.path === 'methods.foo.description')).toBe(true);
  });

  it('accepts all valid return types in the union', () => {
    const types = [
      'string', 'number', 'boolean', 'object', 'array', 'void',
      'Promise<void>', 'Promise<string>', 'Promise<number>', 'Promise<boolean>', 'Promise<object>',
    ];
    for (const t of types) {
      const errs = validateSchema(base({
        methods: { foo: { description: 'd', returns: t } },
      })).filter(e => e.severity === 'error');
      expect(errs, `return type ${t} should be valid`).toEqual([]);
    }
  });

  it('accepts the full civ-form-autosave methods block', () => {
    // Regression: locks in the shape that ships in
    // packages/schema/src/components/civ-form-autosave.schema.ts so a
    // future validator change doesn't silently reject the real schema.
    const errs = validateSchema(base({
      methods: {
        saveNow: {
          description: 'Force an immediate save, skipping the debounce.',
          returns: 'Promise<void>',
        },
        clear: {
          description: 'Remove the saved snapshot from the adapter.',
          returns: 'Promise<void>',
        },
        describeLastSave: {
          description: 'Returns a localized string describing when the last save happened.',
          params: [
            { name: 'now', type: 'number', description: 'Reference timestamp', optional: true },
          ],
          returns: 'string',
        },
      },
    })).filter(e => e.severity === 'error');
    expect(errs).toEqual([]);
  });
});
