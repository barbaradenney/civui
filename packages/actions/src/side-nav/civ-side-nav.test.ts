import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-side-nav.js';
import './civ-side-nav-item.js';
import type { CivSideNav } from './civ-side-nav.js';
import type { CivSideNavItem } from './civ-side-nav-item.js';

afterEach(cleanupFixtures);

const sideNavHtml = `
  <civ-side-nav label="Documentation">
    <civ-side-nav-item href="/intro" label="Introduction"></civ-side-nav-item>
    <civ-side-nav-item href="/components" label="Components" current>
      <civ-side-nav-item href="/components/button" label="Button"></civ-side-nav-item>
      <civ-side-nav-item href="/components/input" label="Input"></civ-side-nav-item>
    </civ-side-nav-item>
    <civ-side-nav-item href="/locked" label="Locked" disabled></civ-side-nav-item>
  </civ-side-nav>
`;

describe('civ-side-nav', () => {
  it('renders a <nav> landmark with aria-label', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Documentation');
  });

  it('omits aria-label when the label prop is empty', async () => {
    const el = await fixture<CivSideNav>(
      `<civ-side-nav><civ-side-nav-item href="/x" label="X"></civ-side-nav-item></civ-side-nav>`
    );
    expect(el.querySelector('nav')!.hasAttribute('aria-label')).toBe(false);
  });

  it('renders top-level items inside the outer <ul>', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const list = el.querySelector('ul.civ-side-nav__list')!;
    // Three top-level civ-side-nav-item direct children.
    const topItems = Array.from(list.children).filter(
      (c) => c.tagName.toLowerCase() === 'civ-side-nav-item'
    );
    expect(topItems.length).toBe(3);
  });

  it('relocates nested items into the parent item\'s sublist', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const parent = el.querySelectorAll('civ-side-nav-item')[1]!;
    const sublist = parent.querySelector('ul.civ-side-nav__sublist')!;
    expect(sublist.children.length).toBe(2);
    expect(sublist.children[0].getAttribute('label')).toBe('Button');
  });
});

describe('civ-side-nav-item', () => {
  it('renders an <a href> by default', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const first = el.querySelector('civ-side-nav-item')!;
    const a = first.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/intro');
    expect(a.textContent).toBe('Introduction');
  });

  it('applies aria-current="page" and current class to the active item', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const current = el.querySelectorAll('civ-side-nav-item')[1] as CivSideNavItem;
    const a = current.querySelector('a')!;
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(a.className).toContain('civ-side-nav__link--current');
  });

  it('renders a non-link <span aria-disabled> when disabled', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const locked = Array.from(el.querySelectorAll('civ-side-nav-item')).find(
      (item) => item.hasAttribute('disabled')
    )!;
    expect(locked.querySelector('a')).toBeNull();
    const span = locked.querySelector('span')!;
    expect(span.getAttribute('aria-disabled')).toBe('true');
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    for (const item of el.querySelectorAll('civ-side-nav-item')) {
      expect(item.getAttribute('role')).toBe('listitem');
    }
  });

  it('toggles aria-current when current flips at runtime', async () => {
    const el = await fixture<CivSideNav>(
      `<civ-side-nav>
        <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
      </civ-side-nav>`
    );
    const item = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    expect(item.querySelector('a')!.hasAttribute('aria-current')).toBe(false);
    item.current = true;
    await elementUpdated(item);
    expect(item.querySelector('a')!.getAttribute('aria-current')).toBe('page');
  });

  it('fires civ-analytics on link click', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);
    el.querySelector('civ-side-nav-item')!.querySelector('a')!.click();
    expect(handler).toHaveBeenCalledOnce();
  });
});
