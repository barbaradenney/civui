import { describe, it, expect, afterEach, vi } from 'vitest';
import './civ-segment.js';
import './civ-segmented-control.js';

function createFixture(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as HTMLElement;
}

function cleanup(): void {
  document.body.innerHTML = '';
}

async function waitForUpdate(el: HTMLElement): Promise<void> {
  if ('updateComplete' in el) {
    await (el as any).updateComplete;
  }
  const children = el.querySelectorAll('civ-segment');
  for (const child of children) {
    if ('updateComplete' in child) {
      await (child as any).updateComplete;
    }
  }
}

afterEach(cleanup);

describe('civ-segmented-control', () => {
  it('renders segments with labels', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('List');
    expect(buttons[1].textContent).toContain('Grid');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-segmented-control') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('has role="radiogroup" on fieldset', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(fieldset!.getAttribute('role')).toBe('radiogroup');
  });

  it('has role="radio" on each segment button', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(2);
  });

  it('sets aria-checked="true" on selected segment', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].getAttribute('aria-checked')).toBe('false');
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
  });

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
    await waitForUpdate(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-change', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();
    await waitForUpdate(el);

    expect(el.value).toBe('grid');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'grid' });
  });

  it('navigates with arrow keys', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;
    await waitForUpdate(el);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await waitForUpdate(el);
    expect(el.value).toBe('grid');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await waitForUpdate(el);
    expect(el.value).toBe('table');
  });

  it('arrow keys wrap around', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="table">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;
    await waitForUpdate(el);

    // ArrowRight on last wraps to first
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await waitForUpdate(el);
    expect(el.value).toBe('list');

    // ArrowLeft on first wraps to last
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await waitForUpdate(el);
    expect(el.value).toBe('table');
  });

  it('Home/End keys jump to first/last', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `) as any;
    await waitForUpdate(el);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await waitForUpdate(el);
    expect(el.value).toBe('table');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await waitForUpdate(el);
    expect(el.value).toBe('list');
  });

  it('only selected segment has tabindex="0"', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="grid">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const buttons = el.querySelectorAll('button[role="radio"]');
    expect(buttons[0].getAttribute('tabindex')).toBe('-1');
    expect(buttons[1].getAttribute('tabindex')).toBe('0');
  });

  it('disables via fieldset disabled attribute', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list" disabled>
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
  });

  it('disabled segment prevents selection', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid" disabled></civ-segment>
      </civ-segmented-control>
    `) as any;
    await waitForUpdate(el);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();
    await waitForUpdate(el);

    expect(el.value).toBe('list');
  });

  it('sets aria-required on fieldset', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" required>
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });

  it('sets aria-invalid when error present', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" error="Select a view">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders hint text', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" hint="Choose a layout">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Choose a layout');
    expect(hintSpan).not.toBeNull();
  });

  it('renders error message', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" error="Selection required">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Selection required');
  });

  it('restores default value on formResetCallback', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `) as any;
    await waitForUpdate(el);

    // Change selection
    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();
    await waitForUpdate(el);
    expect(el.value).toBe('grid');

    // Reset
    el.formResetCallback();
    await waitForUpdate(el);
    expect(el.value).toBe('list');
  });

  it('sets correct position attributes on segments', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const segments = el.querySelectorAll('civ-segment');
    expect(segments[0].getAttribute('data-civ-segment-position')).toBe('first');
    expect(segments[1].getAttribute('data-civ-segment-position')).toBe('middle');
    expect(segments[2].getAttribute('data-civ-segment-position')).toBe('last');
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
    await waitForUpdate(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-change', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    // The event target should be the group, not the child
    const event = handler.mock.calls[0][0];
    expect(event.target).toBe(el);
  });

  it('fires analytics from group, no value in payload', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    `) as any;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const gridBtn = el.querySelectorAll('button[role="radio"]')[1] as HTMLButtonElement;
    gridBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-segmented-control');
    expect(detail).not.toHaveProperty('value');
    expect(detail.details).toBeUndefined();
  });

  it('legend is screen-reader only (civ-sr-only)', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.classList.contains('civ-sr-only')).toBe(true);
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = createFixture(`
      <civ-segmented-control legend="View" name="view" value="list">
        <civ-segment label="List" value="list"></civ-segment>
      </civ-segmented-control>
    `);
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });
});
