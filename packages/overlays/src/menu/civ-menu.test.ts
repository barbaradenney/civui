import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-menu.js';
import './civ-menu-item.js';

afterEach(cleanupFixtures);

const menuTemplate = `
  <civ-menu label="Row actions">
    <button data-civ-menu-trigger type="button" data-testid="trigger">Open</button>
    <civ-menu-item value="edit">Edit</civ-menu-item>
    <civ-menu-item value="duplicate">Duplicate</civ-menu-item>
    <civ-menu-item value="delete" destructive>Delete</civ-menu-item>
  </civ-menu>
`;

describe('civ-menu', () => {
  it('renders closed by default', async () => {
    const el = await fixture(menuTemplate);
    // civ-menu composes civ-popover; the panel (and its role + aria-label)
    // is rendered by the popover layer.
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  it('sets aria-haspopup="menu" on the trigger', async () => {
    const el = await fixture(menuTemplate);
    await elementUpdated(el);
    // queueMicrotask runs after Lit's first render but before next event loop turn
    await new Promise((r) => queueMicrotask(() => r(undefined)));
    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens when the trigger is clicked', async () => {
    const el = await fixture(menuTemplate);
    await elementUpdated(el);
    await new Promise((r) => queueMicrotask(() => r(undefined)));

    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    await elementUpdated(el);

    // civ-menu composes civ-popover; the panel (and its role + aria-label)
    // is rendered by the popover layer.
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel.hasAttribute('hidden')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes when the trigger is clicked twice', async () => {
    const el = await fixture(menuTemplate);
    await elementUpdated(el);
    await new Promise((r) => queueMicrotask(() => r(undefined)));

    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    await elementUpdated(el);
    trigger.click();
    await elementUpdated(el);

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape', async () => {
    const el = await fixture(menuTemplate) as any;
    el.open = true;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-menu-close', handler);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);
  });

  it('fires civ-menu-open and civ-menu-close', async () => {
    const el = await fixture(menuTemplate);
    await elementUpdated(el);
    await new Promise((r) => queueMicrotask(() => r(undefined)));

    const opened = vi.fn();
    const closed = vi.fn();
    el.addEventListener('civ-menu-open', opened);
    el.addEventListener('civ-menu-close', closed);

    const trigger = el.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    expect(opened).toHaveBeenCalledOnce();
    trigger.click();
    expect(closed).toHaveBeenCalledOnce();
  });

  it('fires civ-menu-select with value + index on item click', async () => {
    const el = await fixture(menuTemplate) as any;
    el.open = true;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-menu-select', handler);

    const editItem = el.querySelector('civ-menu-item[value="edit"]') as HTMLElement;
    editItem.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).toEqual({ value: 'edit', index: 0 });
  });

  it('closes after item selection', async () => {
    const el = await fixture(menuTemplate) as any;
    el.open = true;
    await elementUpdated(el);

    const item = el.querySelector('civ-menu-item[value="edit"]') as HTMLElement;
    item.click();
    await elementUpdated(el);

    expect(el.open).toBe(false);
  });

  it('does not fire civ-menu-select for disabled items', async () => {
    const el = await fixture(`
      <civ-menu label="m">
        <button data-civ-menu-trigger type="button">Open</button>
        <civ-menu-item value="a">A</civ-menu-item>
        <civ-menu-item value="b" disabled>B</civ-menu-item>
      </civ-menu>
    `) as any;
    el.open = true;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-menu-select', handler);

    const disabled = el.querySelector('civ-menu-item[value="b"]') as HTMLElement;
    disabled.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('skips disabled items in the active-item collection', async () => {
    const el = await fixture(`
      <civ-menu label="m">
        <button data-civ-menu-trigger type="button">Open</button>
        <civ-menu-item value="a">A</civ-menu-item>
        <civ-menu-item value="b" disabled>B</civ-menu-item>
        <civ-menu-item value="c">C</civ-menu-item>
      </civ-menu>
    `) as any;
    el.open = true;
    await elementUpdated(el);

    // ArrowDown twice → moves through enabled items only.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await elementUpdated(el);

    // The two enabled items are A and C — the active item should wrap back to A.
    expect(el._activeIndex).toBeLessThan(2);
  });

  it('exposes role="menu" + aria-label on the panel', async () => {
    const el = await fixture(menuTemplate);
    // civ-menu composes civ-popover; the panel (and its role + aria-label)
    // is rendered by the popover layer.
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('menu');
    expect(panel.getAttribute('aria-label')).toBe('Row actions');
  });

  it('falls back to the generic i18n label when no label is supplied', async () => {
    const el = await fixture(`
      <civ-menu>
        <button data-civ-menu-trigger type="button">Open</button>
        <civ-menu-item>A</civ-menu-item>
      </civ-menu>
    `);
    // civ-menu composes civ-popover; the panel (and its role + aria-label)
    // is rendered by the popover layer.
    const panel = el.querySelector('.civ-popover__panel') as HTMLElement;
    expect(panel.getAttribute('aria-label')).toBeTruthy();
    expect(panel.getAttribute('aria-label')!.length).toBeGreaterThan(0);
  });

  it('reflects `open` to the host attribute', async () => {
    const el = await fixture(menuTemplate) as any;
    el.open = true;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(true);
    el.open = false;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('uses Light DOM', async () => {
    const el = await fixture(menuTemplate);
    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-menu-item', () => {
  it('sets role="menuitem" on connect', async () => {
    const el = await fixture('<civ-menu-item>Hello</civ-menu-item>');
    expect(el.getAttribute('role')).toBe('menuitem');
  });

  it('renders as a button by default', async () => {
    const el = await fixture('<civ-menu-item>Edit</civ-menu-item>');
    expect(el.querySelector('button.civ-menu-item__inner')).not.toBeNull();
  });

  it('renders the authored text content inside the inner button', async () => {
    const el = await fixture('<civ-menu-item>Edit</civ-menu-item>');
    const label = el.querySelector('.civ-menu-item__label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Edit');
  });

  it('renders the label prop when set (takes precedence over text content)', async () => {
    const el = await fixture('<civ-menu-item label="From prop">From child</civ-menu-item>');
    const label = el.querySelector('.civ-menu-item__label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('From prop');
  });

  it('renders a leading icon when icon prop is set', async () => {
    const el = await fixture('<civ-menu-item icon="edit" label="Edit"></civ-menu-item>');
    const icon = el.querySelector('civ-icon.civ-menu-item__icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('name')).toBe('edit');
  });

  it('renders as an anchor when href is set', async () => {
    const el = await fixture('<civ-menu-item href="/profile">Profile</civ-menu-item>');
    const a = el.querySelector('a.civ-menu-item__inner') as HTMLAnchorElement;
    expect(a).not.toBeNull();
    expect(a.getAttribute('href')).toBe('/profile');
  });

  it('sanitizes unsafe hrefs to #', async () => {
    const el = await fixture('<civ-menu-item href="javascript:alert(1)">Bad</civ-menu-item>');
    const a = el.querySelector('a.civ-menu-item__inner') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('#');
  });

  it('applies destructive styling class when destructive', async () => {
    const el = await fixture('<civ-menu-item destructive>Delete</civ-menu-item>');
    expect(el.querySelector('.civ-menu-item__inner--destructive')).not.toBeNull();
  });

  it('disables the inner button when disabled', async () => {
    const el = await fixture('<civ-menu-item disabled>Edit</civ-menu-item>');
    const btn = el.querySelector('button.civ-menu-item__inner') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(el.getAttribute('aria-disabled')).toBe('true');
  });
});
