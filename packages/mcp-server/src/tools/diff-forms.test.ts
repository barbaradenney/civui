import { describe, it, expect } from 'vitest';
import { diffForms } from './diff-forms.js';

describe('diffForms', () => {
  it('reports no differences for identical markup', () => {
    const html = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const result = diffForms(html, html);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.unchanged).toBe(1);
    expect(result.summary).toContain('unchanged');
  });

  it('detects added fields', () => {
    const before = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const after = `
      <civ-text-input label="Name" name="name"></civ-text-input>
      <civ-text-input label="Email" name="email"></civ-text-input>
    `;
    const result = diffForms(before, after);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].name).toBe('email');
    expect(result.summary).toContain('Added 1 field');
  });

  it('detects removed fields', () => {
    const before = `
      <civ-text-input label="Name" name="name"></civ-text-input>
      <civ-text-input label="Email" name="email"></civ-text-input>
    `;
    const after = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const result = diffForms(before, after);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].name).toBe('email');
    expect(result.summary).toContain('removed 1');
  });

  it('detects changed attributes', () => {
    const before = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const after = '<civ-text-input label="Full name" name="name" required></civ-text-input>';
    const result = diffForms(before, after);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].name).toBe('name');
    expect(result.changed[0].changes.some((c) => c.attribute === 'label')).toBe(true);
  });

  it('matches elements by name attribute', () => {
    const before = `
      <civ-text-input label="A" name="field-a"></civ-text-input>
      <civ-text-input label="B" name="field-b"></civ-text-input>
    `;
    const after = `
      <civ-text-input label="B updated" name="field-b"></civ-text-input>
      <civ-text-input label="A" name="field-a"></civ-text-input>
    `;
    const result = diffForms(before, after);
    expect(result.unchanged).toBe(1);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].name).toBe('field-b');
  });

  it('handles complete replacement', () => {
    const before = '<civ-text-input label="Old" name="old"></civ-text-input>';
    const after = '<civ-select label="New" name="new"></civ-select>';
    const result = diffForms(before, after);
    expect(result.removed).toHaveLength(1);
    expect(result.added).toHaveLength(1);
  });

  it('handles empty before', () => {
    const after = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const result = diffForms('', after);
    expect(result.added).toHaveLength(1);
    expect(result.removed).toHaveLength(0);
  });

  it('handles empty after', () => {
    const before = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const result = diffForms(before, '');
    expect(result.removed).toHaveLength(1);
    expect(result.added).toHaveLength(0);
  });

  it('handles both empty', () => {
    const result = diffForms('', '');
    expect(result.summary).toBe('No differences');
  });

  it('detects attribute removal', () => {
    const before = '<civ-text-input label="Name" name="name" hint="Your full name"></civ-text-input>';
    const after = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const result = diffForms(before, after);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].changes.some((c) => c.attribute === 'hint' && c.after === null)).toBe(true);
  });

  it('detects attribute addition', () => {
    const before = '<civ-text-input label="Name" name="name"></civ-text-input>';
    const after = '<civ-text-input label="Name" name="name" autocomplete="name"></civ-text-input>';
    const result = diffForms(before, after);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].changes.some((c) => c.attribute === 'autocomplete' && c.before === null)).toBe(true);
  });

  it('summary includes all categories', () => {
    const before = `
      <civ-text-input label="Keep" name="keep"></civ-text-input>
      <civ-text-input label="Remove" name="remove"></civ-text-input>
      <civ-text-input label="Change" name="change"></civ-text-input>
    `;
    const after = `
      <civ-text-input label="Keep" name="keep"></civ-text-input>
      <civ-text-input label="Changed" name="change"></civ-text-input>
      <civ-text-input label="New" name="new"></civ-text-input>
    `;
    const result = diffForms(before, after);
    expect(result.summary).toContain('Added');
    expect(result.summary).toContain('removed');
    expect(result.summary).toContain('changed');
    expect(result.summary).toContain('unchanged');
  });
});
