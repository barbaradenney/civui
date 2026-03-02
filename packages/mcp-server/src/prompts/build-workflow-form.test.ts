import { describe, it, expect } from 'vitest';
import {
  buildWorkflowFormPrompt,
  BUILD_WORKFLOW_FORM_NAME,
  BUILD_WORKFLOW_FORM_DESCRIPTION,
} from './build-workflow-form.js';

describe('buildWorkflowFormPrompt', () => {
  const description = 'An immigration petition (I-130) with attorney delegation and USCIS adjudicator review';

  it('returns 5 messages (4 resources + 1 text)', () => {
    const result = buildWorkflowFormPrompt(description);
    expect(result.messages).toHaveLength(5);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('resource');
    expect(result.messages[3].content.type).toBe('resource');
    expect(result.messages[4].content.type).toBe('text');
  });

  it('embeds 4 resources: catalog, gov-patterns, complex-patterns, workflow-patterns', () => {
    const result = buildWorkflowFormPrompt(description);
    expect(
      (result.messages[0].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://catalog');
    expect(
      (result.messages[1].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://gov-patterns');
    expect(
      (result.messages[2].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://complex-patterns');
    expect(
      (result.messages[3].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://workflow-patterns');
  });

  it('references all relevant tools', () => {
    const result = buildWorkflowFormPrompt(description);
    const text = (result.messages[4].content as { text: string }).text;
    expect(text).toContain('generate_civui_form');
    expect(text).toContain('generate_workflow_ui');
    expect(text).toContain('generate_lock_matrix');
    expect(text).toContain('generate_delegation_sections');
    expect(text).toContain('generate_feedback_ui');
    expect(text).toContain('generate_section_progress');
    expect(text).toContain('validate_form');
    expect(text).toContain('estimate_burden');
  });

  it('includes the description in text content', () => {
    const result = buildWorkflowFormPrompt(description);
    const text = (result.messages[4].content as { text: string }).text;
    expect(text).toContain(description);
  });

  it('has correct name and description', () => {
    expect(BUILD_WORKFLOW_FORM_NAME).toBe('build-workflow-form');
    expect(BUILD_WORKFLOW_FORM_DESCRIPTION.length).toBeGreaterThan(0);
  });

  it('fourth resource URI is civui://workflow-patterns', () => {
    const result = buildWorkflowFormPrompt(description);
    const resource = (result.messages[3].content as { resource: { uri: string } }).resource;
    expect(resource.uri).toBe('civui://workflow-patterns');
  });
});
