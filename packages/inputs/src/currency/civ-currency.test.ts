import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-currency.js';
import type { CivCurrency } from './civ-currency.js';

describe('civ-currency', () => {
  afterEach(cleanupFixtures);

  it('renders with default currency configuration', async () => {
    const el = await fixture('<civ-currency name="amount"></civ-currency>') as CivCurrency;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Amount');
    expect(input.getAttribute('mask')).toBe('currency');
    expect(input.getAttribute('validate')).toBe('currency');
    expect(input.getAttribute('inputmode')).toBe('decimal');
    expect(input.getAttribute('prefix')).toBe('$');
    expect(input.hasAttribute('autocomplete')).toBe(false);
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-currency name="amount" label="Monthly income"></civ-currency>') as CivCurrency;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Monthly income');
  });

  it('dispatches civ-input event', async () => {
    const el = await fixture('<civ-currency name="amount"></civ-currency>') as CivCurrency;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '1234.56' }, bubbles: true }));
    expect(received).toBe('1234.56');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-currency name="amount"></civ-currency>') as CivCurrency;
    el.value = '1234.56';
    el.formResetCallback();
    expect(el.value).toBe('');
  });

  it('forwards decimals="0" to switch the inner input into whole-dollar mode', async () => {
    const el = await fixture('<civ-currency name="amount" decimals="0"></civ-currency>') as CivCurrency;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('decimals')).toBe('0');
    // Decimal-mode keyboard switches to numeric (no decimal key).
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });

  it('forwards min and max bounds to the inner input', async () => {
    const el = await fixture('<civ-currency name="amount" min="100" max="10000"></civ-currency>') as CivCurrency;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('min')).toBe('100');
    expect(input.getAttribute('max')).toBe('10000');
  });

  it('forwards allow-negative to the inner input', async () => {
    const el = await fixture('<civ-currency name="amount" allow-negative></civ-currency>') as CivCurrency;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.hasAttribute('allow-negative')).toBe(true);
  });

  it('forwards width to the inner control', async () => {
    const el = await fixture('<civ-currency name="x" width="md"></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner control', async () => {
    const el = await fixture('<civ-currency name="x" placeholder="PH"></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('placeholder')).toBe('PH');
  });

  it('forwards readonly to the inner control', async () => {
    const el = await fixture('<civ-currency name="x" readonly></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner control', async () => {
    const el = await fixture('<civ-currency name="x" disabled></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner control', async () => {
    const el = await fixture('<civ-currency name="x" error="An error"></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('error')).toBe('An error');
  });

  it('forwards civ-input from the inner control', async () => {
    const el = await fixture('<civ-currency name="x"></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'SAMPLE' }, bubbles: true }));
    expect(received).toBe('SAMPLE');
  });

  it('forwards civ-change from the inner control', async () => {
    const el = await fixture('<civ-currency name="x"></civ-currency>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '$1,234.56' }, bubbles: true }));
    expect(received).toBe('$1,234.56');
  });
});
