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
import { Toggle } from './Toggle.js';

describe('Toggle', () => {
  it('renders without crashing', () => {
    render(<Toggle name="notifications" label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<Toggle name="notifications" label="Enable notifications" />);
    expect(screen.getByTestId('civ-toggle-notifications')).toBeTruthy();
  });

  it('sets the switch accessibility role', () => {
    render(<Toggle name="notifications" label="Enable notifications" />);
    const control = screen.getByTestId('civ-toggle-notifications-control');
    expect(control.getAttribute('role')).toBe('switch');
  });

  it('renders the required indicator', () => {
    render(<Toggle name="notifications" label="Enable notifications" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text when provided', () => {
    render(<Toggle name="notifications" label="Enable" hint="Receive updates" />);
    expect(screen.getByText('Receive updates')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<Toggle name="notifications" label="Enable" error="Must enable" />);
    const errorEl = screen.getByText('Must enable');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('calls onChange when toggled off to on', () => {
    const onChange = vi.fn();
    render(<Toggle name="n" label="Notifications" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-toggle-n-control'));
    expect(onChange).toHaveBeenCalledWith(true, 'on');
  });

  it('calls onChange when toggled on to off', () => {
    const onChange = vi.fn();
    render(<Toggle name="n" label="Notifications" checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-toggle-n-control'));
    expect(onChange).toHaveBeenCalledWith(false, 'on');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Toggle name="n" label="Notifications" disabled onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-toggle-n-control'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders description text', () => {
    render(<Toggle name="n" label="Notifications" description="Get push notifications" />);
    expect(screen.getByText('Get push notifications')).toBeTruthy();
  });

  it('sets accessibility label combining parts', () => {
    render(<Toggle name="n" label="Notifications" hint="Push alerts" error="Required" required />);
    const control = screen.getByTestId('civ-toggle-n-control');
    expect(control.getAttribute('aria-label')).toBe(
      'Notifications, required. Push alerts. Error: Required',
    );
  });
});
