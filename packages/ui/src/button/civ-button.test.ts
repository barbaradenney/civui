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

  it('renders an <a> when href is set', async () => {
    const el = await fixture('<civ-button href="/next">Continue</civ-button>');

    const link = el.querySelector('a');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('/next');
    expect(link!.textContent).toContain('Continue');
    expect(el.querySelector('button')).toBeNull();
  });

  it('applies link variant class when href is set', async () => {
    const el = await fixture('<civ-button href="/next">Go</civ-button>');

    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--primary');
  });

  it('applies secondary link class with caret', async () => {
    const el = await fixture('<civ-button href="/next" variant="secondary">Details</civ-button>');

    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--secondary');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-right');
  });

  it('applies tertiary link class without caret', async () => {
    const el = await fixture('<civ-button href="/next" variant="tertiary">Learn more</civ-button>');

    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--tertiary');
    const icon = el.querySelector('civ-icon');
    expect(icon).toBeNull();
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

  it('applies danger variant class', async () => {
    const el = await fixture('<civ-button variant="danger">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--danger');
  });

  it('sets disabled attribute on button', async () => {
    const el = await fixture('<civ-button disabled>Click</civ-button>');

    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('disabled link has aria-disabled, no href, and tabindex=-1', async () => {
    const el = await fixture('<civ-button href="/next" disabled>Click</civ-button>');

    const link = el.querySelector('a')!;
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('tabindex')).toBe('-1');
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

  it('applies focus-visible:civ-focus-ring class', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('focus-visible:civ-focus-ring');
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

  it('fires analytics on link click', async () => {
    const el = await fixture('<civ-button href="/next">Go</civ-button>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const link = el.querySelector('a') as HTMLAnchorElement;
    link.click();

    expect(handler).toHaveBeenCalledOnce();
  });
});
