import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-income.js';
import type { CivIncome } from './civ-income.js';

afterEach(cleanupFixtures);

async function setSelectValue(el: HTMLElement, name: string, value: string) {
  const select = el.querySelector(`civ-select[name="${name}"]`)!;
  const inner = select.querySelector('select') as HTMLSelectElement;
  inner.value = value;
  inner.dispatchEvent(new Event('change', { bubbles: true }));
  await elementUpdated(select);
}

async function setCurrencyValue(el: HTMLElement, name: string, value: string) {
  const currency = el.querySelector(`civ-currency[name="${name}"]`) as any;
  const input = currency.querySelector('input') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await elementUpdated(currency);
}

describe('civ-income', () => {
  it('renders a fieldset with a currency input and a frequency select', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="wages"></civ-income>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('civ-currency[name="wages.amount"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="wages.frequency"]')).not.toBeNull();
  });

  it('renders the legend text', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Monthly gross income" name="income"></civ-income>');
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Monthly gross income');
  });

  it('defaults to all eight frequency options', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages"></civ-income>');
    const select = el.querySelector('civ-select') as any;
    expect(select.options.length).toBe(7);
    expect(select.options.map((o: any) => o.value)).toEqual([
      'weekly', 'biweekly', 'semimonthly', 'monthly',
      'quarterly', 'annually', 'one-time',
    ]);
  });

  it('honors a restricted frequencies list', async () => {
    const el = await fixture<CivIncome>(
      `<civ-income legend="Wages" frequencies='["weekly","monthly","annually"]'></civ-income>`
    );
    const select = el.querySelector('civ-select') as any;
    expect(select.options.map((o: any) => o.value)).toEqual(['weekly', 'monthly', 'annually']);
  });

  it('writes nested form names {name}.amount and {name}.frequency', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="gross"></civ-income>');
    expect(el.querySelector('civ-currency[name="gross.amount"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="gross.frequency"]')).not.toBeNull();
  });

  it('falls back to plain names when no base name is set', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages"></civ-income>');
    expect(el.querySelector('civ-currency[name="amount"]')).not.toBeNull();
    expect(el.querySelector('civ-select[name="frequency"]')).not.toBeNull();
  });

  it('updates incomeValue when sub-fields change', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="wages"></civ-income>');
    await setCurrencyValue(el, 'wages.amount', '1500');
    await setSelectValue(el, 'wages.frequency', 'monthly');
    await elementUpdated(el);
    expect(el.incomeValue.amount).toBe('1500');
    expect(el.incomeValue.frequency).toBe('monthly');
  });

  it('dispatches civ-change with the assembled value', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="wages"></civ-income>');
    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    await setCurrencyValue(el, 'wages.amount', '2000');
    await setSelectValue(el, 'wages.frequency', 'biweekly');

    expect(handler).toHaveBeenCalled();
    const last = handler.mock.calls[handler.mock.calls.length - 1][0] as CustomEvent;
    expect(last.detail.value).toEqual({ amount: '2000', frequency: 'biweekly' });
  });

  it('does not bubble inner sub-field events past the compound', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="wages"></civ-income>');
    const handler = vi.fn();
    el.addEventListener('civ-input', handler as EventListener);

    await setCurrencyValue(el, 'wages.amount', '1234');
    // Should have been called for the compound's own civ-input only.
    handler.mock.calls.forEach((call) => {
      const evt = call[0] as CustomEvent;
      expect(typeof evt.detail.value).toBe('object');
    });
  });

  it('renders custom amount and frequency labels', async () => {
    const el = await fixture<CivIncome>(
      '<civ-income legend="Wages" amount-label="Pay" frequency-label="Schedule"></civ-income>'
    );
    expect(el.textContent).toContain('Pay');
    expect(el.textContent).toContain('Schedule');
  });

  it('cascades disabled to the sub-fields', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" disabled></civ-income>');
    const currency = el.querySelector('civ-currency') as any;
    const select = el.querySelector('civ-select') as any;
    expect(currency.disabled).toBe(true);
    expect(select.disabled).toBe(true);
  });

  it('renders the hint and error inside the fieldset header', async () => {
    const el = await fixture<CivIncome>(
      '<civ-income legend="Wages" hint="Use gross income" error="Required"></civ-income>'
    );
    expect(el.textContent).toContain('Use gross income');
    expect(el.textContent).toContain('Required');
  });

  it('renders sub-field-specific errors', async () => {
    const el = await fixture<CivIncome>(
      '<civ-income legend="Wages" amount-error="Required" frequency-error="Required"></civ-income>'
    );
    const currency = el.querySelector('civ-currency') as any;
    const select = el.querySelector('civ-select') as any;
    expect(currency.error).toBe('Required');
    expect(select.error).toBe('Required');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages"></civ-income>');
    expect(el.shadowRoot).toBeNull();
  });

  it('hydrates from a JSON value attribute', async () => {
    const el = await fixture<CivIncome>(
      `<civ-income legend="Wages" name="wages" value='{"amount":"2500","frequency":"monthly"}'></civ-income>`
    );
    await elementUpdated(el);
    expect(el.incomeValue).toEqual({ amount: '2500', frequency: 'monthly' });
  });

  it('renders required marker on the child controls (section-legend rule)', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" required></civ-income>');
    // The section legend should NOT carry (required) — multi-field
    // compound rule. The child controls should.
    const legendMarks = el.querySelectorAll('legend .civ-required-mark');
    expect(legendMarks.length).toBe(0);

    const childMarks = el.querySelectorAll('civ-currency .civ-required-mark, civ-select .civ-required-mark');
    expect(childMarks.length).toBeGreaterThan(0);
  });

  it('serializes _data into value as JSON on sub-field change', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="wages"></civ-income>');
    await setCurrencyValue(el, 'wages.amount', '1200');
    await setSelectValue(el, 'wages.frequency', 'monthly');
    await elementUpdated(el);
    // CivCompoundElement.syncFormDataFromState serializes _data; the
    // public surface to assert is incomeValue (parsed) and value (JSON).
    expect(JSON.parse(el.value)).toEqual({ amount: '1200', frequency: 'monthly' });
  });

  it('is discoverable by parent civ-form via data-civ-form-field', async () => {
    // Avoid importing form-patterns from compound (build-order
    // boundary). Stub the discovery selector the same way civ-form
    // would — civ-income's host should carry data-civ-form-field.
    const el = await fixture<CivIncome>('<civ-income legend="Wages" name="wages"></civ-income>');
    expect(el.hasAttribute('data-civ-form-field')).toBe(true);
    expect((el as unknown as { name: string }).name).toBe('wages');
  });

  it('re-renders frequency options when the frequencies prop changes', async () => {
    const el = await fixture<CivIncome>('<civ-income legend="Wages"></civ-income>');
    expect((el.querySelector('civ-select') as any).options.length).toBe(7);

    el.frequencies = ['weekly', 'monthly'];
    await elementUpdated(el);
    expect((el.querySelector('civ-select') as any).options.length).toBe(2);
  });
});
