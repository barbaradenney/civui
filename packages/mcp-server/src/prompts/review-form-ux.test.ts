import { describe, it, expect } from 'vitest';
import { reviewFormUxPrompt, REVIEW_FORM_UX_NAME, REVIEW_FORM_UX_DESCRIPTION } from './review-form-ux.js';

describe('reviewFormUxPrompt', () => {
  const markup = '<civ-form-field label="Name"><civ-text-input name="name"></civ-text-input></civ-form-field>';

  it('returns 3 messages (2 resources + 1 text)', () => {
    const result = reviewFormUxPrompt(markup);
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('text');
  });

  it('embeds catalog and gov-patterns resources', () => {
    const result = reviewFormUxPrompt(markup);
    expect(
      (result.messages[0].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://catalog');
    expect(
      (result.messages[1].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://gov-patterns');
  });

  it('references all 4 chained tools', () => {
    const result = reviewFormUxPrompt(markup);
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).toContain('validate_form');
    expect(text).toContain('form_to_schema');
    expect(text).toContain('estimate_burden');
    expect(text).toContain('check_contrast');
  });

  it('includes the markup in text content', () => {
    const result = reviewFormUxPrompt(markup);
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).toContain(markup);
  });

  it('has correct name and description', () => {
    expect(REVIEW_FORM_UX_NAME).toBe('review-form-ux');
    expect(REVIEW_FORM_UX_DESCRIPTION.length).toBeGreaterThan(0);
  });

  it('escapes triple-backticks in markup', () => {
    const dangerous = 'before```injected```after';
    const result = reviewFormUxPrompt(dangerous);
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).not.toContain('before```');
    expect(text).toContain('before\\`\\`\\`');
  });
});
