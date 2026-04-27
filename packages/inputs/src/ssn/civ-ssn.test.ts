import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-ssn.js';
import type { CivSsn } from './civ-ssn.js';

describe('civ-ssn', () => {
  afterEach(cleanupFixtures);

  it('renders with default label for full mode', async () => {
    const el = await fixture('<civ-ssn name="ssn"></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input') as any;
    expect(input).not.toBeNull();
    expect(input.getAttribute('label')).toBe('Social Security number');
    expect(input.getAttribute('mask')).toBe('ssn');
    expect(input.getAttribute('validate')).toBe('ssn');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('renders last4 mode with shorter width and no mask', async () => {
    const el = await fixture('<civ-ssn name="ssn" mode="last4"></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Last 4 digits of Social Security number');
    expect(input.getAttribute('maxlength')).toBe('4');
    expect(input.hasAttribute('mask')).toBe(false);
  });

  it('allows label override', async () => {
    const el = await fixture('<civ-ssn name="ssn" label="Veteran SSN"></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('label')).toBe('Veteran SSN');
  });

  it('forwards required to child input', async () => {
    const el = await fixture('<civ-ssn name="ssn" required></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('forwards error to child input', async () => {
    const el = await fixture('<civ-ssn name="ssn" error="Invalid SSN"></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.getAttribute('error')).toBe('Invalid SSN');
  });

  it('dispatches civ-input on child input event', async () => {
    const el = await fixture('<civ-ssn name="ssn"></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-input', ((e: CustomEvent) => {
      received = e.detail.value;
    }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '123456789' }, bubbles: true }));
    expect(received).toBe('123456789');
    expect(el.value).toBe('123456789');
  });

  it('dispatches civ-change on child change event', async () => {
    const el = await fixture('<civ-ssn name="ssn"></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input')!;
    let received = '';
    el.addEventListener('civ-change', ((e: CustomEvent) => {
      received = e.detail.value;
    }) as EventListener);
    input.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '123456789' }, bubbles: true }));
    expect(received).toBe('123456789');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture('<civ-ssn name="ssn" error="bad"></civ-ssn>') as CivSsn;
    el.value = '123456789';
    el.formResetCallback();
    expect(el.value).toBe('');
    expect(el.error).toBe('');
  });

  it('passes disabled to child', async () => {
    const el = await fixture('<civ-ssn name="ssn" disabled></civ-ssn>') as CivSsn;
    const input = el.querySelector('civ-text-input') as any;
    expect(input.hasAttribute('disabled')).toBe(true);
  });
});
