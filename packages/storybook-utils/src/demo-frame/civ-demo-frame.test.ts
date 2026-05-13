import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './index.js';
import { matchPath } from './civ-demo-frame.js';
import type { CivDemoFrame } from './civ-demo-frame.js';
import type { CivDemoPage } from './civ-demo-page.js';

afterEach(cleanupFixtures);

describe('matchPath', () => {
  it('returns empty params on exact static match', () => {
    expect(matchPath('/dependents', '/dependents')).toEqual({});
  });

  it('returns null when path lengths differ', () => {
    expect(matchPath('/dependents', '/dependents/new')).toBeNull();
  });

  it('returns null when a static segment does not match', () => {
    expect(matchPath('/dependents/new', '/dependents/edit')).toBeNull();
  });

  it('captures a single :param segment', () => {
    expect(matchPath('/dependents/:id', '/dependents/42')).toEqual({ id: '42' });
  });

  it('captures multiple :param segments', () => {
    expect(
      matchPath('/users/:userId/dependents/:depId/edit', '/users/7/dependents/42/edit'),
    ).toEqual({ userId: '7', depId: '42' });
  });

  it('decodes URI-encoded param values', () => {
    expect(matchPath('/q/:term', '/q/hello%20world')).toEqual({ term: 'hello world' });
  });

  it('ignores query string on the actual path', () => {
    expect(matchPath('/dependents/:id', '/dependents/42?foo=bar')).toEqual({ id: '42' });
  });

  it('treats trailing slashes equivalently', () => {
    expect(matchPath('/dependents', '/dependents/')).toEqual({});
  });
});

describe('civ-demo-frame', () => {
  it('renders the page whose path matches initial-path', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><span data-testid="list">LIST</span></civ-demo-page>
        <civ-demo-page path="/new"><span data-testid="new">NEW</span></civ-demo-page>
      </civ-demo-frame>
    `);

    const listPage = frame.querySelector<CivDemoPage>('civ-demo-page[path="/list"]')!;
    const newPage = frame.querySelector<CivDemoPage>('civ-demo-page[path="/new"]')!;
    expect(listPage.hidden).toBe(false);
    expect(newPage.hidden).toBe(true);
  });

  it('slotted demo-page lives INSIDE the chrome body container', async () => {
    // Regression for the review-blocker: <slot> doesn't project in Light DOM.
    // After fix, the LightDomSlotMixin relocates slotted pages into
    // [data-civ-demo-body] so the chrome (URL bar + body padding) wraps them.
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list">
          <div data-marker="content">LIST</div>
        </civ-demo-page>
      </civ-demo-frame>
    `);
    const body = frame.querySelector('[data-civ-demo-body]');
    expect(body).not.toBeNull();
    expect(body!.querySelector('civ-demo-page')).not.toBeNull();
    // And the authored child content lives inside the page's own content wrapper
    expect(frame.querySelector('[data-civ-demo-page-content] [data-marker="content"]')).not.toBeNull();
  });

  it('exposes the current path via currentPath getter', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list">LIST</civ-demo-page>
      </civ-demo-frame>
    `);
    expect(frame.currentPath).toBe('/list');
  });

  it('navigates to a new page when a matching anchor is clicked', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="/new">go</a></civ-demo-page>
        <civ-demo-page path="/new">NEW</civ-demo-page>
      </civ-demo-frame>
    `);

    const link = frame.querySelector('a[href="/new"]') as HTMLAnchorElement;
    link.click();
    await elementUpdated(frame);

    expect(frame.currentPath).toBe('/new');
    const newPage = frame.querySelector<CivDemoPage>('civ-demo-page[path="/new"]')!;
    expect(newPage.hidden).toBe(false);
  });

  it('fires civ-demo-navigate with path and params on navigation', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="/dependents/42/edit">edit</a></civ-demo-page>
        <civ-demo-page path="/dependents/:id/edit">EDIT</civ-demo-page>
      </civ-demo-frame>
    `);

    let detail: any = null;
    frame.addEventListener('civ-demo-navigate', ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    (frame.querySelector('a') as HTMLAnchorElement).click();
    await elementUpdated(frame);

    expect(detail).not.toBeNull();
    expect(detail.path).toBe('/dependents/42/edit');
    expect(detail.params).toEqual({ id: '42' });
  });

  it('surfaces path params on the active page', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/dependents/42/edit">
        <civ-demo-page path="/dependents/:id/edit">EDIT</civ-demo-page>
      </civ-demo-frame>
    `);

    const page = frame.querySelector<CivDemoPage>('civ-demo-page')!;
    expect(page.params).toEqual({ id: '42' });
    expect(page.getAttribute('data-path-params')).toBe('{"id":"42"}');
  });

  it('back button pops the history stack', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="/new">go</a></civ-demo-page>
        <civ-demo-page path="/new">NEW</civ-demo-page>
      </civ-demo-frame>
    `);

    (frame.querySelector('a[href="/new"]') as HTMLAnchorElement).click();
    await elementUpdated(frame);
    expect(frame.currentPath).toBe('/new');

    const backResult = frame.back();
    await elementUpdated(frame);
    expect(backResult).toBe(true);
    expect(frame.currentPath).toBe('/list');
  });

  it('back is a no-op when stack is at the initial entry', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list">LIST</civ-demo-page>
      </civ-demo-frame>
    `);
    expect(frame.back()).toBe(false);
    expect(frame.currentPath).toBe('/list');
  });

  it('does not push duplicate consecutive entries onto the stack', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="/list">self</a></civ-demo-page>
      </civ-demo-frame>
    `);

    (frame.querySelector('a') as HTMLAnchorElement).click();
    await elementUpdated(frame);
    // Still on /list, and the back stack didn't grow
    expect(frame.currentPath).toBe('/list');
    expect(frame.back()).toBe(false);
  });

  it('passes modifier-key clicks through to the browser', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="/new">go</a></civ-demo-page>
        <civ-demo-page path="/new">NEW</civ-demo-page>
      </civ-demo-frame>
    `);

    const link = frame.querySelector('a') as HTMLAnchorElement;
    // Simulate cmd+click — should NOT navigate internally
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
    link.dispatchEvent(event);
    await elementUpdated(frame);

    expect(frame.currentPath).toBe('/list');
    expect(event.defaultPrevented).toBe(false);
  });

  it('passes external (non-rooted) hrefs through', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="https://example.com">external</a></civ-demo-page>
      </civ-demo-frame>
    `);

    const link = frame.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    await elementUpdated(frame);

    expect(event.defaultPrevented).toBe(false);
  });

  it('honors target="_blank" by not intercepting', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list"><a href="/new" target="_blank">go</a></civ-demo-page>
        <civ-demo-page path="/new">NEW</civ-demo-page>
      </civ-demo-frame>
    `);

    const link = frame.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    await elementUpdated(frame);

    expect(event.defaultPrevented).toBe(false);
    expect(frame.currentPath).toBe('/list');
  });

  it('renders without chrome when hide-chrome is set', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list" hide-chrome>
        <civ-demo-page path="/list">LIST</civ-demo-page>
      </civ-demo-frame>
    `);
    expect(frame.querySelector('.civ-demo-frame__chrome')).toBeNull();
  });

  it('renders chrome with a disabled back button on initial entry', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/list">
        <civ-demo-page path="/list">LIST</civ-demo-page>
      </civ-demo-frame>
    `);
    const back = frame.querySelector<HTMLButtonElement>('.civ-demo-frame__back')!;
    expect(back.disabled).toBe(true);
  });

  it('hides all pages when no path matches', async () => {
    const frame = await fixture<CivDemoFrame>(`
      <civ-demo-frame initial-path="/nope">
        <civ-demo-page path="/list">LIST</civ-demo-page>
      </civ-demo-frame>
    `);
    const page = frame.querySelector<CivDemoPage>('civ-demo-page')!;
    expect(page.hidden).toBe(true);
  });
});
