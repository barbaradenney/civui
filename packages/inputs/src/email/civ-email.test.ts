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
});
