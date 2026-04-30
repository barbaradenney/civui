import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-list.js';
import './civ-list-item.js';

afterEach(cleanupFixtures);

describe('civ-list', () => {
  it('renders as a <ul> with role="list"', async () => {
    const el = await fixture('<civ-list></civ-list>');
    const ul = el.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(ul!.getAttribute('role')).toBe('list');
  });

  it('relocates slotted children into the list container', async () => {
    const el = await fixture(`
      <civ-list>
        <civ-list-item href="/a">A</civ-list-item>
        <civ-list-item href="/b">B</civ-list-item>
      </civ-list>
    `);
    const ul = el.querySelector('ul')!;
    const items = ul.querySelectorAll('civ-list-item');
    expect(items.length).toBe(2);
  });

  it('does not apply divider class by default', async () => {
    const el = await fixture('<civ-list></civ-list>');
    const ul = el.querySelector('ul')!;
    expect(ul.className).not.toContain('civ-list--dividers');
  });

  it('applies divider class when dividers attribute is set', async () => {
    const el = await fixture('<civ-list dividers></civ-list>');
    const ul = el.querySelector('ul')!;
    expect(ul.className).toContain('civ-list--dividers');
  });

  it('applies variant class', async () => {
    const el = await fixture('<civ-list variant="primary"></civ-list>');
    const ul = el.querySelector('ul')!;
    expect(ul.className).toContain('civ-list--primary');
  });

  it('applies compact spacing class', async () => {
    const el = await fixture('<civ-list spacing="sm"></civ-list>');
    const ul = el.querySelector('ul')!;
    expect(ul.className).toContain('civ-list--sm');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-list></civ-list>');
    expect(el.shadowRoot).toBeNull();
  });
});
