import { describe, it, expect } from 'vitest';
import { generateDocumentChecklist } from './generate-document-checklist.js';
import type { FormSchema } from '../schema/index.js';

function makeSchema(overrides?: Partial<FormSchema>): FormSchema {
  return {
    title: 'Permit Application',
    sections: [
      {
        heading: 'Applicant info',
        fields: [
          { type: 'text', name: 'full-name', label: 'Full name', required: true },
        ],
      },
    ],
    documents: {
      requirements: [
        {
          id: 'photo-id',
          label: 'Government-issued photo ID',
          description: 'A valid unexpired photo ID',
          required: true,
          acceptedFormats: ['pdf', 'jpg', 'png'],
          maxSizeMb: 10,
        },
        {
          id: 'proof-of-address',
          label: 'Proof of address',
          required: true,
          acceptedFormats: ['pdf'],
          maxSizeMb: 5,
          alternatives: ['Utility bill', 'Bank statement'],
        },
        {
          id: 'supplemental',
          label: 'Supplemental materials',
          required: false,
        },
      ],
      maxTotalSizeMb: 50,
    },
    ...overrides,
  };
}

describe('generateDocumentChecklist', () => {
  it('throws when schema has no documents config', () => {
    const schema: FormSchema = {
      title: 'No docs',
      sections: [
        {
          heading: 'Info',
          fields: [{ type: 'text', name: 'a', label: 'A' }],
        },
      ],
    };
    expect(() => generateDocumentChecklist(schema)).toThrow(
      'Schema must have a documents configuration',
    );
  });

  it('returns html, javascript, features, requirementCount', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('requirementCount');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
    expect(typeof result.requirementCount).toBe('number');
  });

  it('requirementCount matches number of requirements', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.requirementCount).toBe(3);
  });

  it('HTML has data-civ-document-checklist section', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('<section data-civ-document-checklist');
    expect(result.html).toContain('aria-labelledby="doc-checklist-heading"');
  });

  it('renders heading "Required documents"', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('id="doc-checklist-heading"');
    expect(result.html).toContain('Required documents');
  });

  it('each requirement gets a data-civ-doc-item with its id', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('data-civ-doc-item="photo-id"');
    expect(result.html).toContain('data-civ-doc-item="proof-of-address"');
    expect(result.html).toContain('data-civ-doc-item="supplemental"');
  });

  it('required documents get Required badge', () => {
    const result = generateDocumentChecklist(makeSchema());
    // The photo-id item is required; its badge should say "Required"
    const photoIdStart = result.html.indexOf('data-civ-doc-item="photo-id"');
    const photoIdEnd = result.html.indexOf('</li>', photoIdStart);
    const photoIdBlock = result.html.substring(photoIdStart, photoIdEnd);
    expect(photoIdBlock).toContain('civ-bg-error-lightest');
    expect(photoIdBlock).toContain('>Required</span>');
  });

  it('optional documents get Optional badge', () => {
    const result = generateDocumentChecklist(makeSchema());
    const suppStart = result.html.indexOf('data-civ-doc-item="supplemental"');
    const suppEnd = result.html.indexOf('</li>', suppStart);
    const suppBlock = result.html.substring(suppStart, suppEnd);
    expect(suppBlock).toContain('civ-bg-base-lighter');
    expect(suppBlock).toContain('>Optional</span>');
  });

  it('accepted formats are displayed', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('Accepted formats: pdf, jpg, png');
    expect(result.html).toContain('Accepted formats: pdf');
  });

  it('max size is displayed', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('Maximum file size: 10 MB');
    expect(result.html).toContain('Maximum file size: 5 MB');
  });

  it('file upload has accept attribute from acceptedFormats', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('accept=".pdf,.jpg,.png"');
    // proof-of-address only accepts pdf
    expect(result.html).toContain('accept=".pdf"');
  });

  it('alternatives text is shown', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('Or provide: Utility bill, Bank statement');
  });

  it('total max size shown when configured', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.html).toContain('Maximum total upload size: 50 MB');
  });

  it('features include correct conditional features', () => {
    const result = generateDocumentChecklist(makeSchema());
    expect(result.features).toContain('document-checklist');
    expect(result.features).toContain('required-documents');
    expect(result.features).toContain('format-validation');
    expect(result.features).toContain('size-validation');
    expect(result.features).toContain('alternatives');
  });
});
