import { describe, it, expect, afterEach } from 'vitest';
import './civ-text-input.js';

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

describe('civ-text-input', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Email');
  });

  it('renders an input element', async () => {
    const el = createFixture('<civ-text-input label="Name" name="name"></civ-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input).not.toBeNull();
    expect(input!.type).toBe('text');
    expect(input!.name).toBe('name');
  });

  it('associates label with input via for/id', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('shows required indicator when required', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" required></civ-text-input>',
    );
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
    expect(abbr!.title).toBe('required');
  });

  it('does not show required indicator when not required', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).toBeNull();
  });

  it('renders hint text', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" hint="Enter your work email"></civ-text-input>',
    );
    await waitForUpdate(el);

    const hint = el.querySelector('span');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Enter your work email');
  });

  it('renders error message with alert role', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" error="Email is required"></civ-text-input>',
    );
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Email is required');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" error="Invalid"></civ-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid to false when no error', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('false');
  });

  it('sets aria-describedby for hint and error', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" hint="Hint text" error="Error text"></civ-text-input>',
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
      '<civ-text-input label="Password" type="password"></civ-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.type).toBe('password');
  });

  it('renders disabled state', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" disabled></civ-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.disabled).toBe(true);
  });

  it('fires civ-input event on input', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" name="email"></civ-text-input>',
    );
    await waitForUpdate(el);

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
    const el = createFixture(
      '<civ-text-input label="Email" name="email"></civ-text-input>',
    );
    await waitForUpdate(el);

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
    const el = createFixture(
      '<civ-text-input label="Email" placeholder="you@example.com"></civ-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.placeholder).toBe('you@example.com');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('applies error border classes when error is set', async () => {
    const el = createFixture(
      '<civ-text-input label="Email" error="Required"></civ-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('civ-border-error');
    expect(input!.className).toContain('civ-border-l-4');
  });

  it('applies width variant classes', async () => {
    const el = createFixture(
      '<civ-text-input label="ZIP" width="sm"></civ-text-input>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('civ-w-24');
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civ-text-input label="Email" required></civ-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
  });

  it('sets aria-required to false when not required', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('false');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-text-input') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('accepts custom required-message property', async () => {
    const el = createFixture('<civ-text-input label="Email" required required-message="Campo requerido"></civ-text-input>') as any;
    await waitForUpdate(el);

    expect(el.requiredMessage).toBe('Campo requerido');
  });

  it('applies focus-visible ring class', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = createFixture('<civ-text-input label="Email"></civ-text-input>');
    await waitForUpdate(el);

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});
