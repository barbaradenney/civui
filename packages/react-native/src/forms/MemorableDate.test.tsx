import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  TextInput: ({ onChangeText, editable, keyboardType, inputMode, accessibilityState, accessibilityHint, ...props }: any) => (
    <input
      {...mapRNProps(props)}
      onChange={onChangeText ? (e: any) => onChangeText(e.target.value) : undefined}
      disabled={editable === false}
    />
  ),
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
  getMonthNames: (locale: string) => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  parseISODate: (iso: string) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    return date;
  },
}));

function mapRNProps(props: Record<string, any>) {
  const mapped: Record<string, any> = {};
  for (const [key, val] of Object.entries(props)) {
    if (key === 'testID') mapped['data-testid'] = val;
    else if (key === 'accessibilityRole') mapped['role'] = val;
    else if (key === 'accessibilityLabel') mapped['aria-label'] = val;
    else if (key === 'accessibilityLiveRegion') mapped['aria-live'] = val;
    else if (key === 'style' || key === 'pointerEvents' || key === 'accessible') continue;
    else mapped[key] = val;
  }
  return mapped;
}

import { render, screen, fireEvent } from '@testing-library/react';
import { MemorableDate } from './MemorableDate.js';

describe('MemorableDate', () => {
  it('renders without crashing', () => {
    render(<MemorableDate name="dob" legend="Date of birth" />);
    expect(screen.getByText('Date of birth')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<MemorableDate name="dob" legend="Date of birth" />);
    expect(screen.getByTestId('civ-memorable-date-dob')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(<MemorableDate name="dob" legend="Date of birth" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<MemorableDate name="dob" legend="Date of birth" hint="For example: January 15 1990" />);
    expect(screen.getByText('For example: January 15 1990')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<MemorableDate name="dob" legend="Date of birth" error="Date is required" />);
    const errorEl = screen.getByText('Date is required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('renders Month, Day, and Year field labels', () => {
    render(<MemorableDate name="dob" legend="Date of birth" />);
    expect(screen.getByText('Month')).toBeTruthy();
    expect(screen.getByText('Day')).toBeTruthy();
    expect(screen.getByText('Year')).toBeTruthy();
  });

  it('renders custom field labels', () => {
    render(
      <MemorableDate
        name="dob"
        legend="Date of birth"
        monthLabel="Mes"
        dayLabel="Dia"
        yearLabel="Ano"
      />,
    );
    expect(screen.getByText('Mes')).toBeTruthy();
    expect(screen.getByText('Dia')).toBeTruthy();
    expect(screen.getByText('Ano')).toBeTruthy();
  });

  it('renders day and year input fields', () => {
    render(<MemorableDate name="dob" legend="Date of birth" />);
    expect(screen.getByTestId('civ-memorable-date-dob-day')).toBeTruthy();
    expect(screen.getByTestId('civ-memorable-date-dob-year')).toBeTruthy();
  });

  it('renders month trigger', () => {
    render(<MemorableDate name="dob" legend="Date of birth" />);
    expect(screen.getByTestId('civ-memorable-date-dob-month-trigger')).toBeTruthy();
  });

  it('opens month picker modal on trigger press', () => {
    render(<MemorableDate name="dob" legend="Date of birth" />);
    fireEvent.click(screen.getByTestId('civ-memorable-date-dob-month-trigger'));
    // After opening, month options should be visible
    expect(screen.getByText('January')).toBeTruthy();
    expect(screen.getByText('December')).toBeTruthy();
  });

  it('parses value prop into fields', () => {
    render(<MemorableDate name="dob" legend="Date of birth" value="1990-01-15" />);
    // Day input should have value 15
    const dayInput = screen.getByTestId('civ-memorable-date-dob-day');
    expect(dayInput.getAttribute('value')).toBe('15');
    // Year input should have value 1990
    const yearInput = screen.getByTestId('civ-memorable-date-dob-year');
    expect(yearInput.getAttribute('value')).toBe('1990');
  });
});
