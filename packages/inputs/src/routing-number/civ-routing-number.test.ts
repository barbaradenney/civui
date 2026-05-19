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

  it('forwards width to the inner control', async () => {
    const el = await fixture('<civ-routing-number name="x" width="md"></civ-routing-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner control', async () => {
    const el = await fixture('<civ-routing-number name="x" placeholder="PH"></civ-routing-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('placeholder')).toBe('PH');
  });

  it('forwards readonly to the inner control', async () => {
    const el = await fixture('<civ-routing-number name="x" readonly></civ-routing-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner control', async () => {
    const el = await fixture('<civ-routing-number name="x" disabled></civ-routing-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner control', async () => {
    const el = await fixture('<civ-routing-number name="x" error="An error"></civ-routing-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('error')).toBe('An error');
  });

  it('forwards civ-input from the inner control', async () => {
    const el = await fixture('<civ-routing-number name="x"></civ-routing-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'SAMPLE' }, bubbles: true }));
    expect(received).toBe('SAMPLE');
  });
});
