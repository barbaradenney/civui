import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-segment.js';
import './civ-segmented-control.js';

afterEach(cleanupFixtures);

describe('civ-segmented-control rendering', () => {
  it('renders segments with labels', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);

    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('List');
    expect(buttons[1].textContent).toContain('Grid');
  });

  it('renders a fieldset wrapping the segments', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
  });

  it('renders legend as screen-reader only (civ-sr-only)', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
  });

  it('renders hint text', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" hint="Choose a layout">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Choose a layout');
    expect(hintSpan).not.toBeNull();
  });

  it('renders error message with role="alert"', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" error="Selection required">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Selection required');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });
});

describe('civ-segmented-control accessibility', () => {
  it('has role="radiogroup" on fieldset', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('role')).toBe('radiogroup');
  });

  it('has aria-orientation="horizontal" on fieldset', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('has role="radio" on each segment button', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(2);
  });

  it('sets aria-checked="true" on selected segment', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].getAttribute('aria-checked')).toBe('false');
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" error="Select a view">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid when no error', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBeNull();
  });

  it('sets aria-required on fieldset when required', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" required>
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });

  it('only selected segment has tabindex="0"', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].getAttribute('tabindex')).toBe('-1');
    expect(buttons[1].getAttribute('tabindex')).toBe('0');
  });

  it('applies focus-visible:civ-focus-ring on segment buttons', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const button = el.querySelector('button');
    expect(button!.className).toContain('focus-visible:civ-focus-ring');
  });
});

describe('civ-segmented-control child syncing', () => {
  it('syncs selected state to child segments', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `);

    const segments = el.querySelectorAll('civ-segment');
    expect((segments[0] as any).selected).toBe(false);
    expect((segments[1] as any).selected).toBe(true);
    expect((segments[2] as any).selected).toBe(false);
  });

  it('sets data-civ-segment-position on children', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `);

    const segments = el.querySelectorAll('civ-segment');
    expect(segments[0].getAttribute('data-civ-segment-position')).toBe('first');
    expect(segments[1].getAttribute('data-civ-segment-position')).toBe('middle');
    expect(segments[2].getAttribute('data-civ-segment-position')).toBe('last');
  });

  it('sets data-civ-segment-position="only" for single segment', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);

    const segment = el.querySelector('civ-segment');
    expect(segment!.getAttribute('data-civ-segment-position')).toBe('only');
  });

  it('syncs disabled state to child segments', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list" disabled>
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);

    const segments = el.querySelectorAll('civ-segment');
    for (const segment of segments) {
      expect((segment as any).disabled).toBe(true);
    }
  });
});

describe('civ-segmented-control keyboard navigation', () => {
  it('ArrowRight moves to next segment', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('grid');
  });

  it('ArrowLeft moves to previous segment', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('list');
  });

  it('wraps from last to first on ArrowRight', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="table">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('list');
  });

  it('wraps from first to last on ArrowLeft', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('table');
  });

  it('Home moves to first segment', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="table">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('list');
  });

  it('End moves to last segment', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('table');
  });

  it('ArrowRight moves backward in RTL', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="grid" dir="rtl">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('list');
  });

  it('ArrowLeft moves forward in RTL', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="grid" dir="rtl">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('table');
  });
});

describe('civ-segmented-control events', () => {
  it('selects segment on click and fires civ-change from group', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-segmented-control') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-change', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();
    await elementUpdated(el);

    expect(el.value).toBe('grid');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'grid' });
  });

  it('re-dispatches civ-change from group (not child)', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-segmented-control') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-change', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    const event = handler.mock.calls[0][0];
    expect(event.target).toBe(el);
  });

  it('fires civ-input with { value: string } detail', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-segmented-control') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-input', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'grid' });
  });

  it('disabled segment prevents selection on click', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid" disabled></civ-segment>
      </civ-segmented-control>
    `) as any;

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();
    await elementUpdated(el);

    expect(el.value).toBe('list');
  });
});

describe('civ-segmented-control form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-segmented-control') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('restores default value on formResetCallback', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `) as any;

    // Change selection
    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();
    await elementUpdated(el);
    expect(el.value).toBe('grid');

    // Reset
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.value).toBe('list');
  });

  it('disables fieldset when disabled prop is set', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list" disabled>
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
  });

  it('cascades disabled via formDisabledCallback', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `) as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const segments = el.querySelectorAll('civ-segment');
    for (const segment of segments) {
      expect((segment as any).disabled).toBe(true);
    }
  });
});

describe('civ-segmented-control analytics', () => {
  it('fires civ-analytics from group on selection change', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `) as any;

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-segmented-control');
    expect(detail.action).toBe('change');
  });

  it('never includes value in analytics payload', async () => {
    const el = await fixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `) as any;

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();

    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
    expect(detail.details).toBeUndefined();
  });
});
