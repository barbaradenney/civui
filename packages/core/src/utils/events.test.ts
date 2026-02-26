import { describe, it, expect, vi } from 'vitest';
import { dispatch } from './events.js';

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
