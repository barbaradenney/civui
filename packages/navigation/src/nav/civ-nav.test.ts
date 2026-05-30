import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-nav.js';
import './civ-nav-item.js';
import type { CivNav } from './civ-nav.js';

afterEach(cleanupFixtures);

const navHtml = `
  <civ-nav label="Primary navigation">
    <civ-nav-item href="/" label="Home" current></civ-nav-item>
    <civ-nav-item href="/benefits" label="Benefits"></civ-nav-item>
    <civ-nav-item href="/contact" label="Contact"></civ-nav-item>
  </civ-nav>
`;

describe('civ-nav', () => {
  it('renders a <nav> landmark with aria-label', async () => {
    const el = await fixture<CivNav>(navHtml);
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Primary navigation');
  });

  it('omits aria-label when the label prop is empty', async () => {
    const el = await fixture<CivNav>(
      `<civ-nav><civ-nav-item href="/" label="Home"></civ-nav-item></civ-nav>`
    );
    expect(el.querySelector('nav')!.hasAttribute('aria-label')).toBe(false);
  });

  it('renders a <ul> containing the items', async () => {
    const el = await fixture<CivNav>(navHtml);
    const ul = el.querySelector('ul')!;
    expect(ul.querySelectorAll('civ-nav-item').length).toBe(3);
  });

  it('defaults to primary emphasis (no secondary modifier class)', async () => {
    const el = await fixture<CivNav>(navHtml);
    expect(el.emphasis).toBe('primary');
    expect(el.querySelector('nav')!.classList.contains('civ-nav--secondary')).toBe(false);
  });

  it('applies the secondary modifier class when emphasis="secondary"', async () => {
    const el = await fixture<CivNav>(
      `<civ-nav emphasis="secondary">
        <civ-nav-item href="/" label="Home" current></civ-nav-item>
      </civ-nav>`
    );
    expect(el.emphasis).toBe('secondary');
    expect(el.querySelector('nav')!.classList.contains('civ-nav--secondary')).toBe(true);
  });
});

describe('civ-nav-item', () => {
  it('renders an <a href> by default', async () => {
    const el = await fixture<CivNav>(navHtml);
    const items = el.querySelectorAll('civ-nav-item');
    const a = items[1].querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/benefits');
    expect(a.textContent).toBe('Benefits');
  });

  it('applies aria-current="page" and current class to the active item', async () => {
    const el = await fixture<CivNav>(navHtml);
    const first = el.querySelector('civ-nav-item')!;
    const a = first.querySelector('a')!;
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(a.className).toContain('civ-nav__link--current');
  });

  it('renders a non-link <span> with aria-disabled when disabled', async () => {
    const el = await fixture<CivNav>(
      `<civ-nav>
        <civ-nav-item href="/x" label="Locked" disabled></civ-nav-item>
      </civ-nav>`
    );
    const item = el.querySelector('civ-nav-item')!;
    expect(item.querySelector('a')).toBeNull();
    const span = item.querySelector('span')!;
    expect(span.getAttribute('aria-disabled')).toBe('true');
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivNav>(navHtml);
    for (const item of el.querySelectorAll('civ-nav-item')) {
      expect(item.getAttribute('role')).toBe('listitem');
    }
  });

  it('uses initial child text as a label fallback', async () => {
    const el = await fixture<CivNav>(
      `<civ-nav><civ-nav-item href="/x">Inline</civ-nav-item></civ-nav>`
    );
    expect(el.querySelector('a')!.textContent).toBe('Inline');
  });

  it('fires civ-analytics on link click', async () => {
    const el = await fixture<CivNav>(navHtml);
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);
    (el.querySelectorAll('a')[1] as HTMLAnchorElement).click();
    expect(handler).toHaveBeenCalledOnce();
  });
});
