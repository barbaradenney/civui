import { describe, it, expect, afterEach, vi } from 'vitest';
import "@civui/inputs";
import "@civui/controls";
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-signature.js';
import type { CivSignature } from './civ-signature.js';

afterEach(cleanupFixtures);

describe('civ-signature', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Statement of truth"></civ-signature>');
    expect(el.querySelector('fieldset')).not.toBeNull();
    expect(el.querySelector('legend')!.textContent).toContain('Statement of truth');
  });

  it('renders statement text when provided', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign" statement="I certify this is true."></civ-signature>');
    const p = el.querySelector('p');
    expect(p).not.toBeNull();
    expect(p!.textContent).toBe('I certify this is true.');
  });

  it('renders name input and checkbox', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign" name="sig"></civ-signature>');
    const textInput = el.querySelector('input[type="text"]');
    const checkbox = el.querySelector('input[type="checkbox"]');
    expect(textInput).not.toBeNull();
    expect(checkbox).not.toBeNull();
  });

  it('name input has autocomplete="name"', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign"></civ-signature>');
    const input = el.querySelector('input[type="text"]')!;
    expect(input.getAttribute('autocomplete')).toBe('name');
  });

  it('fires civ-input when name changes', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign" name="sig"></civ-signature>');
    let detail: any = null;
    el.addEventListener('civ-input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const input = el.querySelector('input[type="text"]')!;
    input.value = 'Jane Doe';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(detail.value.name).toBe('Jane Doe');
  });

  it('fires civ-change when checkbox changes', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign" name="sig"></civ-signature>');
    let detail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(detail.value.certified).toBe(true);
  });

  it('isComplete returns false when empty', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign"></civ-signature>') as CivSignature;
    expect(el.isComplete).toBe(false);
  });

  it('isComplete returns true when name entered and certified', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign"></civ-signature>') as CivSignature;
    el.signatureValue = { name: 'Jane Doe', certified: true };
    expect(el.isComplete).toBe(true);
  });

  it('renders field-level errors', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign" name-error="Enter your name" certify-error="You must certify"></civ-signature>');
    const alerts = el.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBe(2);
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-signature') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-signature legend="Sign"></civ-signature>');
    expect(el.shadowRoot).toBeNull();
  });

  it('resets on formResetCallback', async () => {
    const el = await fixture<CivSignature>('<civ-signature legend="Sign"></civ-signature>') as CivSignature;
    el.signatureValue = { name: 'Jane', certified: true };
    await elementUpdated(el);
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.signatureValue.name).toBe('');
    expect(el.signatureValue.certified).toBe(false);
  });

  describe('required validation', () => {
    it('reports invalid when required and empty', async () => {
      const el = await fixture<CivSignature>('<civ-signature legend="Sign" required></civ-signature>') as CivSignature;
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.valueMissing).toBe(true);
    });

    it('reports invalid when required and only name is set', async () => {
      const el = await fixture<CivSignature>('<civ-signature legend="Sign" required></civ-signature>') as CivSignature;
      el.signatureValue = { name: 'Ada Lovelace', certified: false };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
    });

    it('reports invalid when required and only certified is set', async () => {
      const el = await fixture<CivSignature>('<civ-signature legend="Sign" required></civ-signature>') as CivSignature;
      el.signatureValue = { name: '', certified: true };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(false);
    });

    it('reports valid when required and both name and certified are set', async () => {
      const el = await fixture<CivSignature>('<civ-signature legend="Sign" required></civ-signature>') as CivSignature;
      el.signatureValue = { name: 'Ada Lovelace', certified: true };
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });

    it('reports valid when not required even if empty', async () => {
      const el = await fixture<CivSignature>('<civ-signature legend="Sign"></civ-signature>') as CivSignature;
      await elementUpdated(el);
      expect(el.checkValidity()).toBe(true);
    });
  });
});
