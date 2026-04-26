import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
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
    expect(input.getAttribute('width')).toBe('sm');
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
});
