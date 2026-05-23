import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-on-this-page.js';
import './civ-on-this-page-item.js';
import type { CivOnThisPage } from './civ-on-this-page.js';
import type { CivOnThisPageItem } from './civ-on-this-page-item.js';

afterEach(cleanupFixtures);

describe('civ-on-this-page', () => {
  it('renders a <nav> landmark with the label as both heading and aria-label', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page label="On this page">
        <civ-on-this-page-item href="#intro" label="Intro"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('On this page');
    expect(el.querySelector('.civ-on-this-page__heading')!.textContent).toBe('On this page');
  });

  it('renders slotted items inside the <ul>', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page label="Sections">
        <civ-on-this-page-item href="#a" label="A"></civ-on-this-page-item>
        <civ-on-this-page-item href="#b" label="B"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    const ul = el.querySelector('ul.civ-on-this-page__list')!;
    expect(ul.querySelectorAll('civ-on-this-page-item').length).toBe(2);
  });

  it('skips the heading element when label is empty', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page label="">
        <civ-on-this-page-item href="#a" label="A"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    expect(el.querySelector('.civ-on-this-page__heading')).toBeNull();
  });
});

describe('civ-on-this-page auto-detect', () => {
  let scopeEl: HTMLElement;

  beforeEach(() => {
    scopeEl = document.createElement('main');
    scopeEl.innerHTML = `
      <h2 id="install">Install</h2>
      <p>…</p>
      <h2 id="usage">Usage</h2>
      <p>…</p>
      <h3 id="usage-basic">Basic</h3>
    `;
    document.body.appendChild(scopeEl);
  });

  afterEach(() => {
    scopeEl.remove();
  });

  it('auto-detects headings within the scope element', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page label="On this page"></civ-on-this-page>`
    );
    const items = el.querySelectorAll<CivOnThisPageItem>('civ-on-this-page-item');
    expect(items.length).toBe(3);
    expect(items[0].href).toBe('#install');
    expect(items[1].href).toBe('#usage');
    expect(items[2].href).toBe('#usage-basic');
  });

  it('respects a custom selector', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page selector="h2[id]"></civ-on-this-page>`
    );
    const items = el.querySelectorAll('civ-on-this-page-item');
    expect(items.length).toBe(2);
  });

  it('does not auto-detect when explicit children are slotted', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page>
        <civ-on-this-page-item href="#manual" label="Manual only"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    const items = el.querySelectorAll('civ-on-this-page-item');
    expect(items.length).toBe(1);
    expect(items[0].getAttribute('href')).toBe('#manual');
  });
});

describe('civ-on-this-page-item', () => {
  it('renders an <a href> with the label as text', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page>
        <civ-on-this-page-item href="#intro" label="Introduction"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    const item = el.querySelector('civ-on-this-page-item')!;
    const a = item.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('#intro');
    expect(a.textContent).toBe('Introduction');
  });

  it('sets role="listitem" on the host', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page>
        <civ-on-this-page-item href="#a" label="A"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    expect(el.querySelector('civ-on-this-page-item')!.getAttribute('role')).toBe('listitem');
  });

  it('reflects active to aria-current="location" on the rendered link', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page>
        <civ-on-this-page-item href="#a" label="A"></civ-on-this-page-item>
      </civ-on-this-page>`
    );
    const item = el.querySelector('civ-on-this-page-item') as CivOnThisPageItem;
    const a = item.querySelector('a')!;
    expect(a.hasAttribute('aria-current')).toBe(false);
    item.active = true;
    await elementUpdated(item);
    expect(a.getAttribute('aria-current')).toBe('location');
    expect(a.className).toContain('civ-on-this-page__link--active');
  });

  it('falls back to initial child text when label is not set', async () => {
    const el = await fixture<CivOnThisPage>(
      `<civ-on-this-page>
        <civ-on-this-page-item href="#a">Initial Text</civ-on-this-page-item>
      </civ-on-this-page>`
    );
    expect(el.querySelector('a')!.textContent).toBe('Initial Text');
  });
});
