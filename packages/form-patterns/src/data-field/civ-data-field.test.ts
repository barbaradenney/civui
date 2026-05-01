import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-data-field.js';
import type { CivDataField } from './civ-data-field.js';

afterEach(cleanupFixtures);

describe('civ-data-field', () => {
  it('renders label and value in a single row', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane Doe"></civ-data-field>');
    const dt = el.querySelector('dt');
    const dd = el.querySelector('dd');
    expect(dt!.textContent).toBe('Name');
    expect(dd!.textContent).toContain('Jane Doe');
  });

  it('shows "Not provided" when value is empty', async () => {
    const el = await fixture('<civ-data-field label="Phone"></civ-data-field>');
    const dd = el.querySelector('dd');
    expect(dd!.textContent).toContain('Not provided');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-data-field label="SSN" value="●●●-●●-6789" hint="Last 4 digits shown"></civ-data-field>');
    const hint = el.querySelector('.civ-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Last 4 digits shown');
  });

  it('omits hint when empty', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane"></civ-data-field>');
    const hint = el.querySelector('.civ-hint');
    expect(hint).toBeNull();
  });

  it('renders inline edit link when edit-href is set', async () => {
    const el = await fixture('<civ-data-field label="Phone" value="555-1234" edit-href="#/phone"></civ-data-field>');
    const link = el.querySelector('civ-link');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('#/phone');
    expect(link!.getAttribute('label')).toBe('Edit');
  });

  it('uses custom edit label when set', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane" edit-href="/profile" edit-label="Update on your profile"></civ-data-field>');
    const link = el.querySelector('civ-link');
    expect(link!.getAttribute('label')).toBe('Update on your profile');
  });

  it('omits edit link when edit-href is empty', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane"></civ-data-field>');
    const link = el.querySelector('civ-link');
    expect(link).toBeNull();
  });

  it('renders multi-line values from values array', async () => {
    const el = await fixture<CivDataField>('<civ-data-field label="Address"></civ-data-field>');
    (el as any).values = ['123 Main St', 'Springfield, IL 62701'];
    await elementUpdated(el);
    const spans = el.querySelectorAll('.civ-data-field__data span.civ-block');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('123 Main St');
    expect(spans[1].textContent).toBe('Springfield, IL 62701');
  });

  it('uses inline row layout class', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane"></civ-data-field>');
    const row = el.querySelector('.civ-data-field');
    expect(row).not.toBeNull();
  });

  it('bold value via data class', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane"></civ-data-field>');
    const data = el.querySelector('.civ-data-field__data');
    expect(data).not.toBeNull();
    expect(data!.textContent).toContain('Jane');
  });

  it('edit link has accessible name with field label', async () => {
    const el = await fixture('<civ-data-field label="Phone number" value="555" edit-href="#/phone"></civ-data-field>');
    const link = el.querySelector('civ-link');
    expect(link!.getAttribute('aria-label')).toContain('Phone number');
  });

  it('wraps in dl element for valid semantics', async () => {
    const el = await fixture('<civ-data-field label="Name" value="Jane"></civ-data-field>');
    expect(el.querySelector('dl')).not.toBeNull();
  });

  it('uses definition list markup', async () => {
    const el = await fixture('<civ-data-field label="Field" value="Value"></civ-data-field>');
    expect(el.querySelector('dt')).not.toBeNull();
    expect(el.querySelector('dd')).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-data-field label="Test" value="Val"></civ-data-field>');
    expect(el.shadowRoot).toBeNull();
  });
});
