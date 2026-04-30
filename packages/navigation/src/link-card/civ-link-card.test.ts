import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-link-card.js';

afterEach(cleanupFixtures);

describe('civ-link-card', () => {
  it('renders as an <a> element', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    const link = el.querySelector('a');
    expect(link).not.toBeNull();
    expect(link!.getAttribute('href')).toBe('/test');
  });

  it('renders heading text', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Benefits"></civ-link-card>');
    const heading = el.querySelector('.civ-link-card__heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent!.trim()).toBe('Benefits');
  });

  it('renders description when provided', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title" description="Some details"></civ-link-card>');
    const desc = el.querySelector('.civ-link-card__description');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toBe('Some details');
  });

  it('omits description when not provided', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    expect(el.querySelector('.civ-link-card__description')).toBeNull();
  });

  it('has focus-visible:civ-focus-ring class', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('focus-visible:civ-focus-ring');
  });

  it('fires analytics event on click', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const link = el.querySelector('a') as HTMLAnchorElement;
    link.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('defaults to primary variant', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--primary');
  });

  it('applies secondary variant', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Details" variant="secondary"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--secondary');
  });

  it('applies tertiary variant', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="History" variant="tertiary"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--tertiary');
  });

  it('applies critical variant', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Action" variant="critical"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--critical');
  });

  it('renders with empty heading', async () => {
    const el = await fixture('<civ-link-card href="/test"></civ-link-card>');
    const heading = el.querySelector('.civ-link-card__heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent!.trim()).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    expect(el.shadowRoot).toBeNull();
  });

  it('applies danger variant', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Delete" variant="danger"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--danger');
  });

  it('applies sm spacing class', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title" spacing="sm"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--sm');
  });

  it('sanitizes javascript: href', async () => {
    const el = await fixture('<civ-link-card href="javascript:alert(1)" heading="XSS"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).not.toContain('javascript:');
  });

  it('renders icon-start before heading text', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Benefits" icon-start="check-circle"></civ-link-card>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('check-circle');
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders icon-end after heading text', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Details" icon-end="chevron-right"></civ-link-card>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-right');
  });

  it('does not render icons when not set', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    expect(el.querySelector('civ-icon')).toBeNull();
  });

  it('applies color tint class (secondary style)', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title" color="blue" variant="secondary"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-card--blue');
    expect(link.className).not.toContain('civ-card--blue-primary');
  });

  it('applies color primary class when variant is primary', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title" color="green" variant="primary"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-card--green-primary');
  });

  it('falls back to variant class when no color is set', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title" variant="tertiary"></civ-link-card>');
    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-link-card--tertiary');
    expect(link.className).not.toContain('civ-card--');
  });

  it('relocates slotted children into the rendered anchor', async () => {
    const el = await fixture(
      '<civ-link-card href="/test" heading="Title"><span class="badge">flag</span></civ-link-card>'
    );
    const anchor = el.querySelector('a')!;
    const slotted = anchor.querySelector('.badge');
    expect(slotted).not.toBeNull();
    expect(slotted!.textContent).toBe('flag');
  });

  it('relocates data-civ-link-card-end children into the end slot', async () => {
    const el = await fixture(
      '<civ-link-card href="/test" heading="Title" description="Body"><span class="badge" data-civ-link-card-end>tag</span></civ-link-card>'
    );
    const endSlot = el.querySelector('[data-civ-link-card-end-slot]');
    expect(endSlot).not.toBeNull();
    const slotted = endSlot!.querySelector('.badge');
    expect(slotted).not.toBeNull();
    expect(slotted!.textContent).toBe('tag');
  });

  it('end slot uses the layout wrapper even without flank icons', async () => {
    const el = await fixture(
      '<civ-link-card href="/test" heading="Title"><span data-civ-link-card-end>x</span></civ-link-card>'
    );
    const layout = el.querySelector('.civ-link-card__layout');
    expect(layout).not.toBeNull();
    expect(layout!.querySelector('[data-civ-link-card-end-slot]')).not.toBeNull();
  });

  it('omits end slot container when no end-slotted children exist', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    expect(el.querySelector('[data-civ-link-card-end-slot]')).toBeNull();
  });

  it('supports both top and end slots simultaneously', async () => {
    const el = await fixture(
      '<civ-link-card href="/test" heading="Title">' +
        '<span class="top">top</span>' +
        '<span class="end" data-civ-link-card-end>end</span>' +
      '</civ-link-card>'
    );
    const top = el.querySelector('[data-civ-link-card-slot] .top');
    const end = el.querySelector('[data-civ-link-card-end-slot] .end');
    expect(top).not.toBeNull();
    expect(end).not.toBeNull();
  });
});
