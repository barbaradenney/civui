import { describe, it, expect, afterEach, vi } from 'vitest';
import "@civui/inputs";
import "@civui/controls";
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-name.js';
import type { CivName } from './civ-name.js';

afterEach(cleanupFixtures);

describe('civ-name', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture<CivName>('<civ-name legend="Your name"></civ-name>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('legend')!.textContent).toContain('Your name');
  });

  it('renders first, middle, last, and suffix fields by default', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name" name="n"></civ-name>');
    const inputs = el.querySelectorAll('input');
    expect(inputs.length).toBe(3); // first, middle, last
    expect(el.querySelectorAll('select').length).toBe(1); // suffix
  });

  it('hides middle name when showMiddle is false', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    (el as any).showMiddle = false;
    await elementUpdated(el);
    expect(el.querySelectorAll('input').length).toBe(2); // first, last only
  });

  it('hides suffix when showSuffix is false', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    (el as any).showSuffix = false;
    await elementUpdated(el);
    expect(el.querySelectorAll('select').length).toBe(0);
  });

  it('fires civ-input on field change', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name" name="n"></civ-name>');
    let detail: any = null;
    el.addEventListener('civ-input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.querySelector('input')!;
    input.value = 'Jane';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(detail).not.toBeNull();
    expect(detail.value.first).toBe('Jane');
  });

  it('fires civ-change on committed change', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name" name="n"></civ-name>');
    let detail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.querySelector('input')!;
    input.value = 'Doe';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(detail.value.first).toBe('Doe');
  });

  it('sets autocomplete attributes', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name" name="n"></civ-name>');
    const inputs = el.querySelectorAll('input');
    expect(inputs[0].getAttribute('autocomplete')).toBe('given-name');
    expect(inputs[1].getAttribute('autocomplete')).toBe('additional-name');
    expect(inputs[2].getAttribute('autocomplete')).toBe('family-name');
  });

  it('renders required indicator', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name" required></civ-name>');
    expect(el.querySelector('.civ-required-mark')).not.toBeNull();
  });

  it('renders field-level errors', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name" first-error="Enter a first name"></civ-name>');
    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toBe('Enter a first name');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-name') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-name legend="Name"></civ-name>');
    expect(el.shadowRoot).toBeNull();
  });

  it('gets and sets nameValue', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    el.nameValue = { first: 'Jane', middle: 'A', last: 'Doe', suffix: 'Jr.' };
    await elementUpdated(el);
    expect(el.nameValue.first).toBe('Jane');
    expect(el.nameValue.last).toBe('Doe');
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    el.nameValue = { first: 'Jane', middle: '', last: 'Doe', suffix: '' };
    await elementUpdated(el);
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.nameValue.first).toBe('');
  });

  describe('required validation', () => {
    it('reports invalid when required and empty', async () => {
      const el = await fixture<CivName>('<civ-name legend="Your name" required></civ-name>') as CivName;
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.valueMissing).toBe(true);
    });

    it('reports invalid when required and only first name is set', async () => {
      const el = await fixture<CivName>('<civ-name legend="Your name" required></civ-name>') as CivName;
      el.nameValue = { first: 'Ada', middle: '', last: '', suffix: '' };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
    });

    it('reports valid when required and both first and last are set', async () => {
      const el = await fixture<CivName>('<civ-name legend="Your name" required></civ-name>') as CivName;
      el.nameValue = { first: 'Ada', middle: '', last: 'Lovelace', suffix: '' };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });

    it('reports valid when not required even if empty', async () => {
      const el = await fixture<CivName>('<civ-name legend="Your name"></civ-name>') as CivName;
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });

    it('uses requiredMessage when provided', async () => {
      const el = await fixture<CivName>('<civ-name legend="Your name" required required-message="Please tell us your name"></civ-name>') as CivName;
      await elementUpdated(el);
      expect(el.validationMessage).toContain('Please tell us your name');
    });
  });

  it('uses domestic labels by default', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    const labels = Array.from(el.querySelectorAll('civ-form-field')).map(
      (field: any) => field.label,
    );
    expect(labels).toContain('First name');
    expect(labels).toContain('Last name');
  });

  it('uses international labels when format is international', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    el.format = 'international';
    await elementUpdated(el);
    const labels = Array.from(el.querySelectorAll('civ-form-field')).map(
      (field: any) => field.label,
    );
    expect(labels).toContain('Given name');
    expect(labels).toContain('Family name');
    expect(labels).toContain('Middle name'); // middle stays the same
  });

  it('sets autocomplete="honorific-suffix" on suffix select', async () => {
    const el = await fixture<CivName>('<civ-name legend="Name"></civ-name>') as CivName;
    const suffixSelect = el.querySelector('[data-name-suffix]') as any;
    expect(suffixSelect.getAttribute('autocomplete')).toBe('honorific-suffix');
  });
});
