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

  it('fires civ-action-sheet-close on Escape', async () => {
    const el = await fixture('<civ-action-sheet open><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-action-sheet-close', handler as EventListener);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire close on Escape when closed', async () => {
    const el = await fixture('<civ-action-sheet><p>Content</p></civ-action-sheet>');
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-action-sheet-close', handler as EventListener);

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
    el.addEventListener('civ-action-sheet-close', handler as EventListener);

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
