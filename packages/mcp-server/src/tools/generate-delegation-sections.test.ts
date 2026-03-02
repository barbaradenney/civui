import { describe, it, expect } from 'vitest';
import { generateDelegationSections } from './generate-delegation-sections.js';
import type { FormSchema } from '../schema/index.js';

function makeSchema(overrides?: Partial<FormSchema>): FormSchema {
  return {
    title: 'Delegation Test',
    sections: [
      { heading: 'Section 1', fields: [{ type: 'text', name: 'a', label: 'A' }] },
    ],
    delegation: {
      types: [
        { id: 'power-of-attorney', label: 'Attorney (G-28)', requiresDocumentation: true },
        { id: 'authorized-representative', label: 'Authorized representative' },
      ],
      attestation: {
        text: 'I certify under penalty of perjury that the information is correct.',
        signatureType: 'checkbox',
      },
      subjectLabel: 'Beneficiary',
      representativeLabel: 'Attorney',
      requiresConsentUpload: false,
      requiresAuthorizationNumber: false,
    },
    ...overrides,
  };
}

describe('generateDelegationSections', () => {
  it('throws without delegation config', () => {
    expect(() => generateDelegationSections({ sections: [] })).toThrow('delegation');
  });

  it('generates representative information section', () => {
    const result = generateDelegationSections(makeSchema());
    const repSection = result.sections.find((s) => s.heading?.includes('information'));
    expect(repSection).toBeDefined();
    expect(repSection!.fields.some((f) => f.name === 'rep-full-name')).toBe(true);
  });

  it('generates delegation-type select with options', () => {
    const result = generateDelegationSections(makeSchema());
    const repSection = result.sections.find((s) => s.heading?.includes('information'));
    const typeField = repSection!.fields.find((f) => f.name === 'delegation-type');
    expect(typeField).toBeDefined();
    expect(typeField!.options).toHaveLength(2);
  });

  it('generates attestation section from config', () => {
    const result = generateDelegationSections(makeSchema());
    const attestSection = result.sections.find((s) => s.heading === 'Attestation');
    expect(attestSection).toBeDefined();
    expect(result.features).toContain('attestation');
  });

  it('generates checkbox attestation', () => {
    const result = generateDelegationSections(makeSchema());
    const attestSection = result.sections.find((s) => s.heading === 'Attestation');
    const checkbox = attestSection!.fields.find((f) => f.type === 'checkbox');
    expect(checkbox).toBeDefined();
    expect(result.features).toContain('checkbox-attestation');
  });

  it('generates typed-signature attestation', () => {
    const schema = makeSchema({
      delegation: {
        ...makeSchema().delegation!,
        attestation: {
          text: 'I certify this is true.',
          signatureType: 'typed-signature',
        },
      },
    });
    const result = generateDelegationSections(schema);
    const attestSection = result.sections.find((s) => s.heading === 'Attestation');
    const sigField = attestSection!.fields.find((f) => f.name === 'attestation-signature');
    expect(sigField).toBeDefined();
    expect(sigField!.type).toBe('text');
    expect(result.features).toContain('typed-signature');
  });

  it('generates consent upload when configured', () => {
    const schema = makeSchema({
      delegation: { ...makeSchema().delegation!, requiresConsentUpload: true },
    });
    const result = generateDelegationSections(schema);
    const consentSection = result.sections.find((s) => s.heading === 'Consent documentation');
    expect(consentSection).toBeDefined();
    expect(result.features).toContain('consent-upload');
  });

  it('generates authorization number when configured', () => {
    const schema = makeSchema({
      delegation: { ...makeSchema().delegation!, requiresAuthorizationNumber: true },
    });
    const result = generateDelegationSections(schema);
    const repSection = result.sections.find((s) => s.heading?.includes('information'));
    const authField = repSection!.fields.find((f) => f.name === 'rep-authorization-number');
    expect(authField).toBeDefined();
    expect(result.features).toContain('authorization-number');
  });

  it('makes bar-number conditionally visible for attorney type', () => {
    const result = generateDelegationSections(makeSchema());
    const repSection = result.sections.find((s) => s.heading?.includes('information'));
    const barField = repSection!.fields.find((f) => f.name === 'rep-bar-number');
    expect(barField).toBeDefined();
    expect(barField!.visibleWhen).toBeDefined();
    expect(result.features).toContain('bar-number');
  });

  it('uses custom labels in headings', () => {
    const result = generateDelegationSections(makeSchema());
    const repSection = result.sections.find((s) => s.heading?.includes('Attorney'));
    expect(repSection).toBeDefined();
  });

  it('generates valid cross-field rules', () => {
    const result = generateDelegationSections(makeSchema());
    expect(result.crossFieldRules.length).toBeGreaterThan(0);
    for (const rule of result.crossFieldRules) {
      expect(rule.id).toBeDefined();
      expect(rule.description).toBeDefined();
      expect(rule.when).toBeDefined();
      expect(rule.then.action).toBeDefined();
      expect(rule.then.targets.length).toBeGreaterThan(0);
    }
  });

  it('handles single delegation type', () => {
    const result = generateDelegationSections(makeSchema(), 'power-of-attorney');
    const repSection = result.sections.find((s) => s.heading?.includes('information'));
    const typeField = repSection!.fields.find((f) => f.name === 'delegation-type');
    expect(typeField!.options).toHaveLength(1);
  });

  it('all fields have labels and names', () => {
    const result = generateDelegationSections(makeSchema());
    for (const section of result.sections) {
      for (const field of section.fields) {
        expect(field.name).toBeDefined();
        expect(field.label).toBeDefined();
      }
    }
  });

  it('sections are valid FormSection objects', () => {
    const result = generateDelegationSections(makeSchema());
    for (const section of result.sections) {
      expect(section.heading).toBeDefined();
      expect(Array.isArray(section.fields)).toBe(true);
    }
  });
});
