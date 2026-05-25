import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-confirm-button.js';

afterEach(cleanupFixtures);

describe('civ-confirm-button', () => {
  it('renders a button with the resting label', async () => {
    const el = await fixture('<civ-confirm-button label="Copy"></civ-confirm-button>');
    const btn = el.querySelector('button')!;
    expect(btn.textContent?.trim()).toBe('Copy');
  });

  it('fires civ-confirm on click', async () => {
    const el = await fixture('<civ-confirm-button label="Copy"></civ-confirm-button>');
    const handler = vi.fn();
    el.addEventListener('civ-confirm', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('enters success state after click and shows the success label', async () => {
    const el = await fixture('<civ-confirm-button label="Copy" success-label="Copied"></civ-confirm-button>') as any;
    (el.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);
    const btn = el.querySelector('button')!;
    expect(btn.classList.contains('is-success')).toBe(true);
    expect(btn.textContent?.trim()).toBe('Copied');
  });

  it('reverts to the resting label after the success window expires', async () => {
    vi.useFakeTimers();
    const el = await fixture('<civ-confirm-button label="Copy" success-label="Copied" success-ms="500"></civ-confirm-button>');
    (el.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Copied');
    vi.advanceTimersByTime(500);
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Copy');
    vi.useRealTimers();
  });

  it('re-clicks during the success window restart the timer (no stacking)', async () => {
    vi.useFakeTimers();
    const el = await fixture('<civ-confirm-button label="Copy" success-label="Copied" success-ms="1000"></civ-confirm-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.click();
    await elementUpdated(el);
    vi.advanceTimersByTime(800); // 200 ms left
    btn.click();                  // restart timer
    vi.advanceTimersByTime(500); // 500 ms into the new timer — should still be in success
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Copied');
    vi.advanceTimersByTime(600); // total 1100 ms since the second click — past expiry
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Copy');
    vi.useRealTimers();
  });

  it('disabled buttons ignore clicks and do not fire civ-confirm', async () => {
    const el = await fixture('<civ-confirm-button label="Copy" disabled></civ-confirm-button>');
    const handler = vi.fn();
    el.addEventListener('civ-confirm', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('reset() cancels the in-flight success window', async () => {
    vi.useFakeTimers();
    const el = await fixture('<civ-confirm-button label="Copy" success-label="Copied" success-ms="1000"></civ-confirm-button>') as any;
    (el.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Copied');
    el.reset();
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Copy');
    vi.useRealTimers();
  });

  it('defaults to secondary emphasis (civ-text-btn--chip class)', async () => {
    const el = await fixture('<civ-confirm-button label="Copy"></civ-confirm-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--chip')).toBe(true);
  });

  it('renders primary emphasis class when emphasis="primary"', async () => {
    const el = await fixture('<civ-confirm-button label="Generate" emphasis="primary"></civ-confirm-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--primary')).toBe(true);
  });

  it('renders tertiary emphasis as the inline alias class', async () => {
    const el = await fixture('<civ-confirm-button label="Copy" emphasis="tertiary"></civ-confirm-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--inline')).toBe(true);
  });

  it('backward-compat: variant="chip" maps to civ-text-btn--chip', async () => {
    const el = await fixture('<civ-confirm-button label="Copy" variant="chip"></civ-confirm-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--chip')).toBe(true);
  });

  it('backward-compat: variant="inline" maps to civ-text-btn--inline', async () => {
    const el = await fixture('<civ-confirm-button label="Copy" variant="inline"></civ-confirm-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--inline')).toBe(true);
  });
});
