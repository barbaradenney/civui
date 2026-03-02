import { describe, it, expect } from 'vitest';
import { generateSectionProgress } from './generate-section-progress.js';
import type { FormSchema } from '../schema/index.js';

function makeSchema(): FormSchema {
  return {
    title: 'Progress Test',
    sections: [
      {
        heading: 'Personal info',
        fields: [
          { type: 'text', name: 'first-name', label: 'First name', required: true },
          { type: 'text', name: 'last-name', label: 'Last name', required: true },
          { type: 'email', name: 'email', label: 'Email' },
        ],
      },
      {
        heading: 'Documents',
        fields: [
          { type: 'file', name: 'doc', label: 'Upload document', required: true },
        ],
      },
      {
        heading: 'Optional info',
        fields: [
          { type: 'text', name: 'nickname', label: 'Nickname' },
        ],
      },
    ],
  };
}

describe('generateSectionProgress', () => {
  it('lists all sections', () => {
    const result = generateSectionProgress(makeSchema());
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0].sectionHeading).toBe('Personal info');
    expect(result.sections[1].sectionHeading).toBe('Documents');
    expect(result.sections[2].sectionHeading).toBe('Optional info');
  });

  it('marks complete when all required fields are filled', () => {
    const values = { 'first-name': 'John', 'last-name': 'Doe', doc: 'file.pdf' };
    const result = generateSectionProgress(makeSchema(), values);
    expect(result.sections[0].status).toBe('complete');
    expect(result.sections[1].status).toBe('complete');
  });

  it('marks incomplete when some required fields are filled', () => {
    const values = { 'first-name': 'John', 'last-name': '' };
    const result = generateSectionProgress(makeSchema(), values);
    expect(result.sections[0].status).toBe('incomplete');
  });

  it('marks not-started when no required fields are filled', () => {
    const result = generateSectionProgress(makeSchema(), {});
    expect(result.sections[0].status).toBe('not-started');
    expect(result.sections[1].status).toBe('not-started');
  });

  it('calculates overall percentage correctly', () => {
    const values = { 'first-name': 'John', 'last-name': 'Doe', doc: '' };
    const result = generateSectionProgress(makeSchema(), values);
    // 2 of 3 required fields filled = 67%
    expect(result.overallPercentage).toBe(67);
  });

  it('renders nav landmark with aria-label', () => {
    const result = generateSectionProgress(makeSchema());
    expect(result.html).toContain('<nav');
    expect(result.html).toContain('aria-label="Section progress"');
    expect(result.html).toContain('data-civ-section-progress');
  });

  it('generates anchor links to sections', () => {
    const result = generateSectionProgress(makeSchema());
    expect(result.html).toContain('href="#section-personal-info"');
    expect(result.html).toContain('href="#section-documents"');
    expect(result.features).toContain('anchor-links');
  });

  it('uses index for sections without headings', () => {
    const schema: FormSchema = {
      sections: [
        { fields: [{ type: 'text', name: 'a', label: 'A' }] },
      ],
    };
    const result = generateSectionProgress(schema);
    expect(result.sections[0].sectionHeading).toBe('Section 1');
  });

  it('JS listens for civ-change events', () => {
    const result = generateSectionProgress(makeSchema());
    expect(result.javascript).toContain('civ-change');
  });

  it('sections with no required fields are complete', () => {
    const result = generateSectionProgress(makeSchema());
    expect(result.sections[2].status).toBe('complete');
    expect(result.sections[2].requiredFields).toBe(0);
  });

  it('empty completedValues marks all as not-started', () => {
    const result = generateSectionProgress(makeSchema(), {});
    expect(result.sections[0].status).toBe('not-started');
  });

  it('counts array completedValues as filled', () => {
    const schema: FormSchema = {
      sections: [
        {
          heading: 'Multi',
          fields: [{ type: 'checkbox-group', name: 'colors', label: 'Favorite colors', required: true }],
        },
      ],
    };
    const filled = generateSectionProgress(schema, { colors: ['red', 'blue'] });
    expect(filled.sections[0].status).toBe('complete');

    const empty = generateSectionProgress(schema, { colors: [] });
    expect(empty.sections[0].status).toBe('not-started');
  });

  it('features includes section-progress', () => {
    const result = generateSectionProgress(makeSchema());
    expect(result.features).toContain('section-progress');
  });
});
