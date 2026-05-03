import { describe, it, expect } from 'vitest';
import { generateAnalyticsPlan } from './generate-analytics-plan.js';
import type { FormSchema } from '../schema/index.js';

describe('generateAnalyticsPlan', () => {
  it('generates per-field focus/blur/change events', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'name', label: 'Name' },
          { type: 'email', name: 'email', label: 'Email' },
        ],
      }],
    };
    const result = generateAnalyticsPlan(schema);
    const fieldEvents = result.events.filter((e) => e.name.startsWith('field-'));
    // 2 fields × 3 events each = 6
    expect(fieldEvents).toHaveLength(6);
    expect(fieldEvents.some((e) => e.name === 'field-focus:name')).toBe(true);
    expect(fieldEvents.some((e) => e.name === 'field-blur:email')).toBe(true);
    expect(fieldEvents.some((e) => e.name === 'field-change:name')).toBe(true);
  });

  it('generates form-level events (submit, abandon, error-shown, error-cleared)', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
    };
    const result = generateAnalyticsPlan(schema);
    const names = result.events.map((e) => e.name);
    expect(names).toContain('form-submit');
    expect(names).toContain('form-abandon');
    expect(names).toContain('error-shown');
    expect(names).toContain('error-cleared');
  });

  it('generates form step events when steps defined', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Step 1' }, { title: 'Step 2' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { step: 1, fields: [{ type: 'text', name: 'b', label: 'B' }] },
      ],
    };
    const result = generateAnalyticsPlan(schema);
    const stepEvents = result.events.filter((e) => e.name.startsWith('step-change'));
    expect(stepEvents).toHaveLength(2);
  });

  it('creates funnel steps matching sections', () => {
    const schema: FormSchema = {
      sections: [
        { heading: 'Personal', fields: [{ type: 'text', name: 'name', label: 'Name', required: true }] },
        { heading: 'Contact', fields: [{ type: 'email', name: 'email', label: 'Email' }] },
      ],
    };
    const result = generateAnalyticsPlan(schema);
    expect(result.funnel).toHaveLength(2);
    expect(result.funnel[0].name).toBe('Personal');
    expect(result.funnel[0].requiredFieldCount).toBe(1);
  });

  it('flags SSN fields as high drop-off risk', () => {
    const schema: FormSchema = {
      sections: [{
        heading: 'Identity',
        fields: [{ type: 'ssn', name: 'ssn', label: 'Social Security number' }],
      }],
    };
    const result = generateAnalyticsPlan(schema);
    const ssnRisk = result.dropOffRisks.find((r) => r.section === 'Identity' && r.risk === 'high');
    expect(ssnRisk).toBeDefined();
    expect(ssnRisk!.reason).toContain('SSN');
  });

  it('flags file upload as high drop-off risk', () => {
    const schema: FormSchema = {
      sections: [{
        heading: 'Documents',
        fields: [{ type: 'file', name: 'docs', label: 'Supporting documents' }],
      }],
    };
    const result = generateAnalyticsPlan(schema);
    const fileRisk = result.dropOffRisks.find((r) => r.section === 'Documents' && r.risk === 'high');
    expect(fileRisk).toBeDefined();
    expect(fileRisk!.reason).toContain('file upload');
  });

  it('flags sections with >5 required fields as medium risk', () => {
    const fields = Array.from({ length: 7 }, (_, i) => ({
      type: 'text' as const,
      name: `field-${i}`,
      label: `Field ${i}`,
      required: true,
    }));
    const schema: FormSchema = {
      sections: [{ heading: 'Long Section', fields }],
    };
    const result = generateAnalyticsPlan(schema);
    const risk = result.dropOffRisks.find((r) => r.risk === 'medium' && r.reason.includes('required'));
    expect(risk).toBeDefined();
  });

  it('calculates PRA metrics correctly', () => {
    const schema: FormSchema = {
      sections: [{
        fields: [
          { type: 'text', name: 'a', label: 'A' },
          { type: 'select', name: 'b', label: 'B' },
        ],
      }],
    };
    const result = generateAnalyticsPlan(schema);
    expect(result.praMetrics.totalFields).toBe(2);
    // text=30s + select=15s = 45s → 1 minute
    expect(result.praMetrics.estimatedCompletionMinutes).toBe(1);
    expect(result.praMetrics.burdenHoursPerResponse).toBeCloseTo(0.01, 1);
  });

  it('completion rate decays per funnel step', () => {
    const schema: FormSchema = {
      sections: [
        { heading: 'A', fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { heading: 'B', fields: [{ type: 'text', name: 'b', label: 'B' }] },
        { heading: 'C', fields: [{ type: 'text', name: 'c', label: 'C' }] },
      ],
    };
    const result = generateAnalyticsPlan(schema);
    expect(result.funnel[0].expectedCompletionRate).toBeGreaterThan(result.funnel[1].expectedCompletionRate);
    expect(result.funnel[1].expectedCompletionRate).toBeGreaterThan(result.funnel[2].expectedCompletionRate);
  });

  it('handles empty form', () => {
    const schema: FormSchema = { sections: [] };
    const result = generateAnalyticsPlan(schema);
    expect(result.events.length).toBeGreaterThan(0); // form-level events still present
    expect(result.funnel).toHaveLength(0);
    expect(result.praMetrics.totalFields).toBe(0);
  });

  it('summary contains event and funnel counts', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'a', label: 'A' }] }],
    };
    const result = generateAnalyticsPlan(schema);
    expect(result.summary).toContain('events');
    expect(result.summary).toContain('funnel');
  });

  it('creates form-steps-based funnel when steps defined', () => {
    const schema: FormSchema = {
      steps: [{ title: 'Info' }, { title: 'Review' }],
      sections: [
        { step: 0, fields: [{ type: 'text', name: 'a', label: 'A' }] },
        { step: 1, fields: [{ type: 'text', name: 'b', label: 'B' }] },
      ],
    };
    const result = generateAnalyticsPlan(schema);
    expect(result.funnel).toHaveLength(2);
    expect(result.funnel[0].name).toBe('Info');
    expect(result.funnel[1].name).toBe('Review');
  });
});
