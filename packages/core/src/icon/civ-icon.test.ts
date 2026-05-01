import { describe, it, expect, afterEach } from 'vitest';
import { icons, registerIcon, getIconNames } from './icon-library.js';
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

  // ── CSS icon rendering ────────────────────────────────────

  it('renders CSS icon with modifier class and no inner content', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.classList.contains('civ-icon--check')).toBe(true);
    expect(container.children.length).toBe(0);
  });

  it('renders modifier class for each CSS icon', async () => {
    for (const name of ['chevron-right', 'close', 'plus', 'search', 'menu', 'check']) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon')!;
      expect(container.classList.contains(`civ-icon--${name}`)).toBe(true);
      el.remove();
    }
  });

  it('renders SVG-placeholder icons with modifier class', async () => {
    const el = await create('<civ-icon name="check-circle"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.classList.contains('civ-icon--check-circle')).toBe(true);
    expect(container.children.length).toBe(0);
  });

  it('container has civ-icon class', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.classList.contains('civ-icon')).toBe(true);
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
    expect(el.querySelector('.civ-icon')!.classList.contains('civ-icon--check')).toBe(true);

    el.name = 'close';
    await el.updateComplete;
    expect(el.querySelector('.civ-icon')!.classList.contains('civ-icon--close')).toBe(true);
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
    registerIcon('custom-test', { label: 'Custom' });

    const el = await create('<civ-icon name="custom-test"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container).toBeTruthy();
    expect(container.classList.contains('civ-icon--custom-test')).toBe(true);

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
        container!.classList.contains(`civ-icon--${name}`),
        `Icon "${name}" should have modifier class`,
      ).toBe(true);
      el.remove();
    }
  });

  it('all built-in icons have a label defined', () => {
    for (const [name, def] of Object.entries(icons)) {
      expect(def.label, `Icon "${name}" should have a label`).toBeTruthy();
    }
  });

  it('core icons have platform mappings', () => {
    // Only check icons that were hand-authored with platform mappings.
    // Imported icons (from cssicon.space) have label only — platform
    // mappings are added as native implementations are built.
    for (const [name, def] of Object.entries(icons)) {
      if (def.ios || def.android) {
        expect(def.ios, `Icon "${name}" has Android but no iOS mapping`).toBeTruthy();
        expect(def.android, `Icon "${name}" has iOS but no Android mapping`).toBeTruthy();
      }
    }
  });
});
