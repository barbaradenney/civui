import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-routing-number.js';
import type { CivRoutingNumber } from './civ-routing-number.js';

describe('civ-routing-number', () => {
  afterEach(cleanupFixtures);

  it('renders with default configuration', async () => {
    const el = await fixture('<civ-routing-number name="routing"></civ-routing-number>') as CivRoutingNumber;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Routing number');
    expect(input.getAttribute('validate')).toBe('routing');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('width')).toBe('sm');
  });

  it('sets maxlength to 9 digits', async () => {
    const el = await fixture('<civ-routing-number name="routing"></civ-routing-number>') as CivRoutingNumber;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('maxlength')).toBe('9');
  });

  it('dispatches civ-change event', async () => {
    const el = await fixture('<civ-routing-number name="routing"></civ-routing-number>') as CivRoutingNumber;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '021000021' }, bubbles: true }));
    expect(received).toBe('021000021');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-routing-number name="routing"></civ-routing-number>') as CivRoutingNumber;
    el.value = '021000021';
    el.formResetCallback();
    expect(el.value).toBe('');
  });
});
