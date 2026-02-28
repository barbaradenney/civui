import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  TextInput: ({ onChangeText, editable, multiline, numberOfLines, accessibilityState, accessibilityHint, ...props }: any) => (
    <textarea
      {...mapRNProps(props)}
      onChange={onChangeText ? (e: any) => onChangeText(e.target.value) : undefined}
      disabled={editable === false}
      rows={numberOfLines}
    />
  ),
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
    else if (key === 'accessibilityLiveRegion') mapped['aria-live'] = val;
    else if (key === 'style' || key === 'pointerEvents' || key === 'accessible') continue;
    else mapped[key] = val;
  }
  return mapped;
}

import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea.js';

describe('Textarea', () => {
  it('renders without crashing', () => {
    render(<Textarea name="bio" label="Biography" />);
    expect(screen.getByText('Biography')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<Textarea name="bio" label="Biography" />);
    expect(screen.getByTestId('civ-textarea-bio')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(<Textarea name="bio" label="Biography" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<Textarea name="bio" label="Biography" hint="Tell us about yourself" />);
    expect(screen.getByText('Tell us about yourself')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<Textarea name="bio" label="Biography" error="Required" />);
    const errorEl = screen.getByText('Required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('sets accessibility label', () => {
    render(<Textarea name="bio" label="Biography" hint="A short bio" required />);
    const textarea = screen.getByTestId('civ-textarea-bio-input');
    expect(textarea.getAttribute('aria-label')).toBe('Biography, required. A short bio');
  });

  it('calls onInput when text changes', () => {
    const onInput = vi.fn();
    render(<Textarea name="bio" label="Biography" onInput={onInput} />);
    const textarea = screen.getByTestId('civ-textarea-bio-input');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(onInput).toHaveBeenCalledWith('Hello world');
  });

  it('shows character count when maxLength is set', () => {
    render(<Textarea name="bio" label="Biography" maxLength={200} value="Hello" />);
    expect(screen.getByText('195 characters remaining')).toBeTruthy();
  });

  it('does not show character count when maxLength is not set', () => {
    render(<Textarea name="bio" label="Biography" />);
    const charCountEl = screen.queryByText(/characters remaining/);
    expect(charCountEl).toBeNull();
  });

  it('passes value prop to the textarea', () => {
    render(<Textarea name="bio" label="Biography" value="My bio text" />);
    const textarea = screen.getByTestId('civ-textarea-bio-input') as HTMLTextAreaElement;
    // Textarea elements store value as a property, not attribute
    expect(textarea.value).toBe('My bio text');
  });
});
