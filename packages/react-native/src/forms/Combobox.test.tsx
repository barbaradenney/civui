import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  TextInput: ({ onChangeText, editable, autoFocus, accessibilityState, ...props }: any) => (
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
import { Combobox } from './Combobox.js';

const options = [
  { value: 'ny', label: 'New York' },
  { value: 'ca', label: 'California' },
  { value: 'tx', label: 'Texas' },
  { value: 'fl', label: 'Florida' },
];

describe('Combobox', () => {
  it('renders without crashing', () => {
    render(<Combobox name="state" label="State" options={options} />);
    expect(screen.getByText('State')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<Combobox name="state" label="State" options={options} />);
    expect(screen.getByTestId('civ-combobox-state')).toBeTruthy();
  });

  it('shows placeholder when no value is selected', () => {
    render(<Combobox name="state" label="State" options={options} />);
    expect(screen.getByText('Select an option')).toBeTruthy();
  });

  it('shows selected option label when value is set', () => {
    render(<Combobox name="state" label="State" options={options} value="ca" />);
    expect(screen.getByText('California')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(<Combobox name="state" label="State" options={options} required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<Combobox name="state" label="State" options={options} hint="Type to search" />);
    expect(screen.getByText('Type to search')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<Combobox name="state" label="State" options={options} error="Selection required" />);
    const errorEl = screen.getByText('Selection required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('sets combobox accessibility role on trigger', () => {
    render(<Combobox name="state" label="State" options={options} />);
    const trigger = screen.getByTestId('civ-combobox-state-trigger');
    expect(trigger.getAttribute('role')).toBe('combobox');
  });

  it('opens modal with filter input on trigger press', () => {
    render(<Combobox name="state" label="State" options={options} />);
    fireEvent.click(screen.getByTestId('civ-combobox-state-trigger'));
    // Filter input should be visible
    expect(screen.getByTestId('civ-combobox-state-filter')).toBeTruthy();
    // All options should be visible
    expect(screen.getByText('New York')).toBeTruthy();
    expect(screen.getByText('Texas')).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(<Combobox name="state" label="State" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-combobox-state-trigger'));
    const texasOption = screen.getAllByRole('menuitem').find(el => el.textContent?.includes('Texas'));
    expect(texasOption).toBeTruthy();
    fireEvent.click(texasOption!);
    expect(onChange).toHaveBeenCalledWith('tx', 'Texas');
  });

  it('sets accessibility label with all parts', () => {
    render(<Combobox name="state" label="State" options={options} hint="Find your state" error="Required" required />);
    const trigger = screen.getByTestId('civ-combobox-state-trigger');
    expect(trigger.getAttribute('aria-label')).toBe(
      'State, required. Find your state. Error: Required',
    );
  });
});
