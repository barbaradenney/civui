import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-filter-chip.js';
import type { CivFilterChip } from './civ-filter-chip.js';

afterEach(cleanupFixtures);

const action = (el: Element) =>
  el.querySelector<HTMLButtonElement>('.civ-filter-chip__action')!;
const removeBtn = (el: Element) =>
  el.querySelector<HTMLButtonElement>('.civ-filter-chip__remove');
const wrapper = (el: Element) =>
  el.querySelector<HTMLElement>('.civ-filter-chip')!;

describe('civ-filter-chip', () => {
  it('renders label text in the action button', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare"></civ-filter-chip>');
    expect(action(el).textContent).toContain('Healthcare');
  });

  it('falls back to child text when label is empty', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip>Education</civ-filter-chip>');
    expect(action(el).textContent).toContain('Education');
  });

  it('renders the action as a real <button type="button">', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
    expect(action(el).tagName).toBe('BUTTON');
    expect(action(el).getAttribute('type')).toBe('button');
  });

  it('marks the wrapper role="presentation" so AT does not see a button-in-button', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable></civ-filter-chip>');
    expect(wrapper(el).getAttribute('role')).toBe('presentation');
  });

  it('does not nest interactive elements', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable></civ-filter-chip>');
    const action = el.querySelector('.civ-filter-chip__action')!;
    // The action button must not contain the remove button.
    expect(action.querySelector('.civ-filter-chip__remove')).toBeNull();
  });

  describe('toggle (default) ARIA mode', () => {
    it('reflects aria-pressed for unselected state', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(action(el).getAttribute('aria-pressed')).toBe('false');
      expect(action(el).hasAttribute('aria-checked')).toBe(false);
      expect(action(el).hasAttribute('role')).toBe(false);
    });

    it('reflects aria-pressed when selected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" selected></civ-filter-chip>');
      expect(action(el).getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('radio ARIA mode', () => {
    it('uses role="radio" + aria-checked when chip-role="radio"', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" variant="radio"></civ-filter-chip>');
      expect(action(el).getAttribute('role')).toBe('radio');
      expect(action(el).getAttribute('aria-checked')).toBe('false');
      expect(action(el).hasAttribute('aria-pressed')).toBe(false);
    });

    it('updates aria-checked on selection', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" variant="radio" selected></civ-filter-chip>');
      expect(action(el).getAttribute('aria-checked')).toBe('true');
    });

    it('clicking an already-selected radio is a no-op', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" variant="radio" selected></civ-filter-chip>');
      const handler = vi.fn();
      el.addEventListener('civ-change', handler);

      action(el).click();
      await elementUpdated(el);

      expect(el.selected).toBe(true);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  it('toggles selected state on click', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');

    action(el).click();
    await elementUpdated(el);
    expect(el.selected).toBe(true);

    action(el).click();
    await elementUpdated(el);
    expect(el.selected).toBe(false);
  });

  it('fires civ-change with value and selected state', async () => {
    const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" value="health"></civ-filter-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler);

    action(el).click();
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

    action(el).click();
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
      expect(removeBtn(off)).toBeNull();

      const on = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable></civ-filter-chip>');
      expect(removeBtn(on)).not.toBeNull();
    });

    it('renders the remove affordance as a real <button>', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable></civ-filter-chip>');
      expect(removeBtn(el)?.tagName).toBe('BUTTON');
      expect(removeBtn(el)?.getAttribute('type')).toBe('button');
    });

    it('fires civ-remove when × is clicked, without toggling', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" value="health" removable selected></civ-filter-chip>');
      const removeHandler = vi.fn();
      const changeHandler = vi.fn();
      el.addEventListener('civ-remove', removeHandler);
      el.addEventListener('civ-change', changeHandler);

      removeBtn(el)!.click();
      await elementUpdated(el);

      expect(removeHandler).toHaveBeenCalledTimes(1);
      expect(removeHandler.mock.calls[0][0].detail).toEqual({ value: 'health' });
      expect(changeHandler).not.toHaveBeenCalled();
      expect(el.selected).toBe(true);
    });

    it('remove button has accessible label', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" removable></civ-filter-chip>');
      expect(removeBtn(el)?.getAttribute('aria-label')).toBe('Remove Healthcare filter');
    });

    it('disables the remove button when chip is disabled', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable disabled></civ-filter-chip>');
      expect(removeBtn(el)?.disabled).toBe(true);
    });

    it('does not fire civ-remove when disabled', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" removable disabled></civ-filter-chip>');
      const handler = vi.fn();
      el.addEventListener('civ-remove', handler);

      removeBtn(el)!.click();
      await elementUpdated(el);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('chip-style', () => {
    it('defaults to secondary style on the wrapper', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(wrapper(el).className).toContain('civ-filter-chip--style-secondary');
      expect(wrapper(el).className).not.toContain('civ-filter-chip--style-primary');
    });

    it('applies primary style class on the wrapper', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" emphasis="primary"></civ-filter-chip>');
      expect(wrapper(el).className).toContain('civ-filter-chip--style-primary');
    });

    it('keeps style class when toggled selected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" emphasis="primary"></civ-filter-chip>');
      action(el).click();
      await elementUpdated(el);

      expect(wrapper(el).className).toContain('civ-filter-chip--style-primary');
      expect(wrapper(el).className).toContain('civ-filter-chip--selected');
    });
  });

  describe('spacing', () => {
    it('defaults to default spacing (no --sm class on wrapper)', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(wrapper(el).className).not.toContain('civ-filter-chip--sm');
    });

    it('applies civ-filter-chip--sm to wrapper when spacing="sm"', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" spacing="sm"></civ-filter-chip>');
      expect(wrapper(el).className).toContain('civ-filter-chip--sm');
    });
  });

  describe('icon-start', () => {
    it('renders no leading icon by default', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon')).toBeNull();
    });

    it('renders leading icon when icon-start is set and chip is unselected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" icon-start="person"></civ-filter-chip>');
      const icon = el.querySelector('.civ-filter-chip__icon');
      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('name')).toBe('person');
    });

    it('replaces leading icon with check when selected', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" icon-start="person" selected></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon')).toBeNull();
      expect(el.querySelector('.civ-filter-chip__check')).not.toBeNull();
    });

    it('toggles between leading icon and check on click', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" icon-start="person"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon')).not.toBeNull();

      action(el).click();
      await elementUpdated(el);
      expect(el.querySelector('.civ-filter-chip__icon')).toBeNull();
      expect(el.querySelector('.civ-filter-chip__check')).not.toBeNull();
    });
  });

  describe('icon-end', () => {
    it('renders no trailing icon by default', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test"></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon--end')).toBeNull();
    });

    it('renders trailing icon when icon-end is set', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" icon-end="chevron-down"></civ-filter-chip>');
      const icon = el.querySelector('.civ-filter-chip__icon--end');
      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('name')).toBe('chevron-down');
    });

    it('keeps icon-end when chip is selected (unlike icon-start)', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Test" icon-end="chevron-down" selected></civ-filter-chip>');
      expect(el.querySelector('.civ-filter-chip__icon--end')).not.toBeNull();
    });
  });

  describe('count suffix', () => {
    it('renders no count by default', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare"></civ-filter-chip>');
      expect(el.querySelector('civ-count')).toBeNull();
    });

    it('renders a civ-count when count is set', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" count="24"></civ-filter-chip>');
      const count = el.querySelector('civ-count')!;
      expect(count).not.toBeNull();
      expect(count.getAttribute('count')).toBe('24');
      // The count's own span wraps the number in parens for visual readability.
      expect(count.querySelector('.civ-count')?.textContent).toBe('(24)');
    });

    it('renders count of 0', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" count="0"></civ-filter-chip>');
      expect(el.querySelector('.civ-count')?.textContent).toBe('(0)');
    });

    it('updates count reactively', async () => {
      const el = await fixture<CivFilterChip>('<civ-filter-chip label="Healthcare" count="5"></civ-filter-chip>');
      el.count = 10;
      await elementUpdated(el);
      const civCount = el.querySelector('civ-count') as HTMLElement & { count: number };
      civCount.count = 10;
      await elementUpdated(civCount as never);
      expect(el.querySelector('.civ-count')?.textContent).toBe('(10)');
    });
  });
});
