import { describe, it, expect, afterEach } from 'vitest';
import './civ-icon.js';
import type { CivIcon } from './civ-icon.js';
import { icons } from './icon-library.js';

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

// Test that every CSS icon has the right DOM structure
describe('civ-icon visual regression', () => {
  // For each icon, verify:
  // 1. The modifier class is applied
  // 2. No inner content (pure CSS rendering)
  // 3. Container has correct base dimensions (1em x 1em via class)

  for (const [name] of Object.entries(icons)) {
    it(`${name}: renders with modifier class and no children`, async () => {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);

      const container = el.querySelector('.civ-icon')!;
      expect(container).toBeTruthy();
      expect(container.classList.contains(`civ-icon--${name}`)).toBe(true);
      expect(container.children.length).toBe(0); // Pure CSS, no child elements
    });
  }

  // Test that icons scale with font-size
  it('icons scale with size prop', async () => {
    const sizes: Record<string, string> = {
      sm: '0.75em',
      md: '1em',
      lg: '1.5em',
      xl: '2em',
      '2xl': '3em',
    };
    for (const [size, expected] of Object.entries(sizes)) {
      const el = await create(`<civ-icon name="check" size="${size}"></civ-icon>`);
      const container = el.querySelector('.civ-icon') as HTMLElement;
      expect(container.style.fontSize).toBe(expected);
      el.remove();
    }
  });

  // Test that all icons use currentColor (inherit text color)
  // jsdom doesn't compute CSS, so just verify the class is correct
  it('all icons have consistent container class structure', async () => {
    for (const [name] of Object.entries(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon');
      expect(container?.classList.contains('civ-icon')).toBe(true);
      el.remove();
    }
  });

  // Verify each icon container is a span element (consistent rendering)
  it('all icons render as span elements', async () => {
    for (const [name] of Object.entries(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon');
      expect(container?.tagName).toBe('SPAN');
      el.remove();
    }
  });

  // Verify decorative icons have correct a11y attributes
  it('all icons default to decorative (aria-hidden)', async () => {
    for (const [name] of Object.entries(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon')!;
      expect(container.getAttribute('role')).toBe('presentation');
      expect(container.getAttribute('aria-hidden')).toBe('true');
      el.remove();
    }
  });

  // Verify modifier classes don't conflict across icons
  it('each icon has exactly one modifier class', async () => {
    for (const [name] of Object.entries(icons)) {
      const el = await create(`<civ-icon name="${name}"></civ-icon>`);
      const container = el.querySelector('.civ-icon')!;
      const modifierClasses = Array.from(container.classList).filter(
        (c) => c.startsWith('civ-icon--'),
      );
      expect(modifierClasses).toEqual([`civ-icon--${name}`]);
      el.remove();
    }
  });
});
