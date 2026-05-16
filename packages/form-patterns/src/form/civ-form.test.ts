import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-form.js';
import '../conditional/civ-conditional.js';
import '@civui/inputs';

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

describe('civ-form persistence', () => {
  afterEach(() => {
    cleanupFixtures();
    sessionStorage.clear();
  });

  it('saves field values to sessionStorage on input', async () => {
    const el = await fixture(`
      <civ-form persist="test-form">
        <civ-text-input label="Name" name="name" value=""></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    // Set value on the field
    const field = el.querySelector('civ-text-input') as any;
    field.value = 'Jane';

    // Dispatch civ-input to trigger persist
    el.dispatchEvent(new CustomEvent('civ-input', { bubbles: true }));

    // Wait for the 500ms debounce in _persistFormData
    await new Promise((r) => setTimeout(r, 600));

    const saved = sessionStorage.getItem('civ-form:test-form');
    expect(saved).not.toBeNull();
    const data = JSON.parse(saved!);
    expect(data.name).toBe('Jane');
  });

  it('clears persisted data on reset', async () => {
    sessionStorage.setItem('civ-form:test-form', JSON.stringify({ name: 'Jane' }));

    const el = await fixture(`
      <civ-form persist="test-form">
        <civ-text-input label="Name" name="name" value=""></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    el.reset();
    expect(sessionStorage.getItem('civ-form:test-form')).toBeNull();
  });
});

describe('civ-form URL prefill', () => {
  afterEach(cleanupFixtures);

  it('does not crash when window.location has no params', async () => {
    const el = await fixture(`
      <civ-form prefill>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `) as any;
    await waitForChildren(el);

    // Should not throw — just a smoke test
    expect(el).toBeTruthy();
  });
});

describe('civ-form support resources', () => {
  it('renders a support-resources footer when provided as JSON attribute', async () => {
    const el = await fixture(`
      <civ-form support-resources='[{"label":"988 Lifeline","href":"tel:988","description":"24/7"}]'>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-form>
    `);
    await elementUpdated(el);

    const aside = el.querySelector('[data-civ-support-resources]');
    expect(aside).not.toBeNull();
    const link = aside!.querySelector('a');
    expect(link!.getAttribute('href')).toBe('tel:988');
    expect(link!.textContent).toBe('988 Lifeline');
    expect(aside!.textContent).toContain('24/7');
  });

  it('drops entries with unsafe href schemes', async () => {
    const el = await fixture(`
      <civ-form support-resources='[{"label":"Bad","href":"javascript:alert(1)"},{"label":"OK","href":"https://va.gov"}]'>
      </civ-form>
    `);
    await elementUpdated(el);

    const links = el.querySelectorAll('[data-civ-support-resources] a');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toBe('OK');
  });

  it('drops protocol-relative URLs (//evil.com)', async () => {
    const el = await fixture(`
      <civ-form support-resources='[{"label":"Phish","href":"//evil.com/pwn"},{"label":"Root","href":"/help"}]'>
      </civ-form>
    `) as any;
    el.supportResources = [
      { label: 'Phish', href: '//evil.com/pwn' },
      { label: 'Whitespace phish', href: '   //evil.com/pwn' },
      { label: 'Root', href: '/help' },
    ];
    await elementUpdated(el);

    const links = el.querySelectorAll('[data-civ-support-resources] a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/help');
  });

  it('drops data: and vbscript: hrefs', async () => {
    const el = await fixture('<civ-form></civ-form>') as any;
    el.supportResources = [
      { label: 'Data', href: 'data:text/html,<script>alert(1)</script>' },
      { label: 'VBS', href: 'vbscript:msgbox(1)' },
      { label: 'OK', href: 'tel:988' },
    ];
    await elementUpdated(el);
    const links = el.querySelectorAll('[data-civ-support-resources] a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('tel:988');
  });

  it('does not render the footer when no resources are provided', async () => {
    const el = await fixture('<civ-form></civ-form>');
    await elementUpdated(el);
    expect(el.querySelector('[data-civ-support-resources]')).toBeNull();
  });

  it('accepts resources via JS property assignment', async () => {
    const el = await fixture('<civ-form></civ-form>') as any;
    el.supportResources = [{ label: 'Crisis text', href: 'sms:741741' }];
    await elementUpdated(el);
    const link = el.querySelector('[data-civ-support-resources] a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('sms:741741');
  });
});

describe('form reset', () => {
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

describe('civ-form setServerErrors', () => {
  afterEach(cleanupFixtures);

  it('sets error on each named field', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email"></civ-text-input>
        <civ-text-input label="Phone" name="phone"></civ-text-input>
      </civ-form>
    `) as any;
    await elementUpdated(el);

    el.setServerErrors({
      email: 'Already in use',
      phone: 'Invalid format',
    });
    await elementUpdated(el);

    const fields = el.querySelectorAll('[data-civ-form-field]');
    expect((fields[0] as any).error).toBe('Already in use');
    expect((fields[1] as any).error).toBe('Invalid format');
  });

  it('renders the error summary with one entry per server error', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email"></civ-text-input>
        <civ-text-input label="Phone" name="phone"></civ-text-input>
      </civ-form>
    `) as any;
    await elementUpdated(el);

    el.setServerErrors({ email: 'Already in use', phone: 'Invalid' });
    await elementUpdated(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).not.toBeNull();
    const items = summary!.querySelectorAll('a');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Already in use');
    expect(items[1].textContent).toContain('Invalid');
  });

  it('skips unknown field names silently', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email"></civ-text-input>
      </civ-form>
    `) as any;
    await elementUpdated(el);

    el.setServerErrors({
      email: 'Already in use',
      'does-not-exist': 'Never seen',
    });
    await elementUpdated(el);

    const summary = el.querySelector('[data-civ-error-summary]');
    expect(summary).not.toBeNull();
    expect(summary!.querySelectorAll('a').length).toBe(1);
  });

  it('replaces previous server errors on each call (does not append)', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email"></civ-text-input>
        <civ-text-input label="Phone" name="phone"></civ-text-input>
      </civ-form>
    `) as any;
    await elementUpdated(el);

    el.setServerErrors({ email: 'First error' });
    await elementUpdated(el);
    expect(el.querySelectorAll('[data-civ-error-summary] a').length).toBe(1);

    el.setServerErrors({ phone: 'Second error' });
    await elementUpdated(el);

    const fields = el.querySelectorAll('[data-civ-form-field]');
    // First field's error should be cleared on the second call.
    expect((fields[0] as any).error).toBe('');
    expect((fields[1] as any).error).toBe('Second error');
    expect(el.querySelectorAll('[data-civ-error-summary] a').length).toBe(1);
  });

  it('clears the summary and field errors when called with an empty object', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email"></civ-text-input>
      </civ-form>
    `) as any;
    await elementUpdated(el);

    el.setServerErrors({ email: 'Already in use' });
    await elementUpdated(el);
    expect(el.querySelector('[data-civ-error-summary]')).not.toBeNull();

    el.setServerErrors({});
    await elementUpdated(el);

    expect(el.querySelector('[data-civ-error-summary]')).toBeNull();
    const field = el.querySelector('[data-civ-form-field]') as any;
    expect(field.error).toBe('');
  });

  it('fires civ-server-errors with the error list', async () => {
    const el = await fixture(`
      <civ-form>
        <civ-text-input label="Email" name="email"></civ-text-input>
      </civ-form>
    `) as any;
    await elementUpdated(el);

    let captured: any = null;
    el.addEventListener('civ-server-errors', ((e: CustomEvent) => { captured = e.detail; }) as EventListener);

    el.setServerErrors({ email: 'Server says no' });
    await elementUpdated(el);

    expect(captured).not.toBeNull();
    expect(captured.errors.length).toBe(1);
    expect(captured.errors[0].name).toBe('email');
    expect(captured.errors[0].message).toBe('Server says no');
  });
});

async function settleConditional(el: HTMLElement): Promise<void> {
  await elementUpdated(el);
  const conditionals = el.querySelectorAll('civ-conditional');
  for (const c of conditionals) {
    await elementUpdated(c);
  }
  // _relocateSlots runs in firstUpdated; wait one more microtask so children
  // are inside the [data-civ-conditional-content] wrapper.
  await new Promise((r) => requestAnimationFrame(r));
  await elementUpdated(el);
}

describe('civ-form + civ-conditional', () => {
  it('does not validate fields inside a hidden civ-conditional', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-yes-no legend="Are you a veteran?" name="isVeteran" required></civ-yes-no>
        <civ-conditional when="isVeteran" equals="yes">
          <civ-text-input label="Branch of service" name="branch" required></civ-text-input>
        </civ-conditional>
      </civ-form>
    `) as any;
    await settleConditional(el);

    const errors = el.validate();
    // Only the visible required field (the yes-no) should be flagged —
    // the hidden text-input must not appear in the error summary.
    expect(errors.map((e: { name: string }) => e.name)).toEqual(['isVeteran']);
  });

  it('validates fields inside a revealed civ-conditional', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-yes-no legend="Are you a veteran?" name="isVeteran" required value="yes"></civ-yes-no>
        <civ-conditional when="isVeteran" equals="yes">
          <civ-text-input label="Branch of service" name="branch" required></civ-text-input>
        </civ-conditional>
      </civ-form>
    `) as any;
    await settleConditional(el);

    const errors = el.validate();
    const names = errors.map((e: { name: string }) => e.name).sort();
    expect(names).toEqual(['branch']);
  });

  it('omits hidden-conditional fields from getFormData()', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <civ-yes-no legend="Are you a veteran?" name="isVeteran"></civ-yes-no>
        <civ-conditional when="isVeteran" equals="yes">
          <civ-text-input label="Branch" name="branch" value="Army"></civ-text-input>
        </civ-conditional>
      </civ-form>
    `) as any;
    await settleConditional(el);

    const data = el.getFormData();
    expect(data.name).toBe('Ada');
    expect(data.branch).toBeUndefined();
  });
});

describe('civ-form required-legend', () => {
  it('does not render the legend by default', async () => {
    const el = await fixture('<civ-form form-label="Test"></civ-form>');
    expect(el.querySelector('.civ-form-required-legend')).toBeNull();
  });

  it('renders "* indicates a required field" when required-legend is set', async () => {
    const el = await fixture('<civ-form form-label="Test" required-legend></civ-form>');
    const legend = el.querySelector('.civ-form-required-legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('indicates a required field');
    expect(legend!.querySelector('.civ-required-mark')).not.toBeNull();
  });
});

describe('civ-form disclosures slot', () => {
  it('relocates children marked with data-civ-form-disclosures into the footer', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-text-input label="Name" name="name"></civ-text-input>
        <div data-civ-form-disclosures>
          <p>Privacy Act Notice — provided per 5 USC § 552a.</p>
          <p>Paperwork Reduction Act — OMB Control No. 1234-5678.</p>
        </div>
      </civ-form>
    `);
    const slot = el.querySelector('[data-civ-form-disclosures-slot]')!;
    expect(slot).not.toBeNull();
    expect(slot.textContent).toContain('Privacy Act');
    expect(slot.textContent).toContain('Paperwork Reduction');
  });
});

describe('civ-form confirm-before-submit', () => {
  it('does not fire civ-submit immediately when confirm-before-submit is set', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const submitHandler = vi.fn();
    const confirmHandler = vi.fn();
    el.addEventListener('civ-submit', submitHandler as EventListener);
    el.addEventListener('civ-submit-confirm', confirmHandler as EventListener);

    const button = el.querySelector('button') as HTMLButtonElement;
    button.click();
    await elementUpdated(el);

    expect(confirmHandler).toHaveBeenCalledTimes(1);
    expect(submitHandler).not.toHaveBeenCalled();
  });

  it('fires civ-submit when proceed() is called', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const submitHandler = vi.fn();
    el.addEventListener('civ-submit', submitHandler as EventListener);

    el.addEventListener('civ-submit-confirm', ((e: CustomEvent) => {
      e.detail.proceed();
    }) as EventListener);

    const button = el.querySelector('button') as HTMLButtonElement;
    button.click();
    await elementUpdated(el);

    expect(submitHandler).toHaveBeenCalledTimes(1);
  });

  it('fires civ-submit-cancelled when cancel() is called', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const cancelHandler = vi.fn();
    const submitHandler = vi.fn();
    el.addEventListener('civ-submit', submitHandler as EventListener);
    el.addEventListener('civ-submit-cancelled', cancelHandler as EventListener);

    el.addEventListener('civ-submit-confirm', ((e: CustomEvent) => {
      e.detail.cancel();
    }) as EventListener);

    const button = el.querySelector('button') as HTMLButtonElement;
    button.click();
    await elementUpdated(el);

    expect(cancelHandler).toHaveBeenCalledTimes(1);
    expect(submitHandler).not.toHaveBeenCalled();
  });

  it('proceed() and cancel() are idempotent', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const submitHandler = vi.fn();
    el.addEventListener('civ-submit', submitHandler as EventListener);

    el.addEventListener('civ-submit-confirm', ((e: CustomEvent) => {
      e.detail.proceed();
      e.detail.proceed();
      e.detail.cancel();
    }) as EventListener);

    (el.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(submitHandler).toHaveBeenCalledTimes(1);
  });

  it('still blocks submit when validation fails (confirm only fires after validation passes)', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" required></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const submitHandler = vi.fn();
    const confirmHandler = vi.fn();
    const invalidHandler = vi.fn();
    el.addEventListener('civ-submit', submitHandler as EventListener);
    el.addEventListener('civ-submit-confirm', confirmHandler as EventListener);
    el.addEventListener('civ-invalid', invalidHandler as EventListener);

    (el.querySelector('button') as HTMLButtonElement).click();
    await elementUpdated(el);

    expect(invalidHandler).toHaveBeenCalledTimes(1);
    expect(confirmHandler).not.toHaveBeenCalled();
    expect(submitHandler).not.toHaveBeenCalled();
  });

  it('drops repeat submits while a confirm is pending (single-flight)', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const confirmHandler = vi.fn();
    const submitHandler = vi.fn();
    el.addEventListener('civ-submit-confirm', confirmHandler as EventListener);
    el.addEventListener('civ-submit', submitHandler as EventListener);

    // Don't resolve — just click twice. Without the in-flight guard,
    // each click would dispatch its own civ-submit-confirm with a
    // fresh {proceed, cancel} pair.
    const button = el.querySelector('button') as HTMLButtonElement;
    button.click();
    button.click();
    await elementUpdated(el);

    expect(confirmHandler).toHaveBeenCalledTimes(1);
  });

  it('lets a new confirm happen after the first resolves', async () => {
    const el = await fixture(`
      <civ-form form-label="Test" confirm-before-submit>
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <button type="submit">Submit</button>
      </civ-form>
    `);

    const confirmHandler = vi.fn((e: CustomEvent) => e.detail.cancel());
    el.addEventListener('civ-submit-confirm', confirmHandler as EventListener);

    const button = el.querySelector('button') as HTMLButtonElement;
    button.click();
    await elementUpdated(el);
    button.click();
    await elementUpdated(el);

    // First click cancelled, second click fires a fresh confirm.
    expect(confirmHandler).toHaveBeenCalledTimes(2);
  });
});

describe('civ-form excludePii filtering on getFormData', () => {
  it('includes PII fields by default (existing behavior)', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <civ-ssn name="ssn" value="123456789"></civ-ssn>
      </civ-form>
    `) as any;
    const data = el.getFormData();
    expect(data.name).toBe('Ada');
    // civ-ssn carries data-civ-pii — by default it's still included so
    // submit handlers see it; the excludePii option is opt-in.
    expect(data.ssn).toBeTruthy();
  });

  it('excludes PII fields when excludePii: true', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-text-input label="Name" name="name" value="Ada"></civ-text-input>
        <civ-ssn name="ssn" value="123456789"></civ-ssn>
      </civ-form>
    `) as any;
    const data = el.getFormData({ excludePii: true });
    expect(data.name).toBe('Ada');
    expect(data.ssn).toBeUndefined();
  });

  it('excludes data-persist-exclude fields when excludePii: true', async () => {
    const el = await fixture(`
      <civ-form form-label="Test">
        <civ-text-input label="Public" name="pub" value="yes"></civ-text-input>
        <civ-text-input label="Internal" name="internal" value="hidden" data-persist-exclude></civ-text-input>
      </civ-form>
    `) as any;
    const data = el.getFormData({ excludePii: true });
    expect(data.pub).toBe('yes');
    expect(data.internal).toBeUndefined();
  });
});
