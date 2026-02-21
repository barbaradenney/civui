import { describe, it, expect, afterEach } from 'vitest';
import './civds-text-input.js';

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

describe('civds-text-input', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Email');
  });

  it('renders an input element', async () => {
    const el = createFixture('<civds-text-input label="Name" name="name"></civds-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.type).toBe('text');
    expect(input!.name).toBe('name');
  });

  it('associates label with input via for/id', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('shows required indicator when required', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" required></civds-text-input>',
    );
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
    expect(abbr!.title).toBe('required');
  });

  it('does not show required indicator when not required', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).toBeNull();
  });

  it('renders hint text', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" hint="Enter your work email"></civds-text-input>',
    );
    await waitForUpdate(el);

    const hint = el.querySelector('span');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Enter your work email');
  });

  it('renders error message with alert role', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" error="Email is required"></civds-text-input>',
    );
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Email is required');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" error="Invalid"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid to false when no error', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('false');
  });

  it('sets aria-describedby for hint and error', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" hint="Hint text" error="Error text"></civds-text-input>',
    );
    await waitForUpdate(el);

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
    const el = createFixture(
      '<civds-text-input label="Password" type="password"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.type).toBe('password');
  });

  it('renders disabled state', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" disabled></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.disabled).toBe(true);
  });

  it('fires civds-input event on input', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" name="email"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input')!;
    let eventDetail: any = null;

    el.addEventListener('civds-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'test@example.com' });
  });

  it('fires civds-change event on change', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" name="email"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input')!;
    let eventDetail: any = null;

    el.addEventListener('civds-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'test@example.com' });
  });

  it('renders with placeholder', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" placeholder="you@example.com"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.placeholder).toBe('you@example.com');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('applies error border classes when error is set', async () => {
    const el = createFixture(
      '<civds-text-input label="Email" error="Required"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('civds-border-error');
    expect(input!.className).toContain('civds-border-l-4');
  });

  it('applies width variant classes', async () => {
    const el = createFixture(
      '<civds-text-input label="ZIP" width="sm"></civds-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('civds-w-24');
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civds-text-input label="Email" required></civds-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
  });

  it('sets aria-required to false when not required', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('false');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-text-input') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('applies focus-visible ring class', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civds-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = createFixture('<civds-text-input label="Email"></civds-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civds-outline-2');
    expect(input!.className).not.toContain('focus:civds-outline-primary');
    expect(input!.className).not.toContain('focus:civds-outline-offset-0');
  });
});
