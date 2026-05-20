import { describe, it, expect, afterEach, vi } from 'vitest';
import { clickOutside } from './click-outside.js';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('clickOutside', () => {
  it('fires onClickOutside when a click lands outside the host', () => {
    const host = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(host, outside);

    const cb = vi.fn();
    const co = clickOutside(host, cb);
    co.add();

    outside.click();
    expect(cb).toHaveBeenCalledOnce();
  });

  it('does not fire when the click lands inside the host', () => {
    const host = document.createElement('div');
    const inner = document.createElement('button');
    host.appendChild(inner);
    document.body.appendChild(host);

    const cb = vi.fn();
    const co = clickOutside(host, cb);
    co.add();

    inner.click();
    expect(cb).not.toHaveBeenCalled();
  });

  it('skips the in-flight trigger click when add() is called from a click handler', () => {
    // Regression: civ-action-sheet and civ-menu attach the outside-click
    // listener from inside their own `open` reactive flow. That flow
    // (via Lit's microtask) runs while the trigger button's click is
    // still bubbling — Chrome drains microtasks between bubble-phase
    // listeners during real mouse dispatch, so the listener attaches
    // before the click reaches document. Without the skip-next-event
    // guard, the popup closes on the click that opened it.
    const host = document.createElement('div');
    const trigger = document.createElement('button');
    document.body.append(host, trigger);

    const cb = vi.fn();
    const co = clickOutside(host, cb);

    // Reproduce the chain: trigger click → add() runs while the same
    // event is bubbling → click reaches document → handler runs.
    trigger.addEventListener('click', () => co.add());

    trigger.click();
    expect(cb).not.toHaveBeenCalled();
  });

  it('still catches the next genuine outside click after the in-flight one is skipped', () => {
    const host = document.createElement('div');
    const trigger = document.createElement('button');
    const elsewhere = document.createElement('button');
    document.body.append(host, trigger, elsewhere);

    const cb = vi.fn();
    const co = clickOutside(host, cb);
    trigger.addEventListener('click', () => co.add());

    trigger.click();
    expect(cb).not.toHaveBeenCalled();

    elsewhere.click();
    expect(cb).toHaveBeenCalledOnce();
  });

  it('does not skip a genuine outside click when add() ran outside of any event (programmatic open)', () => {
    // The skip flag is only set when `window.event` indicates an event
    // is in flight at add() time. Programmatic opens (no event) leave
    // the flag false, so the very first outside click closes correctly.
    const host = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(host, outside);

    const cb = vi.fn();
    const co = clickOutside(host, cb);
    co.add();

    outside.click();
    expect(cb).toHaveBeenCalledOnce();
  });

  it('remove() stops further notifications', () => {
    const host = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(host, outside);

    const cb = vi.fn();
    const co = clickOutside(host, cb);
    co.add();
    co.remove();

    outside.click();
    expect(cb).not.toHaveBeenCalled();
  });

  it('add() is idempotent — calling twice attaches only one listener', () => {
    const host = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(host, outside);

    const cb = vi.fn();
    const co = clickOutside(host, cb);
    co.add();
    co.add();

    outside.click();
    expect(cb).toHaveBeenCalledOnce();
  });
});
