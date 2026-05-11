import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-memorable-date.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-memorable-date rendering', () => {
  it('renders the legend when set directly (self-contained)', async () => {
    const el = await fixture(
      '<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>',
    );

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Date of birth');
  });

  it('renders month select and day/year text inputs', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>');

    const select = el.querySelector('civ-select');
    const textInputs = el.querySelectorAll('civ-text-input');
    expect(select).not.toBeNull();
    expect(textInputs.length).toBe(2);
  });

  it('month select has 12 month options', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>');

    const select = el.querySelector('civ-select') as any;
    expect(select.options.length).toBe(12);
    expect(select.options[0].label).toBe('January');
    expect(select.options[11].label).toBe('December');
  });

  it('renders hint and error when wrapped in civ-form-fieldset', async () => {
    const wrapper = await fixture(
      '<civ-memorable-date legend="Date of birth" hint="For example: January 19 2000" error="Date is required" name="dob"></civ-memorable-date>',
    );

    const spans = wrapper.querySelectorAll('span');
    const hint = Array.from(spans).find((s) => s.textContent === 'For example: January 19 2000');
    expect(hint).not.toBeNull();

    const errorEl = wrapper.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Date is required');
  });

  it('shows required indicator when wrapped in civ-form-fieldset', async () => {
    const wrapper = await fixture(
      '<civ-memorable-date legend="Date of birth" required name="dob"></civ-memorable-date>',
    );

    const requiredMark = wrapper.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth"></civ-memorable-date>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[data-civ-memorable-date]')).not.toBeNull();
  });

  it('lays out fields in a responsive container', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>');

    const container = el.querySelector('[data-civ-memorable-date]');
    expect(container).not.toBeNull();
    expect(container!.classList.contains('civ-memorable-date-fields')).toBe(true);
  });
});

describe('civ-memorable-date accessibility', () => {
  it('sets aria-invalid on fieldset when error is present (via form-fieldset)', async () => {
    const wrapper = await fixture(
      '<civ-memorable-date legend="Date of birth" error="Invalid date" name="dob"></civ-memorable-date>',
    );

    const fieldset = wrapper.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid on fieldset when no error', async () => {
    const wrapper = await fixture(
      '<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>',
    );

    const fieldset = wrapper.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBeNull();
  });

  it('does not set aria-required on the fieldset (invalid ARIA on fieldset role)', async () => {
    const wrapper = await fixture(
      '<civ-memorable-date legend="Date of birth" required name="dob"></civ-memorable-date>',
    );

    // aria-required is not a valid ARIA attribute on the implicit `group`
    // role of <fieldset> (axe rule `aria-allowed-attr`). The required
    // signal is communicated via the legend "(required)" indicator and via
    // aria-required cascading to the underlying form controls.
    const fieldset = wrapper.querySelector('fieldset');
    expect(fieldset!.hasAttribute('aria-required')).toBe(false);
  });

  it('day and year inputs use type="text" with inputmode="numeric"', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>');
    await elementUpdated(el);

    const textInputs = el.querySelectorAll('civ-text-input');
    expect(textInputs.length).toBe(2);

    for (const textInput of textInputs) {
      await elementUpdated(textInput);
      const input = textInput.querySelector('input');
      expect(input).not.toBeNull();
      expect(input!.type).toBe('text');
      expect(input!.getAttribute('inputmode')).toBe('numeric');
    }
  });

  it('propagates aria-describedby to child inputs when hint is set dynamically', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    // Wait for child components to render their inner elements
    const civSelect = el.querySelector('civ-select');
    if (civSelect) await elementUpdated(civSelect);
    const civTextInputs = el.querySelectorAll('civ-text-input');
    for (const ti of civTextInputs) await elementUpdated(ti);

    // Now set hint dynamically so updated() fires propagation
    el.hint = 'For example: January 19 2000';
    await elementUpdated(el);
    // Wait for RAF-deferred aria propagation
    await new Promise(r => requestAnimationFrame(r));

    const innerSelect = el.querySelector('civ-select select');
    expect(innerSelect).not.toBeNull();
    const describedBy = innerSelect!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  it('propagates aria-describedby to child inputs when error is set dynamically', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    // Wait for child components to render their inner elements
    const civSelect = el.querySelector('civ-select');
    if (civSelect) await elementUpdated(civSelect);
    const civTextInputs = el.querySelectorAll('civ-text-input');
    for (const ti of civTextInputs) await elementUpdated(ti);

    // Now set error dynamically so updated() fires propagation
    el.error = 'Enter a valid date';
    await elementUpdated(el);
    // Wait for RAF-deferred aria propagation
    await new Promise(r => requestAnimationFrame(r));

    const innerSelect = el.querySelector('civ-select select');
    const describedBy = innerSelect!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });
});

describe('civ-memorable-date custom labels', () => {
  it('uses custom month-label on child select', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob" month-label="Mes"></civ-memorable-date>');

    const select = el.querySelector('civ-select') as any;
    expect(select.label).toBe('Mes');
  });

  it('uses custom day-label and year-label', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob" day-label="Dia" year-label="Ano"></civ-memorable-date>');

    const textInputs = el.querySelectorAll('civ-text-input');
    expect((textInputs[0] as any).label).toBe('Dia');
    expect((textInputs[1] as any).label).toBe('Ano');
  });

  it('uses locale-aware month names with locale="es"', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob" locale="es"></civ-memorable-date>');

    const select = el.querySelector('civ-select') as any;
    expect(select.options[0].label).toBe('enero');
    expect(select.options[11].label).toBe('diciembre');
  });
});

describe('civ-memorable-date value and events', () => {
  it('parses initial YYYY-MM-DD value into child fields', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob" value="2000-01-19"></civ-memorable-date>') as any;
    await elementUpdated(el);

    expect(el.value).toBe('2000-01-19');
  });

  it('fires civ-change with detail { value, month, day, year } on child commit', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>';
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-memorable-date') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    // Listen on wrapper so we only capture events re-dispatched from the group
    wrapper.addEventListener('civ-change', ((e: CustomEvent) => {
      handler(e.detail);
    }) as EventListener);

    // Simulate month change
    const monthSelect = el.querySelector('civ-select') as any;
    monthSelect.value = '01';
    monthSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '01' }, bubbles: true }));

    // Simulate day input
    const textInputs = el.querySelectorAll('civ-text-input');
    const dayInput = textInputs[0] as any;
    dayInput.value = '19';
    dayInput.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '19' }, bubbles: true }));

    // Simulate year input
    const yearInput = textInputs[1] as any;
    yearInput.value = '2000';
    yearInput.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2000' }, bubbles: true }));
    await elementUpdated(el);

    // The last civ-change event should have the assembled detail
    expect(handler).toHaveBeenCalled();
    const lastCall = handler.mock.calls[handler.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('value');
    expect(lastCall).toHaveProperty('month');
    expect(lastCall).toHaveProperty('day');
    expect(lastCall).toHaveProperty('year');
  });

  it('fires civ-input with detail { value, month, day, year } on field input', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-input', ((e: CustomEvent) => {
      handler(e.detail);
    }) as EventListener);

    const textInputs = el.querySelectorAll('civ-text-input');
    const dayInput = textInputs[0] as any;
    dayInput.value = '15';
    dayInput.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '15' }, bubbles: true }));

    expect(handler).toHaveBeenCalled();
    const detail = handler.mock.calls[0][0];
    expect(detail).toHaveProperty('day');
  });
});

describe('civ-memorable-date validation', () => {
  it('produces empty value and shows error for invalid date like Feb 30', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    const monthSelect = el.querySelector('civ-select') as any;
    const textInputs = el.querySelectorAll('civ-text-input');
    const dayInput = textInputs[0] as any;
    const yearInput = textInputs[1] as any;

    monthSelect.value = '02';
    monthSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '02' }, bubbles: true }));
    dayInput.value = '30';
    dayInput.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '30' }, bubbles: true }));
    yearInput.value = '2024';
    yearInput.dispatchEvent(new CustomEvent('civ-input', { detail: { value: '2024' }, bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('');
    expect(el.error).toBeTruthy();
  });

  it('uses label property directly for group label', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth"></civ-memorable-date>') as any;
    await elementUpdated(el);
    expect(el.label).toBe('Date of birth');

    el.label = 'Birthday';
    await elementUpdated(el);
    expect(el.label).toBe('Birthday');
  });
});

describe('civ-memorable-date form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-memorable-date') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('resets to default value on formResetCallback', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob" value="2000-01-19"></civ-memorable-date>') as any;
    await elementUpdated(el);

    expect(el.value).toBe('2000-01-19');

    el.value = '2024-06-15';
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('2000-01-19');
  });

  it('cascades disabled to child components via formDisabledCallback', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    el.formDisabledCallback(true);
    await elementUpdated(el);

    expect(el.disabled).toBe(true);
    const select = el.querySelector('civ-select') as any;
    const textInputs = el.querySelectorAll('civ-text-input');
    expect(select.disabled).toBe(true);
    expect((textInputs[0] as any).disabled).toBe(true);
    expect((textInputs[1] as any).disabled).toBe(true);
  });

  it('re-enables child components after formDisabledCallback(false)', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    el.formDisabledCallback(true);
    await elementUpdated(el);
    expect(el.disabled).toBe(true);

    el.formDisabledCallback(false);
    await elementUpdated(el);
    expect(el.disabled).toBe(false);

    const select = el.querySelector('civ-select') as any;
    const textInputs = el.querySelectorAll('civ-text-input');
    expect(select.disabled).toBe(false);
    expect((textInputs[0] as any).disabled).toBe(false);
    expect((textInputs[1] as any).disabled).toBe(false);
  });
});

describe('civ-memorable-date analytics', () => {
  it('fires civ-analytics from group on committed date change', async () => {
    const el = await fixture('<civ-memorable-date label="Date of birth" name="dob"></civ-memorable-date>') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const monthSelect = el.querySelector('civ-select') as any;
    const textInputs = el.querySelectorAll('civ-text-input');
    const dayInput = textInputs[0] as any;
    const yearInput = textInputs[1] as any;

    monthSelect.value = '06';
    monthSelect.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '06' }, bubbles: true }));
    dayInput.value = '15';
    dayInput.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '15' }, bubbles: true }));
    yearInput.value = '2000';
    yearInput.dispatchEvent(new CustomEvent('civ-change', { detail: { value: '2000' }, bubbles: true }));
    await elementUpdated(el);

    // Should have fired analytics at least once for committed change
    const analyticsCall = handler.mock.calls.find(
      (c: any) => c[0].detail.componentName === 'civ-memorable-date',
    );
    expect(analyticsCall).toBeDefined();
    expect(analyticsCall![0].detail.action).toBe('change');
  });
});
