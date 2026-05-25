import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-input-chip.js';
import type { CivInputChip } from './civ-input-chip.js';

afterEach(cleanupFixtures);

const wrapper = (el: Element) =>
  el.querySelector<HTMLElement>('.civ-chip.civ-chip--input')!;
const label = (el: Element) =>
  el.querySelector<HTMLSpanElement>('.civ-chip__label')!;
const removeBtn = (el: Element) =>
  el.querySelector<HTMLButtonElement>('.civ-chip__remove')!;

describe('civ-input-chip', () => {
  it('renders label text', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip label="alice@example.com"></civ-input-chip>');
    expect(label(el).textContent).toBe('alice@example.com');
  });

  it('falls back to child text when label is empty', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip>#typescript</civ-input-chip>');
    expect(label(el).textContent).toBe('#typescript');
  });

  it('marks the wrapper role="presentation" so AT does not see the unused span as a control', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip label="bob@example.com"></civ-input-chip>');
    expect(wrapper(el).getAttribute('role')).toBe('presentation');
  });

  it('always renders a remove handle (input chip\'s defining trait)', async () => {
    // Unlike civ-filter-chip, removal is mandatory — there's no point
    // in an input chip without a way to revoke the input.
    const el = await fixture<CivInputChip>('<civ-input-chip label="X"></civ-input-chip>');
    expect(removeBtn(el)).not.toBeNull();
    expect(removeBtn(el).tagName).toBe('BUTTON');
  });

  it('does not render a check icon, action button, or count', async () => {
    // None of the filter-chip selection chrome belongs on an input
    // chip — it's a display token with one affordance: remove.
    const el = await fixture<CivInputChip>('<civ-input-chip label="X"></civ-input-chip>');
    expect(el.querySelector('.civ-chip__check')).toBeNull();
    expect(el.querySelector('.civ-chip__action')).toBeNull();
    expect(el.querySelector('.civ-chip__count')).toBeNull();
  });

  it('fires civ-remove with the value when × is clicked', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip label="bob@example.com" value="bob@example.com"></civ-input-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-remove', handler);

    removeBtn(el).click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'bob@example.com' });
  });

  it('does not fire civ-remove when disabled', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip label="X" disabled></civ-input-chip>');
    const handler = vi.fn();
    el.addEventListener('civ-remove', handler);

    removeBtn(el).click();
    await elementUpdated(el);

    expect(handler).not.toHaveBeenCalled();
  });

  it('remove button carries an accessible label interpolated from the chip label', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip label="bob@example.com"></civ-input-chip>');
    expect(removeBtn(el).getAttribute('aria-label')).toBe('Remove bob@example.com');
  });

  it('remove button falls back to a generic "Close" aria-label when the chip has no label or children', async () => {
    // Defensive guard against the empty-_text case: without this
    // fallback the aria-label would render as `'Remove '` (trailing
    // space) and screen readers would announce just "Remove, button"
    // with no identifier for what is being removed.
    const el = await fixture<CivInputChip>('<civ-input-chip></civ-input-chip>');
    expect(removeBtn(el).getAttribute('aria-label')).toBe('Close');
  });

  it('disabled attribute reflects to the host', async () => {
    const el = await fixture<CivInputChip>('<civ-input-chip label="X"></civ-input-chip>');
    el.disabled = true;
    await elementUpdated(el);
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(removeBtn(el).disabled).toBe(true);
  });

  describe('spacing', () => {
    it('default spacing does not apply --sm', async () => {
      const el = await fixture<CivInputChip>('<civ-input-chip label="X"></civ-input-chip>');
      expect(wrapper(el).className).not.toContain('civ-chip--sm');
    });

    it('applies civ-chip--sm when spacing="sm"', async () => {
      const el = await fixture<CivInputChip>('<civ-input-chip label="X" spacing="sm"></civ-input-chip>');
      expect(wrapper(el).className).toContain('civ-chip--sm');
    });
  });
});
