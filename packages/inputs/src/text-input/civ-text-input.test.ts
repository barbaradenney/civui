import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import type { CivTextInput } from './civ-text-input.js';
import './civ-text-input.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-text-input', () => {
  it('renders label, hint, and error when wrapped in civ-form-field', async () => {
    const wrapper = await fixture(
      '<civ-form-field label="Email" hint="Enter your work email" error="Email is required"><civ-text-input></civ-text-input></civ-form-field>',
    );

    const label = wrapper.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Email');

    const hint = wrapper.querySelector('span');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Enter your work email');

    const errorEl = wrapper.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Email is required');
  });

  it('renders an input element', async () => {
    const el = await fixture('<civ-text-input label="Name" name="name"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.type).toBe('text');
    expect(input!.name).toBe('name');
  });

  it('associates form-field label with input via for/id', async () => {
    const wrapper = await fixture(
      '<civ-form-field label="Email"><civ-text-input></civ-text-input></civ-form-field>',
    );
    const child = wrapper.querySelector('civ-text-input')!;
    await elementUpdated(child);

    const label = wrapper.querySelector('label');
    const input = wrapper.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('shows required indicator when wrapped in required form-field', async () => {
    const wrapper = await fixture(
      '<civ-form-field label="Email" required><civ-text-input></civ-text-input></civ-form-field>',
    );

    const requiredMark = wrapper.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" error="Invalid"></civ-text-input>',
    );

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid when no error', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBeNull();
  });

  it('form-field wires aria-describedby for hint and error', async () => {
    const wrapper = await fixture(
      '<civ-form-field label="Email" hint="Hint text" error="Error text"><civ-text-input></civ-text-input></civ-form-field>',
    );
    const child = wrapper.querySelector('civ-text-input')!;
    await elementUpdated(child);
    await elementUpdated(wrapper);

    const input = wrapper.querySelector('input');
    const describedBy = input!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const ids = describedBy!.split(' ');
    expect(ids.length).toBe(2);

    // Both IDs should reference existing elements
    for (const id of ids) {
      expect(wrapper.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('renders with different input types', async () => {
    const el = await fixture(
      '<civ-text-input label="Password" type="password"></civ-text-input>',
    );

    const input = el.querySelector('input');
    expect(input!.type).toBe('password');
  });

  it('renders disabled state', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" disabled></civ-text-input>',
    );

    const input = el.querySelector('input');
    expect(input!.disabled).toBe(true);
  });

  it('fires civ-input event on input', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" name="email"></civ-text-input>',
    );

    const input = el.querySelector('input')!;
    let eventDetail: any = null;

    el.addEventListener('civ-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'test@example.com' });
  });

  it('fires civ-change event on change', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" name="email"></civ-text-input>',
    );

    const input = el.querySelector('input')!;
    let eventDetail: any = null;

    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'test@example.com' });
  });

  it('renders with placeholder', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" placeholder="you@example.com"></civ-text-input>',
    );

    const input = el.querySelector('input');
    expect(input!.placeholder).toBe('you@example.com');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('uses civ-input class and sets aria-invalid for error styling', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" error="Required"></civ-text-input>',
    );

    const input = el.querySelector('input');
    expect(input!.className).toContain('civ-input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('applies width variant classes', async () => {
    const el = await fixture(
      '<civ-text-input label="ZIP" width="sm"></civ-text-input>',
    );

    const input = el.querySelector('input');
    expect(input!.className).toContain('civ-w-24');
  });

  it('sets aria-required when required', async () => {
    const el = await fixture('<civ-text-input label="Email" required></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
  });

  it('omits aria-required when not required', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.hasAttribute('aria-required')).toBe(false);
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-text-input') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('accepts custom required-message property', async () => {
    const el = await fixture('<civ-text-input label="Email" required required-message="Campo requerido"></civ-text-input>') as any;

    expect(el.requiredMessage).toBe('Campo requerido');
  });

  it('renders a real <input> so the global focus ring applies', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input')!;
    expect(input.tagName).toBe('INPUT');
    expect(input.className).toContain('civ-input');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});

describe('text-input maxlength guard', () => {
  it('does not render maxlength attribute on input when maxlength="0"', async () => {
    const el = await fixture('<civ-text-input label="Code" maxlength="0"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.hasAttribute('maxlength')).toBe(false);
  });

  it('does not render minlength attribute on input when minlength="0"', async () => {
    const el = await fixture('<civ-text-input label="Code" minlength="0"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.hasAttribute('minlength')).toBe(false);
  });

  it('renders minlength attribute when minlength is a positive number', async () => {
    const el = await fixture('<civ-text-input label="Code" minlength="3"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.getAttribute('minlength')).toBe('3');
  });

  it('renders maxlength attribute when maxlength is a positive number', async () => {
    const el = await fixture('<civ-text-input label="Code" maxlength="5"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.getAttribute('maxlength')).toBe('5');
  });

  it('renders inputmode attribute when set', async () => {
    const el = await fixture('<civ-text-input label="ZIP" inputmode="numeric"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.getAttribute('inputmode')).toBe('numeric');
  });

  it('does not render inputmode attribute when not set', async () => {
    const el = await fixture('<civ-text-input label="Name"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.hasAttribute('inputmode')).toBe(false);
  });

  it('resets to default value on formResetCallback', async () => {
    const el = await fixture('<civ-text-input label="Email" value="original"></civ-text-input>') as any;

    el.value = 'changed';
    await elementUpdated(el);
    expect(el.value).toBe('changed');

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('original');
  });
});

describe('text-input autocomplete', () => {
  it('renders autocomplete attribute when set', async () => {
    const el = await fixture('<civ-text-input label="Email" autocomplete="email"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('autocomplete')).toBe('email');
  });

  it('omits autocomplete attribute when not set', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.hasAttribute('autocomplete')).toBe(false);
  });
});

describe('text-input formDisabledCallback', () => {
  it('disables the input when formDisabledCallback is called', async () => {
    const el = await fixture('<civ-text-input label="Email" name="email"></civ-text-input>') as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const input = el.querySelector('input');
    expect(input!.disabled).toBe(true);
  });

  it('re-enables the input when formDisabledCallback(false) is called', async () => {
    const el = await fixture('<civ-text-input label="Email" name="email"></civ-text-input>') as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);
    el.formDisabledCallback(false);
    await elementUpdated(el);

    const input = el.querySelector('input');
    expect(input!.disabled).toBe(false);
  });
});

describe('text-input analytics', () => {
  it('fires civ-analytics on input', async () => {
    const el = await fixture('<civ-text-input label="Email" name="email"></civ-text-input>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-text-input');
    expect(detail.action).toBe('change');
  });

  it('never includes user input value in analytics payload (PII safety)', async () => {
    const el = await fixture('<civ-text-input label="SSN" name="ssn"></civ-text-input>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.value = '123-45-6789';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
    expect(JSON.stringify(detail)).not.toContain('123-45-6789');
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-text-input label="Email" name="email" disable-analytics></civ-text-input>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('text-input mask', () => {
  afterEach(cleanupFixtures);

  it('auto-populates hint from SSN preset', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="SSN" mask="ssn"></civ-text-input>');
    // Hint is now rendered by civ-form-field, but the component still sets the hint property
    expect(el.hint).toContain('123-45-6789');
  });

  it('sets inputmode from preset', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="SSN" mask="ssn"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });

  it('stores raw value without formatting', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="SSN" mask="ssn"></civ-text-input>');
    el.value = '123456789';
    await elementUpdated(el);
    expect(el.value).toBe('123456789');
    expect(el.formattedValue).toBe('123-45-6789');
  });

  it('strips formatted initial value', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="SSN" mask="ssn" value="123-45-6789"></civ-text-input>');
    await elementUpdated(el);
    expect(el.value).toBe('123456789');
  });

  it('dispatches civ-input with raw value', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Phone" mask="phone-us"></civ-text-input>');
    const input = el.querySelector('input')!;
    let detail: any;
    el.addEventListener('civ-input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
    input.value = '5551234567';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: '7' }));
    expect(detail?.value).toBe('5551234567');
  });

  it('sets autocomplete=off for PII masks', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="SSN" mask="ssn"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('sets maxlength from pattern', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="ZIP" mask="zip"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('maxlength')).toBe('5');
  });

  it('uses custom mask-pattern', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Code" mask-pattern="AA-####"></civ-text-input>');
    el.value = 'AB1234';
    await elementUpdated(el);
    expect(el.formattedValue).toBe('AB-1234');
  });
});

describe('text-input currency mask', () => {
  afterEach(cleanupFixtures);

  it('renders $ prefix with aria-hidden', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    const prefix = el.querySelector('.civ-input-prefix');
    expect(prefix).not.toBeNull();
    expect(prefix!.textContent).toBe('$');
    expect(prefix!.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets inputmode="decimal"', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });

  it('stores raw numeric value', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    const input = el.querySelector('input')!;
    input.value = '1234.56';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
    expect(el.value).toBe('1234.56');
  });

  it('formattedValue returns $ with commas', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    el.value = '1234.56';
    await elementUpdated(el);
    expect(el.formattedValue).toBe('$1,234.56');
  });

  it('handles empty value on blur', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    el.value = '';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(el.value).toBe('');
  });

  it('handles "." only value on blur', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    el.value = '.';
    await elementUpdated(el);
    const input = el.querySelector('input')!;
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(el.value).toBe('');
  });

  it('limits to 2 decimal places', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    const input = el.querySelector('input')!;
    input.value = '12.345';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
    expect(el.value).toBe('12.34');
  });

  it('limits to 2 decimal places after decimal dedup', async () => {
    const el = await fixture<CivTextInput>('<civ-text-input label="Amount" mask="currency"></civ-text-input>');
    const input = el.querySelector('input')!;
    // Simulate input with two decimal points and excess digits: "12.3.456"
    // After dedup: "12.3456", after re-split limit: "12.34"
    input.value = '12.3.456';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
    expect(el.value).toBe('12.34');
  });
});

describe('text-input readonly', () => {
  afterEach(cleanupFixtures);

  it('sets readonly attribute on inner input', async () => {
    const el = await fixture('<civ-text-input label="Name" readonly></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.hasAttribute('readonly')).toBe(true);
  });

  it('value is included in form data (unlike disabled)', async () => {
    const el = await fixture('<civ-text-input label="Name" name="name" value="John" readonly></civ-text-input>') as any;
    // readonly fields should still have a value accessible
    expect(el.value).toBe('John');
    // readonly should NOT set disabled
    const input = el.querySelector('input')!;
    expect(input.disabled).toBe(false);
  });
});

describe('text-input mask IME handling', () => {
  afterEach(cleanupFixtures);

  it('does not reformat during IME composition in live mode', async () => {
    const el = await fixture<CivTextInput>(
      '<civ-text-input label="Code" mask="ssn" mask-mode="live"></civ-text-input>',
    );
    const input = el.querySelector('input')!;

    // Set an initial value so we can verify it doesn't change during composition
    el.value = '';
    await elementUpdated(el);

    // Simulate composition start
    input.dispatchEvent(new CompositionEvent('compositionstart'));

    // Simulate input during composition (isComposing: true)
    input.value = '123';
    const inputEvent = new InputEvent('input', {
      inputType: 'insertCompositionText',
      isComposing: true,
      data: '123',
    });
    input.dispatchEvent(inputEvent);

    // Value should NOT be reformatted during composition — remains empty
    // because _onMaskInput returns early when isComposing is true
    expect(el.value).toBe('');
  });

  it('reformats after IME composition ends in live mode', async () => {
    const el = await fixture<CivTextInput>(
      '<civ-text-input label="Code" mask="ssn" mask-mode="live"></civ-text-input>',
    );
    const input = el.querySelector('input')!;

    // Simulate composition start
    input.dispatchEvent(new CompositionEvent('compositionstart'));

    // Simulate composing input (should be skipped)
    input.value = '123';
    input.dispatchEvent(
      new InputEvent('input', {
        inputType: 'insertCompositionText',
        isComposing: true,
        data: '123',
      }),
    );
    expect(el.value).toBe('');

    // Simulate composition end
    input.dispatchEvent(new CompositionEvent('compositionend'));

    // Now simulate normal input after composition (isComposing: false)
    input.value = '123456789';
    input.dispatchEvent(
      new InputEvent('input', {
        inputType: 'insertText',
        isComposing: false,
        data: '9',
      }),
    );

    expect(el.value).toBe('123456789');
  });

  it('does not reformat during IME composition in blur mode', async () => {
    const el = await fixture<CivTextInput>(
      '<civ-text-input label="Code" mask="ssn"></civ-text-input>',
    );
    const input = el.querySelector('input')!;

    // Simulate input during composition
    input.value = '123';
    const inputEvent = new InputEvent('input', {
      inputType: 'insertCompositionText',
      isComposing: true,
      data: '123',
    });
    input.dispatchEvent(inputEvent);

    // Value should NOT be processed during composition
    expect(el.value).toBe('');
  });

  it('blur mode accepts normal input after IME composition', async () => {
    const el = await fixture<CivTextInput>(
      '<civ-text-input label="Code" mask="ssn"></civ-text-input>',
    );
    const input = el.querySelector('input')!;

    // In blur mode, normal (non-composing) input should work
    input.value = '123456789';
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));

    expect(el.value).toBe('123456789');
  });
});

describe('text-input character counter', () => {
  afterEach(cleanupFixtures);

  it('renders counter when maxlength is set', async () => {
    const el = await fixture('<civ-text-input label="Name" maxlength="20"></civ-text-input>');
    const counter = el.querySelector('[id*="charcount"]');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('20 characters remaining');
  });

  it('does not render counter without maxlength', async () => {
    const el = await fixture('<civ-text-input label="Name"></civ-text-input>');
    const counter = el.querySelector('[id*="charcount"]');
    expect(counter).toBeNull();
  });

  it('does not render counter for masked inputs (mask drives length)', async () => {
    const el = await fixture('<civ-text-input label="SSN" mask="ssn" maxlength="20"></civ-text-input>');
    const counter = el.querySelector('[id*="charcount"]');
    expect(counter).toBeNull();
  });

  it('does not render counter for custom mask-pattern inputs', async () => {
    const el = await fixture('<civ-text-input label="Code" mask-pattern="AAA-####" maxlength="20"></civ-text-input>');
    const counter = el.querySelector('[id*="charcount"]');
    expect(counter).toBeNull();
  });

  it('updates the visual counter as the user types', async () => {
    const el = await fixture('<civ-text-input label="Name" maxlength="20"></civ-text-input>');
    const input = el.querySelector('input')!;
    const counter = el.querySelector('[id*="charcount"]')!;

    input.value = 'Hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    expect(counter.textContent).toContain('15 characters remaining');
  });

  it('shows error styling when over the limit', async () => {
    const el = await fixture<any>('<civ-text-input label="Name" maxlength="3"></civ-text-input>');
    el.value = 'too long';
    await elementUpdated(el);

    const counter = el.querySelector('[id*="charcount"]')!;
    expect(counter.className).toContain('civ-text-error');
    expect(counter.className).toContain('civ-font-bold');
    expect(counter.textContent).toContain('-5 characters remaining');
  });

  it('includes the counter id in aria-describedby', async () => {
    const el = await fixture('<civ-text-input label="Name" maxlength="20"></civ-text-input>');
    const input = el.querySelector('input')!;
    const counter = el.querySelector('[id*="charcount"]')!;
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy.split(' ')).toContain(counter.id);
  });

  it('exposes a polite live region for screen readers', async () => {
    const el = await fixture('<civ-text-input label="Name" maxlength="20"></civ-text-input>');
    const live = el.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live!.textContent).toContain('20 characters remaining');
  });

  it('treats maxlength="0" as unset (no counter)', async () => {
    const el = await fixture('<civ-text-input label="Name" maxlength="0"></civ-text-input>');
    const counter = el.querySelector('[id*="charcount"]');
    expect(counter).toBeNull();
  });
});

describe('text-input inline icons', () => {
  afterEach(cleanupFixtures);

  it('renders a leading icon overlay when leading-icon is set', async () => {
    const el = await fixture('<civ-text-input label="Search" leading-icon="phone"></civ-text-input>');
    const wrap = el.querySelector('.civ-input-icon-wrap');
    const leading = el.querySelector('.civ-input-icon--leading');
    expect(wrap).not.toBeNull();
    expect(leading).not.toBeNull();
    expect(leading!.querySelector('civ-icon')!.getAttribute('name')).toBe('phone');
  });

  it('renders a trailing icon overlay when trailing-icon is set', async () => {
    const el = await fixture('<civ-text-input label="Lookup" trailing-icon="info"></civ-text-input>');
    const trailing = el.querySelector('.civ-input-icon--trailing');
    expect(trailing).not.toBeNull();
    expect(trailing!.querySelector('civ-icon')!.getAttribute('name')).toBe('info');
  });

  it('adds padding-class to the input when a leading icon is shown', async () => {
    const el = await fixture('<civ-text-input label="Search" leading-icon="phone"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.className).toContain('civ-input-with-leading-icon');
  });

  it('adds padding-class to the input when a trailing icon is shown', async () => {
    const el = await fixture('<civ-text-input label="Search" trailing-icon="info"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.className).toContain('civ-input-with-trailing-icon');
  });

  it('icons are decorative by default (aria-hidden via civ-icon)', async () => {
    const el = await fixture('<civ-text-input label="Search" leading-icon="phone"></civ-text-input>');
    const icon = el.querySelector('.civ-input-icon--leading civ-icon')!;
    // civ-icon renders aria-hidden="true" on its inner span when no label
    const inner = icon.querySelector('[aria-hidden]');
    expect(inner?.getAttribute('aria-hidden')).toBe('true');
  });

  it('labeled icons are exposed to assistive tech as role="img"', async () => {
    const el = await fixture(
      '<civ-text-input label="Search" leading-icon="phone" leading-icon-label="Search"></civ-text-input>'
    );
    const icon = el.querySelector('.civ-input-icon--leading civ-icon')!;
    const inner = icon.querySelector('[role="img"]');
    expect(inner).not.toBeNull();
    expect(inner!.getAttribute('aria-label')).toBe('Search');
  });

  it('drops the leading icon when prefix is set (prefix wins)', async () => {
    const el = await fixture(
      '<civ-text-input label="Handle" prefix="@" leading-icon="phone"></civ-text-input>'
    );
    expect(el.querySelector('.civ-input-prefix')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--leading')).toBeNull();
    const input = el.querySelector('input')!;
    expect(input.className).not.toContain('civ-input-with-leading-icon');
  });

  it('drops the trailing icon when suffix is set (suffix wins)', async () => {
    const el = await fixture(
      '<civ-text-input label="Amount" suffix="USD" trailing-icon="info"></civ-text-input>'
    );
    expect(el.querySelector('.civ-input-suffix')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--trailing')).toBeNull();
  });

  it('hides the trailing icon when the clear button is showing', async () => {
    const el = await fixture<CivTextInput>(
      '<civ-text-input label="Search" clearable trailing-icon="info" value="hello"></civ-text-input>'
    );
    await elementUpdated(el);
    expect(el.querySelector('.civ-close-btn')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--trailing')).toBeNull();
  });

  it('shows the trailing icon when clearable is set but the value is empty', async () => {
    const el = await fixture(
      '<civ-text-input label="Search" clearable trailing-icon="info"></civ-text-input>'
    );
    expect(el.querySelector('.civ-close-btn')).toBeNull();
    expect(el.querySelector('.civ-input-icon--trailing')).not.toBeNull();
  });

  it('renders neither wrapper when no icons or prefix/suffix/clear are set', async () => {
    const el = await fixture('<civ-text-input label="Plain"></civ-text-input>');
    expect(el.querySelector('.civ-input-icon-wrap')).toBeNull();
    expect(el.querySelector('.civ-flex')).toBeNull();
  });

  it('supports both leading and trailing icons together', async () => {
    const el = await fixture(
      '<civ-text-input label="Search" leading-icon="phone" trailing-icon="info"></civ-text-input>'
    );
    expect(el.querySelector('.civ-input-icon--leading')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--trailing')).not.toBeNull();
    const input = el.querySelector('input')!;
    expect(input.className).toContain('civ-input-with-leading-icon');
    expect(input.className).toContain('civ-input-with-trailing-icon');
  });

  describe('clear button (clearable)', () => {
    it('clears value, clears component-set error, fires civ-input + civ-change on click', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Search" clearable value="hello"></civ-text-input>'
      );
      const inputEvents: string[] = [];
      el.addEventListener('civ-input', (e) => inputEvents.push((e as CustomEvent).detail.value));
      const changeEvents: string[] = [];
      el.addEventListener('civ-change', (e) => changeEvents.push((e as CustomEvent).detail.value));

      const clearBtn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
      expect(clearBtn).not.toBeNull();
      clearBtn.click();
      await elementUpdated(el);

      expect(el.value).toBe('');
      expect(inputEvents).toEqual(['']);
      expect(changeEvents).toEqual(['']);
    });

    it('clears mask error state on clear', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn" clearable value="123"></civ-text-input>'
      );
      // Trigger blur to populate mask error
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      const clearBtn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
      clearBtn.click();
      await elementUpdated(el);
      expect(el.error).toBe('');
    });
  });

  describe('currency mask handlers', () => {
    it('shows raw value on focus (strips formatting for editing)', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" value="1234.56"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '1,234.56'; // simulate the formatted display value
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      await elementUpdated(el);
      expect(input.value).toBe('1234.56');
    });

    it('flags negative currency values as errors on change', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency"></civ-text-input>'
      );
      el.value = '-50';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();
    });

    it('clears currency mask error when value becomes valid', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency"></civ-text-input>'
      );
      el.value = '-50';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      el.value = '50';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });

    it('clears currency error when value becomes empty', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency"></civ-text-input>'
      );
      el.value = '-1';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      el.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });
  });

  describe('live-mode mask handlers', () => {
    it('paste filters non-digits and reformats (mask-mode=live)', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn" mask-mode="live"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: { getData: () => '123-45-6789' },
      });
      input.dispatchEvent(pasteEvent);
      await elementUpdated(el);
      expect(el.value).toBe('123456789');
      expect(input.value).toBe('123-45-6789');
    });

    it('change event fires civ-change with current value (mask-mode=live)', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn" mask-mode="live" value="123456789"></civ-text-input>'
      );
      const events: string[] = [];
      el.addEventListener('civ-change', (e) => events.push((e as CustomEvent).detail.value));
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(events).toEqual(['123456789']);
    });
  });

  describe('blur-mode mask handlers (default)', () => {
    it('focus shows raw unformatted value for editing', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn" value="123456789"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '123-45-6789'; // formatted display
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      await elementUpdated(el);
      expect(input.value).toBe('123456789');
    });

    it('blur formats display and validates completeness', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn" value="123456789"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(input.value).toBe('123-45-6789');
      expect(el.error).toBe('');
    });

    it('blur sets error when raw value is incomplete', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn"></civ-text-input>'
      );
      el.value = '12345';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();
    });

    it('blur clears mask error when value becomes complete', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      el.value = '12345';
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      el.value = '123456789';
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });

    it('change fires civ-change with raw value', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="SSN" mask="ssn" value="123456789"></civ-text-input>'
      );
      const events: string[] = [];
      el.addEventListener('civ-change', (e) => events.push((e as CustomEvent).detail.value));
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(events).toEqual(['123456789']);
    });
  });

  describe('declarative validate on blur', () => {
    it('runs `validate="email"` on blur and sets error for invalid email', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email" type="email" validate="email"></civ-text-input>'
      );
      el.value = 'not-an-email';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();
    });

    it('clears prior validate-error when value becomes valid', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email" type="email" validate="email"></civ-text-input>'
      );
      el.value = 'bad';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      el.value = 'ok@example.com';
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });

    it('clears validate error when value becomes empty', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email" type="email" validate="email"></civ-text-input>'
      );
      el.value = 'bad';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      el.value = '';
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });
  });

  describe('standalone label/hint/error chrome', () => {
    // Phase 1 of the bare-control + form-field unification: bare controls
    // render their own label/hint/error chrome when used without a wrapper.
    // The earlier "standalone warning" machinery was removed because
    // standalone usage is now first-class.
    it('renders its own <label> with the input id when used without form-field', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email"></civ-text-input>'
      );
      const label = el.querySelector('label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toContain('Email');
      const input = el.querySelector('input');
      expect(label!.getAttribute('for')).toBe(input!.id);
    });

    it('renders the hint span with the right id wired to aria-describedby', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email" hint="Work email"></civ-text-input>'
      );
      const hint = el.querySelector('.civ-hint');
      expect(hint).not.toBeNull();
      expect(hint!.textContent).toBe('Work email');
      const input = el.querySelector('input')!;
      expect(input.getAttribute('aria-describedby')).toContain(hint!.id);
    });

    it('renders error span with role="alert" when set standalone', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email" error="Required"></civ-text-input>'
      );
      const err = el.querySelector('[role="alert"]');
      expect(err).not.toBeNull();
      expect(err!.textContent).toBe('Required');
      const input = el.querySelector('input')!;
      expect(input.getAttribute('aria-describedby')).toContain(err!.id);
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('does NOT render its own chrome when wrapped in civ-form-field (avoids double-rendering)', async () => {
      const wrapper = await fixture(
        '<civ-form-field label="Email" error="Required"><civ-text-input></civ-text-input></civ-form-field>'
      );
      const child = wrapper.querySelector('civ-text-input') as CivTextInput;
      // form-field renders the chrome; the child should not render its own.
      // Count labels in the child element's direct subtree (exclude wrapper).
      const childLabel = child.querySelector('label');
      // The only label visible to the child's subtree is form-field's, which
      // form-field renders OUTSIDE the data-civ-form-field-content slot —
      // so the child element itself has no label child element.
      expect(childLabel).toBeNull();
    });
  });
});
