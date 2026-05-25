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

  describe('loading state', () => {
    it('renders a civ-spinner in place of the leading icon when loading', async () => {
      const el = await fixture('<civ-text-button loading icon-start="chevron-down" label="Generate"></civ-text-button>');
      expect(el.querySelector('civ-spinner')).not.toBeNull();
      expect(el.querySelector('civ-icon[name="chevron-down"]')).toBeNull();
    });

    it('renders the spinner at size="xs" to match the text-button scale', async () => {
      const el = await fixture('<civ-text-button loading label="Generate"></civ-text-button>');
      const spinner = el.querySelector('civ-spinner') as HTMLElement;
      expect(spinner.getAttribute('size')).toBe('xs');
      expect(spinner.hasAttribute('decorative')).toBe(true);
    });

    it('disables the inner button while loading', async () => {
      const el = await fixture('<civ-text-button loading label="Generate"></civ-text-button>');
      expect((el.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('sets aria-busy on the button while loading', async () => {
      const el = await fixture('<civ-text-button loading label="Generate"></civ-text-button>');
      expect(el.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
    });

    it('swaps the accessible name to loadingLabel while loading', async () => {
      const el = await fixture(
        '<civ-text-button loading loading-label="Generating…" label="Generate"></civ-text-button>',
      );
      expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Generating…');
    });

    it('does not fire civ-click while loading', async () => {
      const el = await fixture('<civ-text-button loading label="Generate"></civ-text-button>');
      const handler = vi.fn();
      el.addEventListener('civ-click', handler);
      el.querySelector('button')!.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('removes aria-busy and aria-label when loading flips back to false', async () => {
      const el = await fixture(
        '<civ-text-button loading loading-label="Generating…" label="Generate"></civ-text-button>',
      ) as any;
      expect(el.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
      el.loading = false;
      await elementUpdated(el);
      expect(el.querySelector('button')!.hasAttribute('aria-busy')).toBe(false);
      expect(el.querySelector('button')!.hasAttribute('aria-label')).toBe(false);
    });
  });
});
