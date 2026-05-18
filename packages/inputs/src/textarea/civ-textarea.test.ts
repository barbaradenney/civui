import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-textarea.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-textarea', () => {
  it('renders a textarea element', async () => {
    const el = await fixture('<civ-textarea label="Comments" name="comments"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea).not.toBeNull();
    expect(textarea!.name).toBe('comments');
  });

  it('renders with configurable rows', async () => {
    const el = await fixture('<civ-textarea label="Bio" rows="10"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.rows).toBe(10);
  });

  it('defaults to 5 rows', async () => {
    const el = await fixture('<civ-textarea label="Bio"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.rows).toBe(5);
  });

  it('shows character count when maxlength is set', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxlength="200"></civ-textarea>');

    const counter = el.querySelector('[aria-live="polite"]');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('200 characters remaining');
  });

  it('does not show character count without maxlength', async () => {
    const el = await fixture('<civ-textarea label="Bio"></civ-textarea>');

    const counter = el.querySelector('[aria-live="polite"]');
    expect(counter).toBeNull();
  });

  it('updates character count on input', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxlength="200"></civ-textarea>');

    const textarea = el.querySelector('textarea')!;
    const describedBy = textarea.getAttribute('aria-describedby') || '';
    const charCountId = describedBy.split(' ').pop()!;

    textarea.value = 'Hello world';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    const counter = el.querySelector(`#${charCountId}`);
    expect(counter!.textContent).toContain('189 characters remaining');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-textarea label="Bio" error="Required"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders disabled state', async () => {
    const el = await fixture('<civ-textarea label="Bio" disabled></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.disabled).toBe(true);
  });

  it('fires civ-input event on input', async () => {
    const el = await fixture('<civ-textarea label="Bio" name="bio"></civ-textarea>');

    const textarea = el.querySelector('textarea')!;
    let eventDetail: any = null;

    el.addEventListener('civ-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'Hello' });
  });

  it('fires civ-change event on blur', async () => {
    const el = await fixture('<civ-textarea label="Bio" name="bio"></civ-textarea>');

    const textarea = el.querySelector('textarea')!;
    let eventDetail: any = null;

    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'Hello' });
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture('<civ-textarea label="Bio"></civ-textarea>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('textarea')).not.toBeNull();
  });

  it('sets native required on the inner textarea', async () => {
    const el = await fixture('<civ-textarea label="Bio" required></civ-textarea>');

    const textarea = el.querySelector('textarea')!;
    expect(textarea.required).toBe(true);
    expect(textarea.hasAttribute('required')).toBe(true);
  });

  it('includes character count in aria-describedby when maxlength is set', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxlength="200"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    const describedBy = textarea!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    // The visual character count span has the ID referenced by aria-describedby
    const charCountId = describedBy!.split(' ').pop()!;
    const charCount = el.querySelector(`#${charCountId}`);
    expect(charCount).not.toBeNull();
    expect(charCount!.textContent).toContain('characters remaining');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-textarea') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('renders a real <textarea> so the global focus ring applies', async () => {
    const el = await fixture('<civ-textarea label="Comments"></civ-textarea>');

    const textarea = el.querySelector('textarea')!;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.className).toContain('civ-input');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = await fixture('<civ-textarea label="Comments"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.className).not.toContain('focus:civ-outline-2');
    expect(textarea!.className).not.toContain('focus:civ-outline-primary');
    expect(textarea!.className).not.toContain('focus:civ-outline-offset-0');
  });

  it('omits aria-invalid when no error', async () => {
    const el = await fixture('<civ-textarea label="Comments"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.hasAttribute('aria-invalid')).toBe(false);
  });

  it('resets to default value on formResetCallback', async () => {
    const el = await fixture('<civ-textarea label="Bio" value="hello"></civ-textarea>') as any;

    el.value = 'changed';
    await elementUpdated(el);

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('hello');
  });
});

describe('textarea formDisabledCallback', () => {
  it('disables the textarea when formDisabledCallback is called', async () => {
    const el = await fixture('<civ-textarea label="Bio" name="bio"></civ-textarea>') as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.disabled).toBe(true);
  });

  it('re-enables the textarea when formDisabledCallback(false) is called', async () => {
    const el = await fixture('<civ-textarea label="Bio" name="bio"></civ-textarea>') as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);
    el.formDisabledCallback(false);
    await elementUpdated(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.disabled).toBe(false);
  });
});

describe('textarea analytics', () => {
  it('fires civ-analytics on change', async () => {
    const el = await fixture('<civ-textarea label="Bio" name="bio"></civ-textarea>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const textarea = el.querySelector('textarea')!;
    textarea.value = 'My biography';
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-textarea');
    expect(detail.action).toBe('change');
  });

  it('never includes user input value in analytics payload (PII safety)', async () => {
    const el = await fixture('<civ-textarea label="Medical notes" name="notes"></civ-textarea>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const textarea = el.querySelector('textarea')!;
    textarea.value = 'Sensitive medical information';
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
    expect(JSON.stringify(detail)).not.toContain('Sensitive medical information');
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-textarea label="Bio" name="bio" disable-analytics></civ-textarea>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const textarea = el.querySelector('textarea')!;
    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('textarea word count', () => {
  afterEach(cleanupFixtures);

  it('renders word count when maxwords is set', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxwords="50"></civ-textarea>');
    const wordCountEl = el.querySelector('[id*="wordcount"]');
    expect(wordCountEl).not.toBeNull();
    expect(wordCountEl!.textContent).toContain('50');
  });

  it('counts words correctly', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxwords="50"></civ-textarea>');
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'one two three';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    const wordCountEl = el.querySelector('[id*="wordcount"]');
    expect(wordCountEl).not.toBeNull();
    // 50 - 3 = 47 words remaining
    expect(wordCountEl!.textContent).toContain('47');
  });

  it('does not show word count when maxlength is also set', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxwords="50" maxlength="200"></civ-textarea>');
    const wordCountEl = el.querySelector('[id*="wordcount"]');
    expect(wordCountEl).toBeNull();
    // Should show character count instead
    const charCountEl = el.querySelector('[id*="charcount"]');
    expect(charCountEl).not.toBeNull();
  });

  it('sets error when over word limit', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxwords="3"></civ-textarea>') as any;
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'one two three four';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    expect(el.error).toBeTruthy();
  });

  it('clears error when back under word limit', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxwords="3"></civ-textarea>') as any;
    const textarea = el.querySelector('textarea')!;

    // Go over limit
    textarea.value = 'one two three four';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBeTruthy();

    // Come back under limit
    textarea.value = 'one two';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('word count ID is in aria-describedby', async () => {
    const el = await fixture('<civ-textarea label="Bio" maxwords="50"></civ-textarea>');
    const textarea = el.querySelector('textarea')!;
    const describedBy = textarea.getAttribute('aria-describedby') || '';
    const wordCountEl = el.querySelector('[id*="wordcount"]');
    expect(wordCountEl).not.toBeNull();
    expect(describedBy).toContain(wordCountEl!.id);
  });
});

describe('textarea declarative validate="length"', () => {
  afterEach(cleanupFixtures);

  it('passes when value is within min/max range', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" validate="length" minlength="3" maxlength="10"></civ-textarea>',
    ) as any;
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('errors when value is shorter than minlength', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" validate="length" minlength="5"></civ-textarea>',
    ) as any;
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'hi';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toContain('5');
  });

  it('errors when value is longer than maxlength (paste case)', async () => {
    // The textarea's native maxlength caps typing, but pasting can exceed
    // it briefly before the browser intervenes. The validator catches it.
    const el = await fixture<any>(
      '<civ-textarea label="Bio" validate="length"></civ-textarea>',
    );
    el.maxlength = 3;
    el.value = 'too long';
    await elementUpdated(el);
    const textarea = el.querySelector('textarea')!;
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toContain('3');
  });

  it('clears its own error on next valid blur', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" validate="length" minlength="5"></civ-textarea>',
    ) as any;
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'hi';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).not.toBe('');

    textarea.value = 'hello there';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('does not run on blur when validate is unset', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" minlength="5"></civ-textarea>',
    ) as any;
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'hi';
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('skips validation for empty values (required-field is base class concern)', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" validate="length" minlength="5"></civ-textarea>',
    ) as any;
    const textarea = el.querySelector('textarea')!;
    textarea.value = '';
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await elementUpdated(el);
    expect(el.error).toBe('');
  });

  it('renders minlength attribute on the textarea when set', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" minlength="3"></civ-textarea>',
    );
    const textarea = el.querySelector('textarea')!;
    expect(textarea.getAttribute('minlength')).toBe('3');
  });
});

describe('civ-textarea spacing="sm"', () => {
  it('renders just the bare <textarea> with no chrome', async () => {
    const el = await fixture(
      '<civ-textarea spacing="sm" aria-label="Cell" hint="not shown" label="not shown"></civ-textarea>',
    );
    expect(el.querySelector('textarea')).not.toBeNull();
    expect(el.querySelector('.civ-label')).toBeNull();
    expect(el.querySelector('.civ-hint')).toBeNull();
  });

  it('propagates host aria-label to the inner <textarea>', async () => {
    const el = await fixture('<civ-textarea spacing="sm" aria-label="Notes"></civ-textarea>');
    expect(el.querySelector('textarea')!.getAttribute('aria-label')).toBe('Notes');
  });

  it('applies civ-input--sm class to the inner <textarea>', async () => {
    const el = await fixture('<civ-textarea spacing="sm" aria-label="x"></civ-textarea>');
    expect(el.querySelector('textarea')!.classList.contains('civ-input--sm')).toBe(true);
  });
});
