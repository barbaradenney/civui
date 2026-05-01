import { describe, it, expect, afterEach } from 'vitest';
import { icons, registerIcon, getIconNames, getMaterialSymbolName } from './icon-library.js';
import type { IconDef } from './icon-library.js';
import './civ-icon.js';
import type { CivIcon } from './civ-icon.js';

function cleanup(): void {
  document.body.innerHTML = '';
}

async function create(tag: string): Promise<CivIcon> {
  const tpl = document.createElement('template');
  tpl.innerHTML = tag;
  const el = tpl.content.firstElementChild as CivIcon;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(cleanup);

describe('civ-icon', () => {
  it('renders nothing when name is empty', async () => {
    const el = await create('<civ-icon></civ-icon>');
    const container = el.querySelector('.civ-icon');
    expect(container).toBeNull();
  });

  it('renders nothing for an unknown icon name', async () => {
    const el = await create('<civ-icon name="nonexistent"></civ-icon>');
    const container = el.querySelector('.civ-icon');
    expect(container).toBeNull();
  });

  it('renders a container span with correct role for decorative icons', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container).toBeTruthy();
    expect(container.getAttribute('role')).toBe('none');
    expect(container.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders role="img" and aria-label when label is set', async () => {
    const el = await create('<civ-icon name="check" label="Approved"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.getAttribute('role')).toBe('img');
    expect(container.getAttribute('aria-hidden')).toBe('false');
    expect(container.getAttribute('aria-label')).toBe('Approved');
  });

  // ── Material Symbols rendering ───────────────────────────────

  it('renders the Material Symbols glyph name as text content', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.textContent).toBe('check');
    expect(container.classList.contains('material-symbols-outlined')).toBe(true);
  });

  it('uses the android mapping for the rendered glyph name', async () => {
    const el = await create('<civ-icon name="chevron-down"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    // chevron-down maps to expand_more in Material Symbols
    expect(container.textContent).toBe('expand_more');
  });

  it('falls back to underscored name for icons without an android mapping', () => {
    registerIcon('custom-fallback', { label: 'Fallback' });
    expect(getMaterialSymbolName('custom-fallback')).toBe('custom_fallback');
    delete (icons as Record<string, IconDef>)['custom-fallback'];
  });

  it('keeps the modifier class for selector targeting', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.classList.contains('civ-icon--check')).toBe(true);
  });

  it('marks the glyph translate="no" so screen translators do not mangle it', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.getAttribute('translate')).toBe('no');
  });

  // ── Size prop ───────────────────────────────────────────────

  it('applies named size "sm"', async () => {
    const el = await create('<civ-icon name="check" size="sm"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container.style.fontSize).toBe('0.75em');
  });

  it('applies named size "lg"', async () => {
    const el = await create('<civ-icon name="check" size="lg"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container.style.fontSize).toBe('1.5em');
  });

  it('applies named size "xl"', async () => {
    const el = await create('<civ-icon name="check" size="xl"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container.style.fontSize).toBe('2em');
  });

  it('applies named size "2xl"', async () => {
    const el = await create('<civ-icon name="check" size="2xl"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container.style.fontSize).toBe('3em');
  });

  it('passes through custom size values', async () => {
    const el = await create('<civ-icon name="check" size="24px"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container.style.fontSize).toBe('24px');
  });

  it('no font-size set when size is empty', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container.style.fontSize).toBe('');
  });

  // ── Dynamic updates ─────────────────────────────────────────

  it('re-renders when name changes between icons', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    expect(el.querySelector('.civ-icon')!.textContent).toBe('check');

    el.name = 'close';
    await el.updateComplete;
    expect(el.querySelector('.civ-icon')!.textContent).toBe('close');
  });

  it('re-renders when label changes', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = () => el.querySelector('.civ-icon')!;
    expect(container().getAttribute('aria-hidden')).toBe('true');

    el.label = 'Done';
    await el.updateComplete;
    expect(container().getAttribute('role')).toBe('img');
    expect(container().getAttribute('aria-label')).toBe('Done');
  });

  // ── Icon library ────────────────────────────────────────────

  it('registerIcon adds a custom icon', async () => {
    registerIcon('custom-test', { label: 'Custom', android: 'star' });

    const el = await create('<civ-icon name="custom-test"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container).toBeTruthy();
    expect(container.textContent).toBe('star');

    delete (icons as Record<string, IconDef>)['custom-test'];
  });

  it('getIconNames returns all registered icon names', () => {
    const names = getIconNames();
    expect(names).toContain('check');
    expect(names).toContain('close');
    expect(names).toContain('error');
    expect(names.length).toBeGreaterThan(30);
  });

  // ── Every built-in icon renders ─────────────────────────────

  it('all built-in icons render without errors', async () => {
    for (const [name] of Object.entries(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon');
      expect(container, `Icon "${name}" should render a container`).toBeTruthy();
      expect(
        container!.classList.contains('material-symbols-outlined'),
        `Icon "${name}" should have Material Symbols class`,
      ).toBe(true);
      expect(
        container!.textContent,
        `Icon "${name}" should render a glyph name`,
      ).toBeTruthy();
      el.remove();
    }
  });

  it('all built-in icons have a label defined', () => {
    for (const [name, def] of Object.entries(icons)) {
      expect(def.label, `Icon "${name}" should have a label`).toBeTruthy();
    }
  });

  it('all built-in icons resolve to a Material Symbols glyph name', () => {
    for (const [name] of Object.entries(icons)) {
      const symbol = getMaterialSymbolName(name);
      expect(symbol, `Icon "${name}" must resolve to a glyph name`).toMatch(/^[a-z0-9_]+$/);
    }
  });

  it('core icons have platform mappings', () => {
    // Hand-authored icons with iOS mappings should also have Android.
    for (const [name, def] of Object.entries(icons)) {
      if (def.ios) {
        expect(def.android, `Icon "${name}" has iOS but no Android mapping`).toBeTruthy();
      }
    }
  });
});
