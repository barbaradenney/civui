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
});
