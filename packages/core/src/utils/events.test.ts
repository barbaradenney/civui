import { describe, it, expect, vi } from 'vitest';
import { dispatch, forwardTileClick } from './events.js';

describe('dispatch', () => {
  it('dispatches a CustomEvent with the given name', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    el.addEventListener('civ-test', handler);

    dispatch(el, 'civ-test');

    expect(handler).toHaveBeenCalledOnce();
  });

  it('includes detail in the event', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    el.addEventListener('civ-test', handler as EventListener);

    dispatch(el, 'civ-test', { value: 'hello' });

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ value: 'hello' });
  });

  it('events bubble and are composed', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    el.addEventListener('civ-test', handler as EventListener);

    dispatch(el, 'civ-test');

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('events are not cancelable by default', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    el.addEventListener('civ-test', handler as EventListener);

    dispatch(el, 'civ-test');

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.cancelable).toBe(false);
  });

  it('events are cancelable when cancelable=true', () => {
    const el = document.createElement('div');
    el.addEventListener('civ-test', (e) => e.preventDefault());

    const result = dispatch(el, 'civ-test', undefined, true);

    expect(result).toBe(false);
  });

  it('returns true when event is not cancelled', () => {
    const el = document.createElement('div');
    const result = dispatch(el, 'civ-test');
    expect(result).toBe(true);
  });
});

describe('forwardTileClick', () => {
  function buildHost(): { host: HTMLElement; input: HTMLInputElement } {
    const host = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'checkbox';
    host.appendChild(input);
    document.body.appendChild(host);
    return { host, input };
  }

  it('focuses the inner input when the tile padding is clicked', () => {
    const { host, input } = buildHost();
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: host });
    Object.defineProperty(event, 'currentTarget', { value: host });

    forwardTileClick(host, event);

    // Without focus(), :focus would never match and the tile's focus
    // ring rule wouldn't trigger — locking this in prevents the
    // silent regression we shipped earlier.
    expect(document.activeElement).toBe(input);
    expect(input.checked).toBe(true);
    host.remove();
  });

  it('does nothing when the click came from a child (label handles it natively)', () => {
    const { host, input } = buildHost();
    const child = document.createElement('span');
    host.appendChild(child);
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: child });
    Object.defineProperty(event, 'currentTarget', { value: host });

    forwardTileClick(host, event);

    expect(document.activeElement).not.toBe(input);
    expect(input.checked).toBe(false);
    host.remove();
  });

  it('does nothing when the input is disabled', () => {
    const { host, input } = buildHost();
    input.disabled = true;
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: host });
    Object.defineProperty(event, 'currentTarget', { value: host });

    forwardTileClick(host, event);

    expect(document.activeElement).not.toBe(input);
    expect(input.checked).toBe(false);
    host.remove();
  });
});
