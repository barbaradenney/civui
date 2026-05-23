import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-button.js';
import type { CivButton } from './civ-button.js';

afterEach(cleanupFixtures);

describe('civ-button', () => {
  it('renders a <button> by default', async () => {
    const el = await fixture('<civ-button>Submit</civ-button>');

    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Submit');
  });


  it('applies primary variant class by default', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn');
    expect(btn.className).toContain('civ-btn--primary');
  });

  it('applies secondary variant class', async () => {
    const el = await fixture('<civ-button variant="secondary">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--secondary');
  });

  it('applies tertiary variant class', async () => {
    const el = await fixture('<civ-button variant="tertiary">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--tertiary');
  });

  it('applies danger class to primary variant', async () => {
    const el = await fixture('<civ-button danger>Delete</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--primary-danger');
  });

  it('applies danger class to secondary variant', async () => {
    const el = await fixture('<civ-button variant="secondary" danger>Remove</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--secondary-danger');
  });

  it('applies danger class to tertiary variant', async () => {
    const el = await fixture('<civ-button variant="tertiary" danger>Cancel</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--tertiary-danger');
  });

  it('sets disabled attribute on button', async () => {
    const el = await fixture('<civ-button disabled>Click</civ-button>');

    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });


  it('sets type="button" by default', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('passes through type="submit"', async () => {
    const el = await fixture('<civ-button type="submit">Submit</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('submit');
  });

  it('passes through type="reset"', async () => {
    const el = await fixture('<civ-button type="reset">Reset</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('reset');
  });

  it('fires analytics event on click', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-button');
    expect(detail.action).toBe('click');
  });

  it('does not fire analytics when disabled', async () => {
    const el = await fixture('<civ-button disabled>Click</civ-button>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('renders a real <button> so the global focus ring applies', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.tagName).toBe('BUTTON');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('button')).not.toBeNull();
  });

  // label prop tests
  it('uses label prop as button text', async () => {
    const el = await fixture('<civ-button label="Save changes"></civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.textContent).toContain('Save changes');
  });

  it('label prop takes precedence over child text', async () => {
    const el = await fixture('<civ-button label="Save">Old text</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.textContent).toContain('Save');
    expect(btn.textContent).not.toContain('Old text');
  });

  it('updates text when label prop changes', async () => {
    const el = await fixture('<civ-button label="Save"></civ-button>') as CivButton;

    el.label = 'Submit';
    await elementUpdated(el);

    const btn = el.querySelector('button')!;
    expect(btn.textContent).toContain('Submit');
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-button disable-analytics>Click</civ-button>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('renders icon-start when set', async () => {
    const el = await fixture('<civ-button icon-start="download">Download</civ-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('download');
  });

  it('renders icon-end when set', async () => {
    const el = await fixture('<civ-button icon-end="arrow-right">Next</civ-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('arrow-right');
  });

  it('renders both icons when both set', async () => {
    const el = await fixture('<civ-button icon-start="edit" icon-end="chevron-right">Edit</civ-button>');
    const icons = el.querySelectorAll('civ-icon');
    expect(icons.length).toBe(2);
    expect(icons[0].getAttribute('name')).toBe('edit');
    expect(icons[1].getAttribute('name')).toBe('chevron-right');
  });

  it('renders no icons by default', async () => {
    const el = await fixture('<civ-button>Plain</civ-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).toBeNull();
  });
});

describe('CivButton icon-only mode', () => {
  it('wraps the label in .civ-sr-only when icon-only is set', async () => {
    const el = await fixture('<civ-button icon-only icon-start="more-vert" label="Row actions"></civ-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    const sr = btn.querySelector('.civ-sr-only') as HTMLElement;
    expect(sr).not.toBeNull();
    expect(sr.textContent?.trim()).toBe('Row actions');
  });

  it('keeps the icon visible in icon-only mode', async () => {
    const el = await fixture('<civ-button icon-only icon-start="more-vert" label="More"></civ-button>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('name')).toBe('more-vert');
  });

  it('applies the civ-btn--icon-only class', async () => {
    const el = await fixture('<civ-button icon-only icon-start="more-vert" label="Close"></civ-button>');
    const btn = el.querySelector('button.civ-btn--icon-only');
    expect(btn).not.toBeNull();
  });

  it('reflects the icon-only attribute to the host', async () => {
    const el = await fixture('<civ-button icon-only icon-start="more-vert" label="More"></civ-button>') as any;
    expect(el.hasAttribute('icon-only')).toBe(true);
  });
});

describe('CivButton loading state', () => {
  it('renders a civ-spinner in place of the leading icon when loading', async () => {
    const el = await fixture('<civ-button loading icon-start="check" label="Save"></civ-button>');
    expect(el.querySelector('civ-spinner')).not.toBeNull();
    // The icon should NOT render while loading.
    expect(el.querySelector('civ-icon[name="check"]')).toBeNull();
  });

  it('disables the underlying button while loading', async () => {
    const el = await fixture('<civ-button loading label="Save"></civ-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('sets aria-busy on the button while loading', async () => {
    const el = await fixture('<civ-button loading label="Save"></civ-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('does NOT set aria-busy when not loading', async () => {
    const el = await fixture('<civ-button label="Save"></civ-button>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.hasAttribute('aria-busy')).toBe(false);
  });

  it('passes loadingLabel through to the spinner', async () => {
    const el = await fixture(
      '<civ-button loading loading-label="Saving your application…" label="Save"></civ-button>',
    );
    const spinner = el.querySelector('civ-spinner') as HTMLElement;
    expect(spinner.getAttribute('label')).toBe('Saving your application…');
  });

  it('still renders the label text while loading', async () => {
    const el = await fixture('<civ-button loading label="Save"></civ-button>');
    const btn = el.querySelector('button')!;
    expect(btn.textContent).toContain('Save');
  });

  it('ignores loading in link mode (href set)', async () => {
    const el = await fixture(
      '<civ-button loading href="/next" label="Continue"></civ-button>',
    );
    expect(el.querySelector('a')).not.toBeNull();
    expect(el.querySelector('civ-spinner')).toBeNull();
  });
});
