import { describe, it, expect, vi } from 'vitest';
import { createKeyboardHandler, resolveGroupNavIndex } from './keyboard-handler.js';

describe('resolveGroupNavIndex', () => {
  const length = 5;

  it('ArrowRight advances to next index', () => {
    expect(resolveGroupNavIndex('ArrowRight', 0, length)).toBe(1);
    expect(resolveGroupNavIndex('ArrowRight', 3, length)).toBe(4);
  });

  it('ArrowRight wraps from last to first', () => {
    expect(resolveGroupNavIndex('ArrowRight', 4, length)).toBe(0);
  });

  it('ArrowDown advances to next index', () => {
    expect(resolveGroupNavIndex('ArrowDown', 2, length)).toBe(3);
  });

  it('ArrowDown wraps from last to first', () => {
    expect(resolveGroupNavIndex('ArrowDown', 4, length)).toBe(0);
  });

  it('ArrowLeft goes to previous index', () => {
    expect(resolveGroupNavIndex('ArrowLeft', 3, length)).toBe(2);
    expect(resolveGroupNavIndex('ArrowLeft', 1, length)).toBe(0);
  });

  it('ArrowLeft wraps from first to last', () => {
    expect(resolveGroupNavIndex('ArrowLeft', 0, length)).toBe(4);
  });

  it('ArrowUp goes to previous index', () => {
    expect(resolveGroupNavIndex('ArrowUp', 2, length)).toBe(1);
  });

  it('ArrowUp wraps from first to last', () => {
    expect(resolveGroupNavIndex('ArrowUp', 0, length)).toBe(4);
  });

  it('Home returns 0', () => {
    expect(resolveGroupNavIndex('Home', 3, length)).toBe(0);
  });

  it('End returns last index', () => {
    expect(resolveGroupNavIndex('End', 1, length)).toBe(4);
  });

  it('returns undefined for unrecognized keys', () => {
    expect(resolveGroupNavIndex('Enter', 0, length)).toBeUndefined();
    expect(resolveGroupNavIndex('Tab', 0, length)).toBeUndefined();
    expect(resolveGroupNavIndex('a', 0, length)).toBeUndefined();
  });

  it('handles single-element group', () => {
    expect(resolveGroupNavIndex('ArrowRight', 0, 1)).toBe(0);
    expect(resolveGroupNavIndex('ArrowLeft', 0, 1)).toBe(0);
    expect(resolveGroupNavIndex('Home', 0, 1)).toBe(0);
    expect(resolveGroupNavIndex('End', 0, 1)).toBe(0);
  });

  describe('RTL mode', () => {
    it('ArrowRight moves backward in RTL', () => {
      expect(resolveGroupNavIndex('ArrowRight', 2, length, true)).toBe(1);
    });

    it('ArrowRight wraps from first to last in RTL', () => {
      expect(resolveGroupNavIndex('ArrowRight', 0, length, true)).toBe(4);
    });

    it('ArrowLeft moves forward in RTL', () => {
      expect(resolveGroupNavIndex('ArrowLeft', 1, length, true)).toBe(2);
    });

    it('ArrowLeft wraps from last to first in RTL', () => {
      expect(resolveGroupNavIndex('ArrowLeft', 4, length, true)).toBe(0);
    });

    it('ArrowDown is unchanged in RTL', () => {
      expect(resolveGroupNavIndex('ArrowDown', 2, length, true)).toBe(3);
      expect(resolveGroupNavIndex('ArrowDown', 4, length, true)).toBe(0);
    });

    it('ArrowUp is unchanged in RTL', () => {
      expect(resolveGroupNavIndex('ArrowUp', 2, length, true)).toBe(1);
      expect(resolveGroupNavIndex('ArrowUp', 0, length, true)).toBe(4);
    });

    it('Home is unchanged in RTL', () => {
      expect(resolveGroupNavIndex('Home', 3, length, true)).toBe(0);
    });

    it('End is unchanged in RTL', () => {
      expect(resolveGroupNavIndex('End', 1, length, true)).toBe(4);
    });
  });
});

describe('createKeyboardHandler', () => {
  function makeEvent(key: string, opts: Partial<KeyboardEvent> = {}): KeyboardEvent {
    return new KeyboardEvent('keydown', { key, bubbles: true, ...opts });
  }

  it('calls matching handler for the key', () => {
    const handler = vi.fn();
    const onKeydown = createKeyboardHandler([{ key: 'Enter', handler }]);

    onKeydown(makeEvent('Enter'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call handler for non-matching keys', () => {
    const handler = vi.fn();
    const onKeydown = createKeyboardHandler([{ key: 'Enter', handler }]);

    onKeydown(makeEvent('Escape'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls preventDefault by default', () => {
    const handler = vi.fn();
    const onKeydown = createKeyboardHandler([{ key: 'Enter', handler }]);

    const event = makeEvent('Enter');
    const spy = vi.spyOn(event, 'preventDefault');
    onKeydown(event);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('skips preventDefault when preventDefault is false', () => {
    const handler = vi.fn();
    const onKeydown = createKeyboardHandler([{ key: 'Enter', handler, preventDefault: false }]);

    const event = makeEvent('Enter');
    const spy = vi.spyOn(event, 'preventDefault');
    onKeydown(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('matches modifier keys', () => {
    const handler = vi.fn();
    const onKeydown = createKeyboardHandler([{ key: 'a', handler, ctrlKey: true }]);

    // Without ctrlKey — should not match
    onKeydown(makeEvent('a'));
    expect(handler).not.toHaveBeenCalled();

    // With ctrlKey — should match
    onKeydown(makeEvent('a', { ctrlKey: true }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('stops at first matching binding', () => {
    const first = vi.fn();
    const second = vi.fn();
    const onKeydown = createKeyboardHandler([
      { key: 'Enter', handler: first },
      { key: 'Enter', handler: second },
    ]);

    onKeydown(makeEvent('Enter'));
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });
});
