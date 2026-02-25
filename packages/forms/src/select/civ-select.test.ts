import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-select.js';

afterEach(cleanupFixtures);

describe('civ-select', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('State');
  });

  it('renders a select element', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>');

    const select = el.querySelector('select');
    expect(select).not.toBeNull();
    expect(select!.name).toBe('state');
  });

  it('associates label with select via for/id', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>');

    const label = el.querySelector('label');
    const select = el.querySelector('select');
    expect(label!.getAttribute('for')).toBe(select!.id);
  });

  it('renders default empty option', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>');

    const options = el.querySelectorAll('option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('- Select -');
    expect(options[0].value).toBe('');
  });

  it('renders custom empty label', async () => {
    const el = await fixture('<civ-select label="State" empty-label="Choose one"></civ-select>');

    const options = el.querySelectorAll('option');
    expect(options[0].textContent).toContain('Choose one');
  });

  it('renders options from property', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'TX', label: 'Texas' },
    ];
    await elementUpdated(el);

    const options = el.querySelectorAll('option');
    // 1 empty + 3 real options
    expect(options.length).toBe(4);
    expect(options[1].value).toBe('CA');
    expect(options[1].textContent).toContain('California');
    expect(options[2].value).toBe('NY');
    expect(options[3].value).toBe('TX');
  });

  it('renders disabled options', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'XX', label: 'Unavailable', disabled: true },
    ];
    await elementUpdated(el);

    const options = el.querySelectorAll('option');
    expect(options[2].disabled).toBe(true);
  });

  it('renders error message with alert role', async () => {
    const el = await fixture('<civ-select label="State" error="Selection required"></civ-select>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Selection required');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-select label="State" error="Required"></civ-select>');

    const select = el.querySelector('select');
    expect(select!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-select label="State" hint="Your state of residence"></civ-select>');

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Your state of residence');
    expect(hintSpan).not.toBeNull();
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-select label="State" required></civ-select>');

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders disabled state', async () => {
    const el = await fixture('<civ-select label="State" disabled></civ-select>');

    const select = el.querySelector('select');
    expect(select!.disabled).toBe(true);
  });

  it('fires civ-change event on selection', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
    ];
    await elementUpdated(el);

    const select = el.querySelector('select')!;
    let eventDetail: any = null;

    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    select.value = 'CA';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'CA' });
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('select')).not.toBeNull();
  });

  it('sets aria-required when required', async () => {
    const el = await fixture('<civ-select label="State" required></civ-select>');

    const select = el.querySelector('select');
    expect(select!.getAttribute('aria-required')).toBe('true');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-select') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>');

    const select = el.querySelector('select');
    expect(select!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>');

    const select = el.querySelector('select');
    expect(select!.className).not.toContain('focus:civ-outline-2');
    expect(select!.className).not.toContain('focus:civ-outline-primary');
    expect(select!.className).not.toContain('focus:civ-outline-offset-0');
  });

  describe('analytics', () => {
    it('fires civ-analytics on selection change', async () => {
      const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const select = el.querySelector('select')!;
      select.value = 'CA';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      expect(handler).toHaveBeenCalledOnce();
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.componentName).toBe('civ-select');
      expect(detail.action).toBe('change');
      expect(detail.fieldName).toBe('state');
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = await fixture('<civ-select label="State" name="state" disable-analytics></civ-select>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const select = el.querySelector('select')!;
      select.value = 'CA';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('never includes value in analytics payload', async () => {
      const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const select = el.querySelector('select')!;
      select.value = 'CA';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      const detail = handler.mock.calls[0][0].detail;
      expect(detail).not.toHaveProperty('value');
    });
  });
});

describe('select formDisabledCallback', () => {
  it('disables the select when formDisabledCallback is called', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;
    el.options = [{ value: 'CA', label: 'California' }];
    await elementUpdated(el);

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const select = el.querySelector('select');
    expect(select!.disabled).toBe(true);
  });

  it('re-enables the select when formDisabledCallback(false) is called', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);
    el.formDisabledCallback(false);
    await elementUpdated(el);

    const select = el.querySelector('select');
    expect(select!.disabled).toBe(false);
  });
});

describe('civ-select civ-input event', () => {
  it('fires civ-input event on selection change', async () => {
    const el = await fixture<HTMLElement>('<civ-select label="State" name="state"></civ-select>');
    (el as any).options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
    ];
    await elementUpdated(el);

    const select = el.querySelector('select')!;
    let eventDetail: any = null;

    el.addEventListener('civ-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    select.value = 'NY';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.value).toBe('NY');
  });

  it('omits aria-invalid when no error', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>');

    const select = el.querySelector('select');
    expect(select!.hasAttribute('aria-invalid')).toBe(false);
  });

  it('omits aria-required when not required', async () => {
    const el = await fixture('<civ-select label="State"></civ-select>');

    const select = el.querySelector('select');
    expect(select!.hasAttribute('aria-required')).toBe(false);
  });

  it('sets aria-describedby for hint and error', async () => {
    const el = await fixture(
      '<civ-select label="State" hint="Your state" error="Required"></civ-select>',
    );

    const select = el.querySelector('select');
    const describedBy = select!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(' ');
    expect(ids.length).toBe(2);
    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('resets to default value on formResetCallback', async () => {
    const el = await fixture('<civ-select label="State" name="state"></civ-select>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
    ];
    await elementUpdated(el);

    el.value = 'NY';
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('');
  });
});
