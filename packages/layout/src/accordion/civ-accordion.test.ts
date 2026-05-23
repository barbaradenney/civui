import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-accordion.js';
import './civ-accordion-item.js';
import type { CivAccordion } from './civ-accordion.js';
import type { CivAccordionItem } from './civ-accordion-item.js';

afterEach(cleanupFixtures);

async function openItemViaUser(item: CivAccordionItem): Promise<void> {
  // Simulate the user toggling — set the native <details>.open and
  // dispatch the toggle event the same way the browser would.
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

  it('does not close siblings when a user closes an item', async () => {
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
    // `civ-accordion-item-toggle`, which the parent stops once it
    // has handled.
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

  // ─── Regressions from code review ────────────────────────────

  it('enforces single-open invariant on first paint when multiple items ship with `open`', async () => {
    // Regression: previously the parent's connectedCallback only
    // attached a listener and never reconciled initial state, so
    // markup with multiple `open` items in `single` mode painted
    // with all of them expanded — violating the contract.
    const el = await fixture<CivAccordion>(`
      <civ-accordion single>
        <civ-accordion-item label="A" open>A</civ-accordion-item>
        <civ-accordion-item label="B" open>B</civ-accordion-item>
        <civ-accordion-item label="C" open>C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    // Keep first open, close the rest.
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
    expect(items[2].open).toBe(false);
  });

  it('reconciles when `single` flips from false to true at runtime', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A" open>A</civ-accordion-item>
        <civ-accordion-item label="B" open>B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(true);

    el.single = true;
    await elementUpdated(el);

    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
  });

  it('dispatches civ-toggle when a parent-driven single-mode close occurs', async () => {
    // Consumers subscribing to civ-toggle to mirror open state into
    // a store should see EVERY transition, including parent-driven
    // closes. Previously these were silenced by the equality guard
    // in _onToggle.
    const el = await fixture<CivAccordion>(`
      <civ-accordion single>
        <civ-accordion-item label="A" open>A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    const onAToggle = vi.fn();
    items[0].addEventListener('civ-toggle', onAToggle as EventListener);

    await openItemViaUser(items[1]);

    expect(items[0].open).toBe(false);
    // Item A was closed by the parent's coordination logic; its
    // civ-toggle must fire so the consumer sees the close.
    expect(onAToggle).toHaveBeenCalledTimes(1);
    const event = onAToggle.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(false);
  });

  it('only coordinates direct-descendant items — nested accordions are independent', async () => {
    // Regression: previously `querySelectorAll('civ-accordion-item')`
    // returned grandchild items too, so opening an inner item could
    // close outer-accordion items.
    const el = await fixture<CivAccordion>(`
      <civ-accordion single id="outer">
        <civ-accordion-item label="Outer A" open>
          <civ-accordion id="inner">
            <civ-accordion-item label="Inner X">X</civ-accordion-item>
            <civ-accordion-item label="Inner Y">Y</civ-accordion-item>
          </civ-accordion>
        </civ-accordion-item>
        <civ-accordion-item label="Outer B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const outerA = el.querySelector<CivAccordionItem>('#outer > .civ-accordion__inner > civ-accordion-item:nth-child(1)')!;
    const outerB = el.querySelector<CivAccordionItem>('#outer > .civ-accordion__inner > civ-accordion-item:nth-child(2)')!;
    const innerX = el.querySelector<CivAccordionItem>('#inner > .civ-accordion__inner > civ-accordion-item:nth-child(1)')!;
    const innerY = el.querySelector<CivAccordionItem>('#inner > .civ-accordion__inner > civ-accordion-item:nth-child(2)')!;

    expect(outerA.open).toBe(true);

    // Open inner X — should NOT close outer A.
    await openItemViaUser(innerX);

    expect(outerA.open).toBe(true);
    expect(outerB.open).toBe(false);
    expect(innerX.open).toBe(true);
    expect(innerY.open).toBe(false);
  });

  it('stops the internal coordination event from leaking past the accordion', async () => {
    // The internal `civ-accordion-item-toggle` event is for parent
    // coordination only. It must NOT leak to ancestor listeners
    // (e.g. an outer civ-form or a document-level analytics relay)
    // — same isolation goal that made `civ-toggle` non-bubbling.
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
      </civ-accordion>
    `);
    const onAncestor = vi.fn();
    document.body.addEventListener('civ-accordion-item-toggle', onAncestor as EventListener);

    const item = el.querySelector<CivAccordionItem>('civ-accordion-item')!;
    await openItemViaUser(item);

    expect(onAncestor).not.toHaveBeenCalled();

    document.body.removeEventListener('civ-accordion-item-toggle', onAncestor as EventListener);
  });

  it('a standalone civ-accordion-item still works without a parent accordion', async () => {
    // The item is a fully composable element — used without a
    // parent it behaves like a fancier civ-disclosure. The
    // coordination event still bubbles out (no parent to stop it),
    // which is expected for a standalone item — no parent means no
    // coordination claim.
    const el = await fixture<CivAccordionItem>('<civ-accordion-item label="X">B</civ-accordion-item>');
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);
    await openItemViaUser(el);
    expect(el.open).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ─── Keyboard navigation (ARIA APG pattern) ───────────────────

  function focusSummary(item: CivAccordionItem): HTMLElement {
    const summary = item.querySelector<HTMLElement>('summary')!;
    summary.focus();
    return summary;
  }

  function dispatchKeyOn(target: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  it('ArrowDown moves focus from one summary to the next', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    const summaryA = focusSummary(items[0]);
    dispatchKeyOn(summaryA, 'ArrowDown');
    expect(document.activeElement).toBe(items[1].querySelector('summary'));
  });

  it('ArrowUp moves focus to the previous summary', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    dispatchKeyOn(focusSummary(items[1]), 'ArrowUp');
    expect(document.activeElement).toBe(items[0].querySelector('summary'));
  });

  it('ArrowDown wraps from the last item to the first', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    dispatchKeyOn(focusSummary(items[1]), 'ArrowDown');
    expect(document.activeElement).toBe(items[0].querySelector('summary'));
  });

  it('ArrowUp wraps from the first item to the last', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    dispatchKeyOn(focusSummary(items[0]), 'ArrowUp');
    expect(document.activeElement).toBe(items[1].querySelector('summary'));
  });

  it('Home jumps to the first item, End jumps to the last', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    dispatchKeyOn(focusSummary(items[1]), 'Home');
    expect(document.activeElement).toBe(items[0].querySelector('summary'));
    dispatchKeyOn(focusSummary(items[1]), 'End');
    expect(document.activeElement).toBe(items[2].querySelector('summary'));
  });

  it('skips disabled items during arrow navigation', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B" disabled>B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    dispatchKeyOn(focusSummary(items[0]), 'ArrowDown');
    // Skip the disabled middle item, land on C.
    expect(document.activeElement).toBe(items[2].querySelector('summary'));
  });

  it('keyboard handler does not respond when focus is inside panel content', async () => {
    // Users with text cursors inside an input shouldn't have ArrowDown
    // hijacked — accordion navigation only applies when the SUMMARY
    // itself is focused.
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A" open><input data-test="input" /></civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    const input = el.querySelector<HTMLInputElement>('[data-test="input"]')!;
    input.focus();
    dispatchKeyOn(input, 'ArrowDown');
    // Focus stays on the input — accordion didn't intercept.
    expect(document.activeElement).toBe(input);
    expect(document.activeElement).not.toBe(items[1].querySelector('summary'));
  });

  it('keyboard handler in outer accordion does not move focus when an inner accordion handles it', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion id="outer">
        <civ-accordion-item label="Outer A" open>
          <civ-accordion id="inner">
            <civ-accordion-item label="Inner X">X</civ-accordion-item>
            <civ-accordion-item label="Inner Y">Y</civ-accordion-item>
          </civ-accordion>
        </civ-accordion-item>
      </civ-accordion>
    `);
    const innerItems = el.querySelectorAll<CivAccordionItem>('#inner > .civ-accordion__inner > civ-accordion-item');
    dispatchKeyOn(focusSummary(innerItems[0]), 'ArrowDown');
    // Focus moves to the next INNER item only — the outer handler's
    // scope check (`target.closest('civ-accordion') !== this`) filters
    // out events from grandchild items.
    expect(document.activeElement).toBe(innerItems[1].querySelector('summary'));
  });

  // ─── expandAll / collapseAll methods ──────────────────────────

  it('expandAll() opens every non-disabled direct-child item', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B" disabled>B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    el.expandAll();
    await elementUpdated(el);
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false); // disabled, skipped
    expect(items[2].open).toBe(true);
  });

  it('expandAll() in single mode opens only the first non-disabled item', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion single>
        <civ-accordion-item label="A" disabled>A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
        <civ-accordion-item label="C">C</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    el.expandAll();
    await elementUpdated(el);
    expect(items[0].open).toBe(false); // disabled
    expect(items[1].open).toBe(true);  // first non-disabled
    expect(items[2].open).toBe(false); // single mode skips the rest
  });

  it('collapseAll() closes every non-disabled item', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A" open>A</civ-accordion-item>
        <civ-accordion-item label="B" open>B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    el.collapseAll();
    await elementUpdated(el);
    expect(items[0].open).toBe(false);
    expect(items[1].open).toBe(false);
  });

  it('collapseAll() does not touch disabled-open items (setter rejects)', async () => {
    // Contract consistency: `disabled` freezes the item's state.
    // collapseAll respects that — a disabled item that ships
    // pre-authored as open stays open.
    const el = await fixture<CivAccordion>(`
      <civ-accordion>
        <civ-accordion-item label="A" disabled open>A</civ-accordion-item>
        <civ-accordion-item label="B" open>B</civ-accordion-item>
      </civ-accordion>
    `);
    const items = el.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    el.collapseAll();
    await elementUpdated(el);
    expect(items[0].open).toBe(true);  // disabled, frozen
    expect(items[1].open).toBe(false);
  });

  it('expandAll/collapseAll only touch direct-child items, not nested', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion id="outer">
        <civ-accordion-item label="Outer A">
          <civ-accordion id="inner">
            <civ-accordion-item label="Inner X">X</civ-accordion-item>
          </civ-accordion>
        </civ-accordion-item>
        <civ-accordion-item label="Outer B">B</civ-accordion-item>
      </civ-accordion>
    `);
    const outerA = el.querySelector<CivAccordionItem>('#outer > .civ-accordion__inner > civ-accordion-item:nth-child(1)')!;
    const outerB = el.querySelector<CivAccordionItem>('#outer > .civ-accordion__inner > civ-accordion-item:nth-child(2)')!;
    const innerX = el.querySelector<CivAccordionItem>('#inner > .civ-accordion__inner > civ-accordion-item')!;

    el.expandAll();
    await elementUpdated(el);

    expect(outerA.open).toBe(true);
    expect(outerB.open).toBe(true);
    expect(innerX.open).toBe(false); // grandchild, not touched
  });

  // ─── Parent disabled cascade ──────────────────────────────────

  it('reflects disabled to host attribute', async () => {
    const el = await fixture<CivAccordion>('<civ-accordion><civ-accordion-item label="X">B</civ-accordion-item></civ-accordion>');
    expect(el.hasAttribute('disabled')).toBe(false);
    el.disabled = true;
    await elementUpdated(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  it('parent disabled rejects programmatic open on children', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion disabled>
        <civ-accordion-item label="A">A</civ-accordion-item>
      </civ-accordion>
    `);
    const item = el.querySelector<CivAccordionItem>('civ-accordion-item')!;
    item.open = true;
    await elementUpdated(item);
    expect(item.open).toBe(false);
    expect(item.querySelector('details')!.open).toBe(false);
  });

  it('parent disabled reverts user-click toggles on children', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion disabled>
        <civ-accordion-item label="A">A</civ-accordion-item>
      </civ-accordion>
    `);
    const item = el.querySelector<CivAccordionItem>('civ-accordion-item')!;
    const details = item.querySelector('details')!;
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(item);
    expect(item.open).toBe(false);
    expect(details.open).toBe(false);
  });

  it('parent disabled propagates aria-disabled and tabindex to child summaries', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion disabled>
        <civ-accordion-item label="A">A</civ-accordion-item>
        <civ-accordion-item label="B">B</civ-accordion-item>
      </civ-accordion>
    `);
    for (const item of el.querySelectorAll<CivAccordionItem>('civ-accordion-item')) {
      const summary = item.querySelector('summary')!;
      expect(summary.getAttribute('aria-disabled')).toBe('true');
      expect(summary.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('re-enables children when parent disabled is cleared', async () => {
    const el = await fixture<CivAccordion>(`
      <civ-accordion disabled>
        <civ-accordion-item label="A">A</civ-accordion-item>
      </civ-accordion>
    `);
    const item = el.querySelector<CivAccordionItem>('civ-accordion-item')!;

    // While disabled — open is rejected
    item.open = true;
    await elementUpdated(item);
    expect(item.open).toBe(false);

    // Re-enable parent
    el.disabled = false;
    await elementUpdated(el);
    await elementUpdated(item);

    // aria-disabled/tabindex should be cleared on the child summary
    const summary = item.querySelector('summary')!;
    expect(summary.hasAttribute('aria-disabled')).toBe(false);
    expect(summary.hasAttribute('tabindex')).toBe(false);

    // open is now allowed
    item.open = true;
    await elementUpdated(item);
    expect(item.open).toBe(true);
  });
});
