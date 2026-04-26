import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-alert.js';
import type { CivAlert } from './civ-alert.js';

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

  // heading tests
  it('renders heading with role="heading" when provided', async () => {
    const el = await fixture('<civ-alert heading="Important">Body text.</civ-alert>');

    const heading = el.querySelector('.civ-alert__heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Important');
    expect(heading!.getAttribute('role')).toBe('heading');
    expect(heading!.getAttribute('aria-level')).toBe('4');
  });

  it('renders heading with custom level', async () => {
    const el = await fixture('<civ-alert heading="Title" heading-level="2">Body.</civ-alert>');

    const heading = el.querySelector('.civ-alert__heading')!;
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('clamps heading level to valid range', async () => {
    const el = await fixture('<civ-alert heading="Title" heading-level="1">Body.</civ-alert>') as CivAlert;

    const heading = el.querySelector('.civ-alert__heading')!;
    // Level 1 is clamped to 2
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('hides heading when slim is true', async () => {
    const el = await fixture('<civ-alert heading="Important" slim>Body text.</civ-alert>');

    const heading = el.querySelector('.civ-alert__heading');
    expect(heading).toBeNull();
  });

  // aria-labelledby vs aria-label
  it('uses aria-labelledby pointing to heading when heading is present', async () => {
    const el = await fixture('<civ-alert heading="Important">Body.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    const headingEl = el.querySelector('.civ-alert__heading')!;
    expect(alert.getAttribute('aria-labelledby')).toBe(headingEl.id);
    expect(alert.hasAttribute('aria-label')).toBe(false);
  });

  it('uses aria-label fallback when no heading', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('aria-label')).toBe('Informational alert');
    expect(alert.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('uses aria-label with variant name when no heading', async () => {
    const el = await fixture('<civ-alert variant="error">Error.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('aria-label')).toBe('Error alert');
  });

  it('uses aria-label when slim hides heading', async () => {
    const el = await fixture('<civ-alert heading="Title" slim>Body.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.getAttribute('aria-label')).toBe('Informational alert');
    expect(alert.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('applies slim class when slim is true', async () => {
    const el = await fixture('<civ-alert slim>Compact message.</civ-alert>');

    const alert = el.querySelector('.civ-alert')!;
    expect(alert.className).toContain('civ-alert--slim');
  });

  it('shows dismiss button when dismissible is true', async () => {
    const el = await fixture('<civ-alert dismissible>Dismissible alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn');
    expect(btn).not.toBeNull();
  });

  it('hides dismiss button when dismissible is false', async () => {
    const el = await fixture('<civ-alert>Non-dismissible alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn');
    expect(btn).toBeNull();
  });

  it('fires civ-dismiss event on dismiss click', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-dismiss', handler as EventListener);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('removes element from DOM on dismiss', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const parent = el.parentElement!;
    expect(parent.contains(el)).toBe(true);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    // Removal is deferred via queueMicrotask for screen reader announcement
    await new Promise((r) => queueMicrotask(r));
    expect(parent.contains(el)).toBe(false);
  });

  it('prevents dismiss when civ-dismiss event is cancelled', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');
    const parent = el.parentElement!;

    el.addEventListener('civ-dismiss', (e) => e.preventDefault());

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    await new Promise((r) => queueMicrotask(r));
    expect(parent.contains(el)).toBe(true);
  });

  it('dismiss button has aria-label', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn')!;
    expect(btn.getAttribute('aria-label')).toBe('Dismiss alert');
  });

  it('applies focus-visible:civ-focus-ring on dismiss button', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const btn = el.querySelector('.civ-close-btn')!;
    expect(btn.className).toContain('focus-visible:civ-focus-ring');
  });

  it('renders body content with civ-alert__body class', async () => {
    const el = await fixture('<civ-alert>This is the body text.</civ-alert>');

    const body = el.querySelector('.civ-alert__body');
    expect(body).not.toBeNull();
    expect(body!.textContent).toContain('This is the body text.');
  });

  // label prop tests
  it('uses label prop as body text', async () => {
    const el = await fixture('<civ-alert label="From label prop."></civ-alert>');

    expect(el.textContent).toContain('From label prop.');
  });

  it('label prop takes precedence over child text', async () => {
    const el = await fixture('<civ-alert label="Label wins">Child text</civ-alert>');

    expect(el.textContent).toContain('Label wins');
  });

  it('updates body when label prop changes', async () => {
    const el = await fixture('<civ-alert label="Original"></civ-alert>') as CivAlert;

    el.label = 'Updated';
    await elementUpdated(el);

    expect(el.textContent).toContain('Updated');
  });

  it('fires analytics event on dismiss', async () => {
    const el = await fixture('<civ-alert dismissible>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.componentName).toBe('civ-alert');
    expect(detail.action).toBe('dismiss');
  });

  it('suppresses analytics when disable-analytics is set', async () => {
    const el = await fixture('<civ-alert dismissible disable-analytics>Alert.</civ-alert>');

    const handler = vi.fn();
    el.addEventListener('civ-analytics', handler as EventListener);

    const btn = el.querySelector('.civ-close-btn') as HTMLButtonElement;
    btn.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('clamps heading level to upper bound of 6', async () => {
    const el = await fixture('<civ-alert heading="Title" heading-level="9">Body.</civ-alert>') as CivAlert;

    const heading = el.querySelector('.civ-alert__heading')!;
    expect(heading.getAttribute('aria-level')).toBe('6');
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture('<civ-alert>Message.</civ-alert>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('.civ-alert')).not.toBeNull();
  });
});
