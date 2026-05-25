import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-page-header.js';

afterEach(cleanupFixtures);

describe('civ-page-header', () => {
  it('renders heading slot', async () => {
    const el = await fixture(`
      <civ-page-header>
        <h1 data-heading>Page title</h1>
      </civ-page-header>
    `);
    const heading = el.querySelector('[data-civ-page-header-heading] h1');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Page title');
  });

  it('renders eyebrow slot above heading', async () => {
    const el = await fixture(`
      <civ-page-header>
        <span data-eyebrow>Benefits</span>
        <h1 data-heading>Apply now</h1>
      </civ-page-header>
    `);
    const eyebrow = el.querySelector('[data-civ-page-header-eyebrow]');
    expect(eyebrow).not.toBeNull();
    expect(eyebrow!.textContent).toContain('Benefits');
    // Eyebrow comes before heading in DOM
    const header = el.querySelector('.civ-page-header')!;
    const children = Array.from(header.children);
    const eyebrowIdx = children.findIndex(c => c.hasAttribute('data-civ-page-header-eyebrow'));
    const headingIdx = children.findIndex(c => c.hasAttribute('data-civ-page-header-heading'));
    expect(eyebrowIdx).toBeLessThan(headingIdx);
  });

  it('renders subheading slot below heading', async () => {
    const el = await fixture(`
      <civ-page-header>
        <h1 data-heading>Disability compensation</h1>
        <span data-subheading>VA Form 21-526EZ</span>
      </civ-page-header>
    `);
    const sub = el.querySelector('[data-civ-page-header-subheading]');
    expect(sub).not.toBeNull();
    expect(sub!.textContent).toContain('VA Form 21-526EZ');
  });

  it('renders tag slot above eyebrow', async () => {
    const el = await fixture(`
      <civ-page-header>
        <civ-tag data-tag label="Healthcare" color="blue"></civ-tag>
        <span data-eyebrow>Benefits</span>
        <h1 data-heading>Title</h1>
      </civ-page-header>
    `);
    const tag = el.querySelector('[data-civ-page-header-tag]');
    const eyebrow = el.querySelector('[data-civ-page-header-eyebrow]');
    expect(tag).not.toBeNull();
    expect(eyebrow).not.toBeNull();
    // Tag comes before eyebrow
    const header = el.querySelector('.civ-page-header')!;
    const children = Array.from(header.children);
    const tagIdx = children.indexOf(tag!);
    const eyebrowIdx = children.indexOf(eyebrow!);
    expect(tagIdx).toBeLessThan(eyebrowIdx);
  });

  it('omits eyebrow container when not provided', async () => {
    const el = await fixture(`
      <civ-page-header>
        <h1 data-heading>Title</h1>
      </civ-page-header>
    `);
    expect(el.querySelector('[data-civ-page-header-eyebrow]')).toBeNull();
  });

  it('omits subheading container when not provided', async () => {
    const el = await fixture(`
      <civ-page-header>
        <h1 data-heading>Title</h1>
      </civ-page-header>
    `);
    expect(el.querySelector('[data-civ-page-header-subheading]')).toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-page-header><h1 data-heading>T</h1></civ-page-header>');
    expect(el.shadowRoot).toBeNull();
  });

  it('applies sm rhythm class', async () => {
    const el = await fixture(`
      <civ-page-header rhythm="sm">
        <h1 data-heading>Title</h1>
      </civ-page-header>
    `);
    const header = el.querySelector('.civ-page-header');
    expect(header!.className).toContain('civ-page-header--sm');
  });

  // Deprecated alias — same effect as `rhythm`, plus a one-time
  // dev-mode warning. Migration runway for consumers on old API.
  describe('deprecated `spacing` alias', () => {
    it('still produces the sm modifier class', async () => {
      const el = await fixture(`
        <civ-page-header spacing="sm">
          <h1 data-heading>Title</h1>
        </civ-page-header>
      `);
      const header = el.querySelector('.civ-page-header');
      expect(header!.className).toContain('civ-page-header--sm');
    });

    it('emits a one-time devWarn when set to non-default', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { resetDevWarnDedupe } = await import('@civui/core');
      resetDevWarnDedupe();
      await fixture(`
        <civ-page-header spacing="sm">
          <h1 data-heading>Title</h1>
        </civ-page-header>
      `);
      const message = warn.mock.calls.map((c) => String(c[0])).join('\n');
      expect(message).toContain('civ-page-header');
      expect(message).toContain('spacing');
      expect(message).toContain('rhythm');
      warn.mockRestore();
    });

    it('does not warn when set to default value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { resetDevWarnDedupe } = await import('@civui/core');
      resetDevWarnDedupe();
      await fixture(`
        <civ-page-header spacing="default">
          <h1 data-heading>Title</h1>
        </civ-page-header>
      `);
      const calls = warn.mock.calls.filter((c) =>
        String(c[0]).includes('civ-page-header') && String(c[0]).includes('spacing')
      );
      expect(calls.length).toBe(0);
      warn.mockRestore();
    });

    it('rhythm wins when both are set to sm (idempotent merge)', async () => {
      const el = await fixture(`
        <civ-page-header rhythm="sm" spacing="sm">
          <h1 data-heading>Title</h1>
        </civ-page-header>
      `);
      const header = el.querySelector('.civ-page-header');
      expect(header!.className).toContain('civ-page-header--sm');
    });
  });

  it('renders all slots in correct order (tag → eyebrow → heading → subheading)', async () => {
    const el = await fixture(`
      <civ-page-header>
        <civ-tag data-tag label="Healthcare" color="blue"></civ-tag>
        <span data-eyebrow>Category</span>
        <h1 data-heading>Title</h1>
        <span data-subheading>Subtitle</span>
      </civ-page-header>
    `);
    const header = el.querySelector('.civ-page-header')!;
    const children = Array.from(header.children);
    const tagIdx = children.findIndex(c => c.hasAttribute('data-civ-page-header-tag'));
    const eyebrowIdx = children.findIndex(c => c.hasAttribute('data-civ-page-header-eyebrow'));
    const headingIdx = children.findIndex(c => c.hasAttribute('data-civ-page-header-heading'));
    const subIdx = children.findIndex(c => c.hasAttribute('data-civ-page-header-subheading'));
    expect(tagIdx).toBeLessThan(eyebrowIdx);
    expect(eyebrowIdx).toBeLessThan(headingIdx);
    expect(headingIdx).toBeLessThan(subIdx);
  });
});
