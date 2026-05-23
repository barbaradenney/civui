import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-back-to-top.js';
import type { CivBackToTop } from './civ-back-to-top.js';

afterEach(cleanupFixtures);

describe('civ-back-to-top', () => {
  it('renders a <button> with aria-label and title from label', async () => {
    const el = await fixture<CivBackToTop>(
      `<civ-back-to-top label="Scroll to top"></civ-back-to-top>`
    );
    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Scroll to top');
    expect(btn.getAttribute('title')).toBe('Scroll to top');
  });

  it('defaults the label to "Back to top"', async () => {
    const el = await fixture<CivBackToTop>(`<civ-back-to-top></civ-back-to-top>`);
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Back to top');
  });

  it('starts hidden so the element is invisible until the user scrolls', async () => {
    const el = await fixture<CivBackToTop>(`<civ-back-to-top></civ-back-to-top>`);
    expect(el.hidden).toBe(true);
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('installs a scroll sentinel at the threshold position', async () => {
    await fixture<CivBackToTop>(
      `<civ-back-to-top threshold="500"></civ-back-to-top>`
    );
    const sentinel = document.querySelector(
      '[data-civ-back-to-top-sentinel]'
    ) as HTMLElement | null;
    expect(sentinel).not.toBeNull();
    expect(sentinel!.style.top).toBe('500px');
  });

  it('re-positions the sentinel when threshold changes', async () => {
    const el = await fixture<CivBackToTop>(
      `<civ-back-to-top threshold="200"></civ-back-to-top>`
    );
    el.threshold = 900;
    await elementUpdated(el);
    const sentinel = document.querySelector(
      '[data-civ-back-to-top-sentinel]'
    ) as HTMLElement | null;
    expect(sentinel!.style.top).toBe('900px');
  });

  it('removes the sentinel on disconnect', async () => {
    const el = await fixture<CivBackToTop>(`<civ-back-to-top></civ-back-to-top>`);
    expect(document.querySelector('[data-civ-back-to-top-sentinel]')).not.toBeNull();
    el.remove();
    expect(document.querySelector('[data-civ-back-to-top-sentinel]')).toBeNull();
  });

  it('scrolls to top on click', async () => {
    const el = await fixture<CivBackToTop>(`<civ-back-to-top></civ-back-to-top>`);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    el.querySelector('button')!.click();
    expect(scrollTo).toHaveBeenCalled();
    const arg = scrollTo.mock.calls[0]![0] as ScrollToOptions;
    expect(arg.top).toBe(0);
    scrollTo.mockRestore();
  });
});
