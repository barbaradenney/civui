/**
 * Cross-package integration tests for civ-form-fieldset.
 *
 * Lives in @civui/inputs because it imports civ-text-input as a child
 * fixture and needs @civui/test-utils — neither of which @civui/core
 * has a runtime dependency on.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '@civui/core';
import '../text-input/civ-text-input.js';

afterEach(cleanupFixtures);

describe('civ-form-fieldset', () => {
  it('renders a fieldset with legend, hint, and error', async () => {
    const el = await fixture(
      '<civ-form-fieldset legend="Mailing address" hint="Where we send paper mail" error="Address is required"></civ-form-fieldset>',
    );

    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('legend')!.textContent).toContain('Mailing address');

    const spans = Array.from(el.querySelectorAll('span'));
    expect(spans.some((s) => s.textContent === 'Where we send paper mail')).toBe(true);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Address is required');
  });

  it('does NOT clobber a child control\'s own label', async () => {
    // The wrapper renders its own legend; children keep their own labels.
    // Regression: an earlier _wireChild() helper would overwrite the first
    // [data-civ-form-field] child's label with the wrapper's legend.
    const wrapper = await fixture(
      `<civ-form-fieldset legend="Mailing address">
        <civ-text-input label="Street" name="street"></civ-text-input>
        <civ-text-input label="City" name="city"></civ-text-input>
      </civ-form-fieldset>`,
    );
    // Wait for slot relocation + child renders to settle.
    await elementUpdated(wrapper);
    await new Promise((r) => requestAnimationFrame(r));

    const inputs = wrapper.querySelectorAll('civ-text-input');
    expect(inputs).toHaveLength(2);
    expect((inputs[0] as HTMLElement & { label: string }).label).toBe('Street');
    expect((inputs[1] as HTMLElement & { label: string }).label).toBe('City');
  });

  it('mirrors a child\'s civ-error-change event into its own error', async () => {
    const wrapper = await fixture(
      `<civ-form-fieldset legend="Date of birth">
        <civ-text-input label="Date" name="dob"></civ-text-input>
      </civ-form-fieldset>`,
    ) as HTMLElement & { error: string };
    await elementUpdated(wrapper);

    const child = wrapper.querySelector('civ-text-input') as HTMLElement & { error: string };
    child.error = 'Enter a valid date';
    await elementUpdated(wrapper);
    expect(wrapper.error).toBe('Enter a valid date');

    child.error = '';
    await elementUpdated(wrapper);
    expect(wrapper.error).toBe('');
  });

  it('reflects required on the host element', async () => {
    const el = await fixture(
      '<civ-form-fieldset legend="Address" required></civ-form-fieldset>',
    );
    expect(el.hasAttribute('required')).toBe(true);
  });
});
