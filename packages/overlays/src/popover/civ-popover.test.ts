import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-popover.js';

afterEach(cleanupFixtures);

const template = `
  <civ-popover label="Filters">
    <button data-civ-popover-trigger type="button" data-testid="trigger">Open</button>
    <div data-testid="panel-content">
      <p>Some panel content</p>
      <button type="button" data-testid="inner-btn">Inner</button>
    </div>
  </civ-popover>
`;

const waitMicrotask = () => new Promise<void>((r) => queueMicrotask(() => r()));

describe('civ-popover', () => {
  it('renders the panel hidden by default', async () => {
    const el = await fixture(template);
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  it('wires aria-haspopup + aria-expanded + aria-controls on the trigger', async () => {
    const el = await fixture(template);
    await elementUpdated(el);
    await waitMicrotask();
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBeTruthy();
  });

  it('opens when the trigger is clicked', async () => {
    const el = await fixture(template);
    await elementUpdated(el);
    await waitMicrotask();
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    await elementUpdated(el);
    expect((el as any).open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel.hasAttribute('hidden')).toBe(false);
  });

  it('closes when the trigger is clicked twice', async () => {
    const el = await fixture(template);
    await elementUpdated(el);
    await waitMicrotask();
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    await elementUpdated(el);
    trigger.click();
    await elementUpdated(el);
    expect((el as any).open).toBe(false);
  });

  it('fires civ-popover-open and civ-popover-close', async () => {
    const el = await fixture(template);
    await elementUpdated(el);
    await waitMicrotask();
    const opened = vi.fn();
    const closed = vi.fn();
    el.addEventListener('civ-popover-open', opened);
    el.addEventListener('civ-popover-close', closed);
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    expect(opened).toHaveBeenCalledOnce();
    trigger.click();
    expect(closed).toHaveBeenCalledOnce();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const el = (await fixture(template)) as any;
    el.open = true;
    await elementUpdated(el);
    // Move focus into the panel so the post-close focus restoration is
    // observable. Without this, document.activeElement is body before
    // AND after the close — the assertion would pass for the wrong
    // reason.
    const innerBtn = el.querySelector('[data-testid="inner-btn"]') as HTMLElement;
    innerBtn.focus();
    expect(document.activeElement).toBe(innerBtn);

    const handler = vi.fn();
    el.addEventListener('civ-popover-close', handler);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    expect(document.activeElement).toBe(trigger);
  });

  it('does not close on Escape when no-escape-close is set', async () => {
    const el = (await fixture(`
      <civ-popover no-escape-close>
        <button data-civ-popover-trigger>x</button>
        <div></div>
      </civ-popover>
    `)) as any;
    el.open = true;
    await elementUpdated(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it('closes on Tab by default (menu-button semantics)', async () => {
    const el = (await fixture(template)) as any;
    el.open = true;
    await elementUpdated(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it('does not close on Tab when no-tab-close is set', async () => {
    const el = (await fixture(`
      <civ-popover no-tab-close>
        <button data-civ-popover-trigger>x</button>
        <input type="checkbox" />
        <input type="checkbox" />
      </civ-popover>
    `)) as any;
    el.open = true;
    await elementUpdated(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it('flipping no-click-outside-close mid-open removes/adds the document listener', async () => {
    const sibling = document.createElement('button');
    document.body.appendChild(sibling);
    const el = (await fixture(template)) as any;
    el.open = true;
    await elementUpdated(el);

    // Flip mid-open: outside clicks should no longer close.
    el.noClickOutsideClose = true;
    await elementUpdated(el);
    sibling.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await elementUpdated(el);
    expect(el.open).toBe(true);

    // Flip back: outside clicks close again.
    el.noClickOutsideClose = false;
    await elementUpdated(el);
    sibling.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await elementUpdated(el);
    expect(el.open).toBe(false);

    sibling.remove();
  });

  it('skips JS placement on mobile (bottom-sheet pattern owns positioning)', async () => {
    // jsdom's matchMedia returns `{ matches: false }` by default — patch
    // it to return true so the `_repositionPanel` mobile branch runs.
    // Without this branch, the popover would set `top`/`left` inline
    // styles that fight `.civ-bottom-sheet`'s `bottom: 0` cascade.
    const originalMatchMedia = window.matchMedia;
    (window as any).matchMedia = (q: string) => ({
      matches: q === '(max-width: 480px)',
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() { return false; },
      onchange: null,
    });
    try {
      const el = (await fixture(template)) as any;
      // Pre-seed inline placement so we can verify it gets cleared.
      const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
      panel.style.top = '50px';
      panel.style.left = '50px';

      el.open = true;
      await elementUpdated(el);
      // Wait one more tick — _repositionPanel runs after updateComplete.
      await new Promise((r) => queueMicrotask(() => r(undefined)));

      expect(panel.style.top).toBe('');
      expect(panel.style.left).toBe('');
    } finally {
      (window as any).matchMedia = originalMatchMedia;
    }
  });

  it('respects panel-role and applies it as the panel role', async () => {
    const el = await fixture(`
      <civ-popover panel-role="group" label="g">
        <button data-civ-popover-trigger>x</button>
        <div></div>
      </civ-popover>
    `);
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('group');
  });

  it('forwards trigger-haspopup to the trigger element', async () => {
    const el = await fixture(`
      <civ-popover trigger-haspopup="menu">
        <button data-civ-popover-trigger data-testid="trigger">x</button>
        <div></div>
      </civ-popover>
    `);
    await elementUpdated(el);
    await waitMicrotask();
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('walks into the slotted element to wire ARIA on the inner focusable (e.g. wrapped <button>)', async () => {
    const el = await fixture(`
      <civ-popover>
        <span data-civ-popover-trigger>
          <button type="button" data-testid="inner-trigger">Open</button>
        </span>
        <div></div>
      </civ-popover>
    `);
    await elementUpdated(el);
    await waitMicrotask();
    // ARIA must land on the focusable inner button, not the wrapper span —
    // screen readers reading the focused button would otherwise miss the
    // popup affordance.
    const inner = el.querySelector('[data-testid="inner-trigger"]') as HTMLElement;
    expect(inner.getAttribute('aria-haspopup')).toBeTruthy();
    expect(inner.getAttribute('aria-controls')).toBeTruthy();
    const wrapper = el.querySelector('[data-civ-popover-trigger]') as HTMLElement;
    expect(wrapper.hasAttribute('aria-haspopup')).toBe(false);
  });

  it('closes when a click happens outside the host', async () => {
    const sibling = document.createElement('div');
    document.body.appendChild(sibling);

    const el = (await fixture(template)) as any;
    el.open = true;
    await elementUpdated(el);

    sibling.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await elementUpdated(el);

    expect(el.open).toBe(false);
    sibling.remove();
  });

  it('reflects open to the host attribute', async () => {
    const el = (await fixture(template)) as any;
    el.open = true;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(true);
    el.open = false;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('uses Light DOM', async () => {
    const el = await fixture(template);
    expect(el.shadowRoot).toBeNull();
  });
});
