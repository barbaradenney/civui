import { describe, it, expect, afterEach, vi } from 'vitest';
import './civds-select.js';

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
  if ('updateComplete' in el) {
    await (el as any).updateComplete;
  }
}

afterEach(cleanup);

describe('civds-select', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civds-select label="State"></civds-select>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('State');
  });

  it('renders a select element', async () => {
    const el = createFixture('<civds-select label="State" name="state"></civds-select>');
    await waitForUpdate(el);

    const select = el.querySelector('select');
    expect(select).not.toBeNull();
    expect(select!.name).toBe('state');
  });

  it('associates label with select via for/id', async () => {
    const el = createFixture('<civds-select label="State"></civds-select>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const select = el.querySelector('select');
    expect(label!.getAttribute('for')).toBe(select!.id);
  });

  it('renders default empty option', async () => {
    const el = createFixture('<civds-select label="State"></civds-select>');
    await waitForUpdate(el);

    const options = el.querySelectorAll('option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('- Select -');
    expect(options[0].value).toBe('');
  });

  it('renders custom empty label', async () => {
    const el = createFixture('<civds-select label="State" empty-label="Choose one"></civds-select>');
    await waitForUpdate(el);

    const options = el.querySelectorAll('option');
    expect(options[0].textContent).toContain('Choose one');
  });

  it('renders options from property', async () => {
    const el = createFixture('<civds-select label="State" name="state"></civds-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'TX', label: 'Texas' },
    ];
    await waitForUpdate(el);

    const options = el.querySelectorAll('option');
    // 1 empty + 3 real options
    expect(options.length).toBe(4);
    expect(options[1].value).toBe('CA');
    expect(options[1].textContent).toContain('California');
    expect(options[2].value).toBe('NY');
    expect(options[3].value).toBe('TX');
  });

  it('renders disabled options', async () => {
    const el = createFixture('<civds-select label="State"></civds-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'XX', label: 'Unavailable', disabled: true },
    ];
    await waitForUpdate(el);

    const options = el.querySelectorAll('option');
    expect(options[2].disabled).toBe(true);
  });

  it('renders error message with alert role', async () => {
    const el = createFixture('<civds-select label="State" error="Selection required"></civds-select>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Selection required');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture('<civds-select label="State" error="Required"></civds-select>');
    await waitForUpdate(el);

    const select = el.querySelector('select');
    expect(select!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders hint text', async () => {
    const el = createFixture('<civds-select label="State" hint="Your state of residence"></civds-select>');
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Your state of residence');
    expect(hintSpan).not.toBeNull();
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civds-select label="State" required></civds-select>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders disabled state', async () => {
    const el = createFixture('<civds-select label="State" disabled></civds-select>');
    await waitForUpdate(el);

    const select = el.querySelector('select');
    expect(select!.disabled).toBe(true);
  });

  it('fires civds-change event on selection', async () => {
    const el = createFixture('<civds-select label="State" name="state"></civds-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
    ];
    await waitForUpdate(el);

    const select = el.querySelector('select')!;
    let eventDetail: any = null;

    el.addEventListener('civds-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    select.value = 'CA';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'CA' });
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = createFixture('<civds-select label="State"></civds-select>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('select')).not.toBeNull();
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civds-select label="State" required></civds-select>');
    await waitForUpdate(el);

    const select = el.querySelector('select');
    expect(select!.getAttribute('aria-required')).toBe('true');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-select') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = createFixture('<civds-select label="State" name="state"></civds-select>');
    await waitForUpdate(el);

    const select = el.querySelector('select');
    expect(select!.className).toContain('focus-visible:civds-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = createFixture('<civds-select label="State" name="state"></civds-select>');
    await waitForUpdate(el);

    const select = el.querySelector('select');
    expect(select!.className).not.toContain('focus:civds-outline-2');
    expect(select!.className).not.toContain('focus:civds-outline-primary');
    expect(select!.className).not.toContain('focus:civds-outline-offset-0');
  });

  describe('analytics', () => {
    it('fires civds-analytics on selection change', async () => {
      const el = createFixture('<civds-select label="State" name="state"></civds-select>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      const select = el.querySelector('select')!;
      select.value = 'CA';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      expect(handler).toHaveBeenCalledOnce();
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.componentName).toBe('civds-select');
      expect(detail.action).toBe('change');
      expect(detail.fieldName).toBe('state');
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = createFixture('<civds-select label="State" name="state" disable-analytics></civds-select>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      const select = el.querySelector('select')!;
      select.value = 'CA';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('never includes value in analytics payload', async () => {
      const el = createFixture('<civds-select label="State" name="state"></civds-select>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await waitForUpdate(el);

      const handler = vi.fn();
      el.addEventListener('civds-analytics', handler as EventListener);

      const select = el.querySelector('select')!;
      select.value = 'CA';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      const detail = handler.mock.calls[0][0].detail;
      expect(detail).not.toHaveProperty('value');
    });
  });
});
