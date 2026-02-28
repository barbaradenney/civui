import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  TextInput: (props: any) => <input {...mapRNProps(props)} />,
  Pressable: ({ children, onPress, accessibilityState, accessibilityViewIsModal, ...props }: any) => (
    <button {...mapRNProps(props)} onClick={onPress}>
      {typeof children === 'function' ? children({ pressed: false }) : children}
    </button>
  ),
  Modal: ({ children, visible }: any) => (visible ? <div data-modal="true">{children}</div> : null),
  FlatList: ({ data, renderItem, keyExtractor }: any) => (
    <div>{data?.map((item: any, i: number) => <div key={keyExtractor?.(item) ?? i}>{renderItem({ item, index: i })}</div>)}</div>
  ),
  StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  Platform: { OS: 'ios', select: (opts: any) => opts.ios },
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
}));

vi.mock('@civui/core/date', () => ({
  parseISODate: (iso: string) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  },
  toISODateString: (date: Date) => {
    const y = date.getFullYear().toString().padStart(4, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },
  formatDate: (date: Date, locale: string) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  },
  formatDateLong: (date: Date, locale: string) => {
    return date.toDateString();
  },
  generateCalendarMonth: (year: number, month: number, opts: any) => ({
    weeks: [[
      { date: new Date(year, month, 1), day: 1, inCurrentMonth: true, isToday: false },
      { date: new Date(year, month, 2), day: 2, inCurrentMonth: true, isToday: false },
      { date: new Date(year, month, 3), day: 3, inCurrentMonth: true, isToday: false },
      { date: new Date(year, month, 4), day: 4, inCurrentMonth: true, isToday: false },
      { date: new Date(year, month, 5), day: 5, inCurrentMonth: true, isToday: false },
      { date: new Date(year, month, 6), day: 6, inCurrentMonth: true, isToday: false },
      { date: new Date(year, month, 7), day: 7, inCurrentMonth: true, isToday: false },
    ]],
  }),
  getDayOfWeekHeaders: (locale: string, weekStartsOn: number) => [
    { short: 'Su' }, { short: 'Mo' }, { short: 'Tu' }, { short: 'We' },
    { short: 'Th' }, { short: 'Fr' }, { short: 'Sa' },
  ],
  getMonthNames: (locale: string) => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  isSameDay: (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(),
  isDateDisabled: (date: Date, constraints: any) => false,
  isMonthDisabled: (year: number, month: number, constraints: any) => false,
}));

function mapRNProps(props: Record<string, any>) {
  const mapped: Record<string, any> = {};
  for (const [key, val] of Object.entries(props)) {
    if (key === 'testID') mapped['data-testid'] = val;
    else if (key === 'accessibilityRole') mapped['role'] = val;
    else if (key === 'accessibilityLabel') mapped['aria-label'] = val;
    else if (key === 'style' || key === 'pointerEvents' || key === 'accessible') continue;
    else mapped[key] = val;
  }
  return mapped;
}

import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './DatePicker.js';

describe('DatePicker', () => {
  it('renders without crashing', () => {
    render(<DatePicker name="appt" label="Appointment date" />);
    expect(screen.getByText('Appointment date')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<DatePicker name="appt" label="Appointment date" />);
    expect(screen.getByTestId('civ-date-picker-appt')).toBeTruthy();
  });

  it('shows placeholder text when no value selected', () => {
    render(<DatePicker name="appt" label="Appointment date" />);
    expect(screen.getByText('Select a date')).toBeTruthy();
  });

  it('shows custom placeholder', () => {
    render(<DatePicker name="appt" label="Date" placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(<DatePicker name="appt" label="Date" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<DatePicker name="appt" label="Date" hint="Select your appointment" />);
    expect(screen.getByText('Select your appointment')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<DatePicker name="appt" label="Date" error="Date is required" />);
    const errorEl = screen.getByText('Date is required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('shows formatted date when value is set', () => {
    render(<DatePicker name="appt" label="Date" value="2025-03-15" />);
    // Our mock formatDate returns "3/15/2025"
    expect(screen.getByText('3/15/2025')).toBeTruthy();
  });

  it('opens calendar modal on trigger press', () => {
    render(<DatePicker name="appt" label="Date" />);
    fireEvent.click(screen.getByTestId('civ-date-picker-appt-trigger'));
    // Calendar header should be visible
    expect(screen.getByText('Choose Date')).toBeTruthy();
  });

  it('renders trigger with button role', () => {
    render(<DatePicker name="appt" label="Date" />);
    const trigger = screen.getByTestId('civ-date-picker-appt-trigger');
    expect(trigger.getAttribute('role')).toBe('button');
  });
});
