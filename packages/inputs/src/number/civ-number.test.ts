import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated, typeText } from '@civui/test-utils';
import './civ-number.js';
import type { CivNumber } from './civ-number.js';

afterEach(cleanupFixtures);

describe('civ-number', () => {
  it('renders an input with inputmode=numeric by default', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Quantity" name="qty"></civ-number>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('type')).toBe('text');
  });

  it('uses inputmode=decimal when allow-decimal is set', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Weight" allow-decimal></civ-number>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });

  it('renders the label', async () => {
    const el = await fixture<CivNumber>('<civ-number label="How many?" name="qty"></civ-number>');
    const label = el.querySelector('label')!;
    expect(label.textContent).toContain('How many?');
  });

  it('filters non-digit input to digits only when integers required', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const input = el.querySelector('input')!;
    await typeText(input, 'abc123def');
    await elementUpdated(el);
    expect(el.value).toBe('123');
    expect(input.value).toBe('123');
  });

  it('allows a single decimal point when allow-decimal is set', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Weight" allow-decimal></civ-number>');
    const input = el.querySelector('input')!;
    await typeText(input, '12.34');
    await elementUpdated(el);
    expect(el.value).toBe('12.34');
  });

  it('collapses multiple decimal points to one', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Weight" allow-decimal></civ-number>');
    const input = el.querySelector('input')!;
    input.value = '12.34.56';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('12.3456');
  });

  it('rejects decimal point when allow-decimal is false', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const input = el.querySelector('input')!;
    await typeText(input, '12.34');
    await elementUpdated(el);
    expect(el.value).toBe('1234');
  });

  it('rejects negative sign by default', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const input = el.querySelector('input')!;
    input.value = '-5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('5');
  });

  it('keeps a leading minus when allow-negative is set', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Temp" allow-negative></civ-number>');
    const input = el.querySelector('input')!;
    input.value = '-12';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('-12');
  });

  it('dispatches civ-input on every keystroke', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const handler = vi.fn();
    el.addEventListener('civ-input', handler as EventListener);
    const input = el.querySelector('input')!;
    input.value = '5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail.value).toBe('5');
  });

  it('dispatches civ-change on change event', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);
    el.value = '42';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sets error when value is below min on blur', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" min="18"></civ-number>');
    el.value = '15';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();
    expect(el.error).toContain('18');
  });

  it('sets error when value is above max on blur', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Score" max="100"></civ-number>');
    el.value = '150';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();
    expect(el.error).toContain('100');
  });

  it('clears range error when value comes back in range', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" min="0" max="120"></civ-number>');
    el.value = '999';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();

    el.value = '42';
    await elementUpdated(el);
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('skips range validation when value is empty', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" min="18"></civ-number>');
    el.value = '';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('normalizes trailing decimal point on blur', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Weight" allow-decimal></civ-number>');
    el.value = '12.';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.value).toBe('12');
  });

  it('renders prefix when set', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Count" prefix="#"></civ-number>');
    const prefix = el.querySelector('.civ-input-prefix');
    expect(prefix).not.toBeNull();
    expect(prefix!.textContent).toBe('#');
  });

  it('renders suffix when set', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Discount" suffix="%"></civ-number>');
    const suffix = el.querySelector('.civ-input-suffix');
    expect(suffix).not.toBeNull();
    expect(suffix!.textContent).toBe('%');
  });

  it('sets aria-valuemin and aria-valuemax', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" min="0" max="120"></civ-number>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('aria-valuemin')).toBe('0');
    expect(input.getAttribute('aria-valuemax')).toBe('120');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders required mark when required', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" required></civ-number>');
    expect(el.querySelector('.civ-required-mark')).not.toBeNull();
  });
});
