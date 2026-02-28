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
import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('renders without crashing', () => {
    render(<Checkbox name="agree" label="I agree" />);
    expect(screen.getByText('I agree')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<Checkbox name="agree" label="I agree" />);
    expect(screen.getByTestId('civ-checkbox-agree')).toBeTruthy();
  });

  it('renders the required indicator', () => {
    render(<Checkbox name="agree" label="I agree" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text when provided', () => {
    render(<Checkbox name="agree" label="I agree" hint="Please review terms" />);
    expect(screen.getByText('Please review terms')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<Checkbox name="agree" label="I agree" error="You must agree" />);
    const errorEl = screen.getByText('You must agree');
    expect(errorEl).toBeTruthy();
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('sets the checkbox accessibility role on the pressable', () => {
    render(<Checkbox name="agree" label="I agree" />);
    const control = screen.getByTestId('civ-checkbox-agree-control');
    expect(control.getAttribute('role')).toBe('checkbox');
  });

  it('calls onChange when pressed', () => {
    const onChange = vi.fn();
    render(<Checkbox name="agree" label="I agree" onChange={onChange} />);
    const control = screen.getByTestId('civ-checkbox-agree-control');
    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true, 'on');
  });

  it('toggles checked state: unchecked -> checked', () => {
    const onChange = vi.fn();
    render(<Checkbox name="agree" label="I agree" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-checkbox-agree-control'));
    expect(onChange).toHaveBeenCalledWith(true, 'on');
  });

  it('toggles checked state: checked -> unchecked', () => {
    const onChange = vi.fn();
    render(<Checkbox name="agree" label="I agree" checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-checkbox-agree-control'));
    expect(onChange).toHaveBeenCalledWith(false, 'on');
  });

  it('uses custom value in onChange callback', () => {
    const onChange = vi.fn();
    render(<Checkbox name="agree" label="I agree" value="yes" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-checkbox-agree-control'));
    expect(onChange).toHaveBeenCalledWith(true, 'yes');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Checkbox name="agree" label="I agree" disabled onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-checkbox-agree-control'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders description text when provided', () => {
    render(<Checkbox name="agree" label="I agree" description="Terms and conditions apply" />);
    expect(screen.getByText('Terms and conditions apply')).toBeTruthy();
  });

  it('sets accessibility label combining label and error', () => {
    render(<Checkbox name="agree" label="I agree" error="Required" required />);
    const control = screen.getByTestId('civ-checkbox-agree-control');
    expect(control.getAttribute('aria-label')).toBe('I agree, required. Error: Required');
  });
});
