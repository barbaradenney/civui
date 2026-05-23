import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-callout.js';

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

  it('reflects default variant to the host attribute', async () => {
    const el = await fixture('<civ-callout><p>x</p></civ-callout>');
    await elementUpdated(el);
    expect(el.getAttribute('variant')).toBe('default');
  });

  it('reflects each semantic variant to the host attribute', async () => {
    for (const variant of ['info', 'warning', 'error', 'success'] as const) {
      const el = await fixture(
        `<civ-callout variant="${variant}"><p>x</p></civ-callout>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute('variant')).toBe(variant);
    }
  });

  it('does not replace children when variant changes', async () => {
    const el = await fixture<HTMLElement & { variant: string }>(
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
});
