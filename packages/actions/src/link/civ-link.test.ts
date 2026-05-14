import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-link.js';

afterEach(cleanupFixtures);

// Tailwind content-scanner protection (`pnpm lint:purged-variants`).
// civ-link builds the danger classes via template literal
// `civ-link--${variant}-danger`:
//   civ-link--primary-danger  civ-link--secondary-danger  civ-link--tertiary-danger

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

  it('renders custom icon-start', async () => {
    const el = await fixture('<civ-link href="/download" icon-start="download">Download</civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('download');
  });

  it('renders custom icon-end', async () => {
    const el = await fixture('<civ-link href="/ext" icon-end="external-link">External</civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('external-link');
  });

  it('icon-end overrides secondary default chevron', async () => {
    const el = await fixture('<civ-link href="/next" variant="secondary" icon-end="arrow-right">Next</civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon!.getAttribute('name')).toBe('arrow-right');
  });

  it('icon-start overrides back default chevron', async () => {
    const el = await fixture('<civ-link href="/" variant="back" icon-start="home">Home</civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon!.getAttribute('name')).toBe('home');
  });

  it('applies danger class', async () => {
    const el = await fixture('<civ-link href="/delete" danger>Delete</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('danger');
  });

  it('sanitizes javascript: href', async () => {
    const el = await fixture('<civ-link href="javascript:alert(1)">XSS</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href') ?? '').not.toContain('javascript:');
  });

  it('renders a real <a href> so the global focus ring applies', async () => {
    const el = await fixture('<civ-link href="/next">Go</civ-link>');
    const link = el.querySelector('a')!;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/next');
  });

  it('new-tab sets target="_blank"', async () => {
    const el = await fixture('<civ-link href="/ext" new-tab>External</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('new-tab sets rel="noopener noreferrer"', async () => {
    const el = await fixture('<civ-link href="/ext" new-tab>External</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('new-tab renders external-link icon', async () => {
    const el = await fixture('<civ-link href="/ext" new-tab>External</civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('external-link');
  });

  it('new-tab overrides custom target prop', async () => {
    const el = await fixture('<civ-link href="/ext" new-tab target="_self">External</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('new-tab overrides custom rel prop', async () => {
    const el = await fixture('<civ-link href="/ext" new-tab rel="nofollow">External</civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('new-tab adds screen reader text span', async () => {
    const el = await fixture('<civ-link href="/ext" new-tab>External</civ-link>');
    const srSpan = el.querySelector('.civ-sr-only');
    expect(srSpan).not.toBeNull();
  });

  // ── Type modes (folded from the former civ-action-link) ───────

  it('type="phone" builds a tel: href from `number`', async () => {
    const el = await fixture('<civ-link type="phone" number="8005551234"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('tel:8005551234');
  });

  it('type="phone" formats a 10-digit number as (NNN) NNN-NNNN for display', async () => {
    const el = await fixture('<civ-link type="phone" number="8005551234"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.textContent).toContain('(800) 555-1234');
  });

  it('type="phone" strips formatting before building tel:', async () => {
    const el = await fixture('<civ-link type="phone" number="(800) 555-1234"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('tel:8005551234');
  });

  it('type="phone" renders an empty href when number is empty', async () => {
    const el = await fixture('<civ-link type="phone" number=""></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('');
  });

  it('type="phone" uses the phone icon as leading icon', async () => {
    const el = await fixture('<civ-link type="phone" number="8005551234"></civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon?.getAttribute('name')).toBe('phone');
  });

  it('type="email" builds a mailto: href from `address`', async () => {
    const el = await fixture('<civ-link type="email" address="help@va.gov"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('mailto:help@va.gov');
  });

  it('type="email" includes URL-encoded subject', async () => {
    const el = await fixture('<civ-link type="email" address="help@va.gov" subject="Question about benefits"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('mailto:help@va.gov?subject=Question%20about%20benefits');
  });

  it('type="email" uses the mail icon as leading icon', async () => {
    const el = await fixture('<civ-link type="email" address="a@b.com"></civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon?.getAttribute('name')).toBe('mail');
  });

  it('type="download" passes the `href` through and sets the download attribute', async () => {
    const el = await fixture('<civ-link type="download" href="/forms/10-10EZ.pdf" filename="10-10EZ.pdf"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/forms/10-10EZ.pdf');
    expect(link.getAttribute('download')).toBe('10-10EZ.pdf');
  });

  it('type="download" uses the download icon as leading icon', async () => {
    const el = await fixture('<civ-link type="download" href="/file.pdf"></civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon?.getAttribute('name')).toBe('download');
  });

  it('type="download" renders the file size suffix when set', async () => {
    const el = await fixture('<civ-link type="download" href="/file.pdf" file-size="2.4 MB"></civ-link>');
    const sizeSpan = el.querySelector('span.civ-text-sm');
    expect(sizeSpan).not.toBeNull();
    expect(sizeSpan!.textContent).toContain('2.4 MB');
  });

  it('type="download" falls back to filename as display text when no label', async () => {
    const el = await fixture('<civ-link type="download" href="/forms/10-10EZ.pdf" filename="10-10EZ.pdf"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.textContent).toContain('10-10EZ.pdf');
  });

  it('label prop wins over type-derived display text', async () => {
    const el = await fixture('<civ-link type="phone" number="8005551234" label="Call us"></civ-link>');
    const link = el.querySelector('a')!;
    expect(link.textContent).toContain('Call us');
  });

  it('iconStart wins over type-derived icon', async () => {
    const el = await fixture('<civ-link type="phone" number="8005551234" icon-start="info"></civ-link>');
    const icon = el.querySelector('civ-icon');
    expect(icon?.getAttribute('name')).toBe('info');
  });
});
