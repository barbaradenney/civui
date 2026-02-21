/**
 * Pure date utility functions for parsing, formatting, validation, and arithmetic.
 * No DOM dependencies — safe for use in both web and React Native.
 */

/** Parse an ISO date string (YYYY-MM-DD) into a Date, or null if invalid. */
export function parseISODate(str: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

/** Format a Date as YYYY-MM-DD for form values. */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format a Date for display using the user's locale (e.g. "3/15/2026"). */
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
}

/** Format a Date for screen readers (e.g. "Friday, March 15, 2026"). */
export function formatDateLong(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** Try to parse a user-typed date string. Returns null if unparseable. */
export function parseDateString(text: string, _locale = 'en-US'): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Try ISO format first
  const iso = parseISODate(trimmed);
  if (iso) return iso;

  // Try common US format: M/D/YYYY or MM/DD/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (slashMatch) {
    let [, mStr, dStr, yStr] = slashMatch;
    let y = Number(yStr);
    if (y < 100) y += 2000;
    const m = Number(mStr);
    const d = Number(dStr);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
      return date;
    }
  }

  return null;
}

/** Check if a Date object represents a valid date. */
export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

/** Check if two dates are the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check if two dates are in the same month and year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Add (or subtract) days from a date. Returns a new Date. */
export function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/** Add (or subtract) months from a date. Clamps day to month end. */
export function addMonths(date: Date, n: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + n;
  result.setMonth(targetMonth);
  // If the day overflowed (e.g. Jan 31 + 1 month = Mar 3), clamp to last day
  if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setDate(0); // last day of previous month
  }
  return result;
}

/** Add (or subtract) years from a date. Clamps Feb 29 to Feb 28 in non-leap years. */
export function addYears(date: Date, n: number): Date {
  const result = new Date(date);
  const targetYear = result.getFullYear() + n;
  result.setFullYear(targetYear);
  // Handle Feb 29 → Feb 28 for non-leap years
  if (result.getMonth() !== date.getMonth()) {
    result.setDate(0);
  }
  return result;
}

/** Get the start of the week containing this date. */
export function startOfWeek(date: Date, weekStartsOn = 0): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
}

/** Get the end of the week containing this date. */
export function endOfWeek(date: Date, weekStartsOn = 0): Date {
  const result = startOfWeek(date, weekStartsOn);
  result.setDate(result.getDate() + 6);
  return result;
}
