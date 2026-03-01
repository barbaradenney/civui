import { describe, it, expect } from 'vitest';
import {
  buildComplexFormPrompt,
  BUILD_COMPLEX_FORM_NAME,
  BUILD_COMPLEX_FORM_DESCRIPTION,
} from './build-complex-form.js';

describe('buildComplexFormPrompt', () => {
  const description = 'A VA disability benefits claim form with repeatable medical conditions and dependents';

  it('returns 4 messages (3 resources + 1 text)', () => {
    const result = buildComplexFormPrompt(description);
    expect(result.messages).toHaveLength(4);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('resource');
    expect(result.messages[3].content.type).toBe('text');
  });

  it('embeds catalog, gov-patterns, and complex-patterns resources', () => {
    const result = buildComplexFormPrompt(description);
    expect(
      (result.messages[0].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://catalog');
    expect(
      (result.messages[1].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://gov-patterns');
    expect(
      (result.messages[2].content as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://complex-patterns');
  });

  it('references all chained tools', () => {
    const result = buildComplexFormPrompt(description);
    const text = (result.messages[3].content as { text: string }).text;
    expect(text).toContain('generate_civui_form');
    expect(text).toContain('generate_companion_js');
    expect(text).toContain('analyze_relationships');
    expect(text).toContain('validate_form');
    expect(text).toContain('estimate_burden');
  });

  it('includes the description in text content', () => {
    const result = buildComplexFormPrompt(description);
    const text = (result.messages[3].content as { text: string }).text;
    expect(text).toContain(description);
  });

  it('has correct name and description', () => {
    expect(BUILD_COMPLEX_FORM_NAME).toBe('build-complex-form');
    expect(BUILD_COMPLEX_FORM_DESCRIPTION.length).toBeGreaterThan(0);
  });
});
