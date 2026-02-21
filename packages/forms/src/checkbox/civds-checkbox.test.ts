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
