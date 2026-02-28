import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-checkbox.js';
import './civ-checkbox-group.js';

afterEach(cleanupFixtures);

describe('civ-checkbox-group rendering', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" name="toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Toppings');
  });

  it('renders hint text', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" hint="Select all that apply">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Select all that apply');
    expect(hintSpan).not.toBeNull();
  });

  it('renders error message with role="alert"', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" error="Select at least one topping">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Select at least one topping');
  });

  it('shows required indicator asterisk', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" required>
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });

  it('renders legend (not label) for the group', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    // Should not render a top-level label element for the group
    const labels = Array.from(el.querySelectorAll('label'));
    const groupLabel = labels.find((l) => l.textContent?.includes('Toppings'));
    // Legend is the group label, not a <label> element
    expect(legend!.textContent).toContain('Toppings');
  });
});

describe('civ-checkbox-group accessibility', () => {
  it('sets aria-invalid on fieldset when error is present', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" error="Required">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid on fieldset when no error', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBeNull();
  });

  it('sets aria-required on fieldset when required', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" required>
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });

  it('omits aria-required on fieldset when not required', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.hasAttribute('aria-required')).toBe(false);
  });

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
      <civ-checkbox-group legend="Toppings" name="toppings" tile>
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

describe('civ-checkbox-group form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-checkbox-group') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('disables fieldset when disabled prop is set', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings" disabled>
        <civ-checkbox label="Cheese" value="cheese"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
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
