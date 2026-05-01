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

  // ── CSS icon rendering (default) ─────────────────────────────

  it('renders a span with the modifier class and no inner content', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span).toBeTruthy();
    expect(span.classList.contains('civ-icon--check')).toBe(true);
    expect(span.children.length).toBe(0);
  });

  it('does NOT add the material-symbols-outlined class for built-in CSS icons', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.classList.contains('material-symbols-outlined')).toBe(false);
  });

  it('renders a modifier class for every built-in icon', async () => {
    for (const name of Object.keys(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const span = el.querySelector('span.civ-icon')!;
      expect(span.classList.contains(`civ-icon--${name}`)).toBe(true);
      el.remove();
    }
  });

  // ── A11y attributes ──────────────────────────────────────────

  it('renders role="none" + aria-hidden for decorative icons', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.getAttribute('role')).toBe('none');
    expect(span.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders role="img" + aria-label when label is set', async () => {
    const el = await create('<civ-icon name="check" label="Approved"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.getAttribute('role')).toBe('img');
    expect(span.getAttribute('aria-hidden')).toBe('false');
    expect(span.getAttribute('aria-label')).toBe('Approved');
  });

  // ── Size prop ────────────────────────────────────────────────

  it.each([
    ['sm', '0.75em'],
    ['md', '1em'],
    ['lg', '1.5em'],
    ['xl', '2em'],
    ['2xl', '3em'],
    ['24px', '24px'],
  ])('size="%s" → font-size %s', async (size, expected) => {
    const el = await create(`<civ-icon name="check" size="${size}"></civ-icon>`);
    const span = el.querySelector('span.civ-icon') as HTMLElement;
    expect(span.style.fontSize).toBe(expected);
  });

  it('omits font-size when size is unset', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const span = el.querySelector('span.civ-icon') as HTMLElement;
    expect(span.style.fontSize).toBe('');
  });

  // ── Transforms ───────────────────────────────────────────────

  it('applies a rotate transform with display:inline-block', async () => {
    const el = await create('<civ-icon name="check" rotate="90"></civ-icon>');
    const span = el.querySelector('span.civ-icon') as HTMLElement;
    expect(span.style.transform).toBe('rotate(90deg)');
    expect(span.style.display).toBe('inline-block');
  });

  it('applies a horizontal flip transform', async () => {
    const el = await create('<civ-icon name="check" flip="horizontal"></civ-icon>');
    const span = el.querySelector('span.civ-icon') as HTMLElement;
    expect(span.style.transform).toBe('scaleX(-1)');
  });

  // ── Dynamic updates ──────────────────────────────────────────

  it('re-renders when name changes', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    expect(el.querySelector('.civ-icon')!.classList.contains('civ-icon--check')).toBe(true);

    el.name = 'close';
    await el.updateComplete;
    expect(el.querySelector('.civ-icon')!.classList.contains('civ-icon--close')).toBe(true);
  });

  it('re-renders when label changes', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const span = () => el.querySelector('.civ-icon')!;
    expect(span().getAttribute('aria-hidden')).toBe('true');

    el.label = 'Done';
    await el.updateComplete;
    expect(span().getAttribute('role')).toBe('img');
    expect(span().getAttribute('aria-label')).toBe('Done');
  });

  // ── Material Symbols font fallback (opt-in) ──────────────────

  it('renders Material Symbols ligature when icon defines a `symbol`', async () => {
    registerIcon('home', { label: 'Home', symbol: 'home' });

    const el = await create('<civ-icon name="home"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.classList.contains('material-symbols-outlined')).toBe(true);
    expect(span.textContent).toBe('home');
    expect(span.getAttribute('translate')).toBe('no');
  });

  it('preserves a11y attributes in the font-fallback path', async () => {
    registerIcon('home', { label: 'Home', symbol: 'home' });

    const el = await create('<civ-icon name="home" label="Go home"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.getAttribute('role')).toBe('img');
    expect(span.getAttribute('aria-label')).toBe('Go home');
  });

  // ── Icon library ─────────────────────────────────────────────

  it('registerIcon adds a custom CSS-only icon', async () => {
    registerIcon('agency-seal', { label: 'Agency seal' });

    const el = await create('<civ-icon name="agency-seal"></civ-icon>');
    const span = el.querySelector('span.civ-icon')!;
    expect(span.classList.contains('civ-icon--agency-seal')).toBe(true);
    expect(span.classList.contains('material-symbols-outlined')).toBe(false);
  });

  it('getIconNames returns all registered icon names', () => {
    const names = getIconNames();
    expect(names).toContain('check');
    expect(names).toContain('close');
    expect(names).toContain('error');
    expect(names.length).toBeGreaterThanOrEqual(14);
  });

  it('resetIcons reverts to the built-in registry', () => {
    registerIcon('temp-icon', { label: 'Temp' });
    expect(getIconNames()).toContain('temp-icon');

    resetIcons();
    expect(getIconNames()).not.toContain('temp-icon');
    expect(getIconNames()).toContain('check');
  });

  // ── Built-in registry sanity checks ──────────────────────────

  it('every built-in icon has a label and platform mappings', () => {
    for (const [name, def] of Object.entries(icons)) {
      expect(def.label, `Icon "${name}" should have a label`).toBeTruthy();
      expect(def.ios, `Icon "${name}" should have an iOS mapping`).toBeTruthy();
      expect(def.android, `Icon "${name}" should have an Android mapping`).toBeTruthy();
    }
  });
});
