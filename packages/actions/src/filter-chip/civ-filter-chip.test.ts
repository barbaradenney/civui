import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-filter-chip.js';
import type { CivFilterChip } from './civ-filter-chip.js';

afterEach(cleanupFixtures);

describe('civ-filter-chip', () => {
  it('renders label text', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare"></civ-filter-chip>');
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Healthcare');
  });

  it('falls back to child text when label is empty', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip>Education</civ-filter-chip>');
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Education');
  });

  it('renders as a <button> with type="button"', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
    const button = el.querySelector('button')!;
    expect(button).not.toBeNull();
    expect(button.getAttribute('type')).toBe('button');
  });

  it('reflects aria-pressed for unselected state', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
    const button = el.querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('reflects aria-pressed when selected', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" selected></civ-filter-chip>');
    const button = el.querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles selected state on click', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
    const button = el.querySelector('button')!;

    button.click();
    await elementUpdated(el);
    expect(el.selected).toBe(true);

    button.click();
    await elementUpdated(el);
    expect(el.selected).toBe(false);
  });

  it('fires civ-change with value and selected state', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" value="health"></civ-filter-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler);

    el.querySelector('button')!.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'health', selected: true });
  });

  it('renders a check icon when selected', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" selected></civ-filter-chip>');
    expect(el.querySelector('.civ-filter-chip__check')).not.toBeNull();
  });

  it('does not render a check icon when unselected', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
    expect(el.querySelector('.civ-filter-chip__check')).toBeNull();
  });

  it('does not toggle when disabled', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" disabled></civ-filter-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler);

    el.querySelector('button')!.click();
    await elementUpdated(el);

    expect(el.selected).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('reflects selected, removable, disabled attributes', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
    el.selected = true;
    el.removable = true;
    el.disabled = true;
    await elementUpdated(el);

    expect(el.hasAttribute('selected')).toBe(true);
    expect(el.hasAttribute('removable')).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  describe('removable mode', () => {
    it('renders remove affordance only when removable', async () => {
      const off = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(off.querySelector('.civ-filter-chip__remove')).toBeNull();

      const on = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable></civ-filter-chip>');
      expect(on.querySelector('.civ-filter-chip__remove')).not.toBeNull();
    });

    it('fires civ-remove when × is clicked, without toggling', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" value="health" removable selected></civ-filter-chip>');
      const removeHandler = vi.fn();
      const changeHandler = vi.fn();
      el.addEventListener('civ-remove', removeHandler);
      el.addEventListener('civ-change', changeHandler);

      const remove = el.querySelector('.civ-filter-chip__remove') as HTMLElement;
      remove.click();
      await elementUpdated(el);

      expect(removeHandler).toHaveBeenCalledTimes(1);
      expect(removeHandler.mock.calls[0][0].detail).toEqual({ value: 'health' });
      expect(changeHandler).not.toHaveBeenCalled();
      expect(el.selected).toBe(true);
    });

    it('fires civ-remove on Enter key', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" value="t" removable></civ-filter-chip>');
      const handler = vi.fn();
      el.addEventListener('civ-remove', handler);

      const remove = el.querySelector('.civ-filter-chip__remove') as HTMLElement;
      remove.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await elementUpdated(el);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('fires civ-remove on Space key', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" value="t" removable></civ-filter-chip>');
      const handler = vi.fn();
      el.addEventListener('civ-remove', handler);

      const remove = el.querySelector('.civ-filter-chip__remove') as HTMLElement;
      remove.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await elementUpdated(el);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('remove button has accessible label', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" removable></civ-filter-chip>');
      const remove = el.querySelector('.civ-filter-chip__remove')!;
      expect(remove.getAttribute('aria-label')).toBe('Remove Healthcare filter');
    });

    it('does not fire civ-remove when disabled', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable disabled></civ-filter-chip>');
      const handler = vi.fn();
      el.addEventListener('civ-remove', handler);

      (el.querySelector('.civ-filter-chip__remove') as HTMLElement).click();
      await elementUpdated(el);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('chip-style', () => {
    it('defaults to secondary style', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      const button = el.querySelector('button')!;
      expect(button.className).toContain('civ-filter-chip--style-secondary');
      expect(button.className).not.toContain('civ-filter-chip--style-primary');
    });

    it('applies primary style class', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" chip-style="primary"></civ-filter-chip>');
      const button = el.querySelector('button')!;
      expect(button.className).toContain('civ-filter-chip--style-primary');
    });

    it('keeps style class when toggled selected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" chip-style="primary"></civ-filter-chip>');
      el.querySelector('button')!.click();
      await elementUpdated(el);

      const button = el.querySelector('button')!;
      expect(button.className).toContain('civ-filter-chip--style-primary');
      expect(button.className).toContain('civ-filter-chip--selected');
    });
  });

  describe('spacing', () => {
    it('defaults to default spacing (no --sm class)', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      const button = el.querySelector('button')!;
      expect(button.className).not.toContain('civ-filter-chip--sm');
    });

    it('applies civ-filter-chip--sm when spacing="sm"', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" spacing="sm"></civ-filter-chip>');
      const button = el.querySelector('button')!;
      expect(button.className).toContain('civ-filter-chip--sm');
    });
  });

  describe('icon-start', () => {
    it('renders no leading icon by default', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon')).toBeNull();
    });

    it('renders leading icon when icon-start is set and chip is unselected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" icon-start="medical"></civ-filter-chip>');
      const icon = el.querySelector('.civ-filter-chip__icon');
      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('name')).toBe('medical');
    });

    it('replaces leading icon with check when selected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" icon-start="medical" selected></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon')).toBeNull();
      expect(el.querySelector('.civ-filter-chip__check')).not.toBeNull();
    });

    it('toggles between leading icon and check on click', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" icon-start="medical"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon')).not.toBeNull();
      expect(el.querySelector('.civ-filter-chip__check')).toBeNull();

      el.querySelector('button')!.click();
      await elementUpdated(el);
      expect(el.querySelector('.civ-filter-chip__icon')).toBeNull();
      expect(el.querySelector('.civ-filter-chip__check')).not.toBeNull();
    });
  });

  describe('count suffix', () => {
    it('renders no count by default', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__count')).toBeNull();
    });

    it('renders count in parens when set', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" count="24"></civ-filter-chip>');
      const count = el.querySelector('.civ-filter-chip__count')!;
      expect(count.textContent).toBe('(24)');
    });

    it('renders count of 0', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" count="0"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__count')?.textContent).toBe('(0)');
    });

    it('updates count reactively', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" count="5"></civ-filter-chip>');
      el.count = 10;
      await elementUpdated(el);
      expect(el.querySelector('.civ-filter-chip__count')?.textContent).toBe('(10)');
    });
  });
});
