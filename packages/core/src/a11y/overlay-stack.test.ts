import { describe, it, expect, beforeEach } from 'vitest';
import {
  pushOverlay,
  removeOverlay,
  isTopOverlay,
  claimOverlayKey,
  isOverlayKeyClaimed,
  _resetOverlayStack,
} from './overlay-stack.js';

beforeEach(() => _resetOverlayStack());

describe('overlay-stack', () => {
  it('treats the most recently pushed overlay as the top', () => {
    const a = {};
    const b = {};
    pushOverlay(a);
    expect(isTopOverlay(a)).toBe(true);
    pushOverlay(b);
    expect(isTopOverlay(b)).toBe(true);
    expect(isTopOverlay(a)).toBe(false);
  });

  it('restores the previous overlay as top when the top is removed', () => {
    const outer = {};
    const inner = {};
    pushOverlay(outer);
    pushOverlay(inner);
    removeOverlay(inner);
    expect(isTopOverlay(outer)).toBe(true);
  });

  it('de-duplicates: re-pushing an overlay moves it to the top, not a second entry', () => {
    const a = {};
    const b = {};
    pushOverlay(a);
    pushOverlay(b);
    pushOverlay(a); // re-open without an intervening close
    expect(isTopOverlay(a)).toBe(true);
    removeOverlay(a);
    // Only one entry was ever held for `a`, so removing it surfaces `b`.
    expect(isTopOverlay(b)).toBe(true);
  });

  it('removeOverlay is a no-op for an overlay that is not in the stack', () => {
    const a = {};
    const b = {};
    pushOverlay(a);
    removeOverlay(b);
    expect(isTopOverlay(a)).toBe(true);
  });

  it('isTopOverlay is false when the stack is empty', () => {
    expect(isTopOverlay({})).toBe(false);
  });

  it('claims a key event once so later overlay listeners can skip it', () => {
    const e = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(isOverlayKeyClaimed(e)).toBe(false);
    claimOverlayKey(e);
    expect(isOverlayKeyClaimed(e)).toBe(true);
    // A different event is independent.
    expect(isOverlayKeyClaimed(new KeyboardEvent('keydown', { key: 'Escape' }))).toBe(false);
  });
});
