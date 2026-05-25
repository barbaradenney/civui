import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-callout.js';
// Sibling imports register `civ-notice` and `civ-badge` for the
// composition tests below.
import '../notice/civ-notice.js';
import '../badge/civ-badge.js';
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
    expect(el.intent).toBe('default');
    // useDefault: true suppresses initial-value reflection so the base
    // `civ-callout { ... }` CSS rule applies without an attribute selector.
    expect(el.getAttribute('intent')).toBeNull();
  });

  it('reflects each semantic variant to the host attribute', async () => {
    for (const variant of ['info', 'warning', 'error', 'success'] as const) {
      const el = await fixture<CivCallout>(
        `<civ-callout intent="${variant}"><p>x</p></civ-callout>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute('intent')).toBe(variant);
      expect(el.intent).toBe(variant);
    }
  });

  it('restores the default when the variant attribute is removed', async () => {
    const el = await fixture<CivCallout>(
      '<civ-callout intent="warning"><p>x</p></civ-callout>',
    );
    await elementUpdated(el);
    expect(el.intent).toBe('warning');

    el.removeAttribute('intent');
    await elementUpdated(el);
    // With useDefault: true, removeAttribute restores the documented default
    // rather than leaving the property as null.
    expect(el.intent).toBe('default');
  });

  it('does not replace children when variant changes', async () => {
    const el = await fixture<CivCallout>(
      '<civ-callout><p id="body">stable</p></civ-callout>',
    );
    await elementUpdated(el);
    const original = el.querySelector('#body');
    el.intent = 'warning';
    await elementUpdated(el);
    const after = el.querySelector('#body');
    expect(after).toBe(original);
    expect(after!.textContent).toBe('stable');
  });

  it('renders rich slotted content (list inside)', async () => {
    const el = await fixture(`
      <civ-callout intent="info">
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
    el.intent = 'critical' as CivCallout['intent'];
    await elementUpdated(el);
    expect(warn).toHaveBeenCalled();
    const message = warn.mock.calls[0]?.[0] as string;
    expect(message).toContain('civ-callout');
    expect(message).toContain('intent');
    expect(message).toContain('critical');
    warn.mockRestore();
  });

  // Secondary weight (thinner rail). The default `primary` value is
  // suppressed from the host attribute (useDefault: true) so the
  // base `civ-callout { ... }` 5px rule keeps rendering today's
  // markup unchanged.
  describe('emphasis', () => {
    it('keeps the default primary value off the host attribute (useDefault behavior)', async () => {
      const el = await fixture<CivCallout>('<civ-callout><p>x</p></civ-callout>');
      await elementUpdated(el);
      expect(el.emphasis).toBe('primary');
      expect(el.getAttribute('emphasis')).toBeNull();
    });

    it('reflects the secondary value to the host attribute', async () => {
      const el = await fixture<CivCallout>(
        '<civ-callout emphasis="secondary"><p>x</p></civ-callout>',
      );
      await elementUpdated(el);
      expect(el.emphasis).toBe('secondary');
      expect(el.getAttribute('emphasis')).toBe('secondary');
    });

    it('combines with variant — both attributes round-trip independently', async () => {
      const el = await fixture<CivCallout>(
        '<civ-callout intent="warning" emphasis="secondary"><p>x</p></civ-callout>',
      );
      await elementUpdated(el);
      expect(el.intent).toBe('warning');
      expect(el.emphasis).toBe('secondary');
      expect(el.getAttribute('intent')).toBe('warning');
      expect(el.getAttribute('emphasis')).toBe('secondary');
    });

    it('warns when an unknown calloutStyle is set', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const el = await fixture<CivCallout>('<civ-callout><p>x</p></civ-callout>');
      await elementUpdated(el);
      el.emphasis = 'tertiary' as CivCallout['emphasis'];
      await elementUpdated(el);
      expect(warn).toHaveBeenCalled();
      const message = warn.mock.calls[0]?.[0] as string;
      expect(message).toContain('civ-callout');
      expect(message).toContain('emphasis');
      expect(message).toContain('tertiary');
      warn.mockRestore();
    });
  });

  // Composition tests. Callout's detached-renderRoot pattern means
  // children live directly as light-DOM descendants of the host — no
  // capture, no relocation. Custom elements work the same as plain
  // <p> or <ul>.
  describe('composition', () => {
    it('hosts a civ-notice child', async () => {
      const el = await fixture(`
        <civ-callout intent="warning">
          <civ-notice intent="warning" body="Composed body"></civ-notice>
        </civ-callout>
      `);
      await elementUpdated(el);
      const notice = el.querySelector('civ-notice');
      expect(notice).not.toBeNull();
      expect(notice?.querySelector('.civ-notice__body')?.textContent).toBe('Composed body');
    });

    it('hosts a civ-badge child', async () => {
      const el = await fixture(`
        <civ-callout intent="info">
          <civ-badge label="In review" intent="info" with-icon></civ-badge>
        </civ-callout>
      `);
      await elementUpdated(el);
      const badge = el.querySelector('civ-badge');
      expect(badge).not.toBeNull();
      expect(badge?.querySelector('.civ-badge')?.textContent?.trim()).toBe('In review');
    });

    it('hosts multiple notice + badge children alongside prose', async () => {
      const el = await fixture(`
        <civ-callout intent="error">
          <civ-badge label="Action required" intent="error" emphasis="primary" with-icon></civ-badge>
          <p>Your identity verification expired on January 15, 2026.</p>
          <civ-notice intent="error" spacing="sm" body="You have 30 days to re-verify."></civ-notice>
        </civ-callout>
      `);
      await elementUpdated(el);
      // Scope to DIRECT children of the host — querySelectorAll('p')
      // would also match the <p> civ-notice renders internally for
      // its body.
      const directKids = Array.from(el.children).map(c => c.tagName.toLowerCase());
      expect(directKids).toEqual(['civ-badge', 'p', 'civ-notice']);
    });
  });
});
