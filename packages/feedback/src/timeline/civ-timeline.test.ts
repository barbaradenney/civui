import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-timeline.js';
import './civ-timeline-item.js';
import type { CivTimeline } from './civ-timeline.js';

afterEach(cleanupFixtures);

describe('civ-timeline', () => {
  it('renders an ordered list with role="list"', async () => {
    const el = await fixture<CivTimeline>(`
      <civ-timeline></civ-timeline>
    `);
    const ol = el.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.getAttribute('role')).toBe('list');
  });

  it('relocates child items into the list container', async () => {
    const el = await fixture<CivTimeline>(`
      <civ-timeline>
        <civ-timeline-item action="Submitted"></civ-timeline-item>
        <civ-timeline-item action="Approved"></civ-timeline-item>
      </civ-timeline>
    `);
    await elementUpdated(el);

    const ol = el.querySelector('ol')!;
    const items = ol.querySelectorAll('civ-timeline-item');
    expect(items.length).toBe(2);
  });

  it('preserves order of items as authored', async () => {
    const el = await fixture<CivTimeline>(`
      <civ-timeline>
        <civ-timeline-item action="First"></civ-timeline-item>
        <civ-timeline-item action="Second"></civ-timeline-item>
        <civ-timeline-item action="Third"></civ-timeline-item>
      </civ-timeline>
    `);
    await elementUpdated(el);

    const items = el.querySelectorAll('civ-timeline-item');
    expect(items[0].getAttribute('action')).toBe('First');
    expect(items[1].getAttribute('action')).toBe('Second');
    expect(items[2].getAttribute('action')).toBe('Third');
  });

  it('items render as listitem role for accessible counting', async () => {
    const el = await fixture<CivTimeline>(`
      <civ-timeline>
        <civ-timeline-item action="One"></civ-timeline-item>
        <civ-timeline-item action="Two"></civ-timeline-item>
      </civ-timeline>
    `);
    await elementUpdated(el);

    const items = el.querySelectorAll('civ-timeline-item');
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('listitem');
    });
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-timeline></civ-timeline>`);
    expect(el.shadowRoot).toBeNull();
  });
});
