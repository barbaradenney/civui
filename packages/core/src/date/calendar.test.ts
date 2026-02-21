import { describe, it, expect } from 'vitest';
import { generateCalendarMonth, getDayOfWeekHeaders, getMonthNames } from './calendar.js';

describe('generateCalendarMonth', () => {
  it('generates 6 weeks of 7 days', () => {
    const cal = generateCalendarMonth(2026, 2); // March 2026
    expect(cal.weeks.length).toBe(6);
    cal.weeks.forEach((week) => expect(week.length).toBe(7));
  });

  it('sets year and month on result', () => {
    const cal = generateCalendarMonth(2026, 2);
    expect(cal.year).toBe(2026);
    expect(cal.month).toBe(2);
  });

  it('marks days in current month', () => {
    const cal = generateCalendarMonth(2026, 2); // March 2026
    const allDays = cal.weeks.flat();
    const inMonth = allDays.filter((d) => d.inCurrentMonth);
    expect(inMonth.length).toBe(31); // March has 31 days
  });

  it('marks days outside current month', () => {
    const cal = generateCalendarMonth(2026, 2);
    const allDays = cal.weeks.flat();
    const outOfMonth = allDays.filter((d) => !d.inCurrentMonth);
    expect(outOfMonth.length).toBe(42 - 31);
  });

  it('starts grid on correct day of week (Sunday default)', () => {
    const cal = generateCalendarMonth(2026, 2); // March 1, 2026 = Sunday
    expect(cal.weeks[0][0].date.getDay()).toBe(0); // Sunday
  });

  it('respects weekStartsOn=1 (Monday)', () => {
    const cal = generateCalendarMonth(2026, 2, { weekStartsOn: 1 });
    expect(cal.weeks[0][0].date.getDay()).toBe(1); // Monday
  });

  it('marks today', () => {
    const today = new Date();
    const cal = generateCalendarMonth(today.getFullYear(), today.getMonth());
    const allDays = cal.weeks.flat();
    const todayCell = allDays.find((d) => d.isToday);
    expect(todayCell).toBeDefined();
    expect(todayCell!.day).toBe(today.getDate());
  });

  it('handles February in leap year', () => {
    const cal = generateCalendarMonth(2024, 1); // Feb 2024 (leap)
    const inMonth = cal.weeks.flat().filter((d) => d.inCurrentMonth);
    expect(inMonth.length).toBe(29);
  });

  it('handles February in non-leap year', () => {
    const cal = generateCalendarMonth(2025, 1); // Feb 2025
    const inMonth = cal.weeks.flat().filter((d) => d.inCurrentMonth);
    expect(inMonth.length).toBe(28);
  });
});

describe('getDayOfWeekHeaders', () => {
  it('returns 7 headers', () => {
    const headers = getDayOfWeekHeaders();
    expect(headers.length).toBe(7);
  });

  it('starts with Sunday by default', () => {
    const headers = getDayOfWeekHeaders('en-US');
    expect(headers[0].long).toBe('Sunday');
  });

  it('starts with Monday when weekStartsOn=1', () => {
    const headers = getDayOfWeekHeaders('en-US', 1);
    expect(headers[0].long).toBe('Monday');
  });

  it('returns short and long forms', () => {
    const headers = getDayOfWeekHeaders('en-US');
    expect(headers[0].short).toBe('Sun');
    expect(headers[0].long).toBe('Sunday');
  });
});

describe('getMonthNames', () => {
  it('returns 12 month names', () => {
    const names = getMonthNames();
    expect(names.length).toBe(12);
  });

  it('returns long names by default', () => {
    const names = getMonthNames('en-US');
    expect(names[0]).toBe('January');
    expect(names[11]).toBe('December');
  });

  it('returns short names', () => {
    const names = getMonthNames('en-US', 'short');
    expect(names[0]).toBe('Jan');
    expect(names[11]).toBe('Dec');
  });
});
