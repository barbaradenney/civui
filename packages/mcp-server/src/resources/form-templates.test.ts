import { describe, it, expect } from 'vitest';
import { FORM_TEMPLATES } from './form-templates.js';

describe('FORM_TEMPLATES', () => {
  it('is a non-empty string', () => {
    expect(typeof FORM_TEMPLATES).toBe('string');
    expect(FORM_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('contains 8 template sections', () => {
    expect(FORM_TEMPLATES).toContain('## 1. Contact Form');
    expect(FORM_TEMPLATES).toContain('## 2. Benefits Application');
    expect(FORM_TEMPLATES).toContain('## 3. Change of Address');
    expect(FORM_TEMPLATES).toContain('## 4. Document Submission');
    expect(FORM_TEMPLATES).toContain('## 5. Feedback Form');
    expect(FORM_TEMPLATES).toContain('## 6. Benefits Application with Review Workflow');
    expect(FORM_TEMPLATES).toContain('## 7. Petition with Delegation');
    expect(FORM_TEMPLATES).toContain('## 8. Building Permit (Multi-Actor)');
  });

  it('contains valid JSON blocks', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g);
    expect(jsonBlocks).not.toBeNull();
    expect(jsonBlocks!.length).toBe(8);
    for (const block of jsonBlocks!) {
      const json = block.replace(/```json\n/, '').replace(/```$/, '');
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });

  it('each template has required FormSchema structure', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g)!;
    for (const block of jsonBlocks) {
      const json = block.replace(/```json\n/, '').replace(/```$/, '');
      const schema = JSON.parse(json);
      expect(schema.title).toBeDefined();
      expect(schema.sections).toBeDefined();
      expect(Array.isArray(schema.sections)).toBe(true);
      expect(schema.sections.length).toBeGreaterThan(0);
    }
  });

  it('templates use plain language labels', () => {
    expect(FORM_TEMPLATES).not.toMatch(/"label":\s*"DOB"/);
    expect(FORM_TEMPLATES).not.toMatch(/"label":\s*"SSN"/);
    expect(FORM_TEMPLATES).toContain('Date of birth');
    expect(FORM_TEMPLATES).toContain('Social Security number');
  });

  it('templates include autocomplete where appropriate', () => {
    expect(FORM_TEMPLATES).toContain('"autocomplete": "email"');
    expect(FORM_TEMPLATES).toContain('"autocomplete": "tel"');
    expect(FORM_TEMPLATES).toContain('"autocomplete": "name"');
    expect(FORM_TEMPLATES).toContain('"autocomplete": "postal-code"');
  });

  it('workflow templates have actors and workflow definitions', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g)!;
    // Templates 6, 7, 8 (indices 5, 6, 7) have workflow
    for (const idx of [5, 6, 7]) {
      const json = jsonBlocks[idx].replace(/```json\n/, '').replace(/```$/, '');
      const schema = JSON.parse(json);
      expect(schema.actors).toBeDefined();
      expect(schema.actors.length).toBeGreaterThan(0);
      expect(schema.workflow).toBeDefined();
      expect(schema.workflow.initialState).toBeDefined();
      expect(schema.workflow.states.length).toBeGreaterThan(0);
      expect(schema.workflow.transitions.length).toBeGreaterThan(0);
    }
  });

  it('delegation template has delegation config', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g)!;
    // Template 7 (index 6) has delegation
    const json = jsonBlocks[6].replace(/```json\n/, '').replace(/```$/, '');
    const schema = JSON.parse(json);
    expect(schema.delegation).toBeDefined();
    expect(schema.delegation.types.length).toBeGreaterThan(0);
    expect(schema.delegation.attestation).toBeDefined();
  });

  it('building permit template has phase-based sections', () => {
    const jsonBlocks = FORM_TEMPLATES.match(/```json\n([\s\S]*?)```/g)!;
    // Template 8 (index 7) has phase-based sections
    const json = jsonBlocks[7].replace(/```json\n/, '').replace(/```$/, '');
    const schema = JSON.parse(json);
    const phaseSections = schema.sections.filter((s: { phase?: string }) => s.phase);
    expect(phaseSections.length).toBeGreaterThan(0);
  });
});
