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

  it('does not apply divider classes by default', async () => {
    const el = await fixture('<civ-list></civ-list>');
    const ul = el.querySelector('ul')!;
    expect(ul.className).not.toContain('civ-divide-y');
  });

  it('applies divider classes when dividers attribute is set', async () => {
    const el = await fixture('<civ-list dividers></civ-list>');
    const ul = el.querySelector('ul')!;
    expect(ul.className).toContain('civ-divide-y');
    expect(ul.className).toContain('civ-divide-base-lighter');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-list></civ-list>');
    expect(el.shadowRoot).toBeNull();
  });
});
