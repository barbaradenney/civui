import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import { _resetOverlayStack } from '@civui/core';
import './civ-action-sheet.js';
import '../popover/civ-popover.js';

/**
 * Integration coverage for the cross-overlay Escape coordination
 * (`@civui/core` overlay-stack). The unit tests in
 * `packages/core/src/a11y/overlay-stack.test.ts` cover the stack mechanics;
 * these prove the two real document-listener overlays cooperate — a single
 * Escape closes ONE layer (innermost first), not both at once.
 */
afterEach(() => {
  cleanupFixtures();
  _resetOverlayStack();
});

function escape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

describe('nested overlay Escape coordination', () => {
  it('closes only the inner popover on the first Escape, then the action-sheet on the second', async () => {
    // Action-sheet is parent-controlled: it fires civ-close and the parent
    // flips `open`. Wire that here so closing actually pops it off the
    // stack — but only react to the SHEET's own civ-close. `civ-close`
    // bubbles, and the inner popover is a descendant, so an unfiltered
    // listener would also catch the popover's bubbling close (a
    // long-standing property of the bubbling event, unrelated to the
    // Escape stack under test).
    const sheet = await fixture(`
      <civ-action-sheet open>
        <civ-popover>
          <button data-civ-popover-trigger>Open</button>
          <div>Panel content</div>
        </civ-popover>
      </civ-action-sheet>
    `);
    sheet.addEventListener('civ-close', (e) => {
      if (e.target === sheet) (sheet as any).open = false;
    });
    await elementUpdated(sheet);

    const popover = sheet.querySelector('civ-popover') as HTMLElement & { open: boolean };
    popover.open = true;
    await elementUpdated(popover);

    const sheetClose = vi.fn();
    const popoverClose = vi.fn();
    // Filter to each element's OWN close (ignore the bubbled descendant one).
    sheet.addEventListener('civ-close', (e) => { if (e.target === sheet) sheetClose(); });
    popover.addEventListener('civ-close', (e) => { if (e.target === popover) popoverClose(); });

    // First Escape: the popover is the topmost layer, so it consumes the
    // key and closes. The action-sheet's listener sees the already-claimed
    // (or not-top) event and bails — it must NOT close.
    escape();
    await elementUpdated(popover);
    expect(popoverClose).toHaveBeenCalledOnce();
    expect(popover.open).toBe(false);
    expect(sheetClose).not.toHaveBeenCalled();
    expect((sheet as any).open).toBe(true);

    // Second Escape: with the popover popped, the action-sheet is now the
    // top layer and closes.
    escape();
    await elementUpdated(sheet);
    expect(sheetClose).toHaveBeenCalledOnce();
  });

  it('a lone action-sheet still closes on Escape (no regression)', async () => {
    const sheet = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(sheet);
    const close = vi.fn();
    sheet.addEventListener('civ-close', close as EventListener);

    escape();
    expect(close).toHaveBeenCalledOnce();
  });

  it('a lone popover still closes on Escape (no regression)', async () => {
    const popover = await fixture(`
      <civ-popover>
        <button data-civ-popover-trigger>Open</button>
        <div>Panel</div>
      </civ-popover>
    `) as HTMLElement & { open: boolean };
    popover.open = true;
    await elementUpdated(popover);
    const close = vi.fn();
    popover.addEventListener('civ-close', close as EventListener);

    escape();
    await elementUpdated(popover);
    expect(close).toHaveBeenCalledOnce();
    expect(popover.open).toBe(false);
  });
});
