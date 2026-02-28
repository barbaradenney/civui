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
import { Select } from './Select.js';

const options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
];

describe('Select', () => {
  it('renders without crashing', () => {
    render(<Select name="country" label="Country" options={options} />);
    expect(screen.getByText('Country')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<Select name="country" label="Country" options={options} />);
    expect(screen.getByTestId('civ-select-country')).toBeTruthy();
  });

  it('shows placeholder text when no value is selected', () => {
    render(<Select name="country" label="Country" options={options} />);
    expect(screen.getByText('Select an option')).toBeTruthy();
  });

  it('shows custom placeholder', () => {
    render(<Select name="country" label="Country" options={options} placeholder="Choose a country" />);
    expect(screen.getByText('Choose a country')).toBeTruthy();
  });

  it('shows selected option label when value is set', () => {
    render(<Select name="country" label="Country" options={options} value="us" />);
    expect(screen.getByText('United States')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(<Select name="country" label="Country" options={options} required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<Select name="country" label="Country" options={options} hint="Your country of residence" />);
    expect(screen.getByText('Your country of residence')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<Select name="country" label="Country" options={options} error="Selection required" />);
    const errorEl = screen.getByText('Selection required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('sets accessibility label on trigger', () => {
    render(<Select name="country" label="Country" options={options} required />);
    const trigger = screen.getByTestId('civ-select-country-trigger');
    expect(trigger.getAttribute('aria-label')).toBe('Country, required');
  });

  it('opens modal on trigger press and shows options', () => {
    render(<Select name="country" label="Country" options={options} />);
    const trigger = screen.getByTestId('civ-select-country-trigger');
    fireEvent.click(trigger);
    // After opening, the options should be visible in the modal
    expect(screen.getByText('United States')).toBeTruthy();
    expect(screen.getByText('Canada')).toBeTruthy();
    expect(screen.getByText('Mexico')).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(<Select name="country" label="Country" options={options} onChange={onChange} />);
    // Open the modal
    fireEvent.click(screen.getByTestId('civ-select-country-trigger'));
    // Click an option — find the menuitem role button containing "Canada"
    const canadaOption = screen.getAllByRole('menuitem').find(el => el.textContent?.includes('Canada'));
    expect(canadaOption).toBeTruthy();
    fireEvent.click(canadaOption!);
    expect(onChange).toHaveBeenCalledWith('ca');
  });
});
