import { describe, it, expect } from 'vitest';
import { estimateBurden } from './estimate-burden.js';
import type { FormSchema } from '../schema/index.js';

describe('estimateBurden', () => {
  it('estimates a simple form as low complexity', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            { type: 'email', name: 'email', label: 'Email' },
          ],
        },
      ],
    };
    const result = estimateBurden(schema);
    expect(result.totalFields).toBe(2);
    expect(result.requiredFields).toBe(1);
    expect(result.optionalFields).toBe(1);
    expect(result.complexity).toBe('low');
    expect(result.estimatedSeconds).toBe(60); // 30 + 30
    expect(result.estimatedMinutes).toBe(1);
  });

  it('estimates a complex form with SSN, dates, and files as high complexity', () => {
    const fields = [
      { type: 'text' as const, name: 'name', label: 'Full name', required: true },
      { type: 'ssn' as const, name: 'ssn', label: 'Social Security number', required: true },
      { type: 'memorable-date' as const, name: 'dob', label: 'Date of birth', required: true },
      { type: 'email' as const, name: 'email', label: 'Email', required: true },
      { type: 'tel' as const, name: 'phone', label: 'Phone' },
      { type: 'textarea' as const, name: 'description', label: 'Description' },
      { type: 'select' as const, name: 'state', label: 'State' },
      { type: 'radio' as const, name: 'branch', label: 'Branch' },
      { type: 'checkbox-group' as const, name: 'benefits', label: 'Benefits' },
      { type: 'file' as const, name: 'docs', label: 'Documents' },
      { type: 'text' as const, name: 'address1', label: 'Address line 1' },
      { type: 'text' as const, name: 'address2', label: 'Address line 2' },
      { type: 'text' as const, name: 'city', label: 'City' },
      { type: 'zip' as const, name: 'zip', label: 'ZIP code' },
      { type: 'date' as const, name: 'appt', label: 'Appointment date' },
      { type: 'toggle' as const, name: 'notify', label: 'Notifications' },
    ];
    const schema: FormSchema = { sections: [{ fields }] };
    const result = estimateBurden(schema);
    expect(result.totalFields).toBe(16);
    expect(result.complexity).toBe('high');
    expect(result.requiredFields).toBe(4);
    expect(result.estimatedSeconds).toBeGreaterThan(0);
  });

  it('counts required and optional fields correctly', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A', required: true },
            { type: 'text', name: 'b', label: 'B', required: true },
            { type: 'text', name: 'c', label: 'C' },
          ],
        },
      ],
    };
    const result = estimateBurden(schema);
    expect(result.requiredFields).toBe(2);
    expect(result.optionalFields).toBe(1);
  });

  it('tallies fieldsByType correctly', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'a', label: 'A' },
            { type: 'text', name: 'b', label: 'B' },
            { type: 'email', name: 'c', label: 'C' },
            { type: 'select', name: 'd', label: 'D' },
          ],
        },
      ],
    };
    const result = estimateBurden(schema);
    expect(result.fieldsByType['text']).toBe(2);
    expect(result.fieldsByType['email']).toBe(1);
    expect(result.fieldsByType['select']).toBe(1);
  });

  it('assesses reading level', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
            { type: 'email', name: 'email', label: 'Email' },
          ],
        },
      ],
    };
    const result = estimateBurden(schema);
    expect(result.readingLevel).toBeDefined();
    expect(result.readingLevel).not.toBe('N/A');
  });

  it('handles sections count', () => {
    const schema: FormSchema = {
      sections: [
        { heading: 'Section 1', fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { heading: 'Section 2', fields: [{ type: 'text', name: 'b', label: 'B' }] },
        { heading: 'Section 3', fields: [{ type: 'text', name: 'c', label: 'C' }] },
      ],
    };
    const result = estimateBurden(schema);
    expect(result.sectionCount).toBe(3);
  });

  it('multiplies time for repeatable sections with repeatableMin', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Dependents',
          repeatable: true,
          repeatableKey: 'dependents',
          repeatableMin: 3,
          fields: [
            { type: 'text', name: 'name', label: 'Name' },
            { type: 'text', name: 'relationship', label: 'Relationship' },
          ],
        },
      ],
    };
    const result = estimateBurden(schema);
    expect(result.repeatableSections).toBe(1);
    expect(result.estimatedRepeatableItems).toBe(3);
    // 2 text fields × 30s = 60s base, plus 2 extra repeats × 60s = 180s total
    expect(result.estimatedSeconds).toBe(180);
  });

  it('formats time display correctly', () => {
    const schema: FormSchema = {
      sections: [
        {
          fields: [
            { type: 'toggle', name: 'a', label: 'A' },
          ],
        },
      ],
    };
    const result = estimateBurden(schema);
    // 10 seconds → "Less than 1 minute" or "1 minute"
    expect(result.estimatedTimeDisplay).toMatch(/minute/i);
  });
});
