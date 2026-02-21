import { describe, it, expect, afterEach } from 'vitest';
import './civ-date-input.js';
import './civ-memorable-date.js';

function createFixture(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as HTMLElement;
}

function cleanup(): void {
  document.body.innerHTML = '';
}

async function waitForUpdate(el: HTMLElement): Promise<void> {
  if ('updateComplete' in el) await (el as any).updateComplete;
  const children = el.querySelectorAll('civ-select, civ-text-input');
  for (const child of children) {
    if ('updateComplete' in child) await (child as any).updateComplete;
  }
}

afterEach(cleanup);

describe('civ-date-input', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civ-date-input label="Birth date"></civ-date-input>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Birth date');
  });

  it('renders a date input', async () => {
    const el = createFixture('<civ-date-input label="Date" name="date"></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('date');
  });

  it('associates label with input', async () => {
    const el = createFixture('<civ-date-input label="Date"></civ-date-input>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('sets min and max attributes', async () => {
    const el = createFixture('<civ-date-input label="Date" min="2024-01-01" max="2024-12-31"></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('2024-01-01');
    expect(input.max).toBe('2024-12-31');
  });

  it('renders error with alert role', async () => {
    const el = createFixture('<civ-date-input label="Date" error="Invalid date"></civ-date-input>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Invalid date');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture('<civ-date-input label="Date" error="Bad"></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders disabled state', async () => {
    const el = createFixture('<civ-date-input label="Date" disabled></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civ-date-input label="Date" required></civ-date-input>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civ-date-input label="Date" required></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civ-date-input label="Date"></civ-date-input>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-date-input') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = createFixture('<civ-date-input label="Start date" name="start"></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = createFixture('<civ-date-input label="Start date" name="start"></civ-date-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});

describe('civ-memorable-date', () => {
  it('renders a fieldset with legend', async () => {
    const el = createFixture('<civ-memorable-date legend="Date of birth" name="dob"></civ-memorable-date>');
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    const legend = el.querySelector('legend');
    expect(fieldset).not.toBeNull();
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Date of birth');
  });

  it('renders month select and day/year inputs', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');
    await waitForUpdate(el);

    const select = el.querySelector('civ-select');
    const textInputs = el.querySelectorAll('civ-text-input');
    expect(select).not.toBeNull();
    expect(textInputs.length).toBe(2);
  });

  it('month select has 12 month options', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');
    await waitForUpdate(el);

    const select = el.querySelector('civ-select') as any;
    expect(select.options.length).toBe(12);
    expect(select.options[0].label).toBe('January');
    expect(select.options[11].label).toBe('December');
  });

  it('renders error with alert role', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" error="Date is required"></civ-memorable-date>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Date is required');
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" required></civ-memorable-date>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
  });

  it('renders hint text', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" hint="For example: January 19 2000"></civ-memorable-date>');
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hint = Array.from(spans).find((s) => s.textContent === 'For example: January 19 2000');
    expect(hint).not.toBeNull();
  });

  it('uses custom month-label on child select', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" name="dob" month-label="Mes"></civ-memorable-date>');
    await waitForUpdate(el);

    const select = el.querySelector('civ-select') as any;
    expect(select.label).toBe('Mes');
  });

  it('uses locale-aware month names with locale="es"', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" name="dob" locale="es"></civ-memorable-date>');
    await waitForUpdate(el);

    const select = el.querySelector('civ-select') as any;
    expect(select.options[0].label).toBe('enero');
    expect(select.options[11].label).toBe('diciembre');
  });

  it('uses custom day-label and year-label', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" name="dob" day-label="Día" year-label="Año"></civ-memorable-date>');
    await waitForUpdate(el);

    const textInputs = el.querySelectorAll('civ-text-input');
    expect((textInputs[0] as any).label).toBe('Día');
    expect((textInputs[1] as any).label).toBe('Año');
  });

  it('lays out fields horizontally', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB" name="dob"></civ-memorable-date>');
    await waitForUpdate(el);

    const flexContainer = el.querySelector('[data-civ-memorable-date]');
    expect(flexContainer).not.toBeNull();
    expect(flexContainer!.classList.contains('civ-flex')).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civ-memorable-date legend="DOB"></civ-memorable-date>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-memorable-date') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});
