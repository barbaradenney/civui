import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-prefill-choice.js';
import type { CivPrefillChoice } from './civ-prefill-choice.js';

describe('civ-prefill-choice', () => {
  afterEach(cleanupFixtures);

  it('renders radio options from options property', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Which phone?" name="phone"></civ-prefill-choice>
    `);
    el.options = [
      { value: '555-1111', label: 'Mobile: (555) 111-1111' },
      { value: '555-2222', label: 'Home: (555) 222-2222' },
    ];
    await elementUpdated(el);

    const radios = el.querySelectorAll('input[type="radio"]');
    // 2 options + 1 "enter different" = 3
    expect(radios.length).toBe(3);
  });

  it('renders a fieldset with legend', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Choose a phone" name="phone"></civ-prefill-choice>
    `);
    await elementUpdated(el);
    const legend = el.querySelector('legend');
    expect(legend).toBeTruthy();
    expect(legend!.textContent).toContain('Choose a phone');
  });

  it('sets value when an option is selected', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Phone" name="phone"></civ-prefill-choice>
    `);
    el.options = [
      { value: '555-1111', label: 'Mobile' },
      { value: '555-2222', label: 'Home' },
    ];
    await elementUpdated(el);

    const radios = el.querySelectorAll('input[type="radio"]');
    (radios[0] as HTMLInputElement).checked = true;
    radios[0].dispatchEvent(new Event('change'));
    await elementUpdated(el);

    expect(el.value).toBe('555-1111');
  });

  it('fires civ-prefill-resolved with source "selected"', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Phone" name="phone"></civ-prefill-choice>
    `);
    el.options = [{ value: '555-1111', label: 'Mobile' }];
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-prefill-resolved', handler as EventListener);

    const radios = el.querySelectorAll('input[type="radio"]');
    radios[0].dispatchEvent(new Event('change'));
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.source).toBe('selected');
    expect(detail.value).toBe('555-1111');
  });

  it('shows custom input when "enter different" is selected', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Phone" name="phone"></civ-prefill-choice>
    `);
    el.options = [{ value: '555-1111', label: 'Mobile' }];
    await elementUpdated(el);

    // Select "enter different" (last radio)
    const radios = el.querySelectorAll('input[type="radio"]');
    const customRadio = radios[radios.length - 1] as HTMLInputElement;
    customRadio.checked = true;
    customRadio.dispatchEvent(new Event('change'));
    await elementUpdated(el);

    const textInput = el.querySelector('civ-text-input');
    expect(textInput).toBeTruthy();
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Phone" name="phone"></civ-prefill-choice>
    `);
    el.options = [{ value: '555-1111', label: 'Mobile' }];
    await elementUpdated(el);

    // Select an option
    const radios = el.querySelectorAll('input[type="radio"]');
    radios[0].dispatchEvent(new Event('change'));
    await elementUpdated(el);
    expect(el.value).toBe('555-1111');

    // Reset
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivPrefillChoice>(`
      <civ-prefill-choice label="Phone" name="phone"></civ-prefill-choice>
    `);
    expect(el.shadowRoot).toBeNull();
  });
});
