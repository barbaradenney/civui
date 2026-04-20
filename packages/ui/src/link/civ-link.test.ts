import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-link.js';

afterEach(cleanupFixtures);

describe('civ-link', () => {
  it('renders an <a> element', async () => {
    const el = await fixture('<civ-link href="/next">Continue</civ-link>');
    const link = el.querySelector('a');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('/next');
    expect(link!.textContent).toContain('Continue');
  });

  it('defaults to tertiary variant', async () => {
    const el = await fixture('<civ-link href="/next">Go</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--tertiary');
  });

  it('applies primary variant class', async () => {
    const el = await fixture('<civ-link href="/next" variant="primary">Go</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--primary');
  });

  it('applies secondary variant with caret icon', async () => {
    const el = await fixture('<civ-link href="/next" variant="secondary">Details</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--secondary');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-right');
  });

  it('does not show caret for primary or tertiary', async () => {
    for (const variant of ['primary', 'tertiary']) {
      const el = await fixture(`<civ-link href="/next" variant="${variant}">Go</civ-link>`);
      expect(el.querySelector('civ-icon')).toBeNull();
    }
  });

  it('disabled link has aria-disabled, no href, tabindex=-1', async () => {
    const el = await fixture('<civ-link href="/next" disabled>Go</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('tabindex')).toBe('-1');
  });

  it('uses label prop as link text', async () => {
    const el = await fixture('<civ-link href="/next" label="Continue"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.textContent).toContain('Continue');
  });

  it('fires analytics event on click', async () => {
    const el = await fixture('<civ-link href="/next">Go</civ-link>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const link = el.querySelector('a') as HTMLAnchorElement;
    link.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire analytics when disabled', async () => {
    const el = await fixture('<civ-link href="/next" disabled>Go</civ-link>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const link = el.querySelector('a') as HTMLAnchorElement;
    link.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('applies back variant with leading arrow icon', async () => {
    const el = await fixture('<civ-link href="/prev" variant="back" label="Back to task list"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link--back');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-left');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-link href="/next">Go</civ-link>');
    expect(el.shadowRoot).toBeNull();
  });
});
