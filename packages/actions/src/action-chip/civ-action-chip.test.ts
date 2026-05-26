import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-action-chip.js';
import type { CivActionChip } from './civ-action-chip.js';

afterEach(cleanupFixtures);

const btn = (el: Element) =>
  el.querySelector<HTMLButtonElement>('button.civ-chip.civ-chip--action')!;

describe('civ-action-chip', () => {
  it('renders label text in the button', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip label="Last 30 days"></civ-action-chip>');
    expect(btn(el).textContent).toContain('Last 30 days');
  });

  it('falls back to child text when label is empty', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip>This week</civ-action-chip>');
    expect(btn(el).textContent).toContain('This week');
  });

  it('renders as a real <button type="button"> (not a wrapper + nested button)', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip label="Search"></civ-action-chip>');
    // The chip IS the button — no wrapping span and no nested button.
    expect(btn(el).tagName).toBe('BUTTON');
    expect(btn(el).getAttribute('type')).toBe('button');
    expect(btn(el).querySelector('button')).toBeNull();
  });

  it('does not render aria-pressed / aria-checked / role (no toggle semantics)', async () => {
    // Distinguishing trait vs civ-filter-chip — action chip has no
    // state, so no pressed/checked attribute should appear.
    const el = await fixture<CivActionChip>('<civ-action-chip label="X"></civ-action-chip>');
    expect(btn(el).hasAttribute('aria-pressed')).toBe(false);
    expect(btn(el).hasAttribute('aria-checked')).toBe(false);
    expect(btn(el).hasAttribute('role')).toBe(false);
  });

  it('does not render a check icon or remove button (no selection state)', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip label="X"></civ-action-chip>');
    expect(el.querySelector('.civ-chip__check')).toBeNull();
    expect(el.querySelector('.civ-chip__remove')).toBeNull();
  });

  it('fires civ-click with the value on click', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip label="Last 30 days" value="last-30"></civ-action-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-click', handler);

    btn(el).click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'last-30' });
  });

  it('does not fire civ-click when disabled', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip label="X" disabled></civ-action-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-click', handler);

    btn(el).click();
    await elementUpdated(el);

    expect(handler).not.toHaveBeenCalled();
  });

  it('disabled attribute reflects to the host', async () => {
    const el = await fixture<CivActionChip>('<civ-action-chip label="X"></civ-action-chip>');
    el.disabled = true;
    await elementUpdated(el);
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(btn(el).disabled).toBe(true);
  });

  describe('iconStart / iconEnd', () => {
    it('renders a leading icon resolving to the iconStart name', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="Filter" icon-start="add"></civ-action-chip>');
      const icon = el.querySelector('civ-icon.civ-chip__icon');
      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('name')).toBe('add');
    });

    it('renders a trailing icon resolving to the iconEnd name', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="Sort" icon-end="arrow-down"></civ-action-chip>');
      const icon = el.querySelector('civ-icon.civ-chip__icon--end');
      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('name')).toBe('arrow-down');
    });
  });

  describe('count', () => {
    it('renders an optional count via civ-count', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="Inbox" count="12"></civ-action-chip>');
      expect(el.querySelector('.civ-chip__count')).not.toBeNull();
    });

    it('hides the count when null', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="Inbox"></civ-action-chip>');
      expect(el.querySelector('.civ-chip__count')).toBeNull();
    });
  });

  describe('spacing', () => {
    it('default spacing does not apply --sm or --lg', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="X"></civ-action-chip>');
      expect(btn(el).className).not.toContain('civ-chip--sm');
      expect(btn(el).className).not.toContain('civ-chip--lg');
    });

    it('applies civ-chip--sm when spacing="sm"', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="X" spacing="sm"></civ-action-chip>');
      expect(btn(el).className).toContain('civ-chip--sm');
    });

    it('applies civ-chip--lg when spacing="lg" (WCAG 2.5.5 AAA target)', async () => {
      const el = await fixture<CivActionChip>('<civ-action-chip label="X" spacing="lg"></civ-action-chip>');
      expect(btn(el).className).toContain('civ-chip--lg');
    });
  });
});
