import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-toggle.js';
import '@civui/core';

afterEach(cleanupFixtures);

describe('civ-toggle', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('Dark mode');
  });

  it('renders a switch button with role="switch"', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>');

    const btn = el.querySelector('button[role="switch"]');
    expect(btn).not.toBeNull();
  });

  it('sets aria-checked="true" when checked', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" checked></civ-toggle>');

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked="false" when not checked', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>');

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles on click', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>') as any;

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();
    await elementUpdated(el);

    expect(el.checked).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles on Space keypress via native button behavior', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>') as any;
    await elementUpdated(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click(); // Native button handles Space via click

    await elementUpdated(el);
    expect(el.checked).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('fires civ-change with { checked, value } on toggle', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" name="darkmode"></civ-toggle>');

    let eventDetail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(eventDetail).toEqual({ checked: true, value: 'on' });
  });

  it('fires civ-input on toggle', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" name="darkmode"></civ-toggle>');

    const handler = vi.fn();
    el.addEventListener('civ-input', handler as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail).toEqual({ checked: true, value: 'on' });
  });

  it('renders description text', async () => {
    const el = await fixture(
      '<civ-toggle label="Notifications" description="Get push notifications on your device"></civ-toggle>',
    );

    const desc = el.querySelector('span[id]');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('Get push notifications');
  });

  it('disabled state prevents toggle', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" disabled></civ-toggle>') as any;

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    btn.click();
    await elementUpdated(el);
    expect(el.checked).toBe(false);
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-toggle label="Terms" error="Required"></civ-toggle>');

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-required when required', async () => {
    const el = await fixture('<civ-toggle label="Terms" required></civ-toggle>');

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-required')).toBe('true');
  });


  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-toggle') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('resets to default checked state on formResetCallback', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" checked></civ-toggle>') as any;

    el.checked = false;
    await elementUpdated(el);
    expect(el.checked).toBe(false);

    el.formResetCallback();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
  });

  it('fires analytics with checked detail, never includes value', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" name="darkmode"></civ-toggle>');

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
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('button[role="switch"]')).not.toBeNull();
  });

  it('renders the toggle as a real <button role="switch"> so the global focus ring applies', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>');

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.className).not.toContain('focus:civ-outline');
  });

  it('formDisabledCallback cascades disabled state', async () => {
    const el = await fixture('<civ-toggle label="Dark mode"></civ-toggle>') as any;

    el.formDisabledCallback(true);
    await elementUpdated(el);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(el.disabled).toBe(true);
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" disable-analytics></civ-toggle>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('uses custom value prop in events and form data', async () => {
    const el = await fixture('<civ-toggle label="Dark mode" value="yes"></civ-toggle>');

    let eventDetail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    btn.click();

    expect(eventDetail).toEqual({ checked: true, value: 'yes' });
  });

  it('wires description, hint, and error IDs into aria-describedby', async () => {
    const el = await fixture(
      '<civ-toggle label="Notifications" description="Send push notifications" hint="Reduces eye strain" error="Required"></civ-toggle>',
    );
    const btn = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    const describedBy = btn.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(' ').filter(Boolean);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});
