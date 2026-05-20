import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-button-group.js';
import '@civui/actions/action-button';

// jsdom doesn't ship a ResizeObserver. civ-button-group uses one to
// recompute overflow on container resize; stub with a no-op so the
// overflow path can be exercised by manually-triggered measurements.
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver ?? class {
  observe(): void { /* noop */ }
  unobserve(): void { /* noop */ }
  disconnect(): void { /* noop */ }
};

afterEach(cleanupFixtures);

describe('civ-button-group', () => {
  it('renders a toolbar container', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="A"></civ-action-button>
        <civ-action-button label="B"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const toolbar = el.querySelector('[role="toolbar"]');
    expect(toolbar).not.toBeNull();
  });

  it('relocates children into the group container', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="Bold"></civ-action-button>
        <civ-action-button label="Italic"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const container = el.querySelector('[data-civ-button-group-content]');
    const buttons = container!.querySelectorAll('civ-action-button');
    expect(buttons.length).toBe(2);
  });

  it('uses horizontal layout by default', async () => {
    const el = await fixture('<civ-button-group></civ-button-group>');
    const container = el.querySelector('.civ-button-group');
    expect(container).not.toBeNull();
  });

  it('uses vertical layout when orientation is vertical', async () => {
    const el = await fixture('<civ-button-group orientation="vertical"></civ-button-group>');
    const container = el.querySelector('.civ-button-group--vertical');
    expect(container).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-button-group></civ-button-group>');
    expect(el.shadowRoot).toBeNull();
  });

  it('sets aria-label from label prop', async () => {
    const el = await fixture('<civ-button-group label="Actions"></civ-button-group>');
    await elementUpdated(el);
    const toolbar = el.querySelector('[role="toolbar"]');
    expect(toolbar?.getAttribute('aria-label')).toBe('Actions');
  });

  it('supports disabled child buttons', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="Active"></civ-action-button>
        <civ-action-button label="Disabled" disabled></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const buttons = el.querySelectorAll('civ-action-button');
    expect(buttons[1].hasAttribute('disabled')).toBe(true);
  });

  it('renders multiple buttons with correct labels', async () => {
    const el = await fixture(`
      <civ-button-group>
        <civ-action-button label="Save"></civ-action-button>
        <civ-action-button label="Cancel"></civ-action-button>
        <civ-action-button label="Delete"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    const buttons = el.querySelectorAll('civ-action-button');
    expect(buttons.length).toBe(3);
  });
});

describe('civ-button-group allow-overflow', () => {
  afterEach(cleanupFixtures);

  it('does NOT render the More menu by default', async () => {
    const el = await fixture(`
      <civ-button-group label="Toolbar">
        <civ-action-button label="Edit"></civ-action-button>
        <civ-action-button label="Duplicate"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    expect(el.querySelector('civ-popover')).toBeNull();
  });

  it('collapses trailing buttons into a More menu when the container is too narrow', async () => {
    const el = await fixture(`
      <civ-button-group label="Row actions" allow-overflow>
        <civ-action-button label="Edit"></civ-action-button>
        <civ-action-button label="Duplicate"></civ-action-button>
        <civ-action-button label="Move"></civ-action-button>
        <civ-action-button label="Archive"></civ-action-button>
        <civ-action-button label="Remove"></civ-action-button>
      </civ-button-group>
    `) as any;
    await elementUpdated(el);

    // jsdom doesn't compute layout; stub getBoundingClientRect so the
    // measurement reflects "host: 200px; each child: 60px; More: 40px".
    // 200 - 40 (More) = 160 budget → fits 2 children → 3 overflow.
    Object.defineProperty(el, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 200, height: 32, top: 0, left: 0, right: 200, bottom: 32, x: 0, y: 0, toJSON() {} }),
    });
    const children = Array.from(
      el.querySelectorAll('[data-civ-button-group-content] > civ-action-button'),
    );
    for (const child of children) {
      Object.defineProperty(child, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({ width: 60, height: 32, top: 0, left: 0, right: 60, bottom: 32, x: 0, y: 0, toJSON() {} }),
      });
    }

    // Force initial measure — this caches the More-button width on
    // the next render, then re-runs the real measurement.
    el._measure();
    await elementUpdated(el);
    const more = el.querySelector('[data-civ-more-button]') as HTMLElement;
    expect(more).not.toBeNull();
    Object.defineProperty(more, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 40, height: 32, top: 0, left: 0, right: 40, bottom: 32, x: 0, y: 0, toJSON() {} }),
    });
    // Re-run with the cached More-button width.
    el._moreButtonWidth = 40;
    el._measure();
    await elementUpdated(el);

    // 5 children, budget = 200 - 40 = 160, each = 60. Fits 2 (120),
    // third pushes to 180 > 160 → 3 overflow.
    const hidden = el.querySelectorAll('[data-civ-overflow]');
    expect(hidden.length).toBe(3);
    expect(el.querySelector('civ-popover')).not.toBeNull();
  });

  it('proxy click on a menu item fires the original button\'s click handler', async () => {
    const el = await fixture(`
      <civ-button-group label="Toolbar" allow-overflow>
        <civ-action-button label="Edit"></civ-action-button>
        <civ-action-button label="Duplicate"></civ-action-button>
        <civ-action-button label="Archive"></civ-action-button>
        <civ-action-button label="Remove"></civ-action-button>
      </civ-button-group>
    `) as any;
    await elementUpdated(el);

    Object.defineProperty(el, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 120, height: 32, top: 0, left: 0, right: 120, bottom: 32, x: 0, y: 0, toJSON() {} }),
    });
    const children = Array.from(
      el.querySelectorAll('[data-civ-button-group-content] > civ-action-button'),
    );
    for (const child of children) {
      Object.defineProperty(child, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({ width: 60, height: 32, top: 0, left: 0, right: 60, bottom: 32, x: 0, y: 0, toJSON() {} }),
      });
    }
    el._moreButtonWidth = 40;  // pre-seed so first _measure picks real overflow
    el._measure();
    await elementUpdated(el);

    const originalButtons = el.querySelectorAll('civ-action-button');
    const overflowed = Array.from(originalButtons).find((b: any) => b.hasAttribute('data-civ-overflow')) as HTMLElement | undefined;
    expect(overflowed).toBeDefined();

    let clicks = 0;
    overflowed!.addEventListener('click', () => { clicks++; });

    const overflowItems = el.querySelectorAll('.civ-button-group__overflow-item');
    expect(overflowItems.length).toBeGreaterThan(0);
    const overflowedLabel = overflowed!.getAttribute('label');
    const item = Array.from(overflowItems).find(
      (b) => b.getAttribute('label') === overflowedLabel,
    ) as HTMLElement | undefined;
    expect(item).toBeDefined();
    item!.click();
    expect(clicks).toBe(1);
  });

  it('vertical orientation never overflows even with allow-overflow set', async () => {
    const el = await fixture(`
      <civ-button-group orientation="vertical" allow-overflow label="Toolbar">
        <civ-action-button label="A"></civ-action-button>
        <civ-action-button label="B"></civ-action-button>
      </civ-button-group>
    `);
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('civ-popover')).toBeNull();
  });
});
