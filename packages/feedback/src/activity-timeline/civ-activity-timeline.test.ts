import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-activity-timeline.js';
import './civ-activity-item.js';
import type { CivActivityTimeline } from './civ-activity-timeline.js';

afterEach(cleanupFixtures);

describe('civ-activity-timeline', () => {
  it('renders an ordered list with role="list"', async () => {
    const el = await fixture<CivActivityTimeline>(`
      <civ-activity-timeline></civ-activity-timeline>
    `);
    const ol = el.querySelector('ol');
    expect(ol).not.toBeNull();
    expect(ol!.getAttribute('role')).toBe('list');
  });

  it('relocates child items into the list container', async () => {
    const el = await fixture<CivActivityTimeline>(`
      <civ-activity-timeline>
        <civ-activity-item action="Submitted"></civ-activity-item>
        <civ-activity-item action="Approved"></civ-activity-item>
      </civ-activity-timeline>
    `);
    await elementUpdated(el);

    const ol = el.querySelector('ol')!;
    const items = ol.querySelectorAll('civ-activity-item');
    expect(items.length).toBe(2);
  });

  it('preserves order of items as authored', async () => {
    const el = await fixture<CivActivityTimeline>(`
      <civ-activity-timeline>
        <civ-activity-item action="First"></civ-activity-item>
        <civ-activity-item action="Second"></civ-activity-item>
        <civ-activity-item action="Third"></civ-activity-item>
      </civ-activity-timeline>
    `);
    await elementUpdated(el);

    const items = el.querySelectorAll('civ-activity-item');
    expect(items[0].getAttribute('action')).toBe('First');
    expect(items[1].getAttribute('action')).toBe('Second');
    expect(items[2].getAttribute('action')).toBe('Third');
  });

  it('items render as listitem role for accessible counting', async () => {
    const el = await fixture<CivActivityTimeline>(`
      <civ-activity-timeline>
        <civ-activity-item action="One"></civ-activity-item>
        <civ-activity-item action="Two"></civ-activity-item>
      </civ-activity-timeline>
    `);
    await elementUpdated(el);

    const items = el.querySelectorAll('civ-activity-item');
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('listitem');
    });
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-activity-timeline></civ-activity-timeline>`);
    expect(el.shadowRoot).toBeNull();
  });
});
