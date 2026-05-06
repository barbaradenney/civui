import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-checkbox.js';
import './civ-checkbox-group.js';

afterEach(cleanupFixtures);

describe('civ-checkbox-group rendering', () => {
  it('renders a layout container', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const layout = el.querySelector('.civ-group-layout--vertical');
    expect(layout).not.toBeNull();
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-checkbox-group accessibility', () => {
  it('applies focus-visible:civ-focus-ring on child checkbox inputs', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const input = el.querySelector('input[type="checkbox"]');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes on child checkboxes', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const input = el.querySelector('input[type="checkbox"]');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
  });
});

describe('civ-checkbox-group child syncing', () => {
  it('syncs name to child checkboxes', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.name).toBe('toppings');
    });
  });

  it('syncs disabled state to child checkboxes', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings" disabled>
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.disabled).toBe(true);
    });
  });

  it('syncs tile variant to child checkboxes', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.tile).toBe(true);
    });
  });

  it('syncs checked state from group value to children', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings" value="cheese,pepperoni">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
        <civ-checkbox label="Mushroom" value="mushroom"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    expect((checkboxes[0] as any).checked).toBe(true);
    expect((checkboxes[1] as any).checked).toBe(true);
    expect((checkboxes[2] as any).checked).toBe(false);
  });

  it('reads initial checked state from children when no group value set', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese" checked></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
        <civ-checkbox label="Mushroom" value="mushroom" checked></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    expect(el.getCheckedValues()).toEqual(['cheese', 'mushroom']);
  });
});

describe('civ-checkbox-group orientation', () => {
  it('applies civ-group-layout--vertical by default', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const container = el.querySelector('.civ-group-layout--vertical');
    expect(container).not.toBeNull();
  });

  it('applies civ-group-layout--horizontal when orientation is horizontal', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" orientation="horizontal">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const container = el.querySelector('.civ-group-layout--horizontal');
    expect(container).not.toBeNull();
  });
});

describe('civ-checkbox-group variant', () => {
  it('auto resolves to card (no civ-group-list) for ≤4 options', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
        <civ-checkbox label="Mushrooms" value="mushrooms"></civ-checkbox>
        <civ-checkbox label="Olives" value="olives"></civ-checkbox>
      </civ-checkbox-group>
    `);

    expect(el.querySelector('.civ-group-list')).toBeNull();
  });

  it('auto resolves to list (civ-group-list applied) for >4 options', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
        <civ-checkbox label="Mushrooms" value="mushrooms"></civ-checkbox>
        <civ-checkbox label="Olives" value="olives"></civ-checkbox>
        <civ-checkbox label="Onions" value="onions"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const container = el.querySelector('.civ-group-layout--vertical.civ-group-list');
    expect(container).not.toBeNull();
  });

  it('explicit variant=card stays card even for >4 options', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" variant="card">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
        <civ-checkbox label="Mushrooms" value="mushrooms"></civ-checkbox>
        <civ-checkbox label="Olives" value="olives"></civ-checkbox>
        <civ-checkbox label="Onions" value="onions"></civ-checkbox>
      </civ-checkbox-group>
    `);

    expect(el.querySelector('.civ-group-list')).toBeNull();
  });

  it('applies civ-group-list when variant is list and orientation is vertical', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" variant="list">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const container = el.querySelector('.civ-group-layout--vertical.civ-group-list');
    expect(container).not.toBeNull();
  });

  it('does not apply civ-group-list when orientation is horizontal even with variant=list', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" variant="list" orientation="horizontal">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    expect(el.querySelector('.civ-group-list')).toBeNull();
  });
});

describe('civ-checkbox-group form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-checkbox-group') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('syncs disabled to children when disabled prop is set', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" disabled>
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.disabled).toBe(true);
    });
  });

  it('cascades disabled via formDisabledCallback', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.disabled).toBe(true);
    });
  });

  it('restores default values on formResetCallback', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese" checked></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    // Change state by checking another checkbox
    const cbB = el.querySelector('civ-checkbox[value="pepperoni"]') as any;
    const inputB = cbB.querySelector('input') as HTMLInputElement;
    inputB.checked = true;
    inputB.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);

    expect(el.getCheckedValues()).toContain('pepperoni');

    // Reset
    el.formResetCallback();
    await elementUpdated(el);

    expect(el.getCheckedValues()).toEqual(['cheese']);
  });
});

describe('civ-checkbox-group events', () => {
  it('fires civ-change with { values: string[] } detail on child change', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-checkbox-group') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-change', handler as EventListener);

    const cbA = el.querySelector('civ-checkbox[value="cheese"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.values).toContain('cheese');
    expect(Array.isArray(detail.values)).toBe(true);
  });

  it('fires civ-input with { values: string[] } detail on child change', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-checkbox-group') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-input', handler as EventListener);

    const cbA = el.querySelector('civ-checkbox[value="cheese"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.values).toContain('cheese');
  });

  it('updates value property when child checkbox is toggled', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    const cbA = el.querySelector('civ-checkbox[value="cheese"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);

    expect(el.getCheckedValues()).toContain('cheese');
  });
});

describe('civ-checkbox-group analytics', () => {
  it('fires civ-analytics from group on child change', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const cbA = el.querySelector('civ-checkbox[value="cheese"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-checkbox-group');
    expect(detail.action).toBe('change');
  });

  it('never includes value in analytics payload', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const cbA = el.querySelector('civ-checkbox[value="cheese"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
    expect(detail.details).toBeUndefined();
  });
});

describe('civ-checkbox-group minSelections', () => {
  afterEach(cleanupFixtures);

  it('reports invalid when checked count is below the minimum', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="t" min-selections="2">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
        <civ-checkbox label="C" value="c"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;
    el.value = 'a';
    await elementUpdated(el);

    expect(el.checkValidity()).toBe(false);
    expect(el.validity.valueMissing).toBe(true);
    expect(el.validationMessage).toContain('at least 2');
  });

  it('reports valid once the minimum is met', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="t" min-selections="2">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;
    el.value = 'a,b';
    await elementUpdated(el);

    expect(el.checkValidity()).toBe(true);
  });

  it('treats min-selections="0" as unset (not required)', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="t" min-selections="0">
        <civ-checkbox label="A" value="a"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;
    await elementUpdated(el);

    expect(el.checkValidity()).toBe(true);
    expect(el.querySelector('.civ-required-mark')).toBeNull();
  });

  it('still errors when explicit required is set with no selections', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="t" required>
        <civ-checkbox label="A" value="a"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;
    await elementUpdated(el);
    expect(el.checkValidity()).toBe(false);
  });
});
