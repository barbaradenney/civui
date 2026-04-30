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
});
