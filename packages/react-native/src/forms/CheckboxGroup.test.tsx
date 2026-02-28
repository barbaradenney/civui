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
import { CheckboxGroup } from './CheckboxGroup.js';

const options = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
];

describe('CheckboxGroup', () => {
  it('renders without crashing', () => {
    render(<CheckboxGroup name="colors" legend="Favorite colors" options={options} />);
    expect(screen.getByText('Favorite colors')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<CheckboxGroup name="colors" legend="Favorite colors" options={options} />);
    expect(screen.getByTestId('civ-checkbox-group-colors')).toBeTruthy();
  });

  it('renders all checkbox options', () => {
    render(<CheckboxGroup name="colors" legend="Favorite colors" options={options} />);
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByText('Blue')).toBeTruthy();
    expect(screen.getByText('Green')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(<CheckboxGroup name="colors" legend="Favorite colors" options={options} required />);
    // The legend has the * indicator
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<CheckboxGroup name="colors" legend="Favorite colors" options={options} hint="Select all that apply" />);
    expect(screen.getByText('Select all that apply')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<CheckboxGroup name="colors" legend="Favorite colors" options={options} error="At least one required" />);
    const errorEl = screen.getByText('At least one required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('marks checkboxes as checked based on comma-separated value', () => {
    render(<CheckboxGroup name="colors" legend="Colors" options={options} value="red,green" />);
    // The child Checkbox components render with their own testIDs
    expect(screen.getByTestId('civ-checkbox-colors-red')).toBeTruthy();
    expect(screen.getByTestId('civ-checkbox-colors-green')).toBeTruthy();
  });

  it('calls onChange with updated values when a checkbox is toggled on', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup name="colors" legend="Colors" options={options} value="" onChange={onChange} />,
    );
    // Click the first checkbox (Red)
    const redControl = screen.getByTestId('civ-checkbox-colors-red-control');
    fireEvent.click(redControl);
    expect(onChange).toHaveBeenCalledWith(['red']);
  });

  it('calls onChange with removed value when a checkbox is toggled off', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup name="colors" legend="Colors" options={options} value="red,blue" onChange={onChange} />,
    );
    // Click the Red checkbox to uncheck it
    const redControl = screen.getByTestId('civ-checkbox-colors-red-control');
    fireEvent.click(redControl);
    expect(onChange).toHaveBeenCalledWith(['blue']);
  });
});
