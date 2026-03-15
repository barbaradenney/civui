import { describe, it, expect } from 'vitest';
import { validateSchema, validateAll } from '@civui/schema/validate';
import type { ComponentSchema } from '@civui/schema/types';

function validSchema(overrides: Partial<ComponentSchema> = {}): ComponentSchema {
  return {
    $schema: '1.0',
    name: 'civ-test',
    description: 'Test component',
    category: 'form-control',
    extends: 'CivFormElement',
    isGroup: false,
    props: {},
    events: {},
    a11y: { role: 'textbox', requiredIndicator: 'asterisk', errorAnnouncement: 'assertive' },
    renderOrder: [{ type: 'input', bindings: { value: 'value' } }],
    form: { valueMode: 'string', formAssociated: true, resetBehavior: 'restore-default-value' },
    ...overrides,
  };
}

describe('schema validator', () => {
  it('passes a valid schema with no errors', () => {
    const errors = validateSchema(validSchema());
    const errorsOnly = errors.filter(e => e.severity === 'error');
    expect(errorsOnly).toHaveLength(0);
  });

  it('catches missing name', () => {
    const schema = { ...validSchema() } as Record<string, unknown>;
    delete schema['name'];
    const errors = validateSchema(schema);
    expect(errors.some(e => e.path === 'name' && e.severity === 'error')).toBe(true);
  });

  it('catches invalid name prefix', () => {
    const errors = validateSchema(validSchema({ name: 'my-component' as any }));
    expect(errors.some(e => e.path === 'name' && e.message.includes('civ-'))).toBe(true);
  });

  it('catches invalid category', () => {
    const errors = validateSchema(validSchema({ category: 'invalid' as any }));
    expect(errors.some(e => e.path === 'category')).toBe(true);
  });

  it('catches invalid extends', () => {
    const errors = validateSchema(validSchema({ extends: 'HTMLElement' as any }));
    expect(errors.some(e => e.path === 'extends')).toBe(true);
  });

  it('catches enum prop without values', () => {
    const errors = validateSchema(validSchema({
      props: {
        type: { type: 'enum', description: 'Type', default: 'text' } as any,
      },
    }));
    expect(errors.some(e => e.path.includes('values') && e.severity === 'error')).toBe(true);
  });

  it('catches enum default not in values', () => {
    const errors = validateSchema(validSchema({
      props: {
        type: { type: 'enum', description: 'Type', default: 'invalid', values: ['text', 'email'] },
      },
    }));
    expect(errors.some(e => e.path.includes('default') && e.message.includes('not in the values'))).toBe(true);
  });

  it('catches invalid prop type', () => {
    const errors = validateSchema(validSchema({
      props: {
        foo: { type: 'unknown' as any, description: 'Foo' },
      },
    }));
    expect(errors.some(e => e.path.includes('props.foo.type'))).toBe(true);
  });

  it('warns on events not prefixed with civ-', () => {
    const errors = validateSchema(validSchema({
      events: {
        'change': { description: 'Change', detail: { value: { type: 'string' } } },
      },
    }));
    expect(errors.some(e => e.path.includes('events.change') && e.severity === 'warning')).toBe(true);
  });

  it('catches missing a11y role', () => {
    const errors = validateSchema(validSchema({
      a11y: { role: '' as any, requiredIndicator: 'asterisk', errorAnnouncement: 'assertive' },
    }));
    // Empty string would still be typeof string, so check for 'falsy' role
    // The validator checks truthy, so empty string should trigger
    expect(errors.some(e => e.path === 'a11y.role')).toBe(true);
  });

  it('catches invalid valueMode', () => {
    const errors = validateSchema(validSchema({
      form: { valueMode: 'invalid' as any, formAssociated: true, resetBehavior: 'restore-default-value' },
    }));
    expect(errors.some(e => e.path === 'form.valueMode')).toBe(true);
  });

  it('warns when CivBaseElement is formAssociated', () => {
    const errors = validateSchema(validSchema({
      extends: 'CivBaseElement',
      form: { valueMode: 'string', formAssociated: true, resetBehavior: 'restore-default-value' },
    }));
    expect(errors.some(e => e.path === 'form.formAssociated' && e.severity === 'warning')).toBe(true);
  });

  it('warns when boolean valueMode lacks checked prop', () => {
    const errors = validateSchema(validSchema({
      form: { valueMode: 'boolean', formAssociated: true, resetBehavior: 'restore-default-checked' },
      props: {},
    }));
    expect(errors.some(e => e.message.includes('"checked" prop'))).toBe(true);
  });

  it('warns when group component lacks legend', () => {
    const errors = validateSchema(validSchema({
      isGroup: true,
      props: {},
    }));
    expect(errors.some(e => e.message.includes('legend'))).toBe(true);
  });

  it('catches invalid render element type', () => {
    const errors = validateSchema(validSchema({
      renderOrder: [{ type: 'invalid' as any }],
    }));
    expect(errors.some(e => e.path.includes('renderOrder') && e.message.includes('Invalid render element'))).toBe(true);
  });

  it('catches invalid width variant', () => {
    const errors = validateSchema(validSchema({
      widths: {
        sm: { webClass: 'civ-w-24', iosPoints: 'not-a-number' as any, androidDp: 96 },
      },
    }));
    expect(errors.some(e => e.path.includes('widths.sm.iosPoints'))).toBe(true);
  });

  it('catches null schema', () => {
    const errors = validateSchema(null);
    expect(errors.some(e => e.severity === 'error')).toBe(true);
  });

  describe('validateAll', () => {
    it('returns valid for correct schemas', () => {
      const result = validateAll([validSchema(), validSchema({ name: 'civ-other' })]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid with prefixed errors', () => {
      const bad = validSchema({ category: 'invalid' as any });
      const result = validateAll([bad]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toContain('civ-test');
    });
  });
});
