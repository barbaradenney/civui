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
import { RadioGroup } from './Radio.js';

const options = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' },
];

describe('RadioGroup', () => {
  it('renders without crashing', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} />);
    expect(screen.getByText('Do you agree?')).toBeTruthy();
  });

  it('renders with testID', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} />);
    expect(screen.getByTestId('civ-radio-group-answer')).toBeTruthy();
  });

  it('renders the radiogroup accessibility role', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} />);
    const container = screen.getByTestId('civ-radio-group-answer');
    expect(container.getAttribute('role')).toBe('radiogroup');
  });

  it('renders all options', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} />);
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
    expect(screen.getByText('Maybe')).toBeTruthy();
  });

  it('renders individual radio buttons with radio role', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(3);
  });

  it('renders required indicator', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} hint="Choose one" />);
    expect(screen.getByText('Choose one')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(<RadioGroup name="answer" legend="Do you agree?" options={options} error="Selection required" />);
    const errorEl = screen.getByText('Selection required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(<RadioGroup name="answer" legend="Question" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('civ-radio-answer-no'));
    expect(onChange).toHaveBeenCalledWith('no');
  });

  it('renders option with testID per value', () => {
    render(<RadioGroup name="q" legend="Question" options={options} />);
    expect(screen.getByTestId('civ-radio-q-yes')).toBeTruthy();
    expect(screen.getByTestId('civ-radio-q-no')).toBeTruthy();
    expect(screen.getByTestId('civ-radio-q-maybe')).toBeTruthy();
  });

  it('renders option descriptions when provided', () => {
    const opts = [
      { value: 'a', label: 'Option A', description: 'First option' },
      { value: 'b', label: 'Option B', description: 'Second option' },
    ];
    render(<RadioGroup name="q" legend="Pick one" options={opts} />);
    expect(screen.getByText('First option')).toBeTruthy();
    expect(screen.getByText('Second option')).toBeTruthy();
  });
});
