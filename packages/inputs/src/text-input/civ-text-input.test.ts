import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import type { CivTextInput } from './civ-text-input.js';
import './civ-text-input.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-text-input', () => {
  it('renders an input element', async () => {
    const el = await fixture('<civ-text-input label="Name" name="name"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.type).toBe('text');
    expect(input!.name).toBe('name');
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

  it('sets native required on the inner input', async () => {
    const el = await fixture('<civ-text-input label="Email" required></civ-text-input>');

    const input = el.querySelector('input')!;
    expect(input.required).toBe(true);
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('omits required on the inner input when not required', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input')!;
    expect(input.required).toBe(false);
    expect(input.hasAttribute('required')).toBe(false);
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
    const el = await fixture('<civ-text-input label="Search" icon-start="phone"></civ-text-input>');
    const wrap = el.querySelector('.civ-input-icon-wrap');
    const leading = el.querySelector('.civ-input-icon--leading');
    expect(wrap).not.toBeNull();
    expect(leading).not.toBeNull();
    expect(leading!.querySelector('civ-icon')!.getAttribute('name')).toBe('phone');
  });

  it('renders a trailing icon overlay when trailing-icon is set', async () => {
    const el = await fixture('<civ-text-input label="Lookup" icon-end="info"></civ-text-input>');
    const trailing = el.querySelector('.civ-input-icon--trailing');
    expect(trailing).not.toBeNull();
    expect(trailing!.querySelector('civ-icon')!.getAttribute('name')).toBe('info');
  });

  it('adds padding-class to the input when a leading icon is shown', async () => {
    const el = await fixture('<civ-text-input label="Search" icon-start="phone"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.className).toContain('civ-input-with-leading-icon');
  });

  it('adds padding-class to the input when a trailing icon is shown', async () => {
    const el = await fixture('<civ-text-input label="Search" icon-end="info"></civ-text-input>');
    const input = el.querySelector('input')!;
    expect(input.className).toContain('civ-input-with-trailing-icon');
  });

  it('icons are decorative by default (aria-hidden via civ-icon)', async () => {
    const el = await fixture('<civ-text-input label="Search" icon-start="phone"></civ-text-input>');
    const icon = el.querySelector('.civ-input-icon--leading civ-icon')!;
    // civ-icon renders aria-hidden="true" on its inner span when no label
    const inner = icon.querySelector('[aria-hidden]');
    expect(inner?.getAttribute('aria-hidden')).toBe('true');
  });

  it('labeled icons are exposed to assistive tech as role="img"', async () => {
    const el = await fixture(
      '<civ-text-input label="Search" icon-start="phone" icon-start-label="Search"></civ-text-input>'
    );
    const icon = el.querySelector('.civ-input-icon--leading civ-icon')!;
    const inner = icon.querySelector('[role="img"]');
    expect(inner).not.toBeNull();
    expect(inner!.getAttribute('aria-label')).toBe('Search');
  });

  it('drops the leading icon when prefix is set (prefix wins)', async () => {
    const el = await fixture(
      '<civ-text-input label="Handle" prefix="@" icon-start="phone"></civ-text-input>'
    );
    expect(el.querySelector('.civ-input-prefix')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--leading')).toBeNull();
    const input = el.querySelector('input')!;
    expect(input.className).not.toContain('civ-input-with-leading-icon');
  });

  it('drops the trailing icon when suffix is set (suffix wins)', async () => {
    const el = await fixture(
      '<civ-text-input label="Amount" suffix="USD" icon-end="info"></civ-text-input>'
    );
    expect(el.querySelector('.civ-input-suffix')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--trailing')).toBeNull();
  });

  it('hides the trailing icon when the clear button is showing', async () => {
    const el = await fixture<CivTextInput>(
      '<civ-text-input label="Search" clearable icon-end="info" value="hello"></civ-text-input>'
    );
    await elementUpdated(el);
    expect(el.querySelector('.civ-close-btn')).not.toBeNull();
    expect(el.querySelector('.civ-input-icon--trailing')).toBeNull();
  });

  it('shows the trailing icon when clearable is set but the value is empty', async () => {
    const el = await fixture(
      '<civ-text-input label="Search" clearable icon-end="info"></civ-text-input>'
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
      '<civ-text-input label="Search" icon-start="phone" icon-end="info"></civ-text-input>'
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

  describe('password reveal toggle', () => {
    it('does not render the reveal button for non-password types', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Email" type="email" reveal-password value="hello"></civ-text-input>'
      );
      await elementUpdated(el);
      expect(el.querySelector('civ-toggle-button')).toBeNull();
    });

    it('renders a civ-toggle-button when type="password" and reveal-password is set', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password value="hunter2"></civ-text-input>'
      );
      await elementUpdated(el);
      const toggle = el.querySelector('civ-toggle-button') as any;
      expect(toggle).not.toBeNull();
      expect(toggle.pressed).toBe(false);
      expect(toggle.label).toBe('Show password');
      expect(toggle.pressedLabel).toBe('Hide password');
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('flips the rendered input type to "text" on toggle and back on second toggle', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password value="hunter2"></civ-text-input>'
      );
      await elementUpdated(el);

      const innerBtn = el.querySelector('civ-toggle-button button') as HTMLButtonElement;
      innerBtn.click();
      await elementUpdated(el);

      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('text');
      // Re-query: toggle is now pressed
      const toggle = el.querySelector('civ-toggle-button') as any;
      expect(toggle.pressed).toBe(true);

      (el.querySelector('civ-toggle-button button') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect((el.querySelector('input') as HTMLInputElement).type).toBe('password');
      expect((el.querySelector('civ-toggle-button') as any).pressed).toBe(false);
    });

    it('host `type` prop stays "password" through the toggle', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password value="hunter2"></civ-text-input>'
      );
      await elementUpdated(el);
      (el.querySelector('civ-toggle-button button') as HTMLButtonElement).click();
      await elementUpdated(el);
      expect(el.type).toBe('password'); // host prop unchanged
    });

    it('clear button (inset) and reveal toggle (below) coexist when both apply', async () => {
      // Old behavior: clear took precedence and hid the inset reveal.
      // New behavior: clear stays inset, reveal moved to the helper
      // row below — no collision, so both render simultaneously.
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password clearable value="hunter2"></civ-text-input>'
      );
      await elementUpdated(el);
      expect(el.querySelector('.civ-close-btn')).not.toBeNull();
      expect(el.querySelector('.civ-input-helper-row civ-toggle-button')).not.toBeNull();
    });

    it('hides the reveal button when host is disabled or readonly', async () => {
      const elDisabled = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password value="x" disabled></civ-text-input>'
      );
      await elementUpdated(elDisabled);
      expect(elDisabled.querySelector('civ-toggle-button')).toBeNull();

      const elReadonly = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password value="x" readonly></civ-text-input>'
      );
      await elementUpdated(elReadonly);
      expect(elReadonly.querySelector('civ-toggle-button')).toBeNull();
    });
  });

  describe('below-action slot (escape hatch)', () => {
    it('relocates a [data-below-action] child into the helper row below the input', async () => {
      const el = await fixture<CivTextInput>(`
        <civ-text-input label="API key" value="abc">
          <button data-below-action type="button" class="civ-text-btn civ-text-btn--chip">Copy</button>
        </civ-text-input>
      `);
      await elementUpdated(el);
      const container = el.querySelector('[data-civ-below-action]');
      expect(container).not.toBeNull();
      expect(container!.classList.contains('civ-input-helper-row')).toBe(true);
      const button = container!.querySelector('button[data-below-action]');
      expect(button).not.toBeNull();
      expect(button!.textContent).toBe('Copy');
    });

    it('helper row renders OUTSIDE the input chrome (sibling, not inset)', async () => {
      // Verifies the move from inset to below: the slotted button
      // must NOT sit inside an `.civ-input-icon-wrap` (the inset
      // chrome wrapper) and MUST be a descendant of the helper-row
      // sibling. Previously the slot rendered inside the wrap so
      // click-targets overlapped the input bounding box.
      // Use clearable to force the wrap to exist so the "wrap is
      // present but does not contain the slot" assertion is real.
      const el = await fixture<CivTextInput>(`
        <civ-text-input label="API key" clearable value="abc">
          <button data-below-action type="button" class="civ-text-btn civ-text-btn--chip">Copy</button>
        </civ-text-input>
      `);
      await elementUpdated(el);
      const wrap = el.querySelector('.civ-input-icon-wrap');
      expect(wrap).not.toBeNull();
      expect(wrap!.querySelector('[data-below-action]')).toBeNull();
      expect(el.querySelector('.civ-input-helper-row [data-below-action]')).not.toBeNull();
    });

    it('coexists with the clear button — both render simultaneously', async () => {
      // The old inset slot had clear-button precedence (clear hid
      // the slot). Now the slot lives below so there is no
      // collision: clear stays inset on the right, Copy chip sits
      // below.
      const el = await fixture<CivTextInput>(`
        <civ-text-input label="API key" clearable value="hello">
          <button data-below-action type="button" class="civ-text-btn civ-text-btn--chip">Copy</button>
        </civ-text-input>
      `);
      await elementUpdated(el);
      expect(el.querySelector('.civ-close-btn')).not.toBeNull();
      expect(el.querySelector('.civ-input-helper-row [data-below-action]')).not.toBeNull();
    });

    it('does not render the helper row when no [data-below-action] child is slotted', async () => {
      const el = await fixture<CivTextInput>(`<civ-text-input label="Plain" value="abc"></civ-text-input>`);
      await elementUpdated(el);
      expect(el.querySelector('.civ-input-helper-row')).toBeNull();
    });

    it('inset action and overlays share a single positioned wrapper so the input stays the rightmost flex item (for civ-input-group flush layout)', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Search" clearable value="hello"></civ-text-input>'
      );
      await elementUpdated(el);
      const wrap = el.querySelector('.civ-input-icon-wrap');
      expect(wrap).not.toBeNull();
      expect(wrap!.querySelector('.civ-close-btn')).not.toBeNull();
      // Old flex-sibling wrapper class is gone.
      expect(el.querySelector(':scope > div > .civ-flex:not(.civ-input-icon-wrap)')).toBeNull();
      const input = el.querySelector('input')!;
      expect(input.className).toContain('civ-input-with-trailing-action');
    });

    it('also renders the leading-icon overlay alongside the clear button (was previously dropped in the adjacent-wrapper path)', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Search" icon-start="search" clearable value="hello"></civ-text-input>'
      );
      await elementUpdated(el);
      expect(el.querySelector('.civ-input-icon--leading')).not.toBeNull();
      expect(el.querySelector('.civ-close-btn')).not.toBeNull();
    });

    it('reveal toggle renders in the helper row below the input, not inset', async () => {
      // Old behavior: reveal toggle sat inset and the input got
      // extra trailing padding (`civ-input-with-trailing-reveal`) so
      // the "Show password" / "Hide password" text didn't overlap the value.
      // New behavior: reveal moved to the helper row below — no
      // trailing padding needed on the input.
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Password" type="password" reveal-password value="hunter2"></civ-text-input>'
      );
      await elementUpdated(el);
      const input = el.querySelector('input')!;
      expect(input.className).not.toContain('civ-input-with-trailing-reveal');
      expect(el.querySelector('.civ-input-helper-row civ-toggle-button')).not.toBeNull();
      // Toggle is NOT a child of the inset chrome.
      expect(el.querySelector('.civ-input-icon-wrap civ-toggle-button')).toBeNull();
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

    it('shows comma-formatted display after a SINGLE blur (no second-blur required)', async () => {
      // Regression: the blur handler imperatively wrote "1,234.50" to
      // the DOM input, but Lit's reactive `.value="${this.value}"`
      // template binding then overwrote it back to raw "1234.50" on
      // re-render (because `this.value` had just changed from "1234.5"
      // → "1234.50"). On the SECOND blur, `this.value` was already
      // normalized so Lit didn't re-render and the formatted display
      // stuck. Users saw no commas on first blur — only on second.
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      input.focus();
      input.value = '1234.5';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(el);
      // Move focus off the input — blur fires with no focus owner.
      input.blur();
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await elementUpdated(el);
      // Wait for updateComplete to ensure the post-blur format pass ran.
      await el.updateComplete;
      expect(input.value).toBe('1,234.50');
      expect(el.value).toBe('1234.50');
    });

    it('formats a prefilled value with commas on initial mount (no focus required)', async () => {
      // Before the fix, a prefilled `value="1234.5"` rendered as raw
      // "1234.5" until the user focused and blurred. After: the
      // `updated()` hook formats the display on first paint.
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" value="1234.5"></civ-text-input>'
      );
      await el.updateComplete;
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('1,234.50');
    });

    it('keeps the comma-formatted display on a re-blur with no value change', async () => {
      // Focus → blur once: formats. Focus → blur a second time with
      // no edit: `this.value` doesn't change, but the focus handler
      // already stripped the commas — so we need a non-Lit path to
      // re-apply formatting. `updateComplete.then(_applyCurrencyDisplay)`
      // handles this.
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" value="1234.50"></civ-text-input>'
      );
      await el.updateComplete;
      const input = el.querySelector('input') as HTMLInputElement;
      input.focus();
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      await elementUpdated(el);
      // Focus handler stripped to raw view.
      expect(input.value).toBe('1234.50');
      // Blur without editing.
      input.blur();
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await el.updateComplete;
      expect(input.value).toBe('1,234.50');
    });
  });

  describe('currency: whole-dollar mode (decimals=0)', () => {
    it('strips the decimal point and fractional digits during typing', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" decimals="0"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '1234.56';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('123456');
    });

    it('normalizes by rounding (not truncating) on blur', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" decimals="0"></civ-text-input>'
      );
      el.value = '1234.6';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await el.updateComplete;
      expect(el.value).toBe('1235');
    });

    it('formats display without trailing ".00" suffix', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" decimals="0" value="1234"></civ-text-input>'
      );
      await el.updateComplete;
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('1,234');
    });
  });

  describe('currency: min/max bounds', () => {
    it('flags an inline error when the value is below `min`', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" min="100"></civ-text-input>'
      );
      el.value = '50';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toContain('at least');
      expect(el.error).toContain('$100');
    });

    it('flags an inline error when the value exceeds `max`', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" max="10000"></civ-text-input>'
      );
      el.value = '15000';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toContain('at most');
      expect(el.error).toContain('$10,000');
    });

    it('clears the bounds error once the value returns to range', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" min="100" max="10000"></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      el.value = '50';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();

      el.value = '500';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });

    it('formats bound error messages with the active decimals', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency" decimals="0" max="500"></civ-text-input>'
      );
      el.value = '1000';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      // No ".00" tail in whole-dollar mode.
      expect(el.error).toContain('$500');
      expect(el.error).not.toContain('$500.00');
    });
  });

  describe('currency: allow-negative', () => {
    it('rejects negative values by default', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Amount" mask="currency"></civ-text-input>'
      );
      el.value = '-50';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBeTruthy();
    });

    it('accepts negative values when `allow-negative` is set', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Adjustment" mask="currency" allow-negative></civ-text-input>'
      );
      el.value = '-50';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toBe('');
    });

    it('preserves the leading minus during input filtering', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Adjustment" mask="currency" allow-negative></civ-text-input>'
      );
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = '-1234.56';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe('-1234.56');
    });

    it('formats negative values with a leading minus in the locale display', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Adjustment" mask="currency" allow-negative value="-1234.5"></civ-text-input>'
      );
      // Trigger normalization via blur.
      el.value = '-1234.5';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await el.updateComplete;
      // toLocaleString renders negatives with a leading "-" by default.
      expect(input.value).toBe('-1,234.50');
    });

    it('still applies min/max checks when allow-negative is on', async () => {
      const el = await fixture<CivTextInput>(
        '<civ-text-input label="Adjustment" mask="currency" allow-negative min="-100"></civ-text-input>'
      );
      el.value = '-500';
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await elementUpdated(el);
      expect(el.error).toContain('at least');
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

  });
});

describe('civ-text-input spacing="sm"', () => {
  it('renders just the bare <input> with no chrome', async () => {
    const el = await fixture(
      '<civ-text-input spacing="sm" aria-label="Cell" hint="not shown" label="not shown"></civ-text-input>',
    );
    expect(el.querySelector('input')).not.toBeNull();
    expect(el.querySelector('.civ-label')).toBeNull();
    expect(el.querySelector('.civ-hint')).toBeNull();
  });

  it('propagates host aria-label to the inner <input>', async () => {
    const el = await fixture('<civ-text-input spacing="sm" aria-label="Name"></civ-text-input>');
    expect(el.querySelector('input')!.getAttribute('aria-label')).toBe('Name');
  });

  it('applies civ-input--sm class to the inner <input>', async () => {
    const el = await fixture('<civ-text-input spacing="sm" aria-label="x"></civ-text-input>');
    expect(el.querySelector('input')!.classList.contains('civ-input--sm')).toBe(true);
  });

  it('forwards focus() to the inner <input>', async () => {
    const el = await fixture('<civ-text-input spacing="sm" aria-label="x"></civ-text-input>') as HTMLElement;
    el.focus();
    expect(document.activeElement).toBe(el.querySelector('input'));
  });

  it('preserves mask behavior in compact mode', async () => {
    const el = await fixture(
      '<civ-text-input spacing="sm" aria-label="SSN" mask="ssn"></civ-text-input>',
    ) as any;
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = '123456789';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur'));
    await elementUpdated(el);
    // Mask preset normalizes ssn to digits — exact display format depends on
    // mode but raw value is preserved as digits.
    expect(el.value.replace(/\D/g, '')).toBe('123456789');
  });
});
