import { describe, it, expect } from 'vitest';
import {
  conditionalFormPrompt,
  CONDITIONAL_FORM_NAME,
  CONDITIONAL_FORM_DESCRIPTION,
} from './conditional-form.js';

describe('conditionalFormPrompt', () => {
  const description = 'A disability benefits form with conditional sections';

  it('returns 4 messages (3 resources + 1 text)', () => {
    const result = conditionalFormPrompt(description);
    expect(result.messages).toHaveLength(4);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('resource');
    expect(result.messages[3].content.type).toBe('text');
  });

  it('embeds catalog, gov-patterns, and templates resources', () => {
    const result = conditionalFormPrompt(description);
    expect(
      (result.messages[0].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://catalog');
    expect(
      (result.messages[1].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://gov-patterns');
    expect(
      (result.messages[2].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://templates');
  });

  it('contains conditional attribute examples', () => {
    const result = conditionalFormPrompt(description);
    const text = (result.messages[3].content as { text: string }).text;
    expect(text).toContain('data-civ-show-when');
    expect(text).toContain('data-civ-hide-when');
    expect(text).toContain('data-civ-step');
  });

  it('references generate_civui_form and validate_form tools', () => {
    const result = conditionalFormPrompt(description);
    const text = (result.messages[3].content as { text: string }).text;
    expect(text).toContain('generate_civui_form');
    expect(text).toContain('validate_form');
  });

  it('includes the description in text content', () => {
    const result = conditionalFormPrompt(description);
    const text = (result.messages[3].content as { text: string }).text;
    expect(text).toContain(description);
  });

  it('has correct name and description', () => {
    expect(CONDITIONAL_FORM_NAME).toBe('conditional-form');
    expect(CONDITIONAL_FORM_DESCRIPTION.length).toBeGreaterThan(0);
  });
});
