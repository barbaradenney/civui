import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-alert.js';

afterEach(cleanupFixtures);

describe('civ-alert', () => {
  it('renders with default info variant', async () => {
    const el = await fixture('<civ-alert>This is informational.</civ-alert>');

    const alert = el.querySelector('.civ-alert');
    expect(alert).not.toBeNull();
    expect(alert!.className).toContain('civ-alert--info');
  });

  it('renders info variant with correct classes', async () => {
    const el = await fixture('<civ-alert variant="info">Info message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--info');
  });

  it('renders warning variant with correct classes', async () => {
    const el = await fixture('<civ-alert variant="warning">Warning message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--warning');
  });

  it('renders error variant with correct classes', async () => {
    const el = await fixture('<civ-alert variant="error">Error message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--error');
  });

  it('renders success variant with correct classes', async () => {
    const el = await fixture('<civ-alert variant="success">Success message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--success');
  });

  it('uses role="status" on info variant', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    const alert = el.querySelector('[role="status"]');
    expect(alert).not.toBeNull();
  });

  it('uses role="alert" on error variant', async () => {
    const el = await fixture('<civ-alert variant="error">Error.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('alert');
  });

  it('uses role="status" on warning variant', async () => {
    const el = await fixture('<civ-alert variant="warning">Warning.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('status');
  });

  it('uses role="status" on success variant', async () => {
    const el = await fixture('<civ-alert variant="success">Success.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('role')).toBe('status');
  });

  it('renders heading as <h4> when provided', async () => {
    const el = await fixture('<civ-alert heading="Important">Body text.</civ-alert>');

    const heading = el.querySelector('h4.civ-alert__heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Important');
  });

  it('hides heading when slim is true', async () => {
    const el = await fixture('<civ-alert heading="Important" slim>Body text.</civ-alert>');

    const heading = el.querySelector('h4.civ-alert__heading');
    expect(heading).toBeNull();
  });

  it('applies slim class when slim is true', async () => {
    const el = await fixture('<civ-alert slim>Compact message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--slim');
  });

  it('shows dismiss button when dismissible is true', async () => {
    const el = await fixture('<civ-alert dismissible>Dismissible alert.</civ-alert>');

    const btn = el.querySelector('.civ-alert__dismiss');
    expect(btn).not.toBeNull();
  });

  it('hides dismiss button when dismissible is false', async () => {
    const el = await fixture('<civ-alert>Non-dismissible alert.</civ-alert>');

    const btn = el.querySelector('.civ-alert__dismiss');
    expect(btn).toBeNull();
  });

  it('fires civ-dismiss event on dismiss click', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-dismiss', handler as EventListener);

    const btn = el.querySelector('.civ-alert__dismiss') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('removes element from DOM on dismiss', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const parent = el.parentElement!;
    expect(parent.contains(el)).toBe(true);

    const btn = el.querySelector('.civ-alert__dismiss') as HTMLButtonElement;
    btn.click();

    expect(parent.contains(el)).toBe(false);
  });

  it('dismiss button has aria-label', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const btn = el.querySelector('.civ-alert__dismiss')!;
    expect(btn.getAttribute('aria-label')).toBe('Dismiss alert');
  });

  it('applies focus-visible:civ-focus-ring on dismiss button', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const btn = el.querySelector('.civ-alert__dismiss')!;
    expect(btn.className).toContain('focus-visible:civ-focus-ring');
  });

  it('renders body content', async () => {
    const el = await fixture('<civ-alert>This is the body text.</civ-alert>');

    expect(el.textContent).toContain('This is the body text.');
  });

  it('fires analytics event on dismiss', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('.civ-alert__dismiss') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-alert');
    expect(detail.action).toBe('dismiss');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('.civ-alert')).not.toBeNull();
  });
});
