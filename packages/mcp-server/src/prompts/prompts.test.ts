import { describe, it, expect } from 'vitest';
import { convertLegacyFormPrompt } from './convert-legacy-form.js';
import { buildGovernmentFormPrompt } from './build-government-form.js';
import { audit508CompliancePrompt } from './audit-508-compliance.js';
import { addFieldPrompt, FIELD_TYPES } from './add-field.js';

describe('convertLegacyFormPrompt', () => {
  it('returns 3 messages (2 resources + 1 text) for html source', () => {
    const result = convertLegacyFormPrompt('html');
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('text');
  });

  it('references parse_html_form for html source', () => {
    const result = convertLegacyFormPrompt('html');
    const text = result.messages[2].content;
    expect(text.type).toBe('text');
    expect((text as { text: string }).text).toContain('parse_html_form');
  });

  it('references parse_pdf_form for pdf source', () => {
    const result = convertLegacyFormPrompt('pdf');
    const text = result.messages[2].content;
    expect((text as { text: string }).text).toContain('parse_pdf_form');
  });

  it('embeds component catalog resource', () => {
    const result = convertLegacyFormPrompt('html');
    const resource = result.messages[0].content;
    expect(resource.type).toBe('resource');
    expect(
      (resource as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://catalog');
  });

  it('embeds government patterns resource', () => {
    const result = convertLegacyFormPrompt('html');
    const resource = result.messages[1].content;
    expect(resource.type).toBe('resource');
    expect(
      (resource as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://gov-patterns');
  });

  it('references validate_form tool', () => {
    const result = convertLegacyFormPrompt('html');
    const text = result.messages[2].content;
    expect((text as { text: string }).text).toContain('validate_form');
  });
});

describe('buildGovernmentFormPrompt', () => {
  it('returns 4 messages (3 resources + 1 text)', () => {
    const result = buildGovernmentFormPrompt('Veteran benefits application');
    expect(result.messages).toHaveLength(4);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('resource');
    expect(result.messages[2].content.type).toBe('resource');
    expect(result.messages[3].content.type).toBe('text');
  });

  it('includes form purpose in the text', () => {
    const purpose = 'VA disability claim form';
    const result = buildGovernmentFormPrompt(purpose);
    const text = result.messages[3].content;
    expect((text as { text: string }).text).toContain(purpose);
  });

  it('embeds tailwind reference', () => {
    const result = buildGovernmentFormPrompt('test');
    const resource = result.messages[2].content;
    expect(
      (resource as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://tailwind');
  });

  it('references generate_civui_form and validate_form tools', () => {
    const result = buildGovernmentFormPrompt('test');
    const text = (result.messages[3].content as { text: string }).text;
    expect(text).toContain('generate_civui_form');
    expect(text).toContain('validate_form');
  });
});

describe('audit508CompliancePrompt', () => {
  it('returns 2 messages (1 resource + 1 text)', () => {
    const result = audit508CompliancePrompt('<civ-text-input></civ-text-input>');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('text');
  });

  it('embeds government patterns resource', () => {
    const result = audit508CompliancePrompt('<div></div>');
    const resource = result.messages[0].content;
    expect(
      (resource as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://gov-patterns');
  });

  it('includes the markup in the text', () => {
    const markup = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const result = audit508CompliancePrompt(markup);
    const text = (result.messages[1].content as { text: string }).text;
    expect(text).toContain(markup);
  });

  it('references validate_form tool', () => {
    const result = audit508CompliancePrompt('<div></div>');
    const text = (result.messages[1].content as { text: string }).text;
    expect(text).toContain('validate_form');
  });

  it('references WCAG criteria', () => {
    const result = audit508CompliancePrompt('<div></div>');
    const text = (result.messages[1].content as { text: string }).text;
    expect(text).toContain('WCAG');
    expect(text).toContain('1.3.1');
  });

  it('escapes triple-backticks in markup to prevent code fence breakout', () => {
    const markup = 'before```injected```after';
    const result = audit508CompliancePrompt(markup);
    const text = (result.messages[1].content as { text: string }).text;
    expect(text).not.toContain('before```');
    expect(text).toContain('before\\`\\`\\`');
  });
});

describe('addFieldPrompt', () => {
  it('returns 2 messages (1 resource + 1 text)', () => {
    const result = addFieldPrompt('text', 'Full name');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].content.type).toBe('resource');
    expect(result.messages[1].content.type).toBe('text');
  });

  it('embeds catalog resource', () => {
    const result = addFieldPrompt('text', 'Full name');
    const resource = result.messages[0].content;
    expect(
      (resource as { resource: { uri: string } }).resource.uri,
    ).toBe('civui://catalog');
  });

  it('includes field type and label in the text', () => {
    const result = addFieldPrompt('email', 'Email address');
    const text = (result.messages[1].content as { text: string }).text;
    expect(text).toContain('email');
    expect(text).toContain('Email address');
  });

  it('includes civ-text-input mapping for text types', () => {
    const result = addFieldPrompt('ssn', 'SSN');
    const text = (result.messages[1].content as { text: string }).text;
    expect(text).toContain('civ-text-input');
  });

  it('FIELD_TYPES has 20 entries', () => {
    expect(FIELD_TYPES).toHaveLength(20);
  });

  it('FIELD_TYPES matches expected set', () => {
    expect(FIELD_TYPES).toContain('text');
    expect(FIELD_TYPES).toContain('email');
    expect(FIELD_TYPES).toContain('radio');
    expect(FIELD_TYPES).toContain('memorable-date');
    expect(FIELD_TYPES).toContain('toggle');
    expect(FIELD_TYPES).toContain('file');
  });
});
