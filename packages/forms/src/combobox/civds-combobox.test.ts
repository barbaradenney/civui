import { describe, it, expect, afterEach, vi } from 'vitest';
import './civds-combobox.js';

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
}

const STATES = [
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

afterEach(cleanup);

describe('civds-combobox', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('State');
  });

  it('renders a text input with combobox role', async () => {
    const el = createFixture('<civds-combobox label="State" name="state"></civds-combobox>');
    await waitForUpdate(el);

    const input = el.querySelector('input[role="combobox"]');
    expect(input).not.toBeNull();
  });

  it('sets aria-autocomplete="list"', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('starts with aria-expanded="false"', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens listbox on focus', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    await waitForUpdate(el);

    expect(input.getAttribute('aria-expanded')).toBe('true');
    const listbox = el.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
  });

  it('renders options in listbox', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await waitForUpdate(el);

    const options = el.querySelectorAll('[role="option"]');
    expect(options.length).toBe(5);
    expect(options[0].textContent).toContain('California');
  });

  it('filters options on input', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'Co';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForUpdate(el);

    const options = el.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2); // Colorado, Connecticut
  });

  it('shows "No results found" when no matches', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ZZZ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForUpdate(el);

    const noResults = el.querySelector('[role="status"]');
    expect(noResults).not.toBeNull();
    expect(noResults!.textContent).toContain('No results found');
  });

  it('selects option on click', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await waitForUpdate(el);

    let eventDetail: any = null;
    el.addEventListener('civds-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const firstOption = el.querySelector('[role="option"]') as HTMLElement;
    firstOption.click();
    await waitForUpdate(el);

    expect(eventDetail).toEqual({ value: 'CA', label: 'California' });
    expect(el.value).toBe('CA');
  });

  it('closes on Escape', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitForUpdate(el);

    expect(el._open).toBe(false);
  });

  it('navigates with arrow keys', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate(el);
    expect(el._activeIndex).toBe(0);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate(el);
    expect(el._activeIndex).toBe(1);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await waitForUpdate(el);
    expect(el._activeIndex).toBe(0);
  });

  it('selects on Enter', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    el._activeIndex = 1;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await waitForUpdate(el);

    expect(el.value).toBe('CO');
    expect(el._open).toBe(false);
  });

  it('renders error with alert role', async () => {
    const el = createFixture('<civds-combobox label="State" error="Required"></civds-combobox>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture('<civds-combobox label="State" error="Bad"></civds-combobox>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civds-combobox label="State" required></civds-combobox>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
  });

  it('renders disabled state', async () => {
    const el = createFixture('<civds-combobox label="State" disabled></civds-combobox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-combobox') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civds-combobox label="State" required></civds-combobox>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
  });

  it('opens dropdown on ArrowUp when closed', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    await waitForUpdate(el);

    expect(el._open).toBe(false);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await waitForUpdate(el);

    expect(el._open).toBe(true);
  });

  it('uses aria-labelledby on listbox instead of aria-label', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await waitForUpdate(el);

    const listbox = el.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox!.hasAttribute('aria-label')).toBe(false);

    const labelledBy = listbox!.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    const label = el.querySelector('label');
    expect(label!.id).toBe(labelledBy);
  });

  it('sets data-active on the active option', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    el._open = true;
    el._activeIndex = 1;
    await waitForUpdate(el);

    const options = el.querySelectorAll('[role="option"]');
    expect(options[1].hasAttribute('data-active')).toBe(true);
    expect(options[0].hasAttribute('data-active')).toBe(false);
  });

  it('sets aria-live="polite" on no-results status', async () => {
    const el = createFixture('<civds-combobox label="State"></civds-combobox>') as any;
    el.options = STATES;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ZZZ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForUpdate(el);

    const noResults = el.querySelector('[role="status"]');
    expect(noResults!.getAttribute('aria-live')).toBe('polite');
  });

  it('applies focus-visible ring class', async () => {
    const el = createFixture('<civds-combobox label="State" name="state"></civds-combobox>') as any;
    el.options = [{ value: 'CA', label: 'California' }];
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civds-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = createFixture('<civds-combobox label="State" name="state"></civds-combobox>') as any;
    el.options = [{ value: 'CA', label: 'California' }];
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civds-outline-2');
    expect(input!.className).not.toContain('focus:civds-outline-primary');
    expect(input!.className).not.toContain('focus:civds-outline-offset-0');
  });

  describe('i18n overrides', () => {
    it('uses custom no-results-text', async () => {
      const el = createFixture('<civds-combobox label="State" no-results-text="Sin resultados"></civds-combobox>') as any;
      el.options = STATES;
      await waitForUpdate(el);

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = 'ZZZ';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await waitForUpdate(el);

      const noResults = el.querySelector('[role="status"]');
      expect(noResults).not.toBeNull();
      expect(noResults!.textContent).toContain('Sin resultados');
    });
  });

  describe('analytics', () => {
    it('fires civds-analytics with select action on option pick', async () => {
      const el = createFixture('<civds-combobox label="State" name="state"></civds-combobox>') as any;
      el.options = [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
      ];
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      // Simulate selecting an option
      el._selectOption({ value: 'CA', label: 'California' });

      expect(handler).toHaveBeenCalledOnce();
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.componentName).toBe('civds-combobox');
      expect(detail.action).toBe('select');
      expect(detail.fieldName).toBe('state');
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = createFixture('<civds-combobox label="State" name="state" disable-analytics></civds-combobox>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      el._selectOption({ value: 'CA', label: 'California' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('never includes value in analytics payload', async () => {
      const el = createFixture('<civds-combobox label="State" name="state"></civds-combobox>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      el._selectOption({ value: 'CA', label: 'California' });

      const detail = handler.mock.calls[0][0].detail;
      expect(detail).not.toHaveProperty('value');
    });
  });
});
