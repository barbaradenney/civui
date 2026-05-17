import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-toolbar.js';

afterEach(cleanupFixtures);

describe('civ-toolbar', () => {
  it('renders a <div role="group"> wrapper', async () => {
    const el = await fixture('<civ-toolbar label="Test toolbar"></civ-toolbar>');
    const toolbar = el.querySelector('.civ-toolbar');
    expect(toolbar).not.toBeNull();
    expect(toolbar?.getAttribute('role')).toBe('group');
  });

  it('applies the label prop as aria-label', async () => {
    const el = await fixture('<civ-toolbar label="Applications toolbar"></civ-toolbar>');
    const toolbar = el.querySelector('.civ-toolbar');
    expect(toolbar?.getAttribute('aria-label')).toBe('Applications toolbar');
  });

  it('omits aria-label when label is empty', async () => {
    const el = await fixture('<civ-toolbar></civ-toolbar>');
    const toolbar = el.querySelector('.civ-toolbar');
    expect(toolbar?.hasAttribute('aria-label')).toBe(false);
  });

  it('re-relocates children when the host re-renders and the slot targets are emptied', async () => {
    const el = await fixture(`
      <civ-toolbar label="t">
        <button data-testid="search">Search</button>
        <button data-civ-toolbar-end data-testid="add">Add</button>
      </civ-toolbar>
    `) as any;
    await elementUpdated(el);
    // Force a re-render by changing a reactive prop.
    el.label = 'Updated label';
    await elementUpdated(el);
    expect(el.querySelector('.civ-toolbar__start [data-testid="search"]')).not.toBeNull();
    expect(el.querySelector('.civ-toolbar__end [data-testid="add"]')).not.toBeNull();
  });

  it('relocates default children into the start container', async () => {
    const el = await fixture(`
      <civ-toolbar label="t">
        <button data-testid="search">Search</button>
        <button data-testid="filter">Filter</button>
      </civ-toolbar>
    `);
    await elementUpdated(el);
    const start = el.querySelector('.civ-toolbar__start');
    expect(start?.querySelector('[data-testid="search"]')).not.toBeNull();
    expect(start?.querySelector('[data-testid="filter"]')).not.toBeNull();
  });

  it('relocates data-civ-toolbar-end children into the end container', async () => {
    const el = await fixture(`
      <civ-toolbar label="t">
        <button data-testid="search">Search</button>
        <button data-civ-toolbar-end data-testid="add">Add new</button>
      </civ-toolbar>
    `);
    await elementUpdated(el);
    const start = el.querySelector('.civ-toolbar__start');
    const end = el.querySelector('.civ-toolbar__end');
    expect(start?.querySelector('[data-testid="search"]')).not.toBeNull();
    expect(end?.querySelector('[data-testid="add"]')).not.toBeNull();
    expect(start?.querySelector('[data-testid="add"]')).toBeNull();
  });

  it('omits the end container when no end-slotted children exist', async () => {
    const el = await fixture(`
      <civ-toolbar label="t">
        <button>Only start</button>
      </civ-toolbar>
    `);
    await elementUpdated(el);
    expect(el.querySelector('.civ-toolbar__end')).toBeNull();
  });

  it('renders empty (with start container) when no children are passed', async () => {
    const el = await fixture('<civ-toolbar label="t"></civ-toolbar>');
    await elementUpdated(el);
    const start = el.querySelector('.civ-toolbar__start');
    expect(start).not.toBeNull();
    expect(start?.children.length).toBe(0);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-toolbar label="t"></civ-toolbar>');
    expect(el.shadowRoot).toBeNull();
  });
});
