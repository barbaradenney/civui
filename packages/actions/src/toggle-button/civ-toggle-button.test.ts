import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-toggle-button.js';

afterEach(cleanupFixtures);

describe('civ-toggle-button', () => {
  it('renders with the unpressed label', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>');
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Show');
  });

  it('flips to the pressed label on click', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>') as any;
    (el.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(el.querySelector('button')!.textContent?.trim()).toBe('Hide');
    expect(el.pressed).toBe(true);
  });

  it('reflects `pressed` to the host attribute and aria-pressed on the button', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>') as any;
    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(el.hasAttribute('pressed')).toBe(false);

    el.pressed = true;
    await elementUpdated(el);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(el.hasAttribute('pressed')).toBe(true);
  });

  it('fires civ-toggle with the NEW pressed state on click', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>');
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ pressed: true });
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler.mock.calls[1][0].detail).toEqual({ pressed: false });
  });

  it('fires civ-toggle when `pressed` is set programmatically (controlled / two-way binding)', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>') as any;
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler);

    el.pressed = true;
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ pressed: true });

    el.pressed = false;
    expect(handler.mock.calls[1][0].detail).toEqual({ pressed: false });

    // Idempotent set does not re-fire.
    el.pressed = false;
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('does not fire civ-toggle for attribute-driven initial pressed state', async () => {
    // Mounting in the pressed state must not emit a spurious toggle.
    let fired = false;
    document.addEventListener('civ-toggle', () => { fired = true; }, { once: true });
    await fixture('<civ-toggle-button label="Show" pressed-label="Hide" pressed></civ-toggle-button>');
    expect(fired).toBe(false);
  });

  it('disabled buttons ignore clicks and do not fire civ-toggle', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" disabled></civ-toggle-button>') as any;
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).not.toHaveBeenCalled();
    expect(el.pressed).toBe(false);
  });

  it('defaults to secondary emphasis (civ-text-btn--chip class)', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--chip')).toBe(true);
  });

  it('renders primary emphasis class when emphasis="primary"', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" emphasis="primary"></civ-toggle-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--primary')).toBe(true);
  });

  it('renders tertiary emphasis as the inline alias class', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" emphasis="tertiary"></civ-toggle-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--inline')).toBe(true);
  });

  it('backward-compat: variant="chip" maps to civ-text-btn--chip', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" variant="chip"></civ-toggle-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--chip')).toBe(true);
  });

  it('backward-compat: variant="inline" maps to civ-text-btn--inline', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" variant="inline"></civ-toggle-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--inline')).toBe(true);
  });

  it('renders a leading icon when icon-start is set', async () => {
    const el = await fixture<HTMLElement>(
      '<civ-toggle-button label="Expand" pressed-label="Collapse" icon-start="chevron-down"></civ-toggle-button>'
    );
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-down');
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    // Icon precedes the label text in the button
    expect(el.querySelector('button')!.firstElementChild).toBe(icon);
  });

  it('omits the icon when icon-start is empty', async () => {
    const el = await fixture<HTMLElement>(
      '<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>'
    );
    expect(el.querySelector('civ-icon')).toBeNull();
  });
});
