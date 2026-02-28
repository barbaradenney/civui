import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  TextInput: ({ onChangeText, editable, secureTextEntry, keyboardType, inputMode, numberOfLines, accessibilityState, accessibilityHint, multiline, autoCapitalize, ...props }: any) => (
    <input
      {...mapRNProps(props)}
      onChange={onChangeText ? (e: any) => onChangeText(e.target.value) : undefined}
      disabled={editable === false}
      type={secureTextEntry ? 'password' : 'text'}
      data-keyboard-type={keyboardType}
    />
  ),
  Pressable: ({ children, onPress, accessibilityState, ...props }: any) => (
    <button {...mapRNProps(props)} onClick={onPress}>
      {typeof children === 'function' ? children({ pressed: false }) : children}
    </button>
  ),
  Modal: ({ children, visible, ...props }: any) => (visible ? <div data-modal="true">{children}</div> : null),
  FlatList: ({ data, renderItem, keyExtractor, ...props }: any) => (
    <div>{data?.map((item: any, i: number) => <div key={keyExtractor?.(item) ?? i}>{renderItem({ item, index: i })}</div>)}</div>
  ),
  StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  Platform: { OS: 'ios', select: (opts: any) => opts.ios },
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
  AccessibilityInfo: { isScreenReaderEnabled: vi.fn().mockResolvedValue(false) },
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
import { TextInput } from './TextInput.js';

describe('TextInput', () => {
  it('renders without crashing', () => {
    render(<TextInput name="email" label="Email" />);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<TextInput name="email" label="Email" />);
    expect(screen.getByTestId('civ-text-input-email')).toBeTruthy();
  });

  it('renders the label text', () => {
    render(<TextInput name="email" label="Email address" />);
    expect(screen.getByText('Email address')).toBeTruthy();
  });

  it('renders the required indicator', () => {
    render(<TextInput name="email" label="Email" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text when provided', () => {
    render(<TextInput name="email" label="Email" hint="Enter your work email" />);
    expect(screen.getByText('Enter your work email')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<TextInput name="email" label="Email" error="Email is required" />);
    const errorEl = screen.getByText('Email is required');
    expect(errorEl).toBeTruthy();
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('sets accessibility label combining label, hint, and error', () => {
    render(
      <TextInput name="email" label="Email" hint="Work email" error="Required" required />,
    );
    const input = screen.getByTestId('civ-text-input-email-input');
    expect(input.getAttribute('aria-label')).toBe(
      'Email, required. Work email. Error: Required',
    );
  });

  it('disables the input when disabled prop is set', () => {
    render(<TextInput name="email" label="Email" disabled />);
    const input = screen.getByTestId('civ-text-input-email-input');
    expect(input.hasAttribute('disabled')).toBe(true);
  });

  it('calls onInput when text changes', () => {
    const onInput = vi.fn();
    render(<TextInput name="email" label="Email" onInput={onInput} />);
    const input = screen.getByTestId('civ-text-input-email-input');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(onInput).toHaveBeenCalledWith('test@example.com');
  });

  it('renders value prop in input', () => {
    render(<TextInput name="email" label="Email" value="hello@gov.uk" />);
    const input = screen.getByTestId('civ-text-input-email-input');
    expect(input.getAttribute('value')).toBe('hello@gov.uk');
  });

  it('sets password type for type=password', () => {
    render(<TextInput name="pw" label="Password" type="password" />);
    const input = screen.getByTestId('civ-text-input-pw-input');
    expect(input.getAttribute('type')).toBe('password');
  });
});
