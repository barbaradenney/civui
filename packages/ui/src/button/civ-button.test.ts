import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-button.js';

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

  it('applies outline variant class', async () => {
    const el = await fixture('<civ-button variant="outline">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--outline');
  });

  it('applies danger variant class', async () => {
    const el = await fixture('<civ-button variant="danger">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--danger');
  });

  it('applies unstyled variant class', async () => {
    const el = await fixture('<civ-button variant="unstyled">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--unstyled');
  });

  it('applies big size class', async () => {
    const el = await fixture('<civ-button size="big">Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('civ-btn--big');
  });

  it('does not apply big class for default size', async () => {
    const el = await fixture('<civ-button>Click</civ-button>');

    const btn = el.querySelector('button')!;
    expect(btn.className).not.toContain('civ-btn--big');
  });

  it('sets disabled attribute on button', async () => {
    const el = await fixture('<civ-button disabled>Click</civ-button>');

    const btn = el.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('sets aria-disabled on link when disabled', async () => {
    const el = await fixture('<civ-button href="/next" disabled>Click</civ-button>');

    const link = el.querySelector('a')!;
    expect(link.getAttribute('aria-disabled')).toBe('true');
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
});
