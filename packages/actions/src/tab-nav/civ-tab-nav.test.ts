import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-tab-nav.js';
import './civ-tab-nav-item.js';
import type { CivTabNav } from './civ-tab-nav.js';

afterEach(cleanupFixtures);

const tabNavHtml = `
  <civ-tab-nav label="Repository sections">
    <civ-tab-nav-item href="/repo" label="Code" current></civ-tab-nav-item>
    <civ-tab-nav-item href="/repo/issues" label="Issues"></civ-tab-nav-item>
    <civ-tab-nav-item href="/repo/pulls" label="Pull requests"></civ-tab-nav-item>
  </civ-tab-nav>
`;

describe('civ-tab-nav', () => {
  it('renders a <nav> landmark with aria-label', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Repository sections');
  });

  it('omits aria-label when the label prop is empty', async () => {
    const el = await fixture<CivTabNav>(
      `<civ-tab-nav><civ-tab-nav-item href="/" label="Home"></civ-tab-nav-item></civ-tab-nav>`,
    );
    expect(el.querySelector('nav')!.hasAttribute('aria-label')).toBe(false);
  });

  it('does not carry role="tablist" — these are real links, not tabs', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    expect(el.querySelector('[role="tablist"]')).toBeNull();
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector('[role="tabpanel"]')).toBeNull();
  });

  it('renders a <ul> containing the items', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    const ul = el.querySelector('ul')!;
    expect(ul.querySelectorAll('civ-tab-nav-item').length).toBe(3);
  });
});

describe('civ-tab-nav-item', () => {
  it('renders an <a href> by default', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    const items = el.querySelectorAll('civ-tab-nav-item');
    const a = items[1].querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/repo/issues');
    expect(a.textContent).toBe('Issues');
  });

  it('applies aria-current="page" and current class to the active item', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    const first = el.querySelector('civ-tab-nav-item')!;
    const a = first.querySelector('a')!;
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(a.className).toContain('civ-tab-nav__link--current');
  });

  it('does not set aria-current on non-current items', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    const second = el.querySelectorAll('civ-tab-nav-item')[1];
    const a = second.querySelector('a')!;
    expect(a.hasAttribute('aria-current')).toBe(false);
  });

  it('renders a non-link <span> with aria-disabled when disabled', async () => {
    const el = await fixture<CivTabNav>(
      `<civ-tab-nav>
        <civ-tab-nav-item href="/admin" label="Admin" disabled></civ-tab-nav-item>
      </civ-tab-nav>`,
    );
    const item = el.querySelector('civ-tab-nav-item')!;
    expect(item.querySelector('a')).toBeNull();
    const span = item.querySelector('span')!;
    expect(span.getAttribute('aria-disabled')).toBe('true');
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    for (const item of el.querySelectorAll('civ-tab-nav-item')) {
      expect(item.getAttribute('role')).toBe('listitem');
    }
  });

  it('uses initial child text as a label fallback', async () => {
    const el = await fixture<CivTabNav>(
      `<civ-tab-nav><civ-tab-nav-item href="/x">Inline</civ-tab-nav-item></civ-tab-nav>`,
    );
    expect(el.querySelector('a')!.textContent).toBe('Inline');
  });

  it('fires civ-analytics on link click', async () => {
    const el = await fixture<CivTabNav>(tabNavHtml);
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);
    (el.querySelectorAll('a')[1] as HTMLAnchorElement).click();
    expect(handler).toHaveBeenCalledOnce();
  });
});
