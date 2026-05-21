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

  it('disabled buttons ignore clicks and do not fire civ-toggle', async () => {
    const el = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" disabled></civ-toggle-button>') as any;
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).not.toHaveBeenCalled();
    expect(el.pressed).toBe(false);
  });

  it('honors the variant prop on the rendered button class', async () => {
    const inline = await fixture('<civ-toggle-button label="Show" pressed-label="Hide"></civ-toggle-button>');
    expect(inline.querySelector('button')!.classList.contains('civ-text-btn--inline')).toBe(true);
    const chip = await fixture('<civ-toggle-button label="Show" pressed-label="Hide" variant="chip"></civ-toggle-button>');
    expect(chip.querySelector('button')!.classList.contains('civ-text-btn--chip')).toBe(true);
  });
});
