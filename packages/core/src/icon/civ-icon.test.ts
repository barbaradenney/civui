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
    expect(container.getAttribute('role')).toBe('presentation');
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

  it('renders CSS icon with modifier class and no inner spans', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.classList.contains('civ-icon--check')).toBe(true);
    const layers = container.querySelectorAll(':scope > span');
    expect(layers.length).toBe(0);
  });

  it('renders CSS icon modifier class for chevron-right', async () => {
    const el = await create('<civ-icon name="chevron-right"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.classList.contains('civ-icon--chevron-right')).toBe(true);
  });

  // ── Layer icon rendering ──────────────────────────────────

  it('renders correct number of layers for layer-based icon', async () => {
    const el = await create('<civ-icon name="check-circle"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    const layers = container.querySelectorAll(':scope > span');
    expect(layers.length).toBe(2);
    expect(layers[0].textContent).toBe('○');
    expect(layers[1].textContent).toBe('✓');
  });

  it('layer-based icons do not get modifier class', async () => {
    const el = await create('<civ-icon name="check-circle"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container.classList.contains('civ-icon--check-circle')).toBe(false);
  });

  it('applies transform styles to layers', async () => {
    const el = await create('<civ-icon name="check-circle"></civ-icon>');
    const layer = el.querySelector('.civ-icon > span') as HTMLElement;
    expect(layer.style.transform).toBe('scale(1.0)');
  });

  it('all layers are aria-hidden', async () => {
    const el = await create('<civ-icon name="error"></civ-icon>');
    const layers = el.querySelectorAll('.civ-icon > span');
    layers.forEach((layer) => {
      expect(layer.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('container has civ-icon class for micro-canvas styles', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    const container = el.querySelector('.civ-icon') as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.classList.contains('civ-icon')).toBe(true);
  });

  it('layers have civ-icon__layer class for positioning', async () => {
    const el = await create('<civ-icon name="check-circle"></civ-icon>');
    const layer = el.querySelector('.civ-icon > span') as HTMLElement;
    expect(layer.classList.contains('civ-icon__layer')).toBe(true);
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

  it('re-renders when name changes from CSS to layer icon', async () => {
    const el = await create('<civ-icon name="check"></civ-icon>');
    expect(el.querySelector('.civ-icon')!.classList.contains('civ-icon--check')).toBe(true);

    el.name = 'error';
    await el.updateComplete;
    // error is a layer icon
    const container = el.querySelector('.civ-icon')!;
    expect(container.querySelectorAll(':scope > span').length).toBe(2);
  });

  it('re-renders when name changes between CSS icons', async () => {
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

  it('registerIcon adds a custom layer icon', async () => {
    const customIcon: IconDef = {
      label: 'Custom',
      type: 'layers',
      layers: [{ char: '◈' }],
    };
    registerIcon('custom-test', customIcon);

    const el = await create('<civ-icon name="custom-test"></civ-icon>');
    const layer = el.querySelector('.civ-icon > span');
    expect(layer).toBeTruthy();
    expect(layer!.textContent).toBe('◈');

    // Clean up
    delete (icons as Record<string, IconDef>)['custom-test'];
  });

  it('registerIcon adds a custom CSS icon', async () => {
    const customIcon: IconDef = {
      label: 'Custom CSS',
    };
    registerIcon('custom-css-test', customIcon);

    const el = await create('<civ-icon name="custom-css-test"></civ-icon>');
    const container = el.querySelector('.civ-icon')!;
    expect(container).toBeTruthy();
    expect(container.classList.contains('civ-icon--custom-css-test')).toBe(true);
    expect(container.querySelectorAll(':scope > span').length).toBe(0);

    // Clean up
    delete (icons as Record<string, IconDef>)['custom-css-test'];
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
    for (const [name, def] of Object.entries(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon');
      expect(container, `Icon "${name}" should render a container`).toBeTruthy();

      const isCss = !def.type || def.type === 'css';
      if (isCss) {
        // CSS icons should have the modifier class and no inner spans
        expect(
          container!.classList.contains(`civ-icon--${name}`),
          `CSS icon "${name}" should have modifier class`,
        ).toBe(true);
      } else {
        // Layer icons should have at least one layer span
        const layers = container!.querySelectorAll(':scope > span');
        expect(
          layers.length,
          `Layer icon "${name}" should have at least one layer`,
        ).toBeGreaterThanOrEqual(1);
      }
      // Clean up for next iteration
      el.remove();
    }
  });

  it('all built-in icons have a label defined', () => {
    for (const [name, def] of Object.entries(icons)) {
      expect(def.label, `Icon "${name}" should have a label`).toBeTruthy();
    }
  });
});
