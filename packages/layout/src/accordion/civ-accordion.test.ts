import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-accordion.js';
import './civ-accordion-item.js';
import type { CivAccordion } from './civ-accordion.js';
import type { CivAccordionItem } from './civ-accordion-item.js';

afterEach(cleanupFixtures);

async function openItemViaUser(item: CivAccordionItem): Promise<void> {
  // Simulate the user toggling — set the native <details>.open and
  // dispatch the toggle event the same way the browser would. Direct
  // `item.open = true` skips the component's toggle handler, which
  // means it skips dispatching `civ-accordion-item-toggle`, which the
  // parent needs to coordinate single-open mode.
  const details = item.querySelector('details')!;
  details.open = true;
  details.dispatchEvent(new Event('toggle'));
  await elementUpdated(item);
}

describe('civ-accordion', () => {
  it('wraps captured children in the inner content container', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A body</civ-accordion-item>
        <civ-accordion-item label="B">B body</civ-accordion-item>
      </civ-accordion>
    `);
    const inner = el.querySelector('.civ-accordion__inner')!;
    const items = el.querySelectorAll('civ-accordion-item');
    expect(items).toHaveLength(2);
    for (const item of Array.from(items)) {
      expect(inner.contains(item)).toBe(true);
    }
  });

  it('allows multiple items open at once by default', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    await openItemViaUser(items[0]);
    await openItemViaUser(items[2]);
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
    expect(items[2].open).toBe(true);
  });

  it('closes siblings when single is set and an item opens', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion single>
        <civ-accordion-item label="A" open>A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    expect(items[0].open).toBe(true);

    await openItemViaUser(items[1]);

    expect(items[0].open).toBe(false);
    expect(items[1].open).toBe(true);
    expect(items[2].open).toBe(false);
  });

  it('does not close siblings when a user closes an item (open:false events ignored)', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion single>
        <civ-accordion-item label="A" open>A</civ-accordion-item>
        <civ-accordion-item label="B" open>B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    // Close item B
    const detailsB = items[1].querySelector('details')!;
    detailsB.open = false;
    detailsB.dispatchEvent(new Event('toggle'));
    await elementUpdated(items[1]);

    // A should still be open — close events shouldn't trigger sibling coordination
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
  });

  it('reflects single to host attribute', async () => {
    const el = await fixture<CivAccordion>('<civ-accordion><civ-accordion-item label="X">B</civ-accordion-item></civ-accordion>');
    expect(el.hasAttribute('single')).toBe(false);
    el.single = true;
    await elementUpdated(el);
    expect(el.hasAttribute('single')).toBe(true);
  });

  it('child civ-toggle does NOT bubble to the parent (consumer-event isolation)', async () => {
    // The public `civ-toggle` event must stay local to each item so a
    // listener on <civ-accordion> doesn't receive both consumer events
    // and the internal coordination events. The bubbling event used
    // for parent coordination is the separate
    // `civ-accordion-item-toggle`.
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
      </civ-accordion>
    `);
    const onParentCivToggle = vi.fn();
    el.addEventListener('civ-toggle', onParentCivToggle as EventListener);

    const item = el.querySelector<CivAccordionItem>('civ-accordion-item')!;
    await openItemViaUser(item);

    expect(onParentCivToggle).not.toHaveBeenCalled();
  });
});
