import { describe, it, expect } from 'vitest';
import { generateMockData } from './generate-mock-data.js';
import type { FormSchema } from '../schema/index.js';

function schema(): FormSchema {
  return {
    sections: [
      {
        fields: [
          { type: 'text', name: 'fullName', label: 'Full name', required: true },
          { type: 'email', name: 'email', label: 'Email address', required: true },
          { type: 'tel', name: 'phone', label: 'Phone number' },
          { type: 'number', name: 'age', label: 'Age', min: '18', max: '120' },
          { type: 'date', name: 'dob', label: 'Date of birth' },
          {
            type: 'select',
            name: 'state',
            label: 'State',
            options: [
              { value: 'CA', label: 'California' },
              { value: 'NY', label: 'New York' },
            ],
          },
          { type: 'ssn', name: 'ssn', label: 'Social Security number', required: true },
        ],
      },
    ],
  };
}

describe('generateMockData', () => {
  it('throws when schema has no sections', () => {
    expect(() =>
      generateMockData({ sections: [] }),
    ).toThrow('Schema must have at least one section');
  });

  it('returns data, fieldCount, features', () => {
    const result = generateMockData(schema());
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('fieldCount');
    expect(result).toHaveProperty('features');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.fieldCount).toBe(7);
  });

  it('generates 1 record by default', () => {
    const result = generateMockData(schema());
    expect(result.data).toHaveLength(1);
  });

  it('generates multiple records with count option', () => {
    const result = generateMockData(schema(), { count: 5 });
    expect(result.data).toHaveLength(5);
  });

  it('required fields are always populated', () => {
    const result = generateMockData(schema(), { count: 10, seed: 1 });
    for (const record of result.data) {
      expect(record.fullName).toBeTruthy();
      expect(record.email).toBeTruthy();
      expect(record.ssn).toBeTruthy();
    }
  });

  it('email fields use example.gov domain', () => {
    const result = generateMockData(schema());
    expect(result.data[0].email).toContain('@example.gov');
  });

  it('SSN fields use 000-00-XXXX format', () => {
    const result = generateMockData(schema());
    expect(result.data[0].ssn).toMatch(/^000-00-\d{4}$/);
  });

  it('select fields pick from available options', () => {
    const result = generateMockData(schema());
    if (result.data[0].state) {
      expect(['CA', 'NY']).toContain(result.data[0].state);
    }
  });

  it('deterministic output with same seed', () => {
    const a = generateMockData(schema(), { seed: 123 });
    const b = generateMockData(schema(), { seed: 123 });
    expect(a.data).toEqual(b.data);
  });

  it('different seed produces different output', () => {
    const a = generateMockData(schema(), { seed: 1 });
    const b = generateMockData(schema(), { seed: 999 });
    // Very unlikely to be identical
    expect(JSON.stringify(a.data)).not.toEqual(JSON.stringify(b.data));
  });

  it('features include mock-data, deterministic, seeded', () => {
    const result = generateMockData(schema());
    expect(result.features).toContain('mock-data');
    expect(result.features).toContain('deterministic');
    expect(result.features).toContain('seeded');
  });

  it('locale option adds locale-aware feature', () => {
    const result = generateMockData(schema(), { locale: 'en-US' });
    expect(result.features).toContain('locale-aware');
  });

  it('number fields respect min/max range', () => {
    const result = generateMockData(schema(), { count: 20, seed: 42 });
    for (const record of result.data) {
      if (record.age) {
        const age = parseInt(record.age, 10);
        expect(age).toBeGreaterThanOrEqual(18);
        expect(age).toBeLessThanOrEqual(120);
      }
    }
  });
});
