import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-form-group.js';

afterEach(cleanupFixtures);

describe('civ-form-group', () => {
  it('renders a label', async () => {
    const el = await fixture('<civ-form-group label="Full name"></civ-form-group>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Full name');
  });

  it('sets label for attribute from input-id', async () => {
    const el = await fixture('<civ-form-group label="Email" input-id="my-email"></civ-form-group>');

    const label = el.querySelector('label');
    expect(label!.getAttribute('for')).toBe('my-email');
  });

  it('renders hint text', async () => {
    const el = await fixture('<civ-form-group label="Name" hint="As it appears on your ID"></civ-form-group>');

    const hint = el.querySelector('span:not([role])');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('As it appears on your ID');
  });

  it('renders error with alert role', async () => {
    const el = await fixture('<civ-form-group label="Name" error="Name is required"></civ-form-group>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Name is required');
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-form-group label="Name" required></civ-form-group>');

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('renders slotted content', async () => {
    const el = await fixture(`
      <civ-form-group label="Name">
        <input type="text" id="my-input" />
      </civ-form-group>
    `);

    const input = el.querySelector('input#my-input');
    expect(input).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-form-group label="Name"></civ-form-group>');

    expect(el.shadowRoot).toBeNull();
  });

  it('wires aria-describedby for hint', async () => {
    const el = await fixture(`
      <civ-form-group label="Name" hint="Enter your full name">
        <input type="text" id="name" />
      </civ-form-group>
    `);

    const input = el.querySelector('input')!;
    const hintEl = el.querySelector('span:not([role])');
    expect(input.getAttribute('aria-describedby')).toBe(hintEl!.id);
  });

  it('wires aria-describedby for error', async () => {
    const el = await fixture(`
      <civ-form-group label="Name" error="Name is required">
        <input type="text" id="name" />
      </civ-form-group>
    `);

    const input = el.querySelector('input')!;
    const errorEl = el.querySelector('[role="alert"]');
    expect(input.getAttribute('aria-describedby')).toBe(errorEl!.id);
  });

  it('wires aria-describedby with both hint and error', async () => {
    const el = await fixture(`
      <civ-form-group label="Name" hint="Enter your full name" error="Name is required">
        <input type="text" id="name" />
      </civ-form-group>
    `);

    const input = el.querySelector('input')!;
    const describedBy = input.getAttribute('aria-describedby')!;
    const hintEl = el.querySelector('span:not([role])');
    const errorEl = el.querySelector('[role="alert"]');
    expect(describedBy).toContain(hintEl!.id);
    expect(describedBy).toContain(errorEl!.id);
  });

  it('removes aria-describedby when hint and error are cleared', async () => {
    const el = await fixture(`
      <civ-form-group label="Name" hint="Enter your full name">
        <input type="text" id="name" />
      </civ-form-group>
    `) as any;

    const input = el.querySelector('input')!;
    expect(input.hasAttribute('aria-describedby')).toBe(true);

    el.hint = '';
    await el.updateComplete;

    expect(input.hasAttribute('aria-describedby')).toBe(false);
  });
});
