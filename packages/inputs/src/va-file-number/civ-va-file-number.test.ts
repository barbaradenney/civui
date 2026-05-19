import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-va-file-number.js';
import type { CivVaFileNumber } from './civ-va-file-number.js';

describe('civ-va-file-number', () => {
  afterEach(cleanupFixtures);

  it('renders with default label and hint', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile"></civ-va-file-number>') as CivVaFileNumber;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('VA file number');
    expect(input.getAttribute('hint')).toContain('8 or 9 digits');
  });

  it('sets correct HTML attributes', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile"></civ-va-file-number>') as CivVaFileNumber;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('minlength')).toBe('8');
    expect(input.getAttribute('maxlength')).toBe('9');
    expect(input.getAttribute('pattern')).toBe('[0-9]{8,9}');
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile" label="Sponsor VA file number"></civ-va-file-number>') as CivVaFileNumber;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Sponsor VA file number');
  });

  it('forwards required to child input', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile" required></civ-va-file-number>') as CivVaFileNumber;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('dispatches civ-input event', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile"></civ-va-file-number>') as CivVaFileNumber;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '12345678' }, bubbles: true }));
    expect(received).toBe('12345678');
  });

  it('dispatches civ-change event', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile"></civ-va-file-number>') as CivVaFileNumber;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '123456789' }, bubbles: true }));
    expect(received).toBe('123456789');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-va-file-number name="vaFile"></civ-va-file-number>') as CivVaFileNumber;
    el.value = '12345678';
    el.formResetCallback();
    expect(el.value).toBe('');
    expect(el.error).toBe('');
  });

  it('forwards width to the inner control', async () => {
    const el = await fixture('<civ-va-file-number name="x" width="md"></civ-va-file-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner control', async () => {
    const el = await fixture('<civ-va-file-number name="x" placeholder="PH"></civ-va-file-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('placeholder')).toBe('PH');
  });

  it('forwards readonly to the inner control', async () => {
    const el = await fixture('<civ-va-file-number name="x" readonly></civ-va-file-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner control', async () => {
    const el = await fixture('<civ-va-file-number name="x" disabled></civ-va-file-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner control', async () => {
    const el = await fixture('<civ-va-file-number name="x" error="An error"></civ-va-file-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('error')).toBe('An error');
  });

  it('forwards civ-input from the inner control', async () => {
    const el = await fixture('<civ-va-file-number name="x"></civ-va-file-number>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'SAMPLE' }, bubbles: true }));
    expect(received).toBe('SAMPLE');
  });
});
