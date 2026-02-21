import { describe, it, expect, afterEach } from 'vitest';
import './civ-form-group.js';

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
  if ('updateComplete' in el) await (el as any).updateComplete;
}

afterEach(cleanup);

describe('civ-form-group', () => {
  it('renders a label', async () => {
    const el = createFixture('<civ-form-group label="Full name"></civ-form-group>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Full name');
  });

  it('sets label for attribute from input-id', async () => {
    const el = createFixture('<civ-form-group label="Email" input-id="my-email"></civ-form-group>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label!.getAttribute('for')).toBe('my-email');
  });

  it('renders hint text', async () => {
    const el = createFixture('<civ-form-group label="Name" hint="As it appears on your ID"></civ-form-group>');
    await waitForUpdate(el);

    const hint = el.querySelector('span:not([role])');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('As it appears on your ID');
  });

  it('renders error with alert role', async () => {
    const el = createFixture('<civ-form-group label="Name" error="Name is required"></civ-form-group>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Name is required');
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civ-form-group label="Name" required></civ-form-group>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders slotted content', async () => {
    const el = createFixture(`
      <civ-form-group label="Name">
        <input type="text" id="my-input" />
      </civ-form-group>
    `);
    await waitForUpdate(el);

    const input = el.querySelector('input#my-input');
    expect(input).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civ-form-group label="Name"></civ-form-group>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
  });
});
