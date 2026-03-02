import { describe, it, expect } from 'vitest';
import { generateCrossFieldRules } from './generate-cross-field-rules.js';
import type { FormSchema } from '../schema/index.js';

function schema(): FormSchema {
  return {
    sections: [
      {
        fields: [
          {
            type: 'radio',
            name: 'contact-method',
            label: 'Preferred contact method',
            options: [
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
            ],
          },
          { type: 'tel', name: 'phone', label: 'Phone number' },
          { type: 'email', name: 'email', label: 'Email address' },
          { type: 'text', name: 'other-info', label: 'Other information' },
          {
            type: 'select',
            name: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
            ],
          },
          { type: 'text', name: 'reason', label: 'Reason' },
        ],
      },
    ],
  };
}

describe('generateCrossFieldRules', () => {
  it('parses basic "require X when Y is Z" pattern', () => {
    const result = generateCrossFieldRules(schema(), [
      'require phone when contact-method is phone',
    ]);
    expect(result.ruleCount).toBe(1);
    expect(result.rules[0]).toEqual({
      id: 'rule-1',
      description: 'require phone when contact-method is phone',
      when: { field: 'contact-method', operator: 'eq', value: 'phone' },
      then: { action: 'require', targets: ['phone'] },
    });
  });

  it('parses "show X when Y is Z" pattern', () => {
    const result = generateCrossFieldRules(schema(), [
      'show other-info when status is active',
    ]);
    expect(result.ruleCount).toBe(1);
    expect(result.rules[0].then.action).toBe('show');
    expect(result.rules[0].when).toEqual({
      field: 'status',
      operator: 'eq',
      value: 'active',
    });
  });

  it('parses "hide X when Y is not Z" pattern', () => {
    const result = generateCrossFieldRules(schema(), [
      'hide other-info when status is not active',
    ]);
    expect(result.ruleCount).toBe(1);
    expect(result.rules[0].then.action).toBe('hide');
    expect(result.rules[0].when).toEqual({
      field: 'status',
      operator: 'neq',
      value: 'active',
    });
  });

  it('parses "set error on X when Y is Z" pattern', () => {
    const result = generateCrossFieldRules(schema(), [
      'set error on reason when status is inactive',
    ]);
    expect(result.ruleCount).toBe(1);
    expect(result.rules[0].then.action).toBe('setError');
    expect(result.rules[0].then.targets).toEqual(['reason']);
  });

  it('parses "exists" operator', () => {
    const result = generateCrossFieldRules(schema(), [
      'show other-info when phone exists',
    ]);
    expect(result.rules[0].when).toEqual({
      field: 'phone',
      operator: 'exists',
    });
  });

  it('parses "does not exist" operator', () => {
    const result = generateCrossFieldRules(schema(), [
      'require phone when email does not exist',
    ]);
    expect(result.rules[0].when).toEqual({
      field: 'email',
      operator: 'notExists',
    });
  });

  it('parses "is one of" → in operator', () => {
    const result = generateCrossFieldRules(schema(), [
      'show reason when status is one of active, pending',
    ]);
    expect(result.rules[0].when).toEqual({
      field: 'status',
      operator: 'in',
      value: ['active', 'pending'],
    });
  });

  it('parses compound "and" conditions', () => {
    const result = generateCrossFieldRules(schema(), [
      'require phone when contact-method is phone and status is active',
    ]);
    expect(result.ruleCount).toBe(1);
    const when = result.rules[0].when as { allOf: unknown[] };
    expect(when.allOf).toHaveLength(2);
    expect(when.allOf[0]).toEqual({
      field: 'contact-method',
      operator: 'eq',
      value: 'phone',
    });
    expect(when.allOf[1]).toEqual({
      field: 'status',
      operator: 'eq',
      value: 'active',
    });
  });

  it('parses compound "or" conditions', () => {
    const result = generateCrossFieldRules(schema(), [
      'show other-info when status is active or status is pending',
    ]);
    expect(result.ruleCount).toBe(1);
    const when = result.rules[0].when as { anyOf: unknown[] };
    expect(when.anyOf).toHaveLength(2);
  });

  it('validates field references — resolved vs unresolved', () => {
    const result = generateCrossFieldRules(schema(), [
      'require phone when contact-method is phone',
      'require unknown-field when missing-field is yes',
    ]);
    expect(result.ruleCount).toBe(2);
    expect(result.referencedFields).toContain('phone');
    expect(result.referencedFields).toContain('contact-method');
    expect(result.unresolvedFields).toContain('unknown-field');
    expect(result.unresolvedFields).toContain('missing-field');
  });

  it('handles multiple descriptions in one call', () => {
    const result = generateCrossFieldRules(schema(), [
      'require phone when contact-method is phone',
      'require email when contact-method is email',
      'show reason when status is inactive',
    ]);
    expect(result.ruleCount).toBe(3);
    expect(result.rules[0].id).toBe('rule-1');
    expect(result.rules[1].id).toBe('rule-2');
    expect(result.rules[2].id).toBe('rule-3');
  });

  it('skips empty descriptions', () => {
    const result = generateCrossFieldRules(schema(), ['', '  ', 'require phone when contact-method is phone']);
    expect(result.ruleCount).toBe(1);
  });

  it('skips unparseable descriptions gracefully', () => {
    const result = generateCrossFieldRules(schema(), [
      'this is not a valid rule description',
      'require phone when contact-method is phone',
    ]);
    expect(result.ruleCount).toBe(1);
  });

  it('generates deterministic rule IDs', () => {
    const result = generateCrossFieldRules(schema(), [
      'require phone when contact-method is phone',
      'show reason when status is active',
    ]);
    expect(result.rules[0].id).toBe('rule-1');
    expect(result.rules[1].id).toBe('rule-2');
  });
});
