import { describe, it, expect, afterEach, vi } from 'vitest';
import "@civui/inputs";
import "@civui/controls";
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-direct-deposit.js';
import type { CivDirectDeposit } from './civ-direct-deposit.js';

afterEach(cleanupFixtures);

describe('civ-direct-deposit', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Direct deposit"></civ-direct-deposit>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('legend')!.textContent).toContain('Direct deposit');
  });

  it('renders account type radio group with civ-radio components', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" name="bank"></civ-direct-deposit>');
    const radioGroup = el.querySelector('civ-radio-group');
    expect(radioGroup).not.toBeNull();
    const radios = el.querySelectorAll('civ-radio');
    expect(radios.length).toBe(2);
  });

  it('renders routing and account number fields', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" name="bank"></civ-direct-deposit>');
    const inputs = el.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(2);
  });

  it('routing number has maxlength 9', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" name="bank"></civ-direct-deposit>');
    const routingInput = el.querySelectorAll('input[type="text"]')[0];
    expect(routingInput.getAttribute('maxlength')).toBe('9');
  });

  it('fires civ-change when account type changes', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" name="bank"></civ-direct-deposit>');
    let detail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const radioGroup = el.querySelector('civ-radio-group') as any;
    // Simulate the radio group dispatching a civ-change event
    radioGroup.dispatchEvent(new CustomEvent('civ-change', { detail: { value: 'checking' }, bubbles: true }));
    expect(detail).not.toBeNull();
    expect(detail.value.accountType).toBe('checking');
  });

  it('fires civ-input when routing number changes', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" name="bank"></civ-direct-deposit>');
    let detail: any = null;
    el.addEventListener('civ-input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
    input.value = '123456789';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(detail.value.routingNumber).toBe('123456789');
  });

  it('renders hint text for routing and account', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" name="bank"></civ-direct-deposit>');
    const hints = el.querySelectorAll('.civ-hint');
    expect(hints.length).toBeGreaterThanOrEqual(2);
  });

  it('renders field-level errors', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" routing-error="Enter a valid routing number"></civ-direct-deposit>');
    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toBe('Enter a valid routing number');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-direct-deposit') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-direct-deposit legend="Deposit"></civ-direct-deposit>');
    expect(el.shadowRoot).toBeNull();
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit"></civ-direct-deposit>') as CivDirectDeposit;
    el.depositValue = { accountType: 'checking', routingNumber: '123456789', accountNumber: '987654' };
    await elementUpdated(el);
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.depositValue.accountType).toBe('');
    expect(el.depositValue.routingNumber).toBe('');
  });

  describe('required validation', () => {
    it('reports invalid when required and empty', async () => {
      const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" required></civ-direct-deposit>') as CivDirectDeposit;
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.valueMissing).toBe(true);
    });

    it('reports invalid when required and only routing number is set', async () => {
      const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" required></civ-direct-deposit>') as CivDirectDeposit;
      el.depositValue = { accountType: '', routingNumber: '123456789', accountNumber: '' };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
    });

    it('reports valid when required and all three fields are set', async () => {
      const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit" required></civ-direct-deposit>') as CivDirectDeposit;
      el.depositValue = { accountType: 'checking', routingNumber: '123456789', accountNumber: '987654' };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });

    it('reports valid when not required even if empty', async () => {
      const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit"></civ-direct-deposit>') as CivDirectDeposit;
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });
  });

  describe('routing number checksum (validate="routing")', () => {
    it('flags a checksum-failing routing number on the routing sub-input', async () => {
      const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit"></civ-direct-deposit>') as CivDirectDeposit;
      await elementUpdated(el);

      // Light DOM: civ-routing-number renders civ-text-input inline
      const routingField = el.querySelector('civ-routing-number civ-text-input') as any;
      const innerInput = routingField.querySelector('input') as HTMLInputElement;
      innerInput.value = '121000247';
      innerInput.dispatchEvent(new Event('input', { bubbles: true }));
      innerInput.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(routingField);
      await elementUpdated(routingField);

      expect(routingField.error).toContain('routing number');
    });

    it('accepts a checksum-valid routing number', async () => {
      const el = await fixture<CivDirectDeposit>('<civ-direct-deposit legend="Deposit"></civ-direct-deposit>') as CivDirectDeposit;
      await elementUpdated(el);

      const routingField = el.querySelector('civ-routing-number civ-text-input') as any;
      const innerInput = routingField.querySelector('input') as HTMLInputElement;
      innerInput.value = '121000248';
      innerInput.dispatchEvent(new Event('input', { bubbles: true }));
      innerInput.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(routingField);
      await elementUpdated(routingField);

      expect(routingField.error).toBe('');
    });
  });
});
