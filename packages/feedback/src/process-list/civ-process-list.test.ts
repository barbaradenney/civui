import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-process-list.js';
import './civ-process-list-item.js';
import type { CivProcessList } from './civ-process-list.js';

afterEach(cleanupFixtures);

describe('civ-process-list', () => {
  it('renders an ordered list with role="list"', async () => {
    const el = await fixture<CivProcessList>(`
      <civ-process-list></civ-process-list>
    `);
    const ol = el.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.getAttribute('role')).toBe('list');
  });

  it('relocates child items into the list container', async () => {
    const el = await fixture<CivProcessList>(`
      <civ-process-list>
        <civ-process-list-item heading="Gather documents"></civ-process-list-item>
        <civ-process-list-item heading="Fill out the application"></civ-process-list-item>
      </civ-process-list>
    `);
    await elementUpdated(el);

    const ol = el.querySelector('ol')!;
    const items = ol.querySelectorAll('civ-process-list-item');
    expect(items.length).toBe(2);
  });

  it('preserves item order from source markup', async () => {
    const el = await fixture<CivProcessList>(`
      <civ-process-list>
        <civ-process-list-item heading="One"></civ-process-list-item>
        <civ-process-list-item heading="Two"></civ-process-list-item>
        <civ-process-list-item heading="Three"></civ-process-list-item>
      </civ-process-list>
    `);
    await elementUpdated(el);

    const headings = Array.from(
      el.querySelectorAll('.civ-process-list-item__heading'),
    ).map((h) => h.textContent);
    expect(headings).toEqual(['One', 'Two', 'Three']);
  });

  it('items render as listitem role for accessible counting', async () => {
    const el = await fixture<CivProcessList>(`
      <civ-process-list>
        <civ-process-list-item heading="A"></civ-process-list-item>
        <civ-process-list-item heading="B"></civ-process-list-item>
      </civ-process-list>
    `);
    await elementUpdated(el);

    const items = el.querySelectorAll('civ-process-list-item');
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('listitem');
    });
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-process-list></civ-process-list>`);
    expect(el.shadowRoot).toBeNull();
  });
});
