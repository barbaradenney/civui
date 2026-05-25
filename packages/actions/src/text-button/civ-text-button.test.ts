import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-text-button.js';

afterEach(cleanupFixtures);

describe('civ-text-button', () => {
  it('renders a <button> with the label', async () => {
    const el = await fixture('<civ-text-button label="Show more"></civ-text-button>');
    const btn = el.querySelector('button')!;
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe('Show more');
  });

  it('defaults to secondary emphasis (civ-text-btn--chip alias)', async () => {
    const el = await fixture('<civ-text-button label="Open"></civ-text-button>');
    const btn = el.querySelector('button')!;
    expect(btn.classList.contains('civ-text-btn')).toBe(true);
    expect(btn.classList.contains('civ-text-btn--chip')).toBe(true);
  });

  it('renders primary emphasis class when emphasis="primary"', async () => {
    const el = await fixture('<civ-text-button label="Generate" emphasis="primary"></civ-text-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--primary')).toBe(true);
  });

  it('renders tertiary emphasis as the inline alias class', async () => {
    const el = await fixture('<civ-text-button label="Today" emphasis="tertiary"></civ-text-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--inline')).toBe(true);
  });

  it('adds the --sm modifier when spacing="sm"', async () => {
    const el = await fixture('<civ-text-button label="More" spacing="sm"></civ-text-button>');
    expect(el.querySelector('button')!.classList.contains('civ-text-btn--sm')).toBe(true);
  });

  it('fires civ-click on activation', async () => {
    const el = await fixture('<civ-text-button label="Open"></civ-text-button>');
    const handler = vi.fn();
    el.addEventListener('civ-click', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('disabled buttons do not fire civ-click', async () => {
    const el = await fixture('<civ-text-button label="Open" disabled></civ-text-button>');
    const handler = vi.fn();
    el.addEventListener('civ-click', handler);
    (el.querySelector('button') as HTMLButtonElement).click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('renders a leading icon when icon-start is set', async () => {
    const el = await fixture('<civ-text-button label="Refresh" icon-start="chevron-down"></civ-text-button>') as any;
    await elementUpdated(el);
    expect(el.querySelector('civ-icon[name="chevron-down"]')).toBeTruthy();
  });

  it('renders a trailing icon when icon-end is set', async () => {
    const el = await fixture('<civ-text-button label="Next" icon-end="arrow-right"></civ-text-button>') as any;
    await elementUpdated(el);
    expect(el.querySelector('civ-icon[name="arrow-right"]')).toBeTruthy();
  });

  it('honors the type attribute on the rendered <button>', async () => {
    const el = await fixture('<civ-text-button label="Save" type="submit"></civ-text-button>');
    expect((el.querySelector('button') as HTMLButtonElement).type).toBe('submit');
  });
});
