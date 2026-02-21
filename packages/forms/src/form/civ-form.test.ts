import { describe, it, expect, afterEach, vi } from 'vitest';
import './civ-form.js';
import '../text-input/civ-text-input.js';

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

async function waitForChildren(el: HTMLElement): Promise<void> {
  await waitForUpdate(el);
  const children = el.querySelectorAll('civ-text-input');
  for (const child of children) {
    await waitForUpdate(child);
  }
}

afterEach(cleanup);

describe('civ-form', () => {
  it('uses Light DOM', async () => {
    const el = createFixture('<civ-form></civ-form>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });

  it('renders children as descendants', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `);
    await waitForChildren(el);

    const input = el.querySelector('civ-text-input');
    expect(input).not.toBeNull();
  });

  it('does not show error summary initially', async () => {
    const el = createFixture('<civ-form></civ-form>');
    await waitForUpdate(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).toBeNull();
  });

  it('validates required fields', async () => {
    const el = createFixture(`
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
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const errors = el.validate();
    expect(errors.length).toBe(0);
  });

  it('returns no errors when required field has a value', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" value="John" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    const errors = el.validate();
    expect(errors.length).toBe(0);
  });

  it('shows error summary after validation fails', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    // Trigger validation by clicking submit
    el._errors = el.validate();
    await waitForUpdate(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).not.toBeNull();
    expect(summary!.textContent).toContain('1 error');
  });

  it('fires civ-invalid on invalid submit', async () => {
    const el = createFixture(`
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
    await waitForUpdate(el);

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.errors.length).toBe(1);
  });

  it('fires civ-submit when form is valid', async () => {
    const el = createFixture(`
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
    await waitForUpdate(el);

    expect(submitted).toBe(true);
  });

  it('clears errors on clearErrors()', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await waitForUpdate(el);

    el.clearErrors();
    await waitForUpdate(el);

    expect(el._errors.length).toBe(0);
    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).toBeNull();
  });

  it('clears errors on reset button click', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <button type="reset">Reset</button>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await waitForUpdate(el);

    const btn = el.querySelector('button[type="reset"]') as HTMLElement;
    btn.click();
    await waitForUpdate(el);

    expect(el._errors.length).toBe(0);
  });

  it('error summary contains links for each error', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await waitForUpdate(el);

    const links = el.querySelectorAll('[data-civ-error-summary] a');
    expect(links.length).toBe(2);

    for (const link of links) {
      const href = link.getAttribute('href');
      expect(href).toMatch(/^#/);
    }
  });

  it('counts multiple errors correctly', async () => {
    const el = createFixture(`
      <civ-form>
        <civ-text-input label="First" name="first" required></civ-text-input>
        <civ-text-input label="Last" name="last" required></civ-text-input>
        <civ-text-input label="Email" name="email" required></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el._errors = el.validate();
    await waitForUpdate(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary!.textContent).toContain('3 errors');
  });

  it('collects form data from children', async () => {
    const el = createFixture(`
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

  describe('analytics', () => {
    it('fires civ-analytics with submit action on valid submission', async () => {
      const el = createFixture(`
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
      const el = createFixture(`
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
      const el = createFixture(`
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
      const el = createFixture(`
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
