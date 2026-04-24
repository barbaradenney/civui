import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-segment.js';

afterEach(cleanupFixtures);

describe('civ-segment', () => {
  it('renders a button with the label', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>');

    const button = el.querySelector('button');
    expect(button).not.toBeNull();
    expect(button!.textContent).toContain('List');
  });

  it('uses role="radio" on the button', async () => {
    const el = await fixture('<civ-segment label="Grid" value="grid"></civ-segment>');

    const button = el.querySelector('button');
    expect(button!.getAttribute('role')).toBe('radio');
  });

  it('sets aria-checked="true" when selected', async () => {
    const el = await fixture('<civ-segment label="List" value="list" selected></civ-segment>');

    const button = el.querySelector('button');
    expect(button!.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked="false" when not selected', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>');

    const button = el.querySelector('button');
    expect(button!.getAttribute('aria-checked')).toBe('false');
  });

  it('sets tabindex="0" when selected', async () => {
    const el = await fixture('<civ-segment label="List" value="list" selected></civ-segment>');

    const button = el.querySelector('button');
    expect(button!.getAttribute('tabindex')).toBe('0');
  });

  it('sets tabindex="-1" when not selected', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>');

    const button = el.querySelector('button');
    expect(button!.getAttribute('tabindex')).toBe('-1');
  });

  it('disables the button when disabled', async () => {
    const el = await fixture('<civ-segment label="List" value="list" disabled></civ-segment>');

    const button = el.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('fires civ-change on click', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>');

    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const button = el.querySelector('button')!;
    button.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'list' });
  });

  it('does not fire civ-change when disabled', async () => {
    const el = await fixture('<civ-segment label="List" value="list" disabled></civ-segment>');

    const handler = vi.fn();
    el.addEventListener('civ-change', handler as EventListener);

    const button = el.querySelector('button')!;
    button.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('applies focus-visible:civ-focus-ring class', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>');

    const button = el.querySelector('button');
    expect(button!.className).toContain('focus-visible:civ-focus-ring');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>');

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('button')).not.toBeNull();
  });

  it('updates aria-checked when selected changes', async () => {
    const el = await fixture('<civ-segment label="List" value="list"></civ-segment>') as any;

    el.selected = true;
    await elementUpdated(el);

    const button = el.querySelector('button');
    expect(button!.getAttribute('aria-checked')).toBe('true');
  });
});
