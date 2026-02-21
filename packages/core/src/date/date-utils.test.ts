import { describe, it, expect } from 'vitest';
import {
  parseISODate,
  toISODateString,
  formatDate,
  formatDateLong,
  parseDateString,
  isValidDate,
  isSameDay,
  isSameMonth,
  addDays,
  addMonths,
  addYears,
  startOfWeek,
  endOfWeek,
} from './date-utils.js';

describe('parseISODate', () => {
  it('parses a valid date', () => {
    const d = parseISODate('2026-03-15')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it('returns null for invalid format', () => {
    expect(parseISODate('03/15/2026')).toBeNull();
    expect(parseISODate('2026-3-15')).toBeNull();
    expect(parseISODate('')).toBeNull();
  });

  it('returns null for impossible dates', () => {
    expect(parseISODate('2026-02-30')).toBeNull();
    expect(parseISODate('2026-13-01')).toBeNull();
  });

  it('handles leap year correctly', () => {
    expect(parseISODate('2024-02-29')).not.toBeNull();
    expect(parseISODate('2025-02-29')).toBeNull();
  });
});

describe('toISODateString', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISODateString(new Date(2026, 2, 5))).toBe('2026-03-05');
  });

  it('pads single-digit months and days', () => {
    expect(toISODateString(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('formatDate', () => {
  it('formats a date for display', () => {
    const result = formatDate(new Date(2026, 2, 15));
    expect(result).toContain('3');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });
});

describe('formatDateLong', () => {
  it('includes day of week and full month', () => {
    // March 15, 2026 is a Sunday
    const result = formatDateLong(new Date(2026, 2, 15));
    expect(result).toContain('Sunday');
    expect(result).toContain('March');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });
});

describe('parseDateString', () => {
  it('parses ISO format', () => {
    const d = parseDateString('2026-03-15')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
  });

  it('parses M/D/YYYY', () => {
    const d = parseDateString('3/15/2026')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it('parses MM/DD/YYYY', () => {
    const d = parseDateString('03/15/2026')!;
    expect(d.getMonth()).toBe(2);
  });

  it('parses dates with hyphens and dots', () => {
    expect(parseDateString('3-15-2026')).not.toBeNull();
    expect(parseDateString('3.15.2026')).not.toBeNull();
  });

  it('handles 2-digit years', () => {
    const d = parseDateString('3/15/26')!;
    expect(d.getFullYear()).toBe(2026);
  });

  it('returns null for empty or invalid', () => {
    expect(parseDateString('')).toBeNull();
    expect(parseDateString('  ')).toBeNull();
    expect(parseDateString('not a date')).toBeNull();
  });
});

describe('isValidDate', () => {
  it('returns true for valid dates', () => {
    expect(isValidDate(new Date(2026, 0, 1))).toBe(true);
  });

  it('returns false for invalid dates', () => {
    expect(isValidDate(new Date('invalid'))).toBe(false);
  });
});

describe('isSameDay', () => {
  it('returns true for same day', () => {
    expect(isSameDay(new Date(2026, 2, 15), new Date(2026, 2, 15))).toBe(true);
  });

  it('returns false for different days', () => {
    expect(isSameDay(new Date(2026, 2, 15), new Date(2026, 2, 16))).toBe(false);
  });

  it('returns false for different months', () => {
    expect(isSameDay(new Date(2026, 2, 15), new Date(2026, 3, 15))).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('returns true for same month/year', () => {
    expect(isSameMonth(new Date(2026, 2, 1), new Date(2026, 2, 28))).toBe(true);
  });

  it('returns false for different months', () => {
    expect(isSameMonth(new Date(2026, 2, 1), new Date(2026, 3, 1))).toBe(false);
  });
});

describe('addDays', () => {
  it('adds days', () => {
    const result = addDays(new Date(2026, 2, 15), 5);
    expect(result.getDate()).toBe(20);
  });

  it('subtracts days', () => {
    const result = addDays(new Date(2026, 2, 15), -5);
    expect(result.getDate()).toBe(10);
  });

  it('crosses month boundary', () => {
    const result = addDays(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(1);
  });

  it('does not mutate original', () => {
    const original = new Date(2026, 2, 15);
    addDays(original, 5);
    expect(original.getDate()).toBe(15);
  });
});

describe('addMonths', () => {
  it('adds months', () => {
    const result = addMonths(new Date(2026, 0, 15), 3);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(15);
  });

  it('subtracts months', () => {
    const result = addMonths(new Date(2026, 3, 15), -2);
    expect(result.getMonth()).toBe(1);
  });

  it('clamps day to end of month', () => {
    // Jan 31 + 1 month = Feb 28 (not Mar 3)
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('handles leap year clamping', () => {
    // Jan 31, 2024 + 1 month = Feb 29 (leap year)
    const result = addMonths(new Date(2024, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });

  it('does not mutate original', () => {
    const original = new Date(2026, 0, 15);
    addMonths(original, 3);
    expect(original.getMonth()).toBe(0);
  });
});

describe('addYears', () => {
  it('adds years', () => {
    const result = addYears(new Date(2026, 2, 15), 2);
    expect(result.getFullYear()).toBe(2028);
  });

  it('subtracts years', () => {
    const result = addYears(new Date(2026, 2, 15), -1);
    expect(result.getFullYear()).toBe(2025);
  });

  it('handles Feb 29 in leap year to non-leap year', () => {
    const result = addYears(new Date(2024, 1, 29), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });
});

describe('startOfWeek', () => {
  it('returns Sunday for default weekStartsOn=0', () => {
    // March 18, 2026 is a Wednesday
    const result = startOfWeek(new Date(2026, 2, 18));
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(15);
  });

  it('returns Monday for weekStartsOn=1', () => {
    const result = startOfWeek(new Date(2026, 2, 18), 1);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(16);
  });

  it('returns same day if already start of week', () => {
    // March 15, 2026 is a Sunday
    const result = startOfWeek(new Date(2026, 2, 15));
    expect(result.getDate()).toBe(15);
  });
});

describe('endOfWeek', () => {
  it('returns Saturday for default weekStartsOn=0', () => {
    const result = endOfWeek(new Date(2026, 2, 18));
    expect(result.getDay()).toBe(6); // Saturday
    expect(result.getDate()).toBe(21);
  });

  it('returns Sunday for weekStartsOn=1', () => {
    const result = endOfWeek(new Date(2026, 2, 18), 1);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(22);
  });
});
