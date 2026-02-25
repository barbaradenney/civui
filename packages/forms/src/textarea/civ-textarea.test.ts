import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-textarea.js';

afterEach(cleanupFixtures);

describe('civ-textarea', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-textarea label="Comments"></civ-textarea>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Comments');
  });

  it('renders a textarea element', async () => {
    const el = await fixture('<civ-textarea label="Comments" name="comments"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea).not.toBeNull();
    expect(textarea!.name).toBe('comments');
  });

  it('associates label with textarea via for/id', async () => {
    const el = await fixture('<civ-textarea label="Comments"></civ-textarea>');

    const label = el.querySelector('label');
    const textarea = el.querySelector('textarea');
    expect(label!.getAttribute('for')).toBe(textarea!.id);
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

  it('renders error message with alert role', async () => {
    const el = await fixture('<civ-textarea label="Bio" error="Too short"></civ-textarea>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Too short');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-textarea label="Bio" error="Required"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-textarea label="Bio" hint="Keep it brief"></civ-textarea>');

    const hint = el.querySelector('span:not([role])');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Keep it brief');
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-textarea label="Bio" required></civ-textarea>');

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
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

  it('sets aria-required when required', async () => {
    const el = await fixture('<civ-textarea label="Bio" required></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.getAttribute('aria-required')).toBe('true');
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

  it('includes hint, error, and character count in aria-describedby', async () => {
    const el = await fixture(
      '<civ-textarea label="Bio" hint="Keep brief" error="Too short" maxlength="200"></civ-textarea>',
    );

    const textarea = el.querySelector('textarea');
    const describedBy = textarea!.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    expect(ids.length).toBe(3);

    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-textarea') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = await fixture('<civ-textarea label="Comments"></civ-textarea>');

    const textarea = el.querySelector('textarea');
    expect(textarea!.className).toContain('focus-visible:civ-focus-ring');
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
