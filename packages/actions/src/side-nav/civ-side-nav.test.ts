import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-side-nav.js';
import './civ-side-nav-item.js';
import type { CivSideNav } from './civ-side-nav.js';
import type { CivSideNavItem } from './civ-side-nav-item.js';

afterEach(cleanupFixtures);

// Fixture: a parent ("Components") with two leaf children; one of
// the children is `current`, so the parent auto-expands on first
// paint. A separate leaf at top level is `disabled`.
const sideNavHtml = `
  <civ-side-nav label="Documentation">
    <civ-side-nav-item href="/intro" label="Introduction"></civ-side-nav-item>
    <civ-side-nav-item label="Components">
      <civ-side-nav-item href="/components/button" label="Button" current></civ-side-nav-item>
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

describe('civ-side-nav-item — leaf rows', () => {
  it('renders an <a href> by default', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const first = el.querySelector('civ-side-nav-item')!;
    const a = first.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/intro');
    expect(a.textContent).toBe('Introduction');
  });

  it('applies aria-current="page" and current class to the active leaf', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const button = el.querySelector('civ-side-nav-item[label="Button"]') as CivSideNavItem;
    const a = button.querySelector('a')!;
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(a.className).toContain('civ-side-nav__link--current');
  });

  it('renders a non-link <span aria-disabled> when disabled', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const locked = el.querySelector('civ-side-nav-item[disabled]')!;
    expect(locked.querySelector('a')).toBeNull();
    const span = locked.querySelector('span.civ-side-nav__link')!;
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

describe('civ-side-nav-item — disclosure (parent with children)', () => {
  it('renders a <button aria-expanded> instead of an <a>', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const parent = el.querySelector('civ-side-nav-item[label="Components"]') as CivSideNavItem;
    // :scope > to ignore nested leaves' anchors deeper in the tree.
    expect(parent.querySelector(':scope > a')).toBeNull();
    const trigger = parent.querySelector(':scope > button.civ-side-nav__trigger')!;
    expect(trigger).not.toBeNull();
    expect(trigger.hasAttribute('aria-expanded')).toBe(true);
  });

  it('renders a chevron caret before the label', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const parent = el.querySelector('civ-side-nav-item[label="Components"]') as CivSideNavItem;
    const trigger = parent.querySelector('button.civ-side-nav__trigger')!;
    const caret = trigger.querySelector('civ-icon.civ-side-nav__caret')!;
    expect(caret).not.toBeNull();
    expect(caret.getAttribute('name')).toBe('chevron-right');
    // Caret must come before the label in source order so the
    // CSS rotation reads as "pointing at the section header".
    const children = Array.from(trigger.children);
    const caretIdx = children.indexOf(caret);
    const labelIdx = children.findIndex((c) => c.classList.contains('civ-side-nav__trigger-label'));
    expect(caretIdx).toBeLessThan(labelIdx);
  });

  it('auto-expands on first paint when a descendant has current', async () => {
    const el = await fixture<CivSideNav>(sideNavHtml);
    const parent = el.querySelector('civ-side-nav-item[label="Components"]') as CivSideNavItem;
    expect(parent.open).toBe(true);
    expect(parent.querySelector('button.civ-side-nav__trigger')!.getAttribute('aria-expanded')).toBe('true');
    expect(parent.querySelector('ul.civ-side-nav__sublist')!.hasAttribute('hidden')).toBe(false);
  });

  it('starts collapsed when no descendant has current', async () => {
    const el = await fixture<CivSideNav>(`
      <civ-side-nav>
        <civ-side-nav-item label="Section">
          <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
          <civ-side-nav-item href="/b" label="B"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    `);
    const parent = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    expect(parent.open).toBe(false);
    expect(parent.querySelector('ul.civ-side-nav__sublist')!.hasAttribute('hidden')).toBe(true);
  });

  it('respects an explicit `open` attribute over the auto-expand default', async () => {
    const el = await fixture<CivSideNav>(`
      <civ-side-nav>
        <civ-side-nav-item label="Section" open>
          <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    `);
    const parent = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    expect(parent.open).toBe(true);
  });

  it('toggles open on trigger click', async () => {
    const el = await fixture<CivSideNav>(`
      <civ-side-nav>
        <civ-side-nav-item label="Section">
          <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    `);
    const parent = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    const trigger = parent.querySelector('button.civ-side-nav__trigger') as HTMLButtonElement;
    trigger.click();
    await elementUpdated(parent);
    expect(parent.open).toBe(true);
    trigger.click();
    await elementUpdated(parent);
    expect(parent.open).toBe(false);
  });

  it('fires civ-toggle on open-state change', async () => {
    const el = await fixture<CivSideNav>(`
      <civ-side-nav>
        <civ-side-nav-item label="Section">
          <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    `);
    const parent = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    const handler = vi.fn();
    parent.addEventListener('civ-toggle', handler as EventListener);
    parent.open = true;
    await elementUpdated(parent);
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ open: true });
  });

  it('rejects toggle attempts when disabled', async () => {
    const el = await fixture<CivSideNav>(`
      <civ-side-nav>
        <civ-side-nav-item label="Section" disabled>
          <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    `);
    const parent = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    const trigger = parent.querySelector('button.civ-side-nav__trigger') as HTMLButtonElement;
    trigger.click();
    await elementUpdated(parent);
    expect(parent.open).toBe(false);
  });

  it('ignores href on a parent with children', async () => {
    const el = await fixture<CivSideNav>(`
      <civ-side-nav>
        <civ-side-nav-item href="/section" label="Section">
          <civ-side-nav-item href="/a" label="A"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    `);
    const parent = el.querySelector('civ-side-nav-item') as CivSideNavItem;
    // :scope > so we don't match the leaf child's `<a href="/a">`.
    // Parent renders as button, not link.
    expect(parent.querySelector(':scope > a.civ-side-nav__link')).toBeNull();
    expect(parent.querySelector(':scope > button.civ-side-nav__trigger')).not.toBeNull();
  });
});
