import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-phone.js';
import type { CivPhone } from './civ-phone.js';

describe('civ-phone', () => {
  afterEach(cleanupFixtures);

  it('renders with default US phone configuration', async () => {
    const el = await fixture('<civ-phone name="phone"></civ-phone>') as CivPhone;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Phone number');
    expect(input.getAttribute('mask')).toBe('phone-us');
    expect(input.getAttribute('validate')).toBe('phone');
    expect(input.getAttribute('type')).toBe('tel');
    expect(input.getAttribute('autocomplete')).toBe('tel');
  });

  it('renders international mode without mask', async () => {
    const el = await fixture('<civ-phone name="phone" international></civ-phone>') as CivPhone;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('validate')).toBe('phoneIntl');
    expect(input.hasAttribute('mask')).toBe(false);
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-phone name="phone" label="Mobile number"></civ-phone>') as CivPhone;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Mobile number');
  });

  it('dispatches civ-input event', async () => {
    const el = await fixture('<civ-phone name="phone"></civ-phone>') as CivPhone;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '5551234567' }, bubbles: true }));
    expect(received).toBe('5551234567');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-phone name="phone"></civ-phone>') as CivPhone;
    el.value = '5551234567';
    el.formResetCallback();
    expect(el.value).toBe('');
  });

  it('forwards width to the inner control', async () => {
    const el = await fixture('<civ-phone name="x" width="md"></civ-phone>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner control', async () => {
    const el = await fixture('<civ-phone name="x" placeholder="PH"></civ-phone>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('placeholder')).toBe('PH');
  });

  it('forwards readonly to the inner control', async () => {
    const el = await fixture('<civ-phone name="x" readonly></civ-phone>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner control', async () => {
    const el = await fixture('<civ-phone name="x" disabled></civ-phone>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner control', async () => {
    const el = await fixture('<civ-phone name="x" error="An error"></civ-phone>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('error')).toBe('An error');
  });

  it('forwards civ-input from the inner control', async () => {
    const el = await fixture('<civ-phone name="x"></civ-phone>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'SAMPLE' }, bubbles: true }));
    expect(received).toBe('SAMPLE');
  });
});
