import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-action-button.js';

afterEach(cleanupFixtures);

describe('civ-action-button', () => {
  it('renders a button with label', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe('Bold');
  });

  it('defaults to tertiary variant', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--tertiary')).toBe(true);
  });

  it('applies primary variant class', async () => {
    const el = await fixture('<civ-action-button label="Save" variant="primary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--primary')).toBe(true);
  });

  it('applies secondary variant class', async () => {
    const el = await fixture('<civ-action-button label="Info" variant="secondary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--secondary')).toBe(true);
  });

  it('sets aria-pressed when pressed', async () => {
    const el = await fixture('<civ-action-button label="Bold" pressed></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.getAttribute('aria-pressed')).toBe('true');
  });

  it('omits aria-pressed when not used as a toggle', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.hasAttribute('aria-pressed')).toBe(false);
  });

  it('disables the button', async () => {
    const el = await fixture('<civ-action-button label="Test" disabled></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.disabled).toBe(true);
  });

  it('has focus-visible ring class', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    expect(el.shadowRoot).toBeNull();
  });
});
