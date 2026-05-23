import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-callout.js';
import type { CivCallout } from './civ-callout.js';

afterEach(cleanupFixtures);

describe('civ-callout', () => {
  it('renders authored children directly in Light DOM', async () => {
    const el = await fixture(
      '<civ-callout><p data-test="body">Hello</p></civ-callout>',
    );
    await elementUpdated(el);
    const body = el.querySelector('[data-test="body"]');
    expect(body).not.toBeNull();
    expect(body!.textContent).toBe('Hello');
    expect(el.shadowRoot).toBeNull();
  });

  it('keeps the default variant off the host attribute (useDefault behavior)', async () => {
    const el = await fixture<CivCallout>('<civ-callout><p>x</p></civ-callout>');
    await elementUpdated(el);
    expect(el.variant).toBe('default');
    // useDefault: true suppresses initial-value reflection so the base
    // `civ-callout { ... }` CSS rule applies without an attribute selector.
    expect(el.getAttribute('variant')).toBeNull();
  });

  it('reflects each semantic variant to the host attribute', async () => {
    for (const variant of ['info', 'warning', 'error', 'success'] as const) {
      const el = await fixture<CivCallout>(
        `<civ-callout variant="${variant}"><p>x</p></civ-callout>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute('variant')).toBe(variant);
      expect(el.variant).toBe(variant);
    }
  });

  it('restores the default when the variant attribute is removed', async () => {
    const el = await fixture<CivCallout>(
      '<civ-callout variant="warning"><p>x</p></civ-callout>',
    );
    await elementUpdated(el);
    expect(el.variant).toBe('warning');

    el.removeAttribute('variant');
    await elementUpdated(el);
    // With useDefault: true, removeAttribute restores the documented default
    // rather than leaving the property as null.
    expect(el.variant).toBe('default');
  });

  it('does not replace children when variant changes', async () => {
    const el = await fixture<CivCallout>(
      '<civ-callout><p id="body">stable</p></civ-callout>',
    );
    await elementUpdated(el);
    const original = el.querySelector('#body');
    el.variant = 'warning';
    await elementUpdated(el);
    const after = el.querySelector('#body');
    expect(after).toBe(original);
    expect(after!.textContent).toBe('stable');
  });

  it('renders rich slotted content (list inside)', async () => {
    const el = await fixture(`
      <civ-callout variant="info">
        <p>Have ready:</p>
        <ul>
          <li>ID</li>
          <li>Proof of address</li>
        </ul>
      </civ-callout>
    `);
    await elementUpdated(el);
    expect(el.querySelectorAll('li').length).toBe(2);
  });

  it('does not impose a role on the host', async () => {
    const el = await fixture('<civ-callout><p>x</p></civ-callout>');
    await elementUpdated(el);
    expect(el.getAttribute('role')).toBeNull();
  });

  it('preserves consumer-supplied ARIA attributes on the host', async () => {
    const el = await fixture(
      '<civ-callout role="region" aria-label="Important"><p>x</p></civ-callout>',
    );
    await elementUpdated(el);
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Important');
  });

  it('warns when an unknown variant is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await fixture<CivCallout>('<civ-callout><p>x</p></civ-callout>');
    await elementUpdated(el);
    el.variant = 'critical' as CivCallout['variant'];
    await elementUpdated(el);
    expect(warn).toHaveBeenCalled();
    const message = warn.mock.calls[0]?.[0] as string;
    expect(message).toContain('civ-callout');
    expect(message).toContain('variant');
    expect(message).toContain('critical');
    warn.mockRestore();
  });
});
