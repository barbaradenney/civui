import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-zip.js';
import type { CivZip } from './civ-zip.js';

describe('civ-zip', () => {
  afterEach(cleanupFixtures);

  it('renders with default 5-digit ZIP configuration', async () => {
    const el = await fixture('<civ-zip name="zip"></civ-zip>') as CivZip;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('ZIP code');
    expect(input.getAttribute('mask')).toBe('zip');
    expect(input.getAttribute('validate')).toBe('zip');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('postal-code');
  });

  it('renders extended ZIP+4 mode', async () => {
    const el = await fixture('<civ-zip name="zip" extended></civ-zip>') as CivZip;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('mask')).toBe('zip4');
    expect(input.getAttribute('validate')).toBe('zip4');
  });

  it('dispatches civ-input event', async () => {
    const el = await fixture('<civ-zip name="zip"></civ-zip>') as CivZip;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '90210' }, bubbles: true }));
    expect(received).toBe('90210');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-zip name="zip"></civ-zip>') as CivZip;
    el.value = '90210';
    el.formResetCallback();
    expect(el.value).toBe('');
  });

  it('forwards width to the inner control', async () => {
    const el = await fixture('<civ-zip name="x" width="md"></civ-zip>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner control', async () => {
    const el = await fixture('<civ-zip name="x" placeholder="PH"></civ-zip>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('placeholder')).toBe('PH');
  });

  it('forwards readonly to the inner control', async () => {
    const el = await fixture('<civ-zip name="x" readonly></civ-zip>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner control', async () => {
    const el = await fixture('<civ-zip name="x" disabled></civ-zip>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner control', async () => {
    const el = await fixture('<civ-zip name="x" error="An error"></civ-zip>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('error')).toBe('An error');
  });

  it('forwards civ-input from the inner control', async () => {
    const el = await fixture('<civ-zip name="x"></civ-zip>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'SAMPLE' }, bubbles: true }));
    expect(received).toBe('SAMPLE');
  });
});
