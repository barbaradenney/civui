import { describe, it, expect } from 'vitest';
import { migrateFormPrompt, MIGRATE_FORM_NAME, MIGRATE_FORM_DESCRIPTION } from './migrate-form.js';

describe('migrateFormPrompt', () => {
  it('returns 3 messages (2 resources + 1 text)', () => {
    const result = migrateFormPrompt('html');
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('text');
  });

  it('references parse_html_form for html source', () => {
    const result = migrateFormPrompt('html');
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).toContain('parse_html_form');
  });

  it('references parse_pdf_form for pdf source', () => {
    const result = migrateFormPrompt('pdf');
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).toContain('parse_pdf_form');
  });

  it('references suggest_fix tool', () => {
    const result = migrateFormPrompt('html');
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).toContain('suggest_fix');
  });

  it('references diff_forms tool', () => {
    const result = migrateFormPrompt('html');
    const text = (result.messages[2].content as { text: string }).text;
    expect(text).toContain('diff_forms');
  });

  it('has correct name and description', () => {
    expect(MIGRATE_FORM_NAME).toBe('migrate-form');
    expect(MIGRATE_FORM_DESCRIPTION.length).toBeGreaterThan(0);
  });
});
