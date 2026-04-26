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
});
