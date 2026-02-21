import { describe, it, expect } from 'vitest';
import {
  isDateInRange,
  isDateDisabled,
  clampDate,
  isMonthDisabled,
} from './date-constraints.js';

describe('isDateInRange', () => {
  it('returns true when no constraints', () => {
    expect(isDateInRange(new Date(2026, 2, 15), {})).toBe(true);
  });

  it('returns true within range', () => {
    expect(
      isDateInRange(new Date(2026, 2, 15), {
        min: '2026-01-01',
        max: '2026-12-31',
      }),
    ).toBe(true);
  });

  it('returns true on min boundary', () => {
    expect(
      isDateInRange(new Date(2026, 0, 1), { min: '2026-01-01' }),
    ).toBe(true);
  });

  it('returns true on max boundary', () => {
    expect(
      isDateInRange(new Date(2026, 11, 31), { max: '2026-12-31' }),
    ).toBe(true);
  });

  it('returns false before min', () => {
    expect(
      isDateInRange(new Date(2025, 11, 31), { min: '2026-01-01' }),
    ).toBe(false);
  });

  it('returns false after max', () => {
    expect(
      isDateInRange(new Date(2027, 0, 1), { max: '2026-12-31' }),
    ).toBe(false);
  });

  it('accepts Date objects as constraints', () => {
    expect(
      isDateInRange(new Date(2026, 2, 15), {
        min: new Date(2026, 0, 1),
        max: new Date(2026, 11, 31),
      }),
    ).toBe(true);
  });
});

describe('isDateDisabled', () => {
  it('returns false when no constraints', () => {
    expect(isDateDisabled(new Date(2026, 2, 15), {})).toBe(false);
  });

  it('returns true when out of range', () => {
    expect(
      isDateDisabled(new Date(2025, 0, 1), { min: '2026-01-01' }),
    ).toBe(true);
  });

  it('returns true when custom function disables', () => {
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    // March 15, 2026 is a Sunday
    expect(
      isDateDisabled(new Date(2026, 2, 15), { isDateDisabled: isWeekend }),
    ).toBe(true);
  });

  it('returns false when in range and not disabled by function', () => {
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    // March 16, 2026 is a Monday
    expect(
      isDateDisabled(new Date(2026, 2, 16), {
        min: '2026-01-01',
        isDateDisabled: isWeekend,
      }),
    ).toBe(false);
  });
});

describe('clampDate', () => {
  it('returns same date when in range', () => {
    const date = new Date(2026, 2, 15);
    const result = clampDate(date, { min: '2026-01-01', max: '2026-12-31' });
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
  });

  it('clamps to min when before', () => {
    const result = clampDate(new Date(2025, 0, 1), { min: '2026-01-01' });
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  it('clamps to max when after', () => {
    const result = clampDate(new Date(2027, 0, 1), { max: '2026-12-31' });
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(31);
  });

  it('does not mutate original', () => {
    const original = new Date(2025, 0, 1);
    clampDate(original, { min: '2026-01-01' });
    expect(original.getFullYear()).toBe(2025);
  });
});

describe('isMonthDisabled', () => {
  it('returns false when no constraints', () => {
    expect(isMonthDisabled(2026, 2, {})).toBe(false);
  });

  it('returns true when entire month is before min', () => {
    expect(isMonthDisabled(2025, 11, { min: '2026-01-01' })).toBe(true);
  });

  it('returns false when month contains min date', () => {
    expect(isMonthDisabled(2026, 0, { min: '2026-01-15' })).toBe(false);
  });

  it('returns true when entire month is after max', () => {
    expect(isMonthDisabled(2027, 0, { max: '2026-12-31' })).toBe(true);
  });

  it('returns false when month contains max date', () => {
    expect(isMonthDisabled(2026, 11, { max: '2026-12-15' })).toBe(false);
  });
});
