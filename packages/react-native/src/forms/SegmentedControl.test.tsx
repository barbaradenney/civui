import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  TextInput: (props: any) => <input {...mapRNProps(props)} />,
  Pressable: ({ children, onPress, accessibilityState, ...props }: any) => (
    <button {...mapRNProps(props)} onClick={onPress}>
      {typeof children === 'function' ? children({ pressed: false }) : children}
    </button>
  ),
  StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  Platform: { OS: 'ios', select: (opts: any) => opts.ios },
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
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
import { SegmentedControl } from './SegmentedControl.js';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('renders without crashing', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} />);
    expect(screen.getByText('View mode')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} />);
    expect(screen.getByTestId('civ-segmented-control-view')).toBeTruthy();
  });

  it('renders the radiogroup accessibility role on the container', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} />);
    const container = screen.getByTestId('civ-segmented-control-view');
    expect(container.getAttribute('role')).toBe('radiogroup');
  });

  it('renders all segment options', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} />);
    expect(screen.getByText('Day')).toBeTruthy();
    expect(screen.getByText('Week')).toBeTruthy();
    expect(screen.getByText('Month')).toBeTruthy();
  });

  it('renders individual segments with radio role', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(3);
  });

  it('renders required indicator', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} hint="Choose one" />);
    expect(screen.getByText('Choose one')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} error="Required" />);
    const errorEl = screen.getByText('Required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('calls onChange when a segment is pressed', () => {
    const onChange = vi.fn();
    render(<SegmentedControl name="view" legend="View mode" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-segment-view-week'));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('renders segment testIDs based on name and value', () => {
    render(<SegmentedControl name="view" legend="View mode" options={options} />);
    expect(screen.getByTestId('civ-segment-view-day')).toBeTruthy();
    expect(screen.getByTestId('civ-segment-view-week')).toBeTruthy();
    expect(screen.getByTestId('civ-segment-view-month')).toBeTruthy();
  });
});
