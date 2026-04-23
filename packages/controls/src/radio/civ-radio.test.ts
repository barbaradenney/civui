import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-radio.js';
import './civ-radio-group.js';

afterEach(cleanupFixtures);

describe('civ-radio', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Option A');
  });

  it('renders a radio input', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');

    const input = el.querySelector('input[type="radio"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('choice');
  });

  it('associates label with radio via for/id', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('reflects checked state', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" checked></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('defaults to unchecked', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('fires civ-change when selected', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    let eventDetail: any = null;

    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'a' });
  });

  it('renders description text', async () => {
    const el = await fixture(
      '<civ-radio label="Option A" value="a" description="This is option A"></civ-radio>',
    );

    const desc = el.querySelector('.civ-check-description');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('This is option A');
  });

  it('renders tile variant', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" tile></civ-radio>');

    const tile = el.querySelector('.civ-check-tile');
    expect(tile).not.toBeNull();
  });

  it('sets data-civ-tile on tile wrapper', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" tile></civ-radio>');

    const wrapper = el.querySelector('[data-civ-tile]');
    expect(wrapper).not.toBeNull();
  });

  it('does not set data-civ-tile when not tile variant', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const wrapper = el.querySelector('[data-civ-tile]');
    expect(wrapper).toBeNull();
  });

  it('renders disabled state', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" disabled></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('applies focus-visible ring class to radio input', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const input = el.querySelector('input[type="radio"]');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes on radio', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const input = el.querySelector('input[type="radio"]');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});

describe('civ-radio-group', () => {
  it('renders with a legend', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Color');
  });

  it('wraps children in a fieldset', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
  });

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

  it('renders group error', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" error="Please select a color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Please select a color');
  });

  it('renders group hint', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" hint="Pick your favorite">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Pick your favorite');
    expect(hintSpan).not.toBeNull();
  });

  it('shows required indicator', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" required>
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
    expect(requiredMark!.textContent).toContain('required');
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-radio-group') as any;
    expect(Ctor.formAssociated).toBe(true);
  });
});

describe('civ-radio accessibility', () => {
  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" error="Required"></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('omits aria-invalid when no error', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('includes description in aria-describedby', async () => {
    const el = await fixture(
      '<civ-radio label="Option A" value="a" description="This is option A"></civ-radio>',
    );

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descSpan = el.querySelector('span[id]');
    expect(descSpan).not.toBeNull();
    expect(describedBy).toContain(descSpan!.id);
  });

  it('does not include error in aria-describedby (error handled by group)', async () => {
    const el = await fixture(
      '<civ-radio label="Option A" value="a" description="Details" error="Required"></civ-radio>',
    );

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby')!;
    // Only description ID, no error ID (error is displayed by the radio-group)
    const ids = describedBy.split(' ');
    expect(ids.length).toBe(1);
    expect(el.querySelector(`#${ids[0]}`)).not.toBeNull();
  });
});

describe('civ-radio-group accessibility', () => {
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
});

describe('civ-radio analytics', () => {
  it('fires civ-analytics when radio selected', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-radio');
    expect(detail.action).toBe('change');
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" name="choice" disable-analytics></civ-radio>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
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
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('blue');
  });

  it('ArrowRight moves to next radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('blue');
  });

  it('ArrowUp moves to previous radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('red');
  });

  it('ArrowLeft moves to previous radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('red');
  });

  it('wraps from last to first on ArrowDown', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="green">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('red');
  });

  it('wraps from first to last on ArrowUp', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('green');
  });

  it('Home moves to first radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="green">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('red');
  });

  it('End moves to last radio', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('green');
  });

  it('skips disabled radios', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue" disabled></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    expect((el as any).value).toBe('green');
  });
});

describe('civ-radio-group ARIA attributes', () => {
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
});

describe('civ-radio aria-checked', () => {
  it('omits aria-checked (native radio conveys checked state)', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" checked></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('aria-checked')).toBe(false);
    expect(input.checked).toBe(true);
  });

  it('omits aria-checked when unchecked (native radio conveys state)', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a"></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('aria-checked')).toBe(false);
    expect(input.checked).toBe(false);
  });
});

describe('civ-radio-group orientation rendering', () => {
  it('uses civ-group-layout--horizontal for horizontal orientation', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" orientation="horizontal">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const slotWrapper = el.querySelector('fieldset > div');
    expect(slotWrapper!.className).toContain('civ-group-layout--horizontal');
  });

  it('uses civ-group-layout--vertical for vertical orientation', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);

    const slotWrapper = el.querySelector('fieldset > div');
    expect(slotWrapper!.className).toContain('civ-group-layout--vertical');
  });
});

describe('civ-radio civ-input event', () => {
  it('fires civ-input from individual radio', async () => {
    const el = await fixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');

    const input = el.querySelector('input') as HTMLInputElement;
    let eventDetail: any = null;

    el.addEventListener('civ-input', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(eventDetail).toEqual({ value: 'a' });
  });

  it('fires civ-input from group on keyboard navigation', async () => {
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

describe('civ-radio-group form reset', () => {
  it('restores initial value on form reset', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    // Change value
    (el as any).value = 'green';
    await elementUpdated(el);

    // Reset
    (el as any).formResetCallback();
    await elementUpdated(el);

    expect((el as any).value).toBe('blue');
    const radios = el.querySelectorAll('civ-radio');
    expect((radios[1] as any).checked).toBe(true);
  });
});

describe('civ-radio-group RTL keyboard navigation', () => {
  it('ArrowRight moves backward in RTL', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="blue" dir="rtl">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('red');
  });

  it('ArrowLeft moves forward in RTL', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color" value="red" dir="rtl">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `) as any;

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('blue');
  });
});

describe('civ-radio-group initial checked from children', () => {
  it('reads initial value from child with checked attribute', async () => {
    const el = await fixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue" checked></civ-radio>
        <civ-radio label="Green" value="green"></civ-radio>
      </civ-radio-group>
    `);

    expect((el as any).value).toBe('blue');

    const radios = el.querySelectorAll('civ-radio');
    expect((radios[0] as any).checked).toBe(false);
    expect((radios[1] as any).checked).toBe(true);
    expect((radios[2] as any).checked).toBe(false);
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

    // Should get group analytics, not individual radio (child suppressed)
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
