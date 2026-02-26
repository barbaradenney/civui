import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-skip-link.js';

afterEach(cleanupFixtures);

describe('civ-skip-link', () => {
  it('renders an <a> element', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    const link = el.querySelector('a');
    expect(link).not.toBeNull();
  });

  it('has default href of #main-content', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#main-content');
  });

  it('allows custom href', async () => {
    const el = await fixture('<civ-skip-link href="#content"></civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#content');
  });

  it('has civ-skip-link class for visually hidden styling', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.className).toContain('civ-skip-link');
  });

  it('has default label text "Skip to main content"', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.textContent).toBe('Skip to main content');
  });

  it('uses custom children as label text', async () => {
    const el = await fixture('<civ-skip-link>Skip to navigation</civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.textContent).toBe('Skip to navigation');
  });

  it('link is focusable (no tabindex=-1)', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.getAttribute('tabindex')).not.toBe('-1');
  });

  it('applies focus-visible:civ-focus-ring class', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    const link = el.querySelector('a')!;
    expect(link.className).toContain('focus-visible:civ-focus-ring');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-skip-link></civ-skip-link>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('a')).not.toBeNull();
  });
});
