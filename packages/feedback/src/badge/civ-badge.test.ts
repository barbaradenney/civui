import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-badge.js';
import type { CivBadge } from './civ-badge.js';

afterEach(cleanupFixtures);

// Tailwind content-scanner protection (`pnpm lint:purged-variants`).
// civ-badge builds variant classes via template literal:
//   civ-badge--error  civ-badge--info  civ-badge--success  civ-badge--warning

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

  describe('icons', () => {
    it('renders no icon by default', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x" variant="success"></civ-badge>');
      expect(el.querySelector('.civ-badge__icon')).toBeNull();
      expect(el.querySelector('.civ-badge__icon--end')).toBeNull();
      expect(el.querySelector('.civ-badge')!.className).not.toContain('civ-badge--with-icon');
    });

    it('renders the variant default icon when with-icon is set', async () => {
      const cases: Array<[string, string]> = [
        ['success', 'check-circle'],
        ['warning', 'warning'],
        ['error', 'error'],
        ['info', 'info'],
      ];
      for (const [variant, expectedIcon] of cases) {
        const el = await fixture<CivBadge>(
          `<civ-badge label="x" variant="${variant}" with-icon></civ-badge>`
        );
        const icon = el.querySelector('.civ-badge__icon');
        expect(icon, `variant=${variant}`).not.toBeNull();
        expect(icon!.getAttribute('name')).toBe(expectedIcon);
      }
    });

    it('renders no auto-icon for the neutral variant', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="Draft" variant="neutral" with-icon></civ-badge>');
      expect(el.querySelector('.civ-badge__icon')).toBeNull();
    });

    it('explicit icon-start overrides the with-icon default', async () => {
      const el = await fixture<CivBadge>(
        '<civ-badge label="x" variant="success" with-icon icon-start="star"></civ-badge>'
      );
      const icon = el.querySelector('.civ-badge__icon');
      expect(icon?.getAttribute('name')).toBe('star');
    });

    it('renders icon-start without with-icon', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x" icon-start="bell"></civ-badge>');
      const icon = el.querySelector('.civ-badge__icon');
      expect(icon?.getAttribute('name')).toBe('bell');
    });

    it('renders icon-end alongside the label', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="x" icon-end="chevron-right"></civ-badge>');
      const endIcon = el.querySelector('.civ-badge__icon--end');
      expect(endIcon).not.toBeNull();
      expect(endIcon!.getAttribute('name')).toBe('chevron-right');
    });

    it('renders both icon-start and icon-end', async () => {
      const el = await fixture<CivBadge>(
        '<civ-badge label="Approved" variant="success" with-icon icon-end="chevron-right"></civ-badge>'
      );
      const icons = el.querySelectorAll('.civ-badge__icon');
      expect(icons.length).toBe(2);
      expect(icons[0].getAttribute('name')).toBe('check-circle');
      expect(icons[1].getAttribute('name')).toBe('chevron-right');
    });

    it('adds civ-badge--with-icon class when any icon is present', async () => {
      const a = await fixture<CivBadge>('<civ-badge label="x" with-icon variant="success"></civ-badge>');
      expect(a.querySelector('.civ-badge')!.className).toContain('civ-badge--with-icon');

      const b = await fixture<CivBadge>('<civ-badge label="x" icon-end="chevron-right"></civ-badge>');
      expect(b.querySelector('.civ-badge')!.className).toContain('civ-badge--with-icon');
    });

    it('does not render icons in dot mode', async () => {
      const el = await fixture<CivBadge>('<civ-badge dot label="Unread" variant="error" with-icon></civ-badge>');
      expect(el.querySelector('.civ-badge__icon')).toBeNull();
    });

    it('marks icons aria-hidden so the label remains the accessible name', async () => {
      const el = await fixture<CivBadge>('<civ-badge label="Approved" variant="success" with-icon></civ-badge>');
      expect(el.querySelector('.civ-badge__icon')!.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
