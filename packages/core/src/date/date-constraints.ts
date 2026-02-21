/**
 * Date constraint utilities for min/max validation and disabled dates.
 * No DOM dependencies — safe for use in both web and React Native.
 */

import { parseISODate } from './date-utils.js';

/** Constraints that can be applied to selectable dates. */
export interface DateConstraints {
  /** Minimum selectable date (YYYY-MM-DD or Date). */
  min?: string | Date;
  /** Maximum selectable date (YYYY-MM-DD or Date). */
  max?: string | Date;
  /** Custom function to disable specific dates. */
  isDateDisabled?: (date: Date) => boolean;
}

function toDate(value: string | Date | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return parseISODate(value);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Check if a date falls within the min/max range (inclusive). */
export function isDateInRange(date: Date, constraints: DateConstraints): boolean {
  const d = startOfDay(date).getTime();
  const min = toDate(constraints.min);
  const max = toDate(constraints.max);

  if (min && d < startOfDay(min).getTime()) return false;
  if (max && d > startOfDay(max).getTime()) return false;
  return true;
}

/** Check if a date is disabled (out of range or explicitly disabled). */
export function isDateDisabled(date: Date, constraints: DateConstraints): boolean {
  if (!isDateInRange(date, constraints)) return true;
  if (constraints.isDateDisabled?.(date)) return true;
  return false;
}

/** Clamp a date to the min/max range. */
export function clampDate(date: Date, constraints: DateConstraints): Date {
  const min = toDate(constraints.min);
  const max = toDate(constraints.max);

  let result = new Date(date);
  if (min && startOfDay(result).getTime() < startOfDay(min).getTime()) {
    result = new Date(min);
  }
  if (max && startOfDay(result).getTime() > startOfDay(max).getTime()) {
    result = new Date(max);
  }
  return result;
}

/** Check if an entire month has no selectable dates. */
export function isMonthDisabled(
  year: number,
  month: number,
  constraints: DateConstraints,
): boolean {
  const min = toDate(constraints.min);
  const max = toDate(constraints.max);

  // Check if the entire month is before min
  if (min) {
    const lastOfMonth = new Date(year, month + 1, 0);
    if (startOfDay(lastOfMonth).getTime() < startOfDay(min).getTime()) return true;
  }

  // Check if the entire month is after max
  if (max) {
    const firstOfMonth = new Date(year, month, 1);
    if (startOfDay(firstOfMonth).getTime() > startOfDay(max).getTime()) return true;
  }

  return false;
}
