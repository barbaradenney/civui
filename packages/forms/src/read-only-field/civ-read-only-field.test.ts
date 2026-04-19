import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-read-only-field.js';

afterEach(cleanupFixtures);

describe('civ-read-only-field', () => {
  it('renders label and value', async () => {
    const el = await fixture('<civ-read-only-field label="Name" value="Jane Doe"></civ-read-only-field>');
    const dt = el.querySelector('dt');
    const dd = el.querySelector('dd');
    expect(dt!.textContent).toBe('Name');
    expect(dd!.textContent!.trim()).toBe('Jane Doe');
  });

  it('shows "Not provided" when value is empty', async () => {
    const el = await fixture('<civ-read-only-field label="Phone"></civ-read-only-field>');
    const dd = el.querySelector('dd');
    expect(dd!.textContent).toContain('Not provided');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-read-only-field label="SSN" value="●●●-●●-6789" hint="Last 4 digits shown"></civ-read-only-field>');
    const hint = el.querySelector('.civ-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Last 4 digits shown');
  });

  it('omits hint when empty', async () => {
    const el = await fixture('<civ-read-only-field label="Name" value="Jane"></civ-read-only-field>');
    const hint = el.querySelector('.civ-hint');
    expect(hint).toBeNull();
  });

  it('uses definition list markup', async () => {
    const el = await fixture('<civ-read-only-field label="Field" value="Value"></civ-read-only-field>');
    expect(el.querySelector('dt')).not.toBeNull();
    expect(el.querySelector('dd')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-read-only-field label="Test" value="Val"></civ-read-only-field>');
    expect(el.shadowRoot).toBeNull();
  });
});
