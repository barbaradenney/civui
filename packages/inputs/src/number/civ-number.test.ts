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

  it('clears value and range error on formResetCallback', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" name="age" min="0" max="120"></civ-number>');
    el.value = '999';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('');
    expect(el.error).toBe('');
  });

  it('re-runs range validation on blur after min changes at runtime', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" min="0"></civ-number>');
    el.value = '5';
    await elementUpdated(el);
    el.querySelector('input')!.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBe('');

    el.min = 18;
    await elementUpdated(el);
    el.querySelector('input')!.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();
  });

  it('accepts boundary values equal to min and max', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Age" min="18" max="65"></civ-number>');
    const input = el.querySelector('input')!;

    el.value = '18';
    await elementUpdated(el);
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBe('');

    el.value = '65';
    await elementUpdated(el);
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('clears lone "-" / "." / "-." on blur instead of producing NaN range error', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Temp" min="-100" max="100" allow-decimal allow-negative></civ-number>');
    const input = el.querySelector('input')!;
    el.value = '-';
    await elementUpdated(el);
    input.dispatchEvent(new Event('blur'));
    await elementUpdated(el);
    expect(el.value).toBe('');
    expect(el.error).toBe('');
  });

  it('preserves caret position after filter shortens the value', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const input = el.querySelector('input')!;
    // Simulate paste of "1a2b3" with caret at end — filter strips to "123"
    input.value = '1a2b3';
    input.setSelectionRange(5, 5);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(input.value).toBe('123');
    expect(input.selectionStart).toBe(3);
  });

  it('does not filter mid-IME composition (isComposing flag)', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty"></civ-number>');
    const input = el.querySelector('input')!;
    input.value = 'あ12';
    const ev = new (globalThis as any).InputEvent('input', { bubbles: true, isComposing: true });
    input.dispatchEvent(ev);
    await elementUpdated(el);
    // Should NOT have been filtered while composing.
    expect(input.value).toBe('あ12');
  });

  it('drops a second minus sign mid-string when allow-negative is set', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Temp" allow-negative></civ-number>');
    const input = el.querySelector('input')!;
    input.value = '-1-2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    // Only the leading minus is kept; inner minus is stripped along with
    // every other non-digit. Result: "-12".
    expect(el.value).toBe('-12');
  });
});

describe('civ-number keyboard step (ArrowUp / ArrowDown)', () => {
  function pressKey(input: HTMLInputElement, key: string) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  it('ArrowUp increments by step (default 1)', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty" value="3"></civ-number>');
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    pressKey(input, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('4');
  });

  it('ArrowDown decrements by step', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty" value="3"></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowDown');
    await elementUpdated(el);
    expect(el.value).toBe('2');
  });

  it('honors custom step', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Hours" value="2.5" step="0.5" allow-decimal></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('3');
  });

  it('avoids floating-point drift (0.1 + 0.2 → "0.3" not "0.30000000000000004")', async () => {
    const el = await fixture<CivNumber>('<civ-number label="x" value="0.1" step="0.2" allow-decimal></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('0.3');
  });

  it('clamps to max', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty" value="10" max="10"></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('10');
  });

  it('clamps to min', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty" value="0" min="0"></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowDown');
    await elementUpdated(el);
    expect(el.value).toBe('0');
  });

  it('step=0 disables arrow-key stepping', async () => {
    const el = await fixture<CivNumber>('<civ-number label="x" value="3" step="0"></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('3');
  });

  it('disabled/readonly inputs do not respond to arrow keys', async () => {
    const el = await fixture<CivNumber>('<civ-number label="x" value="3" readonly></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('3');
  });

  it('starts from min (or 0) when value is empty', async () => {
    const el = await fixture<CivNumber>('<civ-number label="x" min="5"></civ-number>');
    await elementUpdated(el);
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(el.value).toBe('6');
  });

  it('dispatches civ-input and civ-change on each step', async () => {
    const el = await fixture<CivNumber>('<civ-number label="Qty" value="3"></civ-number>');
    await elementUpdated(el);
    const inputs: string[] = [];
    const changes: string[] = [];
    el.addEventListener('civ-input', (e) => inputs.push((e as CustomEvent).detail.value));
    el.addEventListener('civ-change', (e) => changes.push((e as CustomEvent).detail.value));
    pressKey(el.querySelector('input')!, 'ArrowUp');
    await elementUpdated(el);
    expect(inputs).toEqual(['4']);
    expect(changes).toEqual(['4']);
  });
});

describe('civ-number spacing="sm"', () => {
  it('renders just the bare <input> with no chrome or prefix/suffix decoration', async () => {
    const el = await fixture(
      '<civ-number spacing="sm" aria-label="Amount" prefix="$" suffix="kg"></civ-number>',
    );
    expect(el.querySelector('input')).not.toBeNull();
    expect(el.querySelector('.civ-input-prefix')).toBeNull();
    expect(el.querySelector('.civ-input-suffix')).toBeNull();
    expect(el.querySelector('.civ-label')).toBeNull();
  });

  it('propagates host aria-label to the inner <input>', async () => {
    const el = await fixture('<civ-number spacing="sm" aria-label="Age"></civ-number>');
    expect(el.querySelector('input')!.getAttribute('aria-label')).toBe('Age');
  });

  it('applies civ-input--sm class to the inner <input>', async () => {
    const el = await fixture('<civ-number spacing="sm" aria-label="x"></civ-number>');
    expect(el.querySelector('input')!.classList.contains('civ-input--sm')).toBe(true);
  });
});
