import { describe, it, expect } from 'vitest';
import { WORKFLOW_PATTERNS } from './workflow-patterns.js';

describe('WORKFLOW_PATTERNS', () => {
  it('is a non-empty string', () => {
    expect(typeof WORKFLOW_PATTERNS).toBe('string');
    expect(WORKFLOW_PATTERNS.length).toBeGreaterThan(0);
  });

  it('contains all major sections', () => {
    expect(WORKFLOW_PATTERNS).toContain('## 1. Multi-Actor Government Forms');
    expect(WORKFLOW_PATTERNS).toContain('## 2. Actors');
    expect(WORKFLOW_PATTERNS).toContain('## 3. Workflow State Machine');
    expect(WORKFLOW_PATTERNS).toContain('## 4. Section Locking');
    expect(WORKFLOW_PATTERNS).toContain('## 5. Data Attributes');
    expect(WORKFLOW_PATTERNS).toContain('## 6. Delegation');
    expect(WORKFLOW_PATTERNS).toContain('## 7. Feedback');
    expect(WORKFLOW_PATTERNS).toContain('## 8. Audit Trail');
    expect(WORKFLOW_PATTERNS).toContain('## 9. Section Progress');
    expect(WORKFLOW_PATTERNS).toContain('## 10. Real-World Examples');
    expect(WORKFLOW_PATTERNS).toContain('## 11. Anti-Patterns');
  });

  it('contains valid JSON blocks', () => {
    const jsonBlocks = WORKFLOW_PATTERNS.match(/```json\n([\s\S]*?)```/g);
    expect(jsonBlocks).not.toBeNull();
    expect(jsonBlocks!.length).toBeGreaterThan(0);
    for (const block of jsonBlocks!) {
      const json = block.replace(/```json\n/, '').replace(/```$/, '');
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });

  it('contains data attribute table', () => {
    expect(WORKFLOW_PATTERNS).toContain('data-civ-workflow-status');
    expect(WORKFLOW_PATTERNS).toContain('data-civ-workflow-state');
    expect(WORKFLOW_PATTERNS).toContain('data-civ-workflow-action');
    expect(WORKFLOW_PATTERNS).toContain('data-civ-audit-trail');
    expect(WORKFLOW_PATTERNS).toContain('data-civ-section-progress');
    expect(WORKFLOW_PATTERNS).toContain('data-civ-feedback-panel');
  });

  it('contains workflow examples', () => {
    expect(WORKFLOW_PATTERNS).toContain('initialState');
    expect(WORKFLOW_PATTERNS).toContain('transitions');
    expect(WORKFLOW_PATTERNS).toContain('terminal');
    expect(WORKFLOW_PATTERNS).toContain('editableBy');
  });

  it('contains delegation examples', () => {
    expect(WORKFLOW_PATTERNS).toContain('power-of-attorney');
    expect(WORKFLOW_PATTERNS).toContain('attestation');
    expect(WORKFLOW_PATTERNS).toContain('typed-signature');
    expect(WORKFLOW_PATTERNS).toContain('subjectLabel');
    expect(WORKFLOW_PATTERNS).toContain('representativeLabel');
  });
});
