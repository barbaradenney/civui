import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-checkbox.js';
import './civ-checkbox-group.js';

afterEach(cleanupFixtures);

describe('civ-checkbox', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-checkbox label="Agree to terms"></civ-checkbox>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Agree to terms');
  });

  it('renders a checkbox input', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');

    const input = el.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
  });

  it('associates label with checkbox via for/id', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('reflects checked state', async () => {
    const el = await fixture('<civ-checkbox label="Agree" checked></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('defaults to unchecked', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('fires civ-change on click', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    let eventDetail: any = null;

    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ checked: true, value: 'on' });
  });

  it('renders description text', async () => {
    const el = await fixture(
      '<civ-checkbox label="Agree" description="By checking this you agree to our terms"></civ-checkbox>',
    );

    const desc = el.querySelector('.civ-check-description');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('By checking this');
  });

  it('renders tile variant with border by default', async () => {
    const el = await fixture('<civ-checkbox label="Option A"></civ-checkbox>');

    // Tile variant should have civ-check-tile class on outer wrapper
    const outerDiv = el.querySelector('.civ-check-tile');
    expect(outerDiv).not.toBeNull();
  });

  it('sets data-civ-tile on tile wrapper by default', async () => {
    const el = await fixture('<civ-checkbox label="Option A"></civ-checkbox>');

    const wrapper = el.querySelector('[data-civ-tile]');
    expect(wrapper).not.toBeNull();
  });

  it('does not set data-civ-tile when tile is disabled', async () => {
    const el = await fixture('<civ-checkbox label="Option A"></civ-checkbox>') as any;
    el.tile = false;
    await elementUpdated(el);

    const wrapper = el.querySelector('[data-civ-tile]');
    expect(wrapper).toBeNull();
  });

  it('stores error property', async () => {
    const el = await fixture('<civ-checkbox label="Agree" error="You must agree"></civ-checkbox>') as any;

    expect(el.error).toBe('You must agree');
  });

  it('renders the error above the tile, not inside the label', async () => {
    const el = await fixture('<civ-checkbox label="Agree" error="You must agree"></civ-checkbox>');

    const errorEl = el.querySelector('[role="alert"]');
    const tile = el.querySelector('.civ-check-tile');
    expect(errorEl).not.toBeNull();
    expect(tile).not.toBeNull();
    // Error must appear before the tile in document order so screen-reader
    // and sighted users meet it before the control.
    expect(errorEl!.compareDocumentPosition(tile!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Error must not live inside the label span anymore.
    expect(el.querySelector('.civ-check-label [role="alert"]')).toBeNull();
  });

  it('renders disabled state', async () => {
    const el = await fixture('<civ-checkbox label="Agree" disabled></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-checkbox label="Agree" required></civ-checkbox>');

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('defaults value to "on"', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>') as any;

    expect(el.value).toBe('on');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-checkbox') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

describe('civ-checkbox-group', () => {
  it('renders layout container', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Toppings">
        <civ-checkbox label="Cheese" name="toppings" value="cheese"></civ-checkbox>
        <civ-checkbox label="Pepperoni" name="toppings" value="pepperoni"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const layout = el.querySelector('.civ-group-layout--vertical');
    expect(layout).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options">
        <civ-checkbox label="A"></civ-checkbox>
      </civ-checkbox-group>
    `);

    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-checkbox accessibility', () => {
  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-checkbox label="Agree" error="Must agree"></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid when no error', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('sets native required on the inner input', async () => {
    const el = await fixture('<civ-checkbox label="Agree" required></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('includes description in aria-describedby', async () => {
    const el = await fixture(
      '<civ-checkbox label="Agree" description="By checking this you agree"></civ-checkbox>',
    );

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descSpan = el.querySelector('span[id]');
    expect(descSpan).not.toBeNull();
    expect(describedBy).toContain(descSpan!.id);
  });

});

describe('civ-checkbox-group form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-checkbox-group') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('syncs name to children', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.name).toBe('opts');
    });
  });

  it('syncs disabled to children', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts" disabled>
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.disabled).toBe(true);
    });
  });

  it('syncs tile to children', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.tile).toBe(true);
    });
  });

  it('tracks checked values via getCheckedValues()', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a" checked></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
        <civ-checkbox label="C" value="c" checked></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    expect(el.getCheckedValues()).toEqual(['a', 'c']);
  });

  it('updates value on child change', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    // Simulate checking child checkbox
    const cbA = el.querySelector('civ-checkbox[value="a"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);

    expect(el.getCheckedValues()).toContain('a');
  });

  it('re-dispatches civ-change from group', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-checkbox-group') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    // Listen on the wrapper so we only see events that bubble past the group
    wrapper.addEventListener('civ-change', handler as EventListener);

    const cbA = el.querySelector('civ-checkbox[value="a"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.values).toContain('a');
  });

  it('syncs disabled to children when disabled', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" disabled>
        <civ-checkbox label="A" value="a"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const checkboxes = el.querySelectorAll('civ-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.disabled).toBe(true);
    });
  });

  it('restores default values on formResetCallback', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a" checked></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    // Change state
    const cbB = el.querySelector('civ-checkbox[value="b"]') as any;
    const inputB = cbB.querySelector('input') as HTMLInputElement;
    inputB.checked = true;
    inputB.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);

    expect(el.getCheckedValues()).toContain('b');

    // Reset
    el.formResetCallback();
    await elementUpdated(el);

    expect(el.getCheckedValues()).toEqual(['a']);
  });

  it('fires civ-analytics from group, never includes value in payload', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" name="opts">
        <civ-checkbox label="A" value="a"></civ-checkbox>
      </civ-checkbox-group>
    `) as any;

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const cbA = el.querySelector('civ-checkbox[value="a"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-checkbox-group');
    expect(detail).not.toHaveProperty('value');
    expect(detail.details).toBeUndefined();
  });
});

describe('civ-checkbox-group orientation', () => {
  it('applies civ-group-layout--vertical by default', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options">
        <civ-checkbox label="A" value="a"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const container = el.querySelector('.civ-group-layout--vertical');
    expect(container).not.toBeNull();
  });

  it('applies civ-group-layout--horizontal when orientation is horizontal', async () => {
    const el = await fixture(`
      <civ-checkbox-group legend="Options" orientation="horizontal">
        <civ-checkbox label="A" value="a"></civ-checkbox>
        <civ-checkbox label="B" value="b"></civ-checkbox>
      </civ-checkbox-group>
    `);

    const container = el.querySelector('.civ-group-layout--horizontal');
    expect(container).not.toBeNull();
  });
});

describe('civ-checkbox-group accessibility', () => {
  it('renders the checkbox as a real <input> so the global focus ring applies', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    const input = el.querySelector('input[type="checkbox"]')!;
    expect(input.tagName).toBe('INPUT');
    expect(input.className).toContain('civ-check-input');
  });

  it('does not use deprecated focus: outline classes on checkbox', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    const input = el.querySelector('input[type="checkbox"]');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});

describe('civ-checkbox indeterminate', () => {
  it('sets indeterminate on native input', async () => {
    const el = await fixture('<civ-checkbox label="Select all" indeterminate></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it('exposes indeterminate state without redundant aria-checked', async () => {
    const el = await fixture('<civ-checkbox label="Select all" indeterminate></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    // Native checkbox conveys mixed state via the indeterminate DOM property.
    // aria-checked="mixed" on a native input is redundant and confuses some screen readers.
    expect(input.indeterminate).toBe(true);
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });

  it('clears indeterminate on user interaction', async () => {
    const el = await fixture('<civ-checkbox label="Select all" indeterminate></civ-checkbox>') as any;

    const input = el.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(el);

    expect(el.indeterminate).toBe(false);
    // aria-checked only emitted for indeterminate/mixed; native checked state suffices
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });

  it('applies tile class and indeterminate state', async () => {
    const el = await fixture('<civ-checkbox label="Option" indeterminate></civ-checkbox>');

    const tile = el.querySelector('.civ-check-tile');
    expect(tile).not.toBeNull();

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });
});

describe('civ-checkbox aria-checked', () => {
  it('omits aria-checked when checked (native checkbox conveys state)', async () => {
    const el = await fixture('<civ-checkbox label="Agree" checked></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('aria-checked')).toBe(false);
    expect(input.checked).toBe(true);
  });

  it('omits aria-checked when unchecked (native checkbox conveys state)', async () => {
    const el = await fixture('<civ-checkbox label="Agree"></civ-checkbox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('aria-checked')).toBe(false);
    expect(input.checked).toBe(false);
  });
});

describe('civ-checkbox description', () => {
  it('links description element via aria-describedby', async () => {
    const el = await fixture(
      '<civ-checkbox label="Agree" description="Desc text"></civ-checkbox>',
    );

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby')!;
    expect(describedBy).toBeTruthy();

    const descEl = el.querySelector(`#${describedBy}`);
    expect(descEl).not.toBeNull();
    expect(descEl!.textContent).toBe('Desc text');
  });
});

describe('civ-checkbox civ-input event', () => {
  it('fires civ-input event on change', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');

    const handler = vi.fn();
    el.addEventListener('civ-input', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).toEqual({ checked: true, value: 'on' });
  });
});

describe('civ-checkbox formResetCallback', () => {
  it('resets to defaultChecked on formResetCallback', async () => {
    const el = await fixture('<civ-checkbox label="Agree" checked></civ-checkbox>') as any;

    // Uncheck it
    el.checked = false;
    await elementUpdated(el);
    expect(el.checked).toBe(false);

    // Reset should restore to initially checked
    el.formResetCallback();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
  });

  it('clears indeterminate on formResetCallback', async () => {
    const el = await fixture('<civ-checkbox label="Select all" indeterminate></civ-checkbox>') as any;

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.indeterminate).toBe(false);
  });
});

describe('civ-checkbox analytics', () => {
  it('fires civ-analytics with checked detail on change', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-checkbox');
    expect(detail.action).toBe('change');
    expect(detail.details).toEqual({ checked: true });
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree" disable-analytics></civ-checkbox>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('never includes value in analytics payload', async () => {
    const el = await fixture('<civ-checkbox label="Agree" name="agree"></civ-checkbox>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
  });
});
