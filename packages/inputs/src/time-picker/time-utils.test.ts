import { describe, it, expect } from 'vitest';
import {
  formatTimeForDisplay,
  nearestSlot,
  parseFilterToMinutes,
  parseTimeToMinutes,
  type TimeSlot,
} from './time-utils.js';

describe('time-utils — parseTimeToMinutes', () => {
  it('parses zero-padded HH:MM to minutes-since-midnight', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('09:00')).toBe(9 * 60);
    expect(parseTimeToMinutes('14:30')).toBe(14 * 60 + 30);
    expect(parseTimeToMinutes('23:59')).toBe(23 * 60 + 59);
  });

  it('returns null for unpadded hours', () => {
    expect(parseTimeToMinutes('9:00')).toBeNull();
  });

  it('returns null for empty / malformed input', () => {
    expect(parseTimeToMinutes('')).toBeNull();
    expect(parseTimeToMinutes('not a time')).toBeNull();
    expect(parseTimeToMinutes('12:00:00')).toBeNull();
    expect(parseTimeToMinutes('1200')).toBeNull();
  });

  it('returns null for out-of-range values', () => {
    expect(parseTimeToMinutes('24:00')).toBeNull();
    expect(parseTimeToMinutes('00:60')).toBeNull();
  });
});

describe('time-utils — parseFilterToMinutes', () => {
  it('parses simple hour-only input', () => {
    expect(parseFilterToMinutes('9', '12')).toBe(9 * 60);
    expect(parseFilterToMinutes('14', '24')).toBe(14 * 60);
  });

  it('parses HMM and HHMM digit blocks', () => {
    expect(parseFilterToMinutes('927', '12')).toBe(9 * 60 + 27);
    expect(parseFilterToMinutes('1430', '24')).toBe(14 * 60 + 30);
  });

  it('parses colon-separated input', () => {
    expect(parseFilterToMinutes('9:27', '12')).toBe(9 * 60 + 27);
  });

  it('honors AM/PM hint letters in 12-hour mode', () => {
    expect(parseFilterToMinutes('9p', '12')).toBe(21 * 60);
    expect(parseFilterToMinutes('9 PM', '12')).toBe(21 * 60);
    expect(parseFilterToMinutes('12 AM', '12')).toBe(0);
    expect(parseFilterToMinutes('12 PM', '12')).toBe(12 * 60);
  });

  it('treats hour > 12 as 24-hour input in 12-hour format', () => {
    expect(parseFilterToMinutes('1430', '12')).toBe(14 * 60 + 30);
  });

  it('returns null for pure letters', () => {
    expect(parseFilterToMinutes('abc', '12')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseFilterToMinutes('', '12')).toBeNull();
    expect(parseFilterToMinutes('   ', '12')).toBeNull();
  });

  it('returns null for malformed minute fragments', () => {
    expect(parseFilterToMinutes(':99', '12')).toBeNull();
  });

  it('returns null when parsed hour is out of 0-23 range', () => {
    // "25" with no period hint → out of range
    expect(parseFilterToMinutes('25', '12')).toBeNull();
  });
});

describe('time-utils — formatTimeForDisplay', () => {
  it('formats 12-hour mode with AM/PM', () => {
    expect(formatTimeForDisplay(9, 0, { format: '12', amLabel: 'AM', pmLabel: 'PM' }))
      .toBe('9:00 AM');
    expect(formatTimeForDisplay(14, 30, { format: '12', amLabel: 'AM', pmLabel: 'PM' }))
      .toBe('2:30 PM');
  });

  it('formats 24-hour mode without period', () => {
    expect(formatTimeForDisplay(9, 0, { format: '24' })).toBe('09:00');
    expect(formatTimeForDisplay(14, 30, { format: '24' })).toBe('14:30');
    expect(formatTimeForDisplay(0, 0, { format: '24' })).toBe('00:00');
  });

  it('annotates midnight and noon when labels supplied', () => {
    const opts = { format: '12' as const, amLabel: 'AM', pmLabel: 'PM', midnightLabel: 'midnight', noonLabel: 'noon' };
    expect(formatTimeForDisplay(0, 0, opts)).toBe('12:00 AM (midnight)');
    expect(formatTimeForDisplay(12, 0, opts)).toBe('12:00 PM (noon)');
  });

  it('omits annotation when no annotation labels are supplied', () => {
    const opts = { format: '12' as const, amLabel: 'AM', pmLabel: 'PM' };
    expect(formatTimeForDisplay(0, 0, opts)).toBe('12:00 AM');
    expect(formatTimeForDisplay(12, 0, opts)).toBe('12:00 PM');
  });

  it('does not annotate non-exact noon / midnight slots', () => {
    const opts = { format: '12' as const, amLabel: 'AM', pmLabel: 'PM', midnightLabel: 'midnight', noonLabel: 'noon' };
    expect(formatTimeForDisplay(0, 15, opts)).toBe('12:15 AM');
    expect(formatTimeForDisplay(12, 15, opts)).toBe('12:15 PM');
  });
});

describe('time-utils — nearestSlot', () => {
  const slots: TimeSlot[] = [
    { value: '09:00', label: '9:00 AM' },
    { value: '09:15', label: '9:15 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '09:45', label: '9:45 AM' },
    { value: '10:00', label: '10:00 AM' },
  ];

  it('returns the slot closest to the target minutes', () => {
    // 9:27 is 567 minutes — closest to 9:30 (570).
    expect(nearestSlot(slots, 9 * 60 + 27)?.value).toBe('09:30');
    expect(nearestSlot(slots, 9 * 60 + 7)?.value).toBe('09:00');
    expect(nearestSlot(slots, 9 * 60 + 38)?.value).toBe('09:45');
  });

  it('returns the first slot when target is before all candidates', () => {
    expect(nearestSlot(slots, 0)?.value).toBe('09:00');
  });

  it('returns the last slot when target is after all candidates', () => {
    expect(nearestSlot(slots, 23 * 60)?.value).toBe('10:00');
  });

  it('skips disabled slots — snaps to the closest enabled neighbor', () => {
    const withDisabled = slots.map((s) =>
      s.value === '09:30' ? { ...s, disabled: true } : s,
    );
    // 9:27 would normally snap to 9:30 (disabled). Next-nearest is 9:15.
    expect(nearestSlot(withDisabled, 9 * 60 + 27)?.value).toBe('09:15');
  });

  it('returns null for empty input', () => {
    expect(nearestSlot([], 600)).toBeNull();
  });

  it('returns null when every slot is disabled', () => {
    const allDisabled = slots.map((s) => ({ ...s, disabled: true }));
    expect(nearestSlot(allDisabled, 600)).toBeNull();
  });

  it('skips slots with malformed values rather than crashing', () => {
    const messy: TimeSlot[] = [
      { value: 'gibberish', label: 'bad' },
      { value: '09:30', label: '9:30 AM' },
    ];
    expect(nearestSlot(messy, 9 * 60 + 27)?.value).toBe('09:30');
  });
});
