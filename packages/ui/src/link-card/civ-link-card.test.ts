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
    expect(heading!.textContent).toBe('Benefits');
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
    expect(heading!.textContent).toBe('');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-link-card href="/test" heading="Title"></civ-link-card>');
    expect(el.shadowRoot).toBeNull();
  });
});
