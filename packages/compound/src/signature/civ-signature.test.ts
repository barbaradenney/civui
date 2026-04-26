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
    const statement = el.querySelector('[id*="statement"]');
    expect(statement).not.toBeNull();
    expect(statement!.textContent?.trim()).toBe('I certify this is true.');
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

  describe('statement → checkbox a11y link', () => {
    it('links the certify checkbox to the statement element via aria-describedby', async () => {
      const el = await fixture<CivSignature>(
        '<civ-signature legend="Sign" statement="I certify the information is true"></civ-signature>',
      ) as CivSignature;
      await elementUpdated(el);

      // Stable id on the rendered statement.
      const statement = el.querySelector('[id*="statement"]') as HTMLElement;
      expect(statement).not.toBeNull();
      expect(statement.textContent).toContain('I certify the information is true');

      // The certify checkbox's inner native input includes that id in its
      // aria-describedby chain.
      const checkboxInput = el.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement;
      const describedBy = checkboxInput.getAttribute('aria-describedby') ?? '';
      expect(describedBy.split(' ')).toContain(statement.id);
    });

    it('does not add aria-describedby link when no statement is provided', async () => {
      const el = await fixture<CivSignature>('<civ-signature legend="Sign"></civ-signature>') as CivSignature;
      await elementUpdated(el);

      expect(el.querySelector('[id*="statement"]')).toBeNull();
      // The checkbox may still have hint/error IDs in its describedby, but
      // it shouldn't reference a non-existent statement element.
    });
  });

  describe('statement slot (HTML support)', () => {
    it('renders slotted statement HTML in place of the text prop', async () => {
      const el = await fixture<CivSignature>(`
        <civ-signature legend="Sign">
          <span slot="statement">I certify under <a href="/penalty">penalty of perjury</a> that this is true.</span>
        </civ-signature>
      `) as CivSignature;
      await elementUpdated(el);

      const statement = el.querySelector('[id*="statement"]') as HTMLElement;
      expect(statement).not.toBeNull();
      // The <a> tag survives because we use unsafeHTML.
      const link = statement.querySelector('a');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/penalty');
      expect(link!.textContent).toBe('penalty of perjury');
    });

    it('removes the slotted child from the host so it does not double-render', async () => {
      const el = await fixture<CivSignature>(`
        <civ-signature legend="Sign">
          <span slot="statement">Slotted statement</span>
        </civ-signature>
      `) as CivSignature;
      await elementUpdated(el);

      // Original slot wrapper is gone; the consumer's content lives only
      // inside the rendered statement container.
      expect(el.querySelectorAll('[slot="statement"]').length).toBe(0);
      const statement = el.querySelector('[id*="statement"]');
      expect(statement).not.toBeNull();
      expect(statement!.textContent).toContain('Slotted statement');
    });

    it('slot content takes precedence over the text prop', async () => {
      const el = await fixture<CivSignature>(`
        <civ-signature legend="Sign" statement="From prop">
          <span slot="statement">From slot</span>
        </civ-signature>
      `) as CivSignature;
      await elementUpdated(el);

      const statement = el.querySelector('[id*="statement"]') as HTMLElement;
      expect(statement.textContent).toContain('From slot');
      expect(statement.textContent).not.toContain('From prop');
    });

    it('still links the slotted statement to the certify checkbox', async () => {
      const el = await fixture<CivSignature>(`
        <civ-signature legend="Sign">
          <span slot="statement">Slotted statement with <a href="/x">link</a></span>
        </civ-signature>
      `) as CivSignature;
      await elementUpdated(el);

      const statement = el.querySelector('[id*="statement"]') as HTMLElement;
      const checkboxInput = el.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement;
      expect(checkboxInput.getAttribute('aria-describedby')?.split(' ')).toContain(statement.id);
    });
  });
});
