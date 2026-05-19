import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-ein.js';
import type { CivEin } from './civ-ein.js';

describe('civ-ein', () => {
  afterEach(cleanupFixtures);

  it('renders with default EIN configuration', async () => {
    const el = await fixture('<civ-ein name="ein"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Employer Identification Number');
    expect(input.getAttribute('mask')).toBe('ein');
    expect(input.getAttribute('validate')).toBe('ein');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-ein name="ein" label="EIN"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('EIN');
  });

  it('dispatches civ-change event', async () => {
    const el = await fixture('<civ-ein name="ein"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '123456789' }, bubbles: true }));
    expect(received).toBe('123456789');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-ein name="ein"></civ-ein>') as CivEin;
    el.value = '123456789';
    el.formResetCallback();
    expect(el.value).toBe('');
  });

  it('forwards width to the inner civ-text-input', async () => {
    const el = await fixture('<civ-ein name="ein" width="md"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner civ-text-input', async () => {
    const el = await fixture('<civ-ein name="ein" placeholder="12-3456789"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('placeholder')).toBe('12-3456789');
  });

  it('forwards readonly to the inner civ-text-input', async () => {
    const el = await fixture('<civ-ein name="ein" readonly></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner civ-text-input', async () => {
    const el = await fixture('<civ-ein name="ein" disabled></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner input', async () => {
    const el = await fixture('<civ-ein name="ein" error="Invalid EIN"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('error')).toBe('Invalid EIN');
  });

  it('forwards civ-input on every keystroke from the inner input', async () => {
    const el = await fixture('<civ-ein name="ein"></civ-ein>') as CivEin;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '12-345' }, bubbles: true }));
    expect(received).toBe('12-345');
  });
});
