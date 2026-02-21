import { describe, it, expect, afterEach } from 'vitest';
import './civds-textarea.js';

function createFixture(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as HTMLElement;
}

function cleanup(): void {
  document.body.innerHTML = '';
}

async function waitForUpdate(el: HTMLElement): Promise<void> {
  if ('updateComplete' in el) {
    await (el as any).updateComplete;
  }
}

afterEach(cleanup);

describe('civds-textarea', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civds-textarea label="Comments"></civds-textarea>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Comments');
  });

  it('renders a textarea element', async () => {
    const el = createFixture('<civds-textarea label="Comments" name="comments"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea).not.toBeNull();
    expect(textarea!.name).toBe('comments');
  });

  it('associates label with textarea via for/id', async () => {
    const el = createFixture('<civds-textarea label="Comments"></civds-textarea>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const textarea = el.querySelector('textarea');
    expect(label!.getAttribute('for')).toBe(textarea!.id);
  });

  it('renders with configurable rows', async () => {
    const el = createFixture('<civds-textarea label="Bio" rows="10"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.rows).toBe(10);
  });

  it('defaults to 5 rows', async () => {
    const el = createFixture('<civds-textarea label="Bio"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.rows).toBe(5);
  });

  it('shows character count when maxlength is set', async () => {
    const el = createFixture('<civds-textarea label="Bio" maxlength="200"></civds-textarea>');
    await waitForUpdate(el);

    const counter = el.querySelector('[aria-live="polite"]');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('200 characters remaining');
  });

  it('does not show character count without maxlength', async () => {
    const el = createFixture('<civds-textarea label="Bio"></civds-textarea>');
    await waitForUpdate(el);

    const counter = el.querySelector('[aria-live="polite"]');
    expect(counter).toBeNull();
  });

  it('updates character count on input', async () => {
    const el = createFixture('<civds-textarea label="Bio" maxlength="200"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea')!;
    textarea.value = 'Hello world';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForUpdate(el);

    const counter = el.querySelector('[aria-live="polite"]');
    expect(counter!.textContent).toContain('189 characters remaining');
  });

  it('renders error message with alert role', async () => {
    const el = createFixture('<civds-textarea label="Bio" error="Too short"></civds-textarea>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Too short');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture('<civds-textarea label="Bio" error="Required"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders hint text', async () => {
    const el = createFixture('<civds-textarea label="Bio" hint="Keep it brief"></civds-textarea>');
    await waitForUpdate(el);

    const hint = el.querySelector('span:not([role])');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Keep it brief');
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civds-textarea label="Bio" required></civds-textarea>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders disabled state', async () => {
    const el = createFixture('<civds-textarea label="Bio" disabled></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.disabled).toBe(true);
  });

  it('fires civds-input event on input', async () => {
    const el = createFixture('<civds-textarea label="Bio" name="bio"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea')!;
    let eventDetail: any = null;

    el.addEventListener('civds-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'Hello' });
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = createFixture('<civds-textarea label="Bio"></civds-textarea>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('textarea')).not.toBeNull();
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civds-textarea label="Bio" required></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.getAttribute('aria-required')).toBe('true');
  });

  it('includes character count in aria-describedby when maxlength is set', async () => {
    const el = createFixture('<civds-textarea label="Bio" maxlength="200"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    const describedBy = textarea!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const charCount = el.querySelector('[aria-live="polite"]');
    expect(charCount).not.toBeNull();
    expect(charCount!.id).toBeTruthy();
    expect(describedBy).toContain(charCount!.id);
  });

  it('includes hint, error, and character count in aria-describedby', async () => {
    const el = createFixture(
      '<civds-textarea label="Bio" hint="Keep brief" error="Too short" maxlength="200"></civds-textarea>',
    );
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    const describedBy = textarea!.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    expect(ids.length).toBe(3);

    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-textarea') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = createFixture('<civds-textarea label="Comments"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.className).toContain('focus-visible:civds-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = createFixture('<civds-textarea label="Comments"></civds-textarea>');
    await waitForUpdate(el);

    const textarea = el.querySelector('textarea');
    expect(textarea!.className).not.toContain('focus:civds-outline-2');
    expect(textarea!.className).not.toContain('focus:civds-outline-primary');
    expect(textarea!.className).not.toContain('focus:civds-outline-offset-0');
  });
});
