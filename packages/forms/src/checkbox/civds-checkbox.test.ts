import { describe, it, expect, afterEach, vi } from 'vitest';
import './civds-checkbox.js';
import './civds-checkbox-group.js';

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
  // Also wait for any child custom elements
  const children = el.querySelectorAll('civds-checkbox, civds-checkbox-group');
  for (const child of children) {
    if ('updateComplete' in child) {
      await (child as any).updateComplete;
    }
  }
}

afterEach(cleanup);

describe('civds-checkbox', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civds-checkbox label="Agree to terms"></civds-checkbox>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Agree to terms');
  });

  it('renders a checkbox input', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
  });

  it('associates label with checkbox via for/id', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('reflects checked state', async () => {
    const el = createFixture('<civds-checkbox label="Agree" checked></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('defaults to unchecked', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('fires civds-change on click', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    let eventDetail: any = null;

    el.addEventListener('civds-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ checked: true, value: 'on' });
  });

  it('renders description text', async () => {
    const el = createFixture(
      '<civds-checkbox label="Agree" description="By checking this you agree to our terms"></civds-checkbox>',
    );
    await waitForUpdate(el);

    const desc = el.querySelector('span');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('By checking this');
  });

  it('renders tile variant with border', async () => {
    const el = createFixture('<civds-checkbox label="Option A" tile></civds-checkbox>');
    await waitForUpdate(el);

    const wrapper = el.querySelector('div > div');
    expect(wrapper).not.toBeNull();
    // Tile variant should have border classes on outer wrapper
    const outerDiv = el.querySelector('.civds-border');
    expect(outerDiv).not.toBeNull();
  });

  it('sets data-civds-tile on tile wrapper', async () => {
    const el = createFixture('<civds-checkbox label="Option A" tile></civds-checkbox>');
    await waitForUpdate(el);

    const wrapper = el.querySelector('[data-civds-tile]');
    expect(wrapper).not.toBeNull();
  });

  it('does not set data-civds-tile when not tile variant', async () => {
    const el = createFixture('<civds-checkbox label="Option A"></civds-checkbox>');
    await waitForUpdate(el);

    const wrapper = el.querySelector('[data-civds-tile]');
    expect(wrapper).toBeNull();
  });

  it('renders error message', async () => {
    const el = createFixture('<civds-checkbox label="Agree" error="You must agree"></civds-checkbox>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('You must agree');
  });

  it('renders disabled state', async () => {
    const el = createFixture('<civds-checkbox label="Agree" disabled></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('shows required indicator', async () => {
    const el = createFixture('<civds-checkbox label="Agree" required></civds-checkbox>');
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('defaults value to "on"', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree"></civds-checkbox>') as any;
    await waitForUpdate(el);

    expect(el.value).toBe('on');
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-checkbox') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

describe('civds-checkbox-group', () => {
  it('renders with a legend', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Toppings">
        <civds-checkbox label="Cheese" name="toppings" value="cheese"></civds-checkbox>
        <civds-checkbox label="Pepperoni" name="toppings" value="pepperoni"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Toppings');
  });

  it('wraps children in a fieldset', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Toppings">
        <civds-checkbox label="Cheese"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
  });

  it('renders group error', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Toppings" error="Select at least one">
        <civds-checkbox label="Cheese"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Select at least one');
  });

  it('renders group hint', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Toppings" hint="Choose your favorites">
        <civds-checkbox label="Cheese"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Choose your favorites');
    expect(hintSpan).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options">
        <civds-checkbox label="A"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });
});

describe('civds-checkbox accessibility', () => {
  it('sets aria-invalid when error is present', async () => {
    const el = createFixture('<civds-checkbox label="Agree" error="Must agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid to false when no error', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civds-checkbox label="Agree" required></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('includes description in aria-describedby', async () => {
    const el = createFixture(
      '<civds-checkbox label="Agree" description="By checking this you agree"></civds-checkbox>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descSpan = el.querySelector('span[id]');
    expect(descSpan).not.toBeNull();
    expect(describedBy).toContain(descSpan!.id);
  });

  it('includes both description and error in aria-describedby', async () => {
    const el = createFixture(
      '<civds-checkbox label="Agree" description="Terms" error="Required"></civds-checkbox>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    expect(ids.length).toBe(2);

    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});

describe('civds-checkbox-group form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civds-checkbox-group') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('syncs name to children', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts">
        <civds-checkbox label="A" value="a"></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const checkboxes = el.querySelectorAll('civds-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.name).toBe('opts');
    });
  });

  it('syncs disabled to children', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts" disabled>
        <civds-checkbox label="A" value="a"></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const checkboxes = el.querySelectorAll('civds-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.disabled).toBe(true);
    });
  });

  it('syncs tile to children', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts" tile>
        <civds-checkbox label="A" value="a"></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const checkboxes = el.querySelectorAll('civds-checkbox');
    checkboxes.forEach((cb: any) => {
      expect(cb.tile).toBe(true);
    });
  });

  it('tracks checked values via getCheckedValues()', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts">
        <civds-checkbox label="A" value="a" checked></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
        <civds-checkbox label="C" value="c" checked></civds-checkbox>
      </civds-checkbox-group>
    `) as any;
    await waitForUpdate(el);

    expect(el.getCheckedValues()).toEqual(['a', 'c']);
  });

  it('updates value on child change', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts">
        <civds-checkbox label="A" value="a"></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `) as any;
    await waitForUpdate(el);

    // Simulate checking child checkbox
    const cbA = el.querySelector('civds-checkbox[value="a"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForUpdate(el);

    expect(el.getCheckedValues()).toContain('a');
  });

  it('re-dispatches civds-change from group', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civds-checkbox-group legend="Options" name="opts">
        <civds-checkbox label="A" value="a"></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civds-checkbox-group') as any;
    await waitForUpdate(el);

    const handler = vi.fn();
    // Listen on the wrapper so we only see events that bubble past the group
    wrapper.addEventListener('civds-change', handler as EventListener);

    const cbA = el.querySelector('civds-checkbox[value="a"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.values).toContain('a');
  });

  it('sets disabled on fieldset', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" disabled>
        <civds-checkbox label="A" value="a"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
  });

  it('restores default values on formResetCallback', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts">
        <civds-checkbox label="A" value="a" checked></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `) as any;
    await waitForUpdate(el);

    // Change state
    const cbB = el.querySelector('civds-checkbox[value="b"]') as any;
    const inputB = cbB.querySelector('input') as HTMLInputElement;
    inputB.checked = true;
    inputB.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForUpdate(el);

    expect(el.getCheckedValues()).toContain('b');

    // Reset
    el.formResetCallback();
    await waitForUpdate(el);

    expect(el.getCheckedValues()).toEqual(['a']);
  });

  it('fires civds-analytics from group, never includes value in payload', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" name="opts">
        <civds-checkbox label="A" value="a"></civds-checkbox>
      </civds-checkbox-group>
    `) as any;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civds-analytics', handler as EventListener);

    const cbA = el.querySelector('civds-checkbox[value="a"]') as any;
    const inputA = cbA.querySelector('input') as HTMLInputElement;
    inputA.checked = true;
    inputA.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civds-checkbox-group');
    expect(detail).not.toHaveProperty('value');
    expect(detail.details).toBeUndefined();
  });
});

describe('civds-checkbox-group orientation', () => {
  it('applies vertical classes by default', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options">
        <civds-checkbox label="A" value="a"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const container = el.querySelector('.civds-flex-col');
    expect(container).not.toBeNull();
  });

  it('applies horizontal classes when orientation is horizontal', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" orientation="horizontal">
        <civds-checkbox label="A" value="a"></civds-checkbox>
        <civds-checkbox label="B" value="b"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const container = el.querySelector('.civds-flex-row');
    expect(container).not.toBeNull();
    expect(container!.classList.contains('civds-flex-wrap')).toBe(true);
    expect(container!.classList.contains('civds-gap-4')).toBe(true);
  });

  it('sets aria-required on fieldset when required', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Options" required>
        <civds-checkbox label="A" value="a"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });
});

describe('civds-checkbox-group accessibility', () => {
  it('sets aria-invalid on fieldset when error is present', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Toppings" error="Required">
        <civds-checkbox label="Cheese"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid to false on fieldset when no error', async () => {
    const el = createFixture(`
      <civds-checkbox-group legend="Toppings">
        <civds-checkbox label="Cheese"></civds-checkbox>
      </civds-checkbox-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('false');
  });

  it('applies focus-visible ring class to checkbox input', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="checkbox"]');
    expect(input!.className).toContain('focus-visible:civds-focus-ring');
  });

  it('does not use deprecated focus: outline classes on checkbox', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="checkbox"]');
    expect(input!.className).not.toContain('focus:civds-outline-2');
    expect(input!.className).not.toContain('focus:civds-outline-primary');
    expect(input!.className).not.toContain('focus:civds-outline-offset-0');
  });
});

describe('civds-checkbox indeterminate', () => {
  it('sets indeterminate on native input', async () => {
    const el = createFixture('<civds-checkbox label="Select all" indeterminate></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it('sets aria-checked to mixed when indeterminate', async () => {
    const el = createFixture('<civds-checkbox label="Select all" indeterminate></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });

  it('clears indeterminate on user interaction', async () => {
    const el = createFixture('<civds-checkbox label="Select all" indeterminate></civds-checkbox>') as any;
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await waitForUpdate(el);

    expect(el.indeterminate).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('applies tile active styling when indeterminate', async () => {
    const el = createFixture('<civds-checkbox label="Option" tile indeterminate></civds-checkbox>');
    await waitForUpdate(el);

    const wrapper = el.querySelector('.civds-border-primary');
    expect(wrapper).not.toBeNull();
  });
});

describe('civds-checkbox aria-checked', () => {
  it('sets aria-checked to true when checked', async () => {
    const el = createFixture('<civds-checkbox label="Agree" checked></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked to false when unchecked', async () => {
    const el = createFixture('<civds-checkbox label="Agree"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-checked')).toBe('false');
  });
});

describe('civds-checkbox hint', () => {
  it('renders hint text visually', async () => {
    const el = createFixture('<civds-checkbox label="Agree" hint="This is a helpful hint"></civds-checkbox>');
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'This is a helpful hint');
    expect(hintSpan).not.toBeNull();
  });

  it('includes hint in aria-describedby', async () => {
    const el = createFixture('<civds-checkbox label="Agree" hint="Helpful hint"></civds-checkbox>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby')!;
    expect(describedBy).toBeTruthy();

    const hintEl = el.querySelector(`#${describedBy}`);
    expect(hintEl).not.toBeNull();
    expect(hintEl!.textContent).toBe('Helpful hint');
  });

  it('includes description, hint, and error in aria-describedby', async () => {
    const el = createFixture(
      '<civds-checkbox label="Agree" description="Desc" hint="Hint" error="Error"></civds-checkbox>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    expect(ids.length).toBe(3);

    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});

describe('civds-checkbox civds-input event', () => {
  it('fires civds-input event on change', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree"></civds-checkbox>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civds-input', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).toEqual({ checked: true, value: 'on' });
  });
});

describe('civds-checkbox formResetCallback', () => {
  it('resets to defaultChecked on formResetCallback', async () => {
    const el = createFixture('<civds-checkbox label="Agree" checked></civds-checkbox>') as any;
    await waitForUpdate(el);

    // Uncheck it
    el.checked = false;
    await waitForUpdate(el);
    expect(el.checked).toBe(false);

    // Reset should restore to initially checked
    el.formResetCallback();
    await waitForUpdate(el);
    expect(el.checked).toBe(true);
  });

  it('clears indeterminate on formResetCallback', async () => {
    const el = createFixture('<civds-checkbox label="Select all" indeterminate></civds-checkbox>') as any;
    await waitForUpdate(el);

    el.formResetCallback();
    await waitForUpdate(el);
    expect(el.indeterminate).toBe(false);
  });
});

describe('civds-checkbox analytics', () => {
  it('fires civds-analytics with checked detail on change', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree"></civds-checkbox>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civds-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civds-checkbox');
    expect(detail.action).toBe('change');
    expect(detail.details).toEqual({ checked: true });
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree" disable-analytics></civds-checkbox>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civds-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('never includes value in analytics payload', async () => {
    const el = createFixture('<civds-checkbox label="Agree" name="agree"></civds-checkbox>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civds-analytics', handler as EventListener);

    const input = el.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const detail = handler.mock.calls[0][0].detail;
    expect(detail).not.toHaveProperty('value');
  });
});
