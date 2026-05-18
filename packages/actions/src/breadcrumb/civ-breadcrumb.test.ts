import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-breadcrumb.js';
import './civ-breadcrumb-item.js';
import type { CivBreadcrumb } from './civ-breadcrumb.js';

afterEach(cleanupFixtures);

const trail = `
  <civ-breadcrumb>
    <civ-breadcrumb-item href="/" label="Home"></civ-breadcrumb-item>
    <civ-breadcrumb-item href="/benefits" label="Benefits"></civ-breadcrumb-item>
    <civ-breadcrumb-item label="Healthcare" current></civ-breadcrumb-item>
  </civ-breadcrumb>
`;

describe('civ-breadcrumb', () => {
  it('renders a <nav> landmark with default aria-label', async () => {
    const el = await fixture<CivBreadcrumb>(trail);
    const nav = el.querySelector('nav')!;
    expect(nav).not.toBeNull();
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('renders an <ol> containing the items', async () => {
    const el = await fixture<CivBreadcrumb>(trail);
    const ol = el.querySelector('ol')!;
    expect(ol).not.toBeNull();
    expect(ol.querySelectorAll('civ-breadcrumb-item').length).toBe(3);
  });

  it('overrides the landmark name via the label prop', async () => {
    const el = await fixture<CivBreadcrumb>(
      `<civ-breadcrumb label="Section path">
        <civ-breadcrumb-item href="/" label="Home"></civ-breadcrumb-item>
      </civ-breadcrumb>`
    );
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Section path');
  });
});

describe('civ-breadcrumb-item', () => {
  it('renders an <a href> for navigable items', async () => {
    const el = await fixture<CivBreadcrumb>(trail);
    const first = el.querySelectorAll('civ-breadcrumb-item')[0];
    const a = first.querySelector('a')!;
    expect(a).not.toBeNull();
    expect(a.getAttribute('href')).toBe('/');
    expect(a.textContent).toBe('Home');
  });

  it('renders a non-link <span> with aria-current="page" for the current item', async () => {
    const el = await fixture<CivBreadcrumb>(trail);
    const last = el.querySelectorAll('civ-breadcrumb-item')[2];
    expect(last.querySelector('a')).toBeNull();
    const span = last.querySelector('span')!;
    expect(span.getAttribute('aria-current')).toBe('page');
    expect(span.textContent).toBe('Healthcare');
  });

  it('renders a non-link <span> when href is omitted (even without current)', async () => {
    const el = await fixture<CivBreadcrumb>(
      `<civ-breadcrumb>
        <civ-breadcrumb-item label="Standalone"></civ-breadcrumb-item>
      </civ-breadcrumb>`
    );
    const item = el.querySelector('civ-breadcrumb-item')!;
    expect(item.querySelector('a')).toBeNull();
    expect(item.querySelector('span')!.textContent).toBe('Standalone');
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivBreadcrumb>(trail);
    for (const item of el.querySelectorAll('civ-breadcrumb-item')) {
      expect(item.getAttribute('role')).toBe('listitem');
    }
  });

  it('uses initial child text as a label fallback', async () => {
    const el = await fixture<CivBreadcrumb>(
      `<civ-breadcrumb>
        <civ-breadcrumb-item href="/x">Inline text</civ-breadcrumb-item>
      </civ-breadcrumb>`
    );
    expect(el.querySelector('a')!.textContent).toBe('Inline text');
  });

  it('fires civ-analytics on link click', async () => {
    const el = await fixture<CivBreadcrumb>(trail);
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);
    const a = el.querySelector('a') as HTMLAnchorElement;
    a.click();
    expect(handler).toHaveBeenCalledOnce();
  });
});
