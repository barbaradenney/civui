import { describe, it, expect, afterEach, vi } from 'vitest';
import './civ-radio.js';
import './civ-radio-group.js';

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
  const children = el.querySelectorAll('civ-radio, civ-radio-group');
  for (const child of children) {
    if ('updateComplete' in child) {
      await (child as any).updateComplete;
    }
  }
}

afterEach(cleanup);

describe('civ-radio', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Option A');
  });

  it('renders a radio input', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="radio"]');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).name).toBe('choice');
  });

  it('associates label with radio via for/id', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    const input = el.querySelector('input');
    expect(label!.getAttribute('for')).toBe(input!.id);
  });

  it('reflects checked state', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" checked></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('defaults to unchecked', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('fires civ-change when selected', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');
    await waitForUpdate(el);

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
    const el = createFixture(
      '<civ-radio label="Option A" value="a" description="This is option A"></civ-radio>',
    );
    await waitForUpdate(el);

    const desc = el.querySelector('span');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('This is option A');
  });

  it('renders tile variant', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" tile></civ-radio>');
    await waitForUpdate(el);

    const border = el.querySelector('.civ-border');
    expect(border).not.toBeNull();
  });

  it('sets data-civ-tile on tile wrapper', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" tile></civ-radio>');
    await waitForUpdate(el);

    const wrapper = el.querySelector('[data-civ-tile]');
    expect(wrapper).not.toBeNull();
  });

  it('does not set data-civ-tile when not tile variant', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const wrapper = el.querySelector('[data-civ-tile]');
    expect(wrapper).toBeNull();
  });

  it('renders disabled state', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" disabled></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('applies focus-visible ring class to radio input', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="radio"]');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('does not use deprecated focus: outline classes on radio', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input[type="radio"]');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });
});

describe('civ-radio-group', () => {
  it('renders with a legend', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const legend = el.querySelector('legend');
    expect(legend).not.toBeNull();
    expect(legend!.textContent).toContain('Color');
  });

  it('wraps children in a fieldset', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
  });

  it('syncs name to child radios', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const radios = el.querySelectorAll('civ-radio');
    for (const radio of radios) {
      expect((radio as any).name).toBe('color');
    }
  });

  it('renders group error', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color" error="Please select a color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('Please select a color');
  });

  it('renders group hint', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color" hint="Pick your favorite">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Pick your favorite');
    expect(hintSpan).not.toBeNull();
  });

  it('shows required indicator', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color" required>
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const abbr = el.querySelector('abbr');
    expect(abbr).not.toBeNull();
    expect(abbr!.textContent).toBe('*');
  });

  it('uses Light DOM', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

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
    const el = createFixture('<civ-radio label="Option A" value="a" error="Required"></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid to false when no error', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a"></civ-radio>');
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('includes description in aria-describedby', async () => {
    const el = createFixture(
      '<civ-radio label="Option A" value="a" description="This is option A"></civ-radio>',
    );
    await waitForUpdate(el);

    const input = el.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descSpan = el.querySelector('span[id]');
    expect(descSpan).not.toBeNull();
    expect(describedBy).toContain(descSpan!.id);
  });

  it('does not include error in aria-describedby (error handled by group)', async () => {
    const el = createFixture(
      '<civ-radio label="Option A" value="a" description="Details" error="Required"></civ-radio>',
    );
    await waitForUpdate(el);

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
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color" error="Required">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid to false on fieldset when no error', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-invalid')).toBe('false');
  });

  it('sets aria-required on fieldset when required', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color" required>
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('true');
  });

  it('sets aria-required="false" on fieldset when not required', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset!.getAttribute('aria-required')).toBe('false');
  });
});

describe('civ-radio analytics', () => {
  it('fires civ-analytics when radio selected', async () => {
    const el = createFixture('<civ-radio label="Option A" value="a" name="choice"></civ-radio>');
    await waitForUpdate(el);

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
    const el = createFixture('<civ-radio label="Option A" value="a" name="choice" disable-analytics></civ-radio>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const input = el.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('civ-radio-group analytics', () => {
  it('fires civ-analytics from group on child radio change', async () => {
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
        <civ-radio label="Blue" value="blue"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

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
    const el = createFixture(`
      <civ-radio-group legend="Color" name="color">
        <civ-radio label="Red" value="red"></civ-radio>
      </civ-radio-group>
    `);
    await waitForUpdate(el);

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
