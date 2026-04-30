import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-count.js';
import type { CivCount } from './civ-count.js';

afterEach(cleanupFixtures);

describe('civ-count', () => {
  it('renders the count number', async () => {
    const el = await fixture<CivCount>('<civ-count count="24"></civ-count>');
    const span = el.querySelector('.civ-count')!;
    expect(span.textContent).toBe('24');
  });

  it('renders 0 (does not skip)', async () => {
    const el = await fixture<CivCount>('<civ-count count="0"></civ-count>');
    const span = el.querySelector('.civ-count')!;
    expect(span.textContent).toBe('0');
  });

  it('renders nothing when count is null', async () => {
    const el = await fixture<CivCount>('<civ-count></civ-count>');
    expect(el.querySelector('.civ-count')).toBeNull();
  });

  it('renders nothing when count is NaN', async () => {
    const el = await fixture<CivCount>('<civ-count></civ-count>');
    el.count = Number('not a number'); // NaN
    await elementUpdated(el);
    expect(el.querySelector('.civ-count')).toBeNull();
  });

  it('renders {max}+ when count exceeds default max of 99', async () => {
    const el = await fixture<CivCount>('<civ-count count="150"></civ-count>');
    expect(el.querySelector('.civ-count')!.textContent).toBe('99+');
  });

  it('respects custom max prop', async () => {
    const el = await fixture<CivCount>('<civ-count count="25" max="9"></civ-count>');
    expect(el.querySelector('.civ-count')!.textContent).toBe('9+');
  });

  it('renders exact count when at the max threshold', async () => {
    const el = await fixture<CivCount>('<civ-count count="99"></civ-count>');
    expect(el.querySelector('.civ-count')!.textContent).toBe('99');
  });

  it('updates rendered text reactively', async () => {
    const el = await fixture<CivCount>('<civ-count count="3"></civ-count>');
    expect(el.querySelector('.civ-count')!.textContent).toBe('3');

    el.count = 7;
    await elementUpdated(el);
    expect(el.querySelector('.civ-count')!.textContent).toBe('7');
  });

  describe('count-style', () => {
    it('defaults to secondary style', async () => {
      const el = await fixture<CivCount>('<civ-count count="5"></civ-count>');
      const span = el.querySelector('.civ-count')!;
      expect(span.className).toContain('civ-count--style-secondary');
      expect(span.className).not.toContain('civ-count--style-primary');
    });

    it('applies primary style class', async () => {
      const el = await fixture<CivCount>('<civ-count count="5" count-style="primary"></civ-count>');
      expect(el.querySelector('.civ-count')!.className).toContain('civ-count--style-primary');
    });
  });

  describe('variant', () => {
    it('defaults to neutral', async () => {
      const el = await fixture<CivCount>('<civ-count count="5"></civ-count>');
      expect(el.querySelector('.civ-count')!.className).toContain('civ-count--neutral');
    });

    it('applies semantic variant classes', async () => {
      for (const variant of ['info', 'warning', 'error', 'success', 'neutral'] as const) {
        const el = await fixture<CivCount>(`<civ-count count="5" variant="${variant}"></civ-count>`);
        expect(el.querySelector('.civ-count')!.className).toContain(`civ-count--${variant}`);
      }
    });
  });

  describe('spacing', () => {
    it('defaults to default spacing (no --sm)', async () => {
      const el = await fixture<CivCount>('<civ-count count="5"></civ-count>');
      expect(el.querySelector('.civ-count')!.className).not.toContain('civ-count--sm');
    });

    it('applies civ-count--sm when spacing="sm"', async () => {
      const el = await fixture<CivCount>('<civ-count count="5" spacing="sm"></civ-count>');
      expect(el.querySelector('.civ-count')!.className).toContain('civ-count--sm');
    });
  });

  describe('overlay', () => {
    it('does not add overlay class by default', async () => {
      const el = await fixture<CivCount>('<civ-count count="5"></civ-count>');
      expect(el.querySelector('.civ-count')!.className).not.toContain('civ-count--overlay');
    });

    it('adds civ-count--overlay class when overlay is set', async () => {
      const el = await fixture<CivCount>('<civ-count count="5" overlay></civ-count>');
      expect(el.querySelector('.civ-count')!.className).toContain('civ-count--overlay');
    });

    it('reflects overlay attribute', async () => {
      const el = await fixture<CivCount>('<civ-count count="5" overlay></civ-count>');
      expect(el.hasAttribute('overlay')).toBe(true);
    });
  });

  describe('aria-live', () => {
    it('has no role or aria-live by default (live="off")', async () => {
      const el = await fixture<CivCount>('<civ-count count="5"></civ-count>');
      const span = el.querySelector('.civ-count')!;
      expect(span.hasAttribute('role')).toBe(false);
      expect(span.hasAttribute('aria-live')).toBe(false);
    });

    it('adds role="status" + aria-live="polite" when live="polite"', async () => {
      const el = await fixture<CivCount>('<civ-count count="5" live="polite"></civ-count>');
      const span = el.querySelector('.civ-count')!;
      expect(span.getAttribute('role')).toBe('status');
      expect(span.getAttribute('aria-live')).toBe('polite');
    });

    it('adds role="status" + aria-live="assertive" when live="assertive"', async () => {
      const el = await fixture<CivCount>('<civ-count count="5" live="assertive"></civ-count>');
      const span = el.querySelector('.civ-count')!;
      expect(span.getAttribute('role')).toBe('status');
      expect(span.getAttribute('aria-live')).toBe('assertive');
    });
  });
});
