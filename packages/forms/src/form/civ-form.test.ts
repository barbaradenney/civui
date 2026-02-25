import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-form.js';
import '../text-input/civ-text-input.js';

async function waitForChildren(el: HTMLElement): Promise<void> {
  await elementUpdated(el);
  const children = el.querySelectorAll('civ-text-input');
  for (const child of children) {
    await elementUpdated(child);
  }
}

afterEach(cleanupFixtures);

describe('civ-form', () => {
  it('uses Light DOM', async () => {
    const el = await fixture('<civ-form></civ-form>');

    expect(el.shadowRoot).toBeNull();
  });

  it('renders children as descendants', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `);
    await waitForChildren(el);

    const input = el.querySelector('civ-text-input');
    expect(input).not.toBeNull();
  });

  it('does not show error summary initially', async () => {
    const el = await fixture('<civ-form></civ-form>');

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).toBeNull();
  });

  it('validates required fields', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const errors = el.validate();
    expect(errors.length).toBe(1);
    expect(errors[0].name).toBe('name');
    expect(errors[0].message).toContain('Name');
  });

  it('returns empty errors for valid form', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const errors = el.validate();
    expect(errors.length).toBe(0);
  });

  it('returns no errors when required field has a value', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const errors = el.validate();
    expect(errors.length).toBe(0);
  });

  it('shows error summary after validation fails', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    // Trigger validation by clicking submit
    el._errors = el.validate();
    await elementUpdated(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).not.toBeNull();
    expect(summary!.textContent).toContain('1 error');
  });

  it('fires civ-invalid on invalid submit', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email" required></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    let eventDetail: any = null;
    el.addEventListener('civ-invalid', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    // Click the submit button
    const btn = el.querySelector('button[type="submit"]') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.errors.length).toBe(1);
  });

  it('fires civ-submit when form is valid', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    let submitted = false;
    el.addEventListener('civ-submit', () => {
      submitted = true;
    });

    const btn = el.querySelector('button[type="submit"]') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    expect(submitted).toBe(true);
  });

  it('clears errors on clearErrors()', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await elementUpdated(el);

    el.clearErrors();
    await elementUpdated(el);

    expect(el._errors.length).toBe(0);
    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).toBeNull();
  });

  it('clears errors on reset button click', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <button type="reset">Reset</button>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await elementUpdated(el);

    const btn = el.querySelector('button[type="reset"]') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    expect(el._errors.length).toBe(0);
  });

  it('error summary contains links for each error', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await elementUpdated(el);

    const links = el.querySelectorAll('[data-civ-error-summary] a');
    expect(links.length).toBe(2);

    for (const link of links) {
      const href = link.getAttribute('href');
      expect(href).toMatch(/^#/);
    }
  });

  it('counts multiple errors correctly', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="First" name="first" required></civ-text-input>
        <civ-text-input label="Last" name="last" required></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await elementUpdated(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary!.textContent).toContain('3 errors');
  });

  it('collects form data from children', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John"></civ-text-input>
        <civ-text-input label="Email" name="email" value="john@test.com"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const data = el.getFormData();
    expect(data.name).toBe('John');
    expect(data.email).toBe('john@test.com');
  });

  it('skips disabled fields during validation', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required disabled></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const errors = el.validate();
    expect(errors.length).toBe(1);
    expect(errors[0].name).toBe('email');
  });

  it('excludes disabled fields from getFormData()', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John" disabled></civ-text-input>
        <civ-text-input label="Email" name="email" value="john@test.com"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const data = el.getFormData();
    expect(data).not.toHaveProperty('name');
    expect(data.email).toBe('john@test.com');
  });

  it('excludes disabled fields from toFormData()', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John" disabled></civ-text-input>
        <civ-text-input label="Email" name="email" value="john@test.com"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const fd = el.toFormData();
    expect(fd.get('name')).toBeNull();
    expect(fd.get('email')).toBe('john@test.com');
  });

  it('sets role="form" on the host element', async () => {
    const el = await fixture('<civ-form></civ-form>');
    expect(el.getAttribute('role')).toBe('form');
  });

  it('sets aria-label from form-label attribute', async () => {
    const el = await fixture('<civ-form form-label="Registration"></civ-form>');
    expect(el.getAttribute('aria-label')).toBe('Registration');
  });

  it('submits on Enter key in a text input', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    let submitted = false;
    el.addEventListener('civ-submit', () => { submitted = true; });

    const input = el.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(submitted).toBe(true);
  });

  describe('analytics', () => {
    it('fires civ-analytics with submit action on valid submission', async () => {
      const el = await fixture(`
        <civ-form>
          <civ-text-input label="Name" name="name" value="John"></civ-text-input>
          <button type="submit">Submit</button>
        </civ-form>
      `) as any;
      await waitForChildren(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const button = el.querySelector('button')!;
      button.click();

      const submitCall = handler.mock.calls.find((c: any) => c[0].detail.action === 'submit');
      expect(submitCall).toBeTruthy();
      expect(submitCall[0].detail.componentName).toBe('civ-form');
    });

    it('fires civ-analytics with invalid action on validation failure', async () => {
      const el = await fixture(`
        <civ-form>
          <civ-text-input label="Name" name="name" required></civ-text-input>
          <button type="submit">Submit</button>
        </civ-form>
      `) as any;
      await waitForChildren(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const button = el.querySelector('button')!;
      button.click();

      const invalidCall = handler.mock.calls.find((c: any) => c[0].detail.action === 'invalid');
      expect(invalidCall).toBeTruthy();
      expect(invalidCall[0].detail.details.errorCount).toBe(1);
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = await fixture(`
        <civ-form disable-analytics>
          <civ-text-input label="Name" name="name" value="John"></civ-text-input>
          <button type="submit">Submit</button>
        </civ-form>
      `) as any;
      await waitForChildren(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const button = el.querySelector('button')!;
      button.click();

      const formAnalytics = handler.mock.calls.filter(
        (c: any) => c[0].detail.componentName === 'civ-form',
      );
      expect(formAnalytics.length).toBe(0);
    });

    it('never includes form data in analytics payload', async () => {
      const el = await fixture(`
        <civ-form>
          <civ-text-input label="Name" name="name" value="John Doe"></civ-text-input>
          <button type="submit">Submit</button>
        </civ-form>
      `) as any;
      await waitForChildren(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      const button = el.querySelector('button')!;
      button.click();

      for (const call of handler.mock.calls) {
        const detail = call[0].detail;
        expect(detail).not.toHaveProperty('formData');
        expect(detail).not.toHaveProperty('value');
      }
    });
  });
});

describe('form reset', () => {
  it('calls formResetCallback() on children instead of just setting value to empty', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John"></civ-text-input>
        <button type="reset">Reset</button>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const textInput = el.querySelector('civ-text-input') as any;
    const spy = vi.spyOn(textInput, 'formResetCallback');

    const btn = el.querySelector('button[type="reset"]') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('uses [data-civ-form-field] selector to discover form elements', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    // Any CivFormElement should be discoverable via [data-civ-form-field]
    const fields = el.querySelectorAll('[data-civ-form-field]');
    expect(fields.length).toBeGreaterThanOrEqual(1);

    // Validation should find required fields through this selector
    const errors = el.validate();
    expect(errors.length).toBe(1);
    expect(errors[0].name).toBe('name');
  });
});
