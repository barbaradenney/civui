/**
 * Calendar grid computation utilities.
 * Generates month grids for date picker rendering.
 * No DOM dependencies — safe for use in both web and React Native.
 */

import { isSameDay, startOfWeek, addDays } from './date-utils.js';

/** A single day cell in the calendar grid. */
export interface CalendarDay {
  date: Date;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

/** A complete month grid with metadata. */
export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarDay[][];
}

export interface CalendarOptions {
  weekStartsOn?: number;
}

/** Generate a full calendar month grid (6 rows x 7 columns). */
export function generateCalendarMonth(
  year: number,
  month: number,
  opts?: CalendarOptions,
): CalendarMonth {
  const weekStartsOn = opts?.weekStartsOn ?? 0;
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeek(firstOfMonth, weekStartsOn);

  const weeks: CalendarDay[][] = [];
  let current = new Date(gridStart);

  // Generate exactly 6 weeks (42 days) for a consistent grid
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(current),
        day: current.getDate(),
        inCurrentMonth: current.getMonth() === month && current.getFullYear() === year,
        isToday: isSameDay(current, today),
      });
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  return { year, month, weeks };
}

/** Get abbreviated day-of-week headers (Su, Mo, Tu, ...). */
export function getDayOfWeekHeaders(
  locale = 'en-US',
  weekStartsOn = 0,
): { short: string; long: string }[] {
  const headers: { short: string; long: string }[] = [];
  // Use a known Sunday as reference: Jan 4, 1970 is a Sunday
  const refSunday = new Date(1970, 0, 4);
  const shortFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const longFmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  for (let i = 0; i < 7; i++) {
    const day = new Date(refSunday);
    day.setDate(day.getDate() + ((i + weekStartsOn) % 7));
    headers.push({
      short: shortFmt.format(day),
      long: longFmt.format(day),
    });
  }

  return headers;
}

/** Get localized month names. */
export function getMonthNames(
  locale = 'en-US',
  format: 'long' | 'short' = 'long',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));
}
