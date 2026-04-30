import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-list-item.js';

afterEach(cleanupFixtures);

describe('civ-list-item', () => {
  it('renders as <li> with no href', async () => {
    const el = await fixture('<civ-list-item>Plain row</civ-list-item>');
    expect(el.querySelector('li')).not.toBeNull();
    expect(el.querySelector('a')).toBeNull();
  });

  it('renders <li><a> when href is set', async () => {
    const el = await fixture('<civ-list-item href="/foo">Clickable</civ-list-item>');
    const li = el.querySelector('li');
    const a = el.querySelector('a');
    expect(li).not.toBeNull();
    expect(a).not.toBeNull();
    expect(a!.getAttribute('href')).toBe('/foo');
  });

  it('relocates default slot children into content slot', async () => {
    const el = await fixture('<civ-list-item href="/foo"><span class="x">Hello</span></civ-list-item>');
    const content = el.querySelector('[data-civ-list-item-content-slot]');
    expect(content).not.toBeNull();
    expect(content!.querySelector('.x')).not.toBeNull();
  });

  it('relocates data-list-item-end children into end slot', async () => {
    const el = await fixture(`
      <civ-list-item href="/foo">
        Label
        <span class="badge" data-list-item-end>tag</span>
      </civ-list-item>
    `);
    const endSlot = el.querySelector('[data-civ-list-item-end-slot]');
    expect(endSlot).not.toBeNull();
    expect(endSlot!.querySelector('.badge')).not.toBeNull();
  });

  it('omits end slot container when no end-slotted children exist', async () => {
    const el = await fixture('<civ-list-item href="/foo">Label</civ-list-item>');
    expect(el.querySelector('[data-civ-list-item-end-slot]')).toBeNull();
  });

  it('static row also supports the end slot', async () => {
    const el = await fixture(`
      <civ-list-item>
        Locked
        <span class="badge" data-list-item-end>tag</span>
      </civ-list-item>
    `);
    expect(el.querySelector('a')).toBeNull();
    const endSlot = el.querySelector('[data-civ-list-item-end-slot]');
    expect(endSlot).not.toBeNull();
    expect(endSlot!.querySelector('.badge')).not.toBeNull();
  });

  it('anchor has hover and focus-visible classes', async () => {
    const el = await fixture('<civ-list-item href="/foo">x</civ-list-item>');
    const a = el.querySelector('a')!;
    expect(a.className).toContain('hover:civ-bg-primary-lightest');
    expect(a.className).toContain('focus-visible:civ-focus-ring');
    expect(a.className).toContain('civ-no-underline');
  });

  it('sanitizes javascript: href', async () => {
    const el = await fixture('<civ-list-item href="javascript:alert(1)">x</civ-list-item>');
    const a = el.querySelector('a');
    expect(a).toBeNull();
    expect(el.querySelector('li')).not.toBeNull();
  });

  it('does not set aria-current by default', async () => {
    const el = await fixture('<civ-list-item href="/foo">x</civ-list-item>');
    const a = el.querySelector('a')!;
    expect(a.hasAttribute('aria-current')).toBe(false);
  });

  it('sets aria-current="page" when current is true', async () => {
    const el = await fixture('<civ-list-item href="/foo" current>x</civ-list-item>');
    const a = el.querySelector('a')!;
    expect(a.getAttribute('aria-current')).toBe('page');
  });

  it('fires civ-analytics on click when href is set', async () => {
    const el = await fixture('<civ-list-item href="/foo">x</civ-list-item>');
    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);
    (el.querySelector('a') as HTMLAnchorElement).click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-list-item>x</civ-list-item>');
    expect(el.shadowRoot).toBeNull();
  });

  it('relocates start slot content', async () => {
    const el = await fixture('<civ-list-item><civ-icon data-list-item-start name="edit"></civ-icon>Item</civ-list-item>');
    const startSlot = el.querySelector('[data-civ-list-item-start-slot]');
    expect(startSlot).not.toBeNull();
    const icon = startSlot!.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('edit');
  });

  it('renders heading as bold text', async () => {
    const el = await fixture('<civ-list-item heading="My claims">Item</civ-list-item>');
    const bold = el.querySelector('.civ-font-bold');
    expect(bold).not.toBeNull();
    expect(bold!.textContent).toContain('My claims');
  });

  it('renders description as secondary text', async () => {
    const el = await fixture('<civ-list-item heading="Title" description="Some details">Item</civ-list-item>');
    const desc = el.querySelector('.civ-text-sm');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('Some details');
  });

  it('renders heading + description together', async () => {
    const el = await fixture('<civ-list-item heading="Title" description="Details">Item</civ-list-item>');
    const bold = el.querySelector('.civ-font-bold');
    const desc = el.querySelector('.civ-text-sm');
    expect(bold).not.toBeNull();
    expect(desc).not.toBeNull();
    expect(bold!.textContent).toContain('Title');
    expect(desc!.textContent).toContain('Details');
  });

  it('heading and description work with href (inside anchor)', async () => {
    const el = await fixture('<civ-list-item href="/claims" heading="My claims" description="View all">Item</civ-list-item>');
    const a = el.querySelector('a');
    expect(a).not.toBeNull();
    const bold = a!.querySelector('.civ-font-bold');
    const desc = a!.querySelector('.civ-text-sm');
    expect(bold).not.toBeNull();
    expect(bold!.textContent).toContain('My claims');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('View all');
  });
});
