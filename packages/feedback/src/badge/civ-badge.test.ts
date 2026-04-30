import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-badge.js';
import type { CivBadge } from './civ-badge.js';

afterEach(cleanupFixtures);

describe('civ-badge', () => {
  it('renders label text', async () => {
    const el = await fixture<CivBadge>('<civ-badge label="Approved" variant="success"></civ-badge>');
    const badge = el.querySelector('.civ-badge')!;
    expect(badge.textContent).toBe('Approved');
  });

  it('defaults to neutral variant', async () => {
    const el = await fixture<CivBadge>('<civ-badge label="Draft"></civ-badge>');
    expect(el.querySelector('.civ-badge')!.className).toContain('civ-badge--neutral');
  });

  it('applies semantic variant classes', async () => {
    for (const variant of ['info', 'warning', 'error', 'success', 'neutral'] as const) {
      const el = await fixture<CivBadge>(`<civ-badge label="x" variant="${variant}"></civ-badge>`);
      expect(el.querySelector('.civ-badge')!.className).toContain(`civ-badge--${variant}`);
    }
  });

  it('always has role="status" in label mode', async () => {
    const el = await fixture<CivBadge>('<civ-badge label="Pending"></civ-badge>');
    expect(el.querySelector('[role="status"]')).not.toBeNull();
  });

  it('renders empty when label is empty', async () => {
    const el = await fixture<CivBadge>('<civ-badge></civ-badge>');
    expect(el.querySelector('.civ-badge')!.textContent?.trim()).toBe('');
  });

  it('renders dot mode with no text content', async () => {
    const el = await fixture<CivBadge>('<civ-badge dot label="Unread" variant="error"></civ-badge>');
    const badge = el.querySelector('.civ-badge')!;
    expect(badge.className).toContain('civ-badge--dot');
    expect(badge.textContent?.trim()).toBe('');
  });

  it('uses label as aria-label in dot mode and keeps role=status', async () => {
    const el = await fixture<CivBadge>('<civ-badge dot label="3 unread messages"></civ-badge>');
    const badge = el.querySelector('.civ-badge')!;
    expect(badge.getAttribute('aria-label')).toBe('3 unread messages');
    expect(badge.getAttribute('role')).toBe('status');
  });

  it('marks dot aria-hidden (no role=status, no empty live region) when label is missing', async () => {
    const el = await fixture<CivBadge>('<civ-badge dot></civ-badge>');
    const badge = el.querySelector('.civ-badge')!;
    expect(badge.getAttribute('aria-hidden')).toBe('true');
    expect(badge.hasAttribute('role')).toBe(false);
    expect(badge.hasAttribute('aria-label')).toBe(false);
  });

  it('reflects dot attribute', async () => {
    const el = await fixture<CivBadge>('<civ-badge dot></civ-badge>');
    expect(el.hasAttribute('dot')).toBe(true);
  });

  describe('badge-style', () => {
    it('defaults to secondary style', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x" variant="success"></civ-badge>');
      const badge = el.querySelector('.civ-badge')!;
      expect(badge.className).toContain('civ-badge--style-secondary');
      expect(badge.className).not.toContain('civ-badge--style-primary');
    });

    it('applies primary style class', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x" variant="error" badge-style="primary"></civ-badge>');
      expect(el.querySelector('.civ-badge')!.className).toContain('civ-badge--style-primary');
    });

    it('applies primary style for all variants', async () => {
      for (const variant of ['info', 'warning', 'error', 'success', 'neutral'] as const) {
        const el = await fixture<CivBadge>(
          `<civ-badge label="x" variant="${variant}" badge-style="primary"></civ-badge>`
        );
        const badge = el.querySelector('.civ-badge')!;
        expect(badge.className).toContain(`civ-badge--${variant}`);
        expect(badge.className).toContain('civ-badge--style-primary');
      }
    });
  });

  describe('spacing', () => {
    it('defaults to default spacing (no --sm class)', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x"></civ-badge>');
      expect(el.querySelector('.civ-badge')!.className).not.toContain('civ-badge--sm');
    });

    it('applies civ-badge--sm when spacing="sm"', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x" spacing="sm"></civ-badge>');
      expect(el.querySelector('.civ-badge')!.className).toContain('civ-badge--sm');
    });
  });

  describe('overlay', () => {
    it('does not add overlay class by default', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x"></civ-badge>');
      expect(el.querySelector('.civ-badge')!.className).not.toContain('civ-badge--overlay');
    });

    it('adds civ-badge--overlay class when overlay is set', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="New" variant="error" overlay></civ-badge>');
      expect(el.querySelector('.civ-badge')!.className).toContain('civ-badge--overlay');
    });

    it('reflects overlay attribute', async () => {
      const el = await fixture<CivBadge>('<civ-badge overlay></civ-badge>');
      expect(el.hasAttribute('overlay')).toBe(true);
    });

    it('combines with dot mode', async () => {
      const el = await fixture<CivBadge>('<civ-badge dot overlay variant="error" label="Unread"></civ-badge>');
      const badge = el.querySelector('.civ-badge')!;
      expect(badge.className).toContain('civ-badge--dot');
      expect(badge.className).toContain('civ-badge--overlay');
    });
  });
});
