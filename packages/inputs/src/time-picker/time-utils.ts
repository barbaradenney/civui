// Pure time-parsing / formatting helpers extracted from civ-time-picker.
// Kept side-effect-free and component-free so they can be unit-tested in
// isolation and reused by future platforms (storybook controls, doc
// generators, headless validation).

export type TimePickerFormat = '12' | '24';

/**
 * Parse a strict 24-hour `HH:MM` string to minutes-since-midnight,
 * or `null` when the input is empty / malformed. Requires zero-padded
 * hours (`"09:00"`, not `"9:00"`) so the documented contract matches
 * the parser — important for cross-platform implementations consuming
 * `min` / `max` from the same string.
 */
export function parseTimeToMinutes(s: string): number | null {
  if (!s) return null;
  const match = s.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Parse a free-form filter string to minutes-since-midnight.
 * Handles the natural shapes users type:
 *   - "9" / "9:00"         → 9 * 60 = 540
 *   - "927" / "9:27"       → 9 * 60 + 27 = 567
 *   - "1430"               → 14 * 60 + 30 = 870 (24-hour input)
 *   - "9p" / "9 PM"        → 21 * 60 = 1260
 *   - "9:27 PM"            → 21 * 60 + 27 = 1287
 *
 * In `format="12"`, hour values > 12 are treated as 24-hour input
 * so "1430" still snaps to a sensible afternoon slot. AM/PM hints
 * (any "a"/"p" letter in the filter) override.
 *
 * Returns `null` when the filter has no parseable digits or the
 * parsed time is out of range (e.g. minute > 59).
 */
export function parseFilterToMinutes(filter: string, format: TimePickerFormat): number | null {
  const lower = filter.trim().toLowerCase();
  if (!lower) return null;

  // Loose AM/PM detection — any "a" or "p" letter in the filter
  // counts as the hint. Good enough for typical user input
  // ("9a", "9 am", "9:27 pm") without parsing word boundaries.
  const hasAm = /a/.test(lower);
  const hasPm = /p/.test(lower);

  const cleaned = lower.replace(/[^\d:]/g, '');
  if (!cleaned) return null;

  let h: number;
  let m: number;
  if (cleaned.includes(':')) {
    const [hStr, mStr] = cleaned.split(':');
    h = Number(hStr);
    m = Number(mStr) || 0;
  } else if (cleaned.length <= 2) {
    h = Number(cleaned);
    m = 0;
  } else if (cleaned.length === 3) {
    h = Number(cleaned[0]);
    m = Number(cleaned.slice(1));
  } else {
    h = Number(cleaned.slice(0, 2));
    m = Number(cleaned.slice(2, 4));
  }

  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (m < 0 || m > 59) return null;

  if (format === '12') {
    if (h === 12 && hasAm) h = 0;
    else if (h < 12 && hasPm) h += 12;
    // hour > 12 with no period hint: treat as 24-hour input,
    // leave as-is so "1430" → 14:30.
  }

  if (h < 0 || h > 23) return null;
  return h * 60 + m;
}

export interface FormatTimeForDisplayOptions {
  format: TimePickerFormat;
  /** Localized "AM" string. Required in `format="12"`. */
  amLabel?: string;
  /** Localized "PM" string. Required in `format="12"`. */
  pmLabel?: string;
  /** Localized "midnight" annotation. When omitted, 00:00 is unannotated. */
  midnightLabel?: string;
  /** Localized "noon" annotation. When omitted, 12:00 is unannotated. */
  noonLabel?: string;
}

/**
 * Render a (24-hour) hour/minute pair as the display string the user
 * sees in a combo slot list and (when matched) in the input.
 *
 * Exactly-midnight (00:00) and exactly-noon (12:00) get a "(midnight)"
 * / "(noon)" annotation when labels are supplied — the conventional
 * disambiguation for 12 AM vs 12 PM. Only exact zero-minute slots
 * qualify (12:15 AM is not midnight).
 */
export function formatTimeForDisplay(h: number, m: number, opts: FormatTimeForDisplayOptions): string {
  const minutePart = String(m).padStart(2, '0');
  const annotation = m === 0 && (h === 0 || h === 12) && (opts.midnightLabel || opts.noonLabel)
    ? ` (${h === 0 ? (opts.midnightLabel ?? '') : (opts.noonLabel ?? '')})`
    : '';
  if (opts.format === '24') {
    return `${String(h).padStart(2, '0')}:${minutePart}${annotation}`;
  }
  const period = h < 12 ? (opts.amLabel ?? 'AM') : (opts.pmLabel ?? 'PM');
  const twelveHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${twelveHour}:${minutePart} ${period}${annotation}`;
}

export interface TimeSlot {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Find the slot whose value (parsed via `parseTimeToMinutes`) is
 * closest to the target minutes-since-midnight. Disabled slots are
 * skipped — a "9:27" filter that snaps to a 9:30 slot won't suggest
 * the slot if 9:30 is marked unavailable.
 *
 * Returns `null` when `opts` is empty or contains no parseable /
 * enabled candidates.
 */
export function nearestSlot<T extends TimeSlot>(opts: T[], minutes: number): T | null {
  let nearest: T | null = null;
  let nearestDelta = Infinity;
  for (const opt of opts) {
    if (opt.disabled) continue;
    const m = parseTimeToMinutes(opt.value);
    if (m == null) continue;
    const delta = Math.abs(m - minutes);
    if (delta < nearestDelta) {
      nearestDelta = delta;
      nearest = opt;
    }
  }
  return nearest;
}
