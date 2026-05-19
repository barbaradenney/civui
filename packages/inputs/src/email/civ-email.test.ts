import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-email.js';
import type { CivEmail } from './civ-email.js';

describe('civ-email', () => {
  afterEach(cleanupFixtures);

  it('renders with default email configuration', async () => {
    const el = await fixture('<civ-email name="email"></civ-email>') as CivEmail;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Email address');
    expect(input.getAttribute('type')).toBe('email');
    expect(input.getAttribute('validate')).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-email name="email" label="Work email"></civ-email>') as CivEmail;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Work email');
  });

  it('dispatches civ-change event', async () => {
    const el = await fixture('<civ-email name="email"></civ-email>') as CivEmail;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'test@example.com' }, bubbles: true }));
    expect(received).toBe('test@example.com');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-email name="email"></civ-email>') as CivEmail;
    el.value = 'test@example.com';
    el.formResetCallback();
    expect(el.value).toBe('');
  });

  it('forwards width to the inner control', async () => {
    const el = await fixture('<civ-email name="x" width="md"></civ-email>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('width')).toBe('md');
  });

  it('forwards placeholder to the inner control', async () => {
    const el = await fixture('<civ-email name="x" placeholder="PH"></civ-email>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('placeholder')).toBe('PH');
  });

  it('forwards readonly to the inner control', async () => {
    const el = await fixture('<civ-email name="x" readonly></civ-email>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('readonly')).toBe(true);
  });

  it('forwards disabled to the inner control', async () => {
    const el = await fixture('<civ-email name="x" disabled></civ-email>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.hasAttribute('disabled')).toBe(true);
  });

  it('propagates an error string down to the inner control', async () => {
    const el = await fixture('<civ-email name="x" error="An error"></civ-email>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox') as any;
    expect(inner.getAttribute('error')).toBe('An error');
  });

  it('forwards civ-input from the inner control', async () => {
    const el = await fixture('<civ-email name="x"></civ-email>') as any;
    const inner = el.querySelector('civ-text-input, civ-combobox')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => { received = e.detail.value; }) as EventListener);
    inner.dispatchEvent(new CustomEvent('civ-input', { detail: { value: 'SAMPLE' }, bubbles: true }));
    expect(received).toBe('SAMPLE');
  });
});
