import { describe, it, expect, afterEach, vi } from 'vitest';
import "@civui/inputs";
import "@civui/controls";
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-address.js';
import type { CivAddress } from './civ-address.js';

afterEach(cleanupFixtures);

describe('civ-address', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Mailing address"></civ-address>');

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Mailing address');
  });

  it('renders all six fields by default (country, street1, street2, city, state, zip)', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    const inputs = el.querySelectorAll('input');
    expect(inputs.length).toBe(5); // country (combobox), street1, street2, city, zip

    const selects = el.querySelectorAll('select');
    expect(selects.length).toBe(1); // state
  });

  it('hides street2 when showStreet2 is false', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');
    (el as any).showStreet2 = false;
    await elementUpdated(el);

    const inputs = el.querySelectorAll('input');
    expect(inputs.length).toBe(4); // country (combobox), street1, city, zip — no street2
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address"></civ-address>');
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-address') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('sets data-civ-form-field attribute', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address"></civ-address>');
    expect(el.hasAttribute('data-civ-form-field')).toBe(true);
  });

  it('renders labels for all fields', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    const labels = el.querySelectorAll('label');
    const labelTexts = Array.from(labels).map(l => l.textContent!.trim());
    expect(labelTexts).toContain('Street address');
    expect(labelTexts).toContain('Street address line 2');
    expect(labelTexts).toContain('City');
    expect(labelTexts).toContain('State');
    expect(labelTexts).toContain('ZIP code');
  });

  it('associates labels with inputs via for/id', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    const labels = el.querySelectorAll('label');
    for (const label of labels) {
      const forId = label.getAttribute('for');
      expect(forId).toBeTruthy();
      const target = el.querySelector(`#${forId}`);
      expect(target).not.toBeNull();
    }
  });

  it('renders state select with all US states, territories, and military codes', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');
    await elementUpdated(el);

    const select = el.querySelector('select')!;
    const options = select.querySelectorAll('option');
    // 1 empty + 50 states + DC + 5 territories + 3 military (AA/AE/AP) = 60
    expect(options.length).toBe(60);
    expect(options[0].value).toBe('');
  });

  it('fires civ-input on field change', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    let eventDetail: any = null;
    el.addEventListener('civ-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const streetInput = el.querySelector('civ-text-input')!;
    const street = streetInput.querySelector('input')!;
    street.value = '123 Main St';
    street.dispatchEvent(new Event('input', { bubbles: true }));

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.value.street1).toBe('123 Main St');
  });

  it('fires civ-change on committed field change', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    let eventDetail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const streetInput = el.querySelector('civ-text-input')!;
    const street = streetInput.querySelector('input')!;
    street.value = '456 Oak Ave';
    street.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.value.street1).toBe('456 Oak Ave');
  });

  it('sets autocomplete attributes on sub-components', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    const textInputs = el.querySelectorAll('civ-text-input');
    const stateSelect = el.querySelector('civ-select');

    // street1, street2, city, zip = 4 text inputs; state = 1 select
    expect(textInputs[0].getAttribute('autocomplete')).toBe('address-line1');
    expect(textInputs[1].getAttribute('autocomplete')).toBe('address-line2');
    expect(textInputs[2].getAttribute('autocomplete')).toBe('address-level2');
    expect(stateSelect!.getAttribute('autocomplete')).toBe('address-level1');
    expect(textInputs[3].getAttribute('autocomplete')).toBe('postal-code');
  });

  it('renders required indicator in legend', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" required></civ-address>');

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
  });

  it('disables all fields when disabled', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" disabled></civ-address>');

    const fieldset = el.querySelector('fieldset')!;
    expect(fieldset.disabled).toBe(true);
  });

  it('renders error message with alert role', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" error="Please complete your address"></civ-address>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Please complete your address');
  });

  it('renders field-level errors', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" street-error="Street is required"></civ-address>');

    const alerts = el.querySelectorAll('[role="alert"]');
    const texts = Array.from(alerts).map(a => a.textContent);
    expect(texts).toContain('Street is required');
  });

  it('renders hint text', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" hint="US addresses only"></civ-address>');

    const hint = el.querySelector('.civ-hint--group');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('US addresses only');
  });

  it('gets and sets addressValue', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>') as CivAddress;

    el.addressValue = {
      street1: '123 Main St',
      street2: 'Apt 4',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
    };
    await elementUpdated(el);

    const addr = el.addressValue;
    expect(addr.street1).toBe('123 Main St');
    expect(addr.city).toBe('Springfield');
    expect(addr.state).toBe('IL');
    expect(addr.zip).toBe('62701');
  });

  it('isEmpty returns true when no fields are filled', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address"></civ-address>') as CivAddress;
    expect(el.isEmpty()).toBe(true);
  });

  it('isEmpty returns false when any field is filled', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address"></civ-address>') as CivAddress;

    const streetInput = el.querySelector('civ-text-input')!;
    const street = streetInput.querySelector('input')!;
    street.value = '123 Main St';
    street.dispatchEvent(new Event('input', { bubbles: true }));

    expect(el.isEmpty()).toBe(false);
  });

  it('resets all fields on formResetCallback', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address"></civ-address>') as CivAddress;

    el.addressValue = { street1: '123', street2: '', city: 'Test', state: 'CA', zip: '90210' };
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);

    expect(el.isEmpty()).toBe(true);
    expect(el.error).toBe('');
  });

  it('sets aria-required on fieldset and required sub-fields', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr" required></civ-address>');

    const fieldset = el.querySelector('fieldset')!;
    expect(fieldset.getAttribute('aria-required')).toBe('true');

    // Required sub-fields (street1, city, state, zip) should have aria-required
    // Non-required sub-fields (country, street2) should not
    const streetInput = el.querySelector('civ-text-input')!;
    expect(streetInput.querySelector('input')!.getAttribute('aria-required')).toBe('true');
  });

  it('omits aria-required when not required', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

    const inputs = el.querySelectorAll('input');
    const select = el.querySelector('select')!;

    expect(inputs[0].hasAttribute('aria-required')).toBe(false);
    expect(select.hasAttribute('aria-required')).toBe(false);
  });

  it('disables via formDisabledCallback', async () => {
    const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>') as any;
    el.formDisabledCallback(true);
    await elementUpdated(el);

    const fieldset = el.querySelector('fieldset')!;
    expect(fieldset.disabled).toBe(true);

    el.formDisabledCallback(false);
    await elementUpdated(el);
    expect(el.querySelector('fieldset')!.disabled).toBe(false);
  });

  describe('analytics', () => {
    it('fires civ-analytics on field change', async () => {
      const el = await fixture<CivAddress>('<civ-address legend="Address" name="addr"></civ-address>');

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      // Trigger change via the sub-component's inner input
      const streetInput = el.querySelector('civ-text-input');
      const innerInput = streetInput!.querySelector('input')!;
      innerInput.value = '123 Main St';
      innerInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Sub-component fires civ-analytics (bubbles up)
      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe('required validation', () => {
    it('reports invalid when required and empty', async () => {
      const el = await fixture<any>('<civ-address legend="Mailing address" required></civ-address>');
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.valueMissing).toBe(true);
    });

    it('reports invalid when required and only street1 is set', async () => {
      const el = await fixture<any>('<civ-address legend="Mailing address" required></civ-address>');
      el.addressValue = {
        country: 'US', street1: '123 Main St', street2: '', street3: '',
        city: '', state: '', zip: '',       };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
    });

    it('reports valid when required and street1, city, state, zip are all filled', async () => {
      const el = await fixture<any>('<civ-address legend="Mailing address" required></civ-address>');
      el.addressValue = {
        country: 'US', street1: '123 Main St', street2: '', street3: '',
        city: 'Austin', state: 'TX', zip: '78701',       };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });

    it('reports valid when not required even if empty', async () => {
      const el = await fixture<any>('<civ-address legend="Mailing address"></civ-address>');
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });
  });
});

describe('civ-address validation modal', () => {
  it('does not show modal when validateAddress is not set', async () => {
    const el = await fixture<any>('<civ-address legend="Address" name="addr"></civ-address>');
    el.addressValue = {
      country: 'US', street1: '123 Main St', street2: '', street3: '',
      city: 'Austin', state: 'TX', zip: '78701',     };
    await elementUpdated(el);

    await el.runValidation();
    await elementUpdated(el);
    expect(el.querySelector('civ-modal')).toBeNull();
  });

  it('shows modal with suggestion when validateAddress returns one', async () => {
    const el = await fixture<any>('<civ-address legend="Address" name="addr"></civ-address>');
    el.addressValue = {
      country: 'US', street1: '123 Main St', street2: '', street3: '',
      city: 'Austin', state: 'TX', zip: '78701',     };
    el.validateAddress = async () => ({
      street1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701-1234',
    });
    await elementUpdated(el);

    // Don't await — it blocks until user picks
    const validationPromise = el.runValidation();
    await elementUpdated(el);
    await elementUpdated(el);

    const modal = el.querySelector('civ-modal');
    expect(modal).not.toBeNull();
    expect(modal!.getAttribute('heading')).toBe('Verify your address');

    // Clean up by keeping original
    el._onValidationKeepOriginal();
    await validationPromise;
  });

  it('updates address when user picks suggested', async () => {
    const el = await fixture<any>('<civ-address legend="Address" name="addr"></civ-address>');
    el.addressValue = {
      country: 'US', street1: '123 Main St', street2: '', street3: '',
      city: 'Austin', state: 'TX', zip: '78701',     };
    el.validateAddress = async () => ({
      street1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701-1234',
    });
    await elementUpdated(el);

    const validationPromise = el.runValidation();
    await elementUpdated(el);
    await elementUpdated(el);

    el._onValidationUseSuggested();
    await validationPromise;
    await elementUpdated(el);

    expect(el.addressValue.street1).toBe('123 Main Street');
    expect(el.addressValue.zip).toBe('78701-1234');
  });

  it('keeps original when user clicks keep', async () => {
    const el = await fixture<any>('<civ-address legend="Address" name="addr"></civ-address>');
    el.addressValue = {
      country: 'US', street1: '123 Main St', street2: '', street3: '',
      city: 'Austin', state: 'TX', zip: '78701',     };
    el.validateAddress = async () => ({
      street1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701-1234',
    });
    await elementUpdated(el);

    const validationPromise = el.runValidation();
    await elementUpdated(el);
    await elementUpdated(el);

    el._onValidationKeepOriginal();
    await validationPromise;
    await elementUpdated(el);

    expect(el.addressValue.street1).toBe('123 Main St');
    expect(el.addressValue.zip).toBe('78701');
  });

  it('closes modal when validation returns null (address is valid)', async () => {
    const el = await fixture<any>('<civ-address legend="Address" name="addr"></civ-address>');
    el.addressValue = {
      country: 'US', street1: '123 Main St', street2: '', street3: '',
      city: 'Austin', state: 'TX', zip: '78701',     };
    el.validateAddress = async () => null;
    await elementUpdated(el);

    await el.runValidation();
    await elementUpdated(el);

    expect(el.querySelector('civ-modal')).toBeNull();
  });
});
