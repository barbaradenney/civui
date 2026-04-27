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
    expect(input.getAttribute('width')).toBe('md');
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
});
