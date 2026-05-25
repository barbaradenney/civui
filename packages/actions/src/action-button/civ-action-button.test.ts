import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
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
    const el = await fixture('<civ-action-button label="Save" emphasis="primary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--primary')).toBe(true);
  });

  it('applies secondary variant class', async () => {
    const el = await fixture('<civ-action-button label="Info" emphasis="secondary"></civ-action-button>');
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

  it('renders a real <button> so the global focus ring applies', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button')!;
    expect(btn.tagName).toBe('BUTTON');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    expect(el.shadowRoot).toBeNull();
  });

  it('renders icon-start when set', async () => {
    const el = await fixture('<civ-action-button label="Edit" icon-start="edit"></civ-action-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('edit');
  });

  it('renders icon-end when set', async () => {
    const el = await fixture('<civ-action-button label="More" icon-end="chevron-down"></civ-action-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-down');
  });

  // Note: each variant asserts the emphasis class AND the danger class
  // separately so Tailwind's content scanner sees both literal strings.
  // The danger CSS lives at the `.civ-action-btn--{emphasis}.civ-action-btn--danger`
  // compound selector; Tailwind needs to see both halves preserved so it
  // doesn't purge either rule. See tailwind.config.ts for the full
  // explanation.
  it('applies the primary + danger variant classes', async () => {
    const el = await fixture('<civ-action-button label="Delete" danger emphasis="primary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('civ-action-btn--primary');
    expect(btn!.className).toContain('civ-action-btn--danger');
  });

  it('applies the secondary + danger variant classes', async () => {
    const el = await fixture('<civ-action-button label="Remove" danger emphasis="secondary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('civ-action-btn--secondary');
    expect(btn!.className).toContain('civ-action-btn--danger');
  });

  it('applies the tertiary + danger variant classes', async () => {
    const el = await fixture('<civ-action-button label="Cancel" danger emphasis="tertiary"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.className).toContain('civ-action-btn--tertiary');
    expect(btn!.className).toContain('civ-action-btn--danger');
  });

  it('sets type attribute on button', async () => {
    const el = await fixture('<civ-action-button label="Submit" type="submit"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.getAttribute('type')).toBe('submit');
  });

  it('defaults button type to "button"', async () => {
    const el = await fixture('<civ-action-button label="Test"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.getAttribute('type')).toBe('button');
  });

  it('fires civ-analytics event on click', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button')!;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire civ-analytics when disabled', async () => {
    const el = await fixture('<civ-action-button label="Bold" disabled></civ-action-button>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button')!;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('omits civ-action-btn--sm at default spacing', async () => {
    const el = await fixture('<civ-action-button label="Edit"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--sm')).toBe(false);
  });

  it('applies civ-action-btn--sm when spacing="sm"', async () => {
    const el = await fixture('<civ-action-button label="Edit" spacing="sm"></civ-action-button>');
    const btn = el.querySelector('button');
    expect(btn!.classList.contains('civ-action-btn--sm')).toBe(true);
  });

  it('updates aria-pressed when pressed changes dynamically', async () => {
    const el = await fixture('<civ-action-button label="Bold"></civ-action-button>') as any;
    const btn = el.querySelector('button')!;
    expect(btn.hasAttribute('aria-pressed')).toBe(false);

    el.pressed = true;
    await elementUpdated(el);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('CivActionButton icon-only mode', () => {
  it('wraps the label in .civ-sr-only when icon-only is set', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="Row actions"></civ-action-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    const sr = btn.querySelector('.civ-sr-only') as HTMLElement;
    expect(sr).not.toBeNull();
    expect(sr.textContent?.trim()).toBe('Row actions');
  });

  it('keeps the icon visible in icon-only mode', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="More"></civ-action-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('name')).toBe('more-vert');
  });

  it('applies the civ-action-btn--icon-only class', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="Close"></civ-action-button>');
    const btn = el.querySelector('button.civ-action-btn--icon-only');
    expect(btn).not.toBeNull();
  });

  it('reflects the icon-only attribute to the host', async () => {
    const el = await fixture('<civ-action-button icon-only icon-start="more-vert" label="More"></civ-action-button>') as any;
    expect(el.hasAttribute('icon-only')).toBe(true);
  });
});
