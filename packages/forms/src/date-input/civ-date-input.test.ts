import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-date-input.js';
import './civ-memorable-date.js';

afterEach(cleanupFixtures);

describe('civ-date-input', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-date-input label="Birth date"></civ-date-input>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Birth date');
  });

  it('renders a date input', async () => {
    const el = await fixture('<civ-date-input label="Date" name="date"></civ-date-input>');

    const input = el.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('date');
  });

  it('associates label with input', async () => {
    const el = await fixture('<civ-date-input label="Date"></civ-date-input>');

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('sets min and max attributes', async () => {
    const el = await fixture('<civ-date-input label="Date" min="2024-01-01" max="2024-12-31"></civ-date-input>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('2024-01-01');
    expect(input.max).toBe('2024-12-31');
  });

  it('renders error with alert role', async () => {
    const el = await fixture('<civ-date-input label="Date" error="Invalid date"></civ-date-input>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Invalid date');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-date-input label="Date" error="Bad"></civ-date-input>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders disabled state', async () => {
    const el = await fixture('<civ-date-input label="Date" disabled></civ-date-input>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-date-input label="Date" required></civ-date-input>');

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
  });

  it('sets aria-required when required', async () => {
    const el = await fixture('<civ-date-input label="Date" required></civ-date-input>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-date-input label="Date"></civ-date-input>');

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-date-input') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = await fixture('<civ-date-input label="Start date" name="start"></civ-date-input>');

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = await fixture('<civ-date-input label="Start date" name="start"></civ-date-input>');

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});

describe('civ-memorable-date', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture('<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>');

    const fieldset = el.querySelector('fieldset');
    const legend = el.querySelector('legend');
    expect(fieldset).not.toBeNull();
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Date of birth');
  });

  it('renders month select and day/year inputs', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');

    const select = el.querySelector('civ-select');
    const textInputs = el.querySelectorAll('civ-text-input');
    expect(select).not.toBeNull();
    expect(textInputs.length).toBe(2);
  });

  it('month select has 12 month options', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');

    const select = el.querySelector('civ-select') as any;
    expect(select.options.length).toBe(12);
    expect(select.options[0].label).toBe('January');
    expect(select.options[11].label).toBe('December');
  });

  it('renders error with alert role', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" error="Date is required"></civ-memorable-date>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Date is required');
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" required></civ-memorable-date>');

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" hint="For example: January 19 2000"></civ-memorable-date>');

    const spans = el.querySelectorAll('span');
    const hint = Array.from(spans).find((s) => s.textContent === 'For example: January 19 2000');
    expect(hint).not.toBeNull();
  });

  it('uses custom month-label on child select', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" name="dob" month-label="Mes"></civ-memorable-date>');

    const select = el.querySelector('civ-select') as any;
    expect(select.label).toBe('Mes');
  });

  it('uses locale-aware month names with locale="es"', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" name="dob" locale="es"></civ-memorable-date>');

    const select = el.querySelector('civ-select') as any;
    expect(select.options[0].label).toBe('enero');
    expect(select.options[11].label).toBe('diciembre');
  });

  it('uses custom day-label and year-label', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" name="dob" day-label="Día" year-label="Año"></civ-memorable-date>');

    const textInputs = el.querySelectorAll('civ-text-input');
    expect((textInputs[0] as any).label).toBe('Día');
    expect((textInputs[1] as any).label).toBe('Año');
  });

  it('lays out fields horizontally', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');

    const flexContainer = el.querySelector('[data-civ-memorable-date]');
    expect(flexContainer).not.toBeNull();
    expect(flexContainer!.classList.contains('civ-flex')).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-memorable-date legend="DOB"></civ-memorable-date>');

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-memorable-date') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

describe('memorable-date validation', () => {
  it('produces empty value and shows error for invalid dates like Feb 30', async () => {
    const el = await fixture<HTMLElement>('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');
    await elementUpdated(el);

    const comp = el as any;
    // Set month=02 (February), day=30 -- an invalid date
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

    expect(comp.value).toBe('');
    expect(comp.error).toBeTruthy();
  });

  it('fieldset has aria-invalid attribute', async () => {
    const el = await fixture<HTMLElement>('<civ-memorable-date legend="DOB" error="Invalid date"></civ-memorable-date>');
    await elementUpdated(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('fieldset has aria-invalid="false" when no error', async () => {
    const el = await fixture<HTMLElement>('<civ-memorable-date legend="DOB"></civ-memorable-date>');
    await elementUpdated(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.getAttribute('aria-invalid')).toBe('false');
  });

  it('fieldset has aria-required attribute when required', async () => {
    const el = await fixture<HTMLElement>('<civ-memorable-date legend="DOB" required></civ-memorable-date>');
    await elementUpdated(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });

  it('shows error in live region when error is set', async () => {
    const el = await fixture<HTMLElement>('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');
    await elementUpdated(el);

    (el as any).error = 'Enter a valid date';
    await elementUpdated(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Enter a valid date');
  });

  it('day and year inputs use type="text" with inputmode="numeric"', async () => {
    const el = await fixture<HTMLElement>('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');
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
});
