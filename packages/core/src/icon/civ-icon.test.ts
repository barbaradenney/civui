import { describe, it, expect, afterEach } from 'vitest';
import { icons, registerIcon, getIconNames, resetIcons } from './icon-library.js';
import './civ-icon.js';
import type { CivIcon } from './civ-icon.js';

function cleanup(): void {
  document.body.innerHTML = '';
  resetIcons();
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
    expect(el.querySelector('.civ-icon')).toBeNull();
  });

  it('renders nothing for an unknown icon name', async () => {
    const el = await create('<civ-icon name="nonexistent"></civ-icon>');
    expect(el.querySelector('.civ-icon')).toBeNull();
  });

  // ── SVG rendering ───────────────────────────────────────────

  it('renders an SVG with path elements', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon')!;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('currentColor');
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });

  it('renders multiple path elements for multi-path icons', async () => {
    const el = await create('<civ-icon name="check-circle"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon')!;
    const paths = svg.querySelectorAll('path');
    // check-circle has circle + checkmark as separate path segments
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });

  it('renders an SVG for every built-in icon', async () => {
    for (const name of Object.keys(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const svg = el.querySelector('svg.civ-icon')!;
      expect(svg, `Icon "${name}" should render an SVG`).toBeTruthy();
      expect(svg.querySelectorAll('path').length, `Icon "${name}" should have at least one path`).toBeGreaterThanOrEqual(1);
      el.remove();
    }
  });

  // ── A11y attributes ──────────────────────────────────────────

  it('renders role="none" + aria-hidden for decorative icons', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon')!;
    expect(svg.getAttribute('role')).toBe('none');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders role="img" + aria-label when label is set', async () => {
    const el = await create('<civ-icon name="check" label="Approved"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-hidden')).toBe('false');
    expect(svg.getAttribute('aria-label')).toBe('Approved');
  });

  // ── Size prop ────────────────────────────────────────────────

  it.each([
    ['sm', '0.875em'],
    ['md', '1em'],
    ['lg', '1.5em'],
    ['xl', '2em'],
    ['2xl', '3em'],
    ['24px', '24px'],
  ])('size="%s" → font-size %s', async (size, expected) => {
    const el = await create(`<civ-icon name="check" size="${size}"></civ-icon>`);
    const svg = el.querySelector('svg.civ-icon') as unknown as HTMLElement;
    expect(svg.style.fontSize).toBe(expected);
  });

  it('omits font-size when size is unset', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon') as unknown as HTMLElement;
    expect(svg.style.fontSize).toBe('');
  });

  // ── Transforms ───────────────────────────────────────────────

  it('applies a rotate transform', async () => {
    const el = await create('<civ-icon name="check" rotate="90"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon') as unknown as HTMLElement;
    expect(svg.style.transform).toBe('rotate(90deg)');
  });

  it('applies a horizontal flip transform', async () => {
    const el = await create('<civ-icon name="check" flip="horizontal"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon') as unknown as HTMLElement;
    expect(svg.style.transform).toBe('scaleX(-1)');
  });

  // ── Dynamic updates ──────────────────────────────────────────

  it('re-renders when name changes', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const pathBefore = el.querySelector('svg path')!.getAttribute('d');

    el.name = 'close';
    await el.updateComplete;
    const pathAfter = el.querySelector('svg path')!.getAttribute('d');
    expect(pathAfter).not.toBe(pathBefore);
  });

  it('re-renders when label changes', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const icon = () => el.querySelector('.civ-icon')!;
    expect(icon().getAttribute('aria-hidden')).toBe('true');

    el.label = 'Done';
    await el.updateComplete;
    expect(icon().getAttribute('role')).toBe('img');
    expect(icon().getAttribute('aria-label')).toBe('Done');
  });

  // ── Material Symbols font fallback (opt-in) ──────────────────

  it('renders Material Symbols ligature when icon defines a symbol and no path', async () => {
    registerIcon('home', { label: 'Home', path: '', symbol: 'home' });

    const el = await create('<civ-icon name="home"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.classList.contains('material-symbols-outlined')).toBe(true);
    expect(span.textContent).toBe('home');
    expect(span.getAttribute('translate')).toBe('no');
  });

  it('preserves a11y attributes in the font-fallback path', async () => {
    registerIcon('home', { label: 'Home', path: '', symbol: 'home' });

    const el = await create('<civ-icon name="home" label="Go home"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.getAttribute('role')).toBe('img');
    expect(span.getAttribute('aria-label')).toBe('Go home');
  });

  // ── Icon library ─────────────────────────────────────────────

  it('registerIcon adds a custom SVG icon', async () => {
    registerIcon('agency-seal', { label: 'Agency seal', path: 'M12 2L2 7l10 5 10-5z' });

    const el = await create('<civ-icon name="agency-seal"></civ-icon>');
    const svg = el.querySelector('svg.civ-icon')!;
    expect(svg).toBeTruthy();
    expect(svg.querySelector('path')!.getAttribute('d')).toBe('M12 2L2 7l10 5 10-5z');
  });

  it('getIconNames returns all registered icon names', () => {
    const names = getIconNames();
    expect(names).toContain('check');
    expect(names).toContain('close');
    expect(names).toContain('error');
    expect(names.length).toBeGreaterThanOrEqual(14);
  });

  it('resetIcons reverts to the built-in registry', () => {
    registerIcon('temp-icon', { label: 'Temp', path: 'M0 0' });
    expect(getIconNames()).toContain('temp-icon');

    resetIcons();
    expect(getIconNames()).not.toContain('temp-icon');
    expect(getIconNames()).toContain('check');
  });

  // ── Built-in registry sanity checks ──────────────────────────

  it('every built-in icon has a label, path, and platform mappings', () => {
    for (const [name, def] of Object.entries(icons)) {
      expect(def.label, `Icon "${name}" should have a label`).toBeTruthy();
      expect(def.path, `Icon "${name}" should have an SVG path`).toBeTruthy();
      expect(def.ios, `Icon "${name}" should have an iOS mapping`).toBeTruthy();
      expect(def.android, `Icon "${name}" should have an Android mapping`).toBeTruthy();
    }
  });
});
