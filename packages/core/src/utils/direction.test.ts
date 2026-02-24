import { describe, it, expect } from 'vitest';
import { isRtl } from './direction.js';

describe('isRtl', () => {
  it('returns false for LTR element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(isRtl(el)).toBe(false);
    el.remove();
  });

  it('returns true when dir="rtl" is set on element', () => {
    const el = document.createElement('div');
    el.dir = 'rtl';
    document.body.appendChild(el);
    expect(isRtl(el)).toBe(true);
    el.remove();
  });

  it('returns false for element without dir attribute', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(isRtl(el)).toBe(false);
    el.remove();
  });
});
