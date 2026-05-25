import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-action-sheet.js';

afterEach(cleanupFixtures);

describe('civ-action-sheet', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture('<civ-action-sheet><p>Content</p></civ-action-sheet>');
    expect(el.querySelector('.civ-action-sheet')).toBeNull();
  });

  it('renders content when open', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);
    const sheet = el.querySelector('.civ-action-sheet--open');
    expect(sheet).not.toBeNull();
  });

  it('fires civ-close on Escape', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire close on Escape when closed', async () => {
    const el = await fixture('<civ-action-sheet><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('renders backdrop element when open', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);
    expect(el.querySelector('.civ-action-sheet-backdrop')).not.toBeNull();
  });

  it('fires close on backdrop click', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-close', handler as EventListener);

    const backdrop = el.querySelector('.civ-action-sheet-backdrop') as HTMLElement;
    backdrop.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('applies custom max-height via CSS variable', async () => {
    const el = await fixture('<civ-action-sheet open max-height="70vh"><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);

    const sheet = el.querySelector('.civ-action-sheet--open') as HTMLElement;
    expect(sheet.style.getPropertyValue('--civ-action-sheet-max-height')).toBe('70vh');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    expect(el.shadowRoot).toBeNull();
  });

  it('cleans up listeners on disconnect', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>') as any;
    await elementUpdated(el);

    el.remove();

    // Should not throw when dispatching events after removal
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });

  it('hides content when open changes to false', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>') as any;
    await elementUpdated(el);
    expect(el.querySelector('.civ-action-sheet--open')).not.toBeNull();

    el.open = false;
    await elementUpdated(el);
    expect(el.querySelector('.civ-action-sheet--open')).toBeNull();
  });
});

describe('civ-action-sheet accessibility', () => {
  it('exposes role="dialog" and aria-modal="true" on the panel', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);
    const panel = el.querySelector('.civ-action-sheet--open')!;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });

  it('uses the consumer-supplied label as the accessible name', async () => {
    const el = await fixture('<civ-action-sheet open label="Filter results"><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);
    const panel = el.querySelector('.civ-action-sheet--open')!;
    expect(panel.getAttribute('aria-label')).toBe('Filter results');
  });

  it('falls back to the generic i18n label when no label is supplied', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);
    const panel = el.querySelector('.civ-action-sheet--open')!;
    expect(panel.getAttribute('aria-label')).toBeTruthy();
    expect(panel.getAttribute('aria-label')!.length).toBeGreaterThan(0);
  });

  it('moves focus into the sheet when it opens', async () => {
    // Without this, keyboard users land nowhere when the sheet opens
    // and have to Tab manually to reach the content.
    const el = await fixture(`
      <civ-action-sheet>
        <button id="first-action">First action</button>
        <button id="second-action">Second action</button>
      </civ-action-sheet>
    `) as any;
    document.body.focus();
    el.open = true;
    await elementUpdated(el);
    // The update flush awaits one more microtask for the post-render focus.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 0));
    expect(document.activeElement?.id).toBe('first-action');
  });

  it('returns focus to the trigger element when closed', async () => {
    const trigger = document.createElement('button');
    trigger.id = 'sheet-trigger';
    trigger.textContent = 'Open sheet';
    document.body.appendChild(trigger);
    trigger.focus();
    const el = await fixture('<civ-action-sheet><p>Content</p></civ-action-sheet>') as any;
    el.open = true;
    await elementUpdated(el);
    el.open = false;
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(document.activeElement?.id).toBe('sheet-trigger');
    trigger.remove();
  });
});
