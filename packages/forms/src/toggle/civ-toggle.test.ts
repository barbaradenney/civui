import { describe, it, expect, afterEach, vi } from 'vitest';
import './civ-toggle.js';

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
}

afterEach(cleanup);

describe('civ-toggle', () => {
  it('renders with a label', async () => {
    const el = createFixture('<civ-toggle label="Dark mode"></civ-toggle>');
    await waitForUpdate(el);

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Dark mode');
  });

  it('renders a switch button with role="switch"', async () => {
    const el = createFixture('<civ-toggle label="Dark mode"></civ-toggle>');
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]');
    expect(btn).not.toBeNull();
  });

  it('sets aria-checked="true" when checked', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" checked></civ-toggle>');
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked="false" when not checked', async () => {
    const el = createFixture('<civ-toggle label="Dark mode"></civ-toggle>');
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles on click', async () => {
    const el = createFixture('<civ-toggle label="Dark mode"></civ-toggle>') as any;
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();
    await waitForUpdate(el);

    expect(el.checked).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles on Space keypress', async () => {
    const el = createFixture('<civ-toggle label="Dark mode"></civ-toggle>') as any;
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
    btn.dispatchEvent(spaceEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('fires civ-change with { checked, value } on toggle', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" name="darkmode"></civ-toggle>');
    await waitForUpdate(el);

    let eventDetail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(eventDetail).toEqual({ checked: true, value: 'on' });
  });

  it('fires civ-input on toggle', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" name="darkmode"></civ-toggle>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civ-input', handler as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).toEqual({ checked: true, value: 'on' });
  });

  it('renders description text', async () => {
    const el = createFixture(
      '<civ-toggle label="Notifications" description="Get push notifications on your device"></civ-toggle>',
    );
    await waitForUpdate(el);

    const desc = el.querySelector('span[id]');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('Get push notifications');
  });

  it('renders hint text', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" hint="Reduces eye strain"></civ-toggle>');
    await waitForUpdate(el);

    const spans = el.querySelectorAll('span');
    const hintSpan = Array.from(spans).find((s) => s.textContent === 'Reduces eye strain');
    expect(hintSpan).not.toBeNull();
  });

  it('renders error message with role="alert"', async () => {
    const el = createFixture('<civ-toggle label="Terms" error="You must accept"></civ-toggle>');
    await waitForUpdate(el);

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toBe('You must accept');
  });

  it('disabled state prevents toggle', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" disabled></civ-toggle>') as any;
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    btn.click();
    await waitForUpdate(el);
    expect(el.checked).toBe(false);
  });

  it('sets aria-invalid when error is present', async () => {
    const el = createFixture('<civ-toggle label="Terms" error="Required"></civ-toggle>');
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-required when required', async () => {
    const el = createFixture('<civ-toggle label="Terms" required></civ-toggle>');
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-required')).toBe('true');
  });

  it('links description, hint, and error via aria-describedby', async () => {
    const el = createFixture(
      '<civ-toggle label="Notifications" description="Desc" hint="Hint" error="Error"></civ-toggle>',
    );
    await waitForUpdate(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    const describedBy = btn.getAttribute('aria-describedby')!;
    const ids = describedBy.split(' ');
    expect(ids.length).toBe(3);

    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-toggle') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('resets to default checked state on formResetCallback', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" checked></civ-toggle>') as any;
    await waitForUpdate(el);

    el.checked = false;
    await waitForUpdate(el);
    expect(el.checked).toBe(false);

    el.formResetCallback();
    await waitForUpdate(el);
    expect(el.checked).toBe(true);
  });

  it('fires analytics with checked detail, never includes value', async () => {
    const el = createFixture('<civ-toggle label="Dark mode" name="darkmode"></civ-toggle>');
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-toggle');
    expect(detail.action).toBe('change');
    expect(detail.details).toEqual({ checked: true });
    expect(detail).not.toHaveProperty('value');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = createFixture('<civ-toggle label="Dark mode"></civ-toggle>');
    await waitForUpdate(el);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('button[role="switch"]')).not.toBeNull();
  });
});
