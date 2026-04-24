import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-radio.js';
import './civ-radio-group.js';

afterEach(cleanupFixtures);

describe('civ-radio-group rendering', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Favorite color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Favorite color');
  });

  it('renders hint text', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" hint="Pick your favorite">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Pick your favorite');
    expect(hintSpan).not.toBeNull();
  });

  it('renders error message with role="alert"', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" error="Please select a color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Please select a color');
  });

  it('shows required indicator text', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" required>
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });
});

describe('civ-radio-group accessibility', () => {
  it('has role="radiogroup" on fieldset', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('role')).toBe('radiogroup');
  });

  it('sets aria-orientation matching orientation property', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" orientation="horizontal">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('defaults aria-orientation to vertical', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('sets aria-invalid on fieldset when error is present', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" error="Required">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid on fieldset when no error', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBeNull();
  });

  it('sets aria-required on fieldset when required', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" required>
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });

  it('omits aria-required on fieldset when not required', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.hasAttribute('aria-required')).toBe(false);
  });

  it('applies focus-visible:civ-focus-ring on child radio inputs', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const input = el.querySelector('input[type="radio"]');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });
});

describe('civ-radio-group child syncing', () => {
  it('syncs name to child radios', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).name).toBe('color');
    }
  });

  it('syncs checked state from group value to children', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    const radios = el.querySelectorAll('civ-radio');
    expect((radios[0] as any).checked).toBe(false);
    expect((radios[1] as any).checked).toBe(true);
    expect((radios[2] as any).checked).toBe(false);
  });

  it('reads initial checked state from child with checked attribute', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue" checked></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    expect((el as any).value).toBe('blue');
  });

  it('syncs disabled state to child radios', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" disabled>
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).disabled).toBe(true);
    }
  });

  it('syncs required to child radios', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" required>
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).required).toBe(true);
    }
  });

  it('syncs tile variant to child radios', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" tile>
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).tile).toBe(true);
    }
  });

  it('syncs error to child radios', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" error="Select a color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).error).toBe('Select a color');
    }
  });
});

describe('civ-radio-group roving tabindex', () => {
  it('sets tabindex="0" on checked radio and tabindex="-1" on others', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    const inputs = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].tabIndex).toBe(-1);
    expect(inputs[1].tabIndex).toBe(0);
    expect(inputs[2].tabIndex).toBe(-1);
  });

  it('sets tabindex="0" on first radio when none checked', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const inputs = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].tabIndex).toBe(0);
    expect(inputs[1].tabIndex).toBe(-1);
  });
});

describe('civ-radio-group keyboard navigation', () => {
  it('ArrowDown moves to next radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('blue');
  });

  it('ArrowUp moves to previous radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('red');
  });

  it('wraps from last to first on ArrowDown', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="green">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('red');
  });

  it('wraps from first to last on ArrowUp', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('green');
  });

  it('Home moves to first radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="green">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('red');
  });

  it('End moves to last radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('green');
  });

  it('skips disabled radios during keyboard navigation', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue" disabled></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('green');
  });
});

describe('civ-radio-group events', () => {
  it('fires civ-change with { value: string } detail from group', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `;
    document.body.appendChild(wrapper);
    const el = wrapper.querySelector('civ-radio-group') as any;
    await elementUpdated(el);

    const handler = vi.fn();
    wrapper.addEventListener('civ-change', handler as EventListener);

    const radio = el.querySelector('civ-radio[value="red"]')!;
    const input = radio.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'red' });
  });

  it('fires civ-input with { value: string } detail on keyboard navigation', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    let eventDetail: any = null;
    el.addEventListener('civ-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect(eventDetail).toEqual({ value: 'blue' });
  });
});

describe('civ-radio-group orientation', () => {
  it('uses civ-group-layout--vertical by default', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const container = el.querySelector('.civ-group-layout--vertical');
    expect(container).not.toBeNull();
  });

  it('uses civ-group-layout--horizontal for horizontal orientation', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" orientation="horizontal">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const container = el.querySelector('.civ-group-layout--horizontal');
    expect(container).not.toBeNull();
  });
});

describe('civ-radio-group form association', () => {
  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-radio-group') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('restores initial value on formResetCallback', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    // Change value
    el.value = 'green';
    await elementUpdated(el);

    // Reset
    el.formResetCallback();
    await elementUpdated(el);

    expect(el.value).toBe('blue');
    const radios = el.querySelectorAll('civ-radio');
    expect((radios[1] as any).checked).toBe(true);
  });

  it('cascades disabled via formDisabledCallback', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).disabled).toBe(true);
    }
  });

  it('disables fieldset when disabled prop is set', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" disabled>
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
  });
});

describe('civ-radio-group analytics', () => {
  it('fires civ-analytics from group on child radio change', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const radio = el.querySelector('civ-radio')!;
    const input = radio.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const calls = handler.mock.calls.filter(
      (c: any) => c[0].detail.componentName === 'civ-radio-group',
    );
    expect(calls.length).toBe(1);
    expect(calls[0][0].detail.action).toBe('change');
  });

  it('never includes value in analytics payload', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const radio = el.querySelector('civ-radio')!;
    const input = radio.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    for (const call of handler.mock.calls) {
      expect(call[0].detail).not.toHaveProperty('value');
    }
  });
});

describe('civ-radio-group prefer-not-to-answer affordance', () => {
  it('renders a skip button only when skip-label is set', async () => {
    const without = await fixture(`
      <civ-radio-group legend="X" name="x">
        <civ-radio label="A" value="a"></civ-radio>
      </civ-radio-group>
    `);
    expect(without.querySelector('[data-civ-skip]')).toBeNull();

    const withSkip = await fixture(`
      <civ-radio-group legend="X" name="x" skip-label="Prefer not to answer">
        <civ-radio label="A" value="a"></civ-radio>
      </civ-radio-group>
    `);
    expect(withSkip.querySelector('[data-civ-skip]')).not.toBeNull();
  });

  it('sets value to skip-value when the skip button is clicked', async () => {
    const el = await fixture(`
      <civ-radio-group legend="X" name="x" skip-label="Prefer not to answer" skip-value="opt_out">
        <civ-radio label="A" value="a"></civ-radio>
        <civ-radio label="B" value="b"></civ-radio>
      </civ-radio-group>
    `) as any;
    await elementUpdated(el);

    let changeValue: string | null = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => { changeValue = e.detail.value; }) as EventListener);

    const skip = el.querySelector('[data-civ-skip]') as HTMLButtonElement;
    skip.click();
    await elementUpdated(el);

    expect(el.value).toBe('opt_out');
    expect(changeValue).toBe('opt_out');
    expect(skip.getAttribute('aria-pressed')).toBe('true');
  });

  it('clicking the skip button unchecks any selected radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="X" name="x" skip-label="Prefer not to answer" value="a">
        <civ-radio label="A" value="a"></civ-radio>
        <civ-radio label="B" value="b"></civ-radio>
      </civ-radio-group>
    `) as any;
    await elementUpdated(el);

    const skip = el.querySelector('[data-civ-skip]') as HTMLButtonElement;
    skip.click();
    await elementUpdated(el);

    const radios = el.querySelectorAll('civ-radio') as NodeListOf<any>;
    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(false);
  });

  it('moves role=radiogroup off the fieldset when skip is present', async () => {
    const el = await fixture(`
      <civ-radio-group legend="X" name="x" skip-label="Prefer not to answer">
        <civ-radio label="A" value="a"></civ-radio>
      </civ-radio-group>
    `);
    const fieldset = el.querySelector('fieldset')!;
    expect(fieldset.getAttribute('role')).toBeNull();
    const innerGroup = el.querySelector('[role="radiogroup"]');
    expect(innerGroup).not.toBeNull();
    expect(innerGroup!.tagName.toLowerCase()).toBe('div');
  });
});
