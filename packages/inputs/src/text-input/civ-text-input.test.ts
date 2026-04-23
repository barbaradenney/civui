import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import type { CivTextInput } from './civ-text-input.js';
import './civ-text-input.js';

afterEach(cleanupFixtures);

describe('civ-text-input', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Email');
  });

  it('renders an input element', async () => {
    const el = await fixture('<civ-text-input label="Name" name="name"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.type).toBe('text');
    expect(input!.name).toBe('name');
  });

  it('associates label with input via for/id', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('shows required indicator when required', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" required></civ-text-input>',
    );

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
  });

  it('does not show required indicator when not required', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).toBeNull();
  });

  it('renders hint text', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" hint="Enter your work email"></civ-text-input>',
    );

    const hint = el.querySelector('span');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Enter your work email');
  });

  it('renders error message with alert role', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" error="Email is required"></civ-text-input>',
    );

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Email is required');
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

  it('sets aria-describedby for hint and error', async () => {
    const el = await fixture(
      '<civ-text-input label="Email" hint="Hint text" error="Error text"></civ-text-input>',
    );

    const input = el.querySelector('input');
    const describedBy = input!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const ids = describedBy!.split(' ');
    expect(ids.length).toBe(2);

    // Both IDs should reference existing elements
    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
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

  it('applies focus-visible ring class', async () => {
    const el = await fixture('<civ-text-input label="Email"></civ-text-input>');

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
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
    expect(el.querySelector('.civ-hint')?.textContent).toContain('123-45-6789');
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
