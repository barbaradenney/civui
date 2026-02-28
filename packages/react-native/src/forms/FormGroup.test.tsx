import { describe, it, expect } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: any) => <div {...mapRNProps(props)}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...mapRNProps(props)}>{children}</span>,
  StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
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

import { render, screen } from '@testing-library/react';
import { FormGroup } from './FormGroup.js';

describe('FormGroup', () => {
  it('renders without crashing', () => {
    render(
      <FormGroup>
        <div>child</div>
      </FormGroup>,
    );
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('renders with testID when name is provided', () => {
    render(
      <FormGroup name="address">
        <div>child</div>
      </FormGroup>,
    );
    expect(screen.getByTestId('civ-form-group-address')).toBeTruthy();
  });

  it('does not render testID when name is not provided', () => {
    const { container } = render(
      <FormGroup>
        <div>child</div>
      </FormGroup>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('renders label text', () => {
    render(
      <FormGroup label="Address">
        <div>child</div>
      </FormGroup>,
    );
    expect(screen.getByText('Address')).toBeTruthy();
  });

  it('renders required indicator with label', () => {
    render(
      <FormGroup label="Address" required>
        <div>child</div>
      </FormGroup>,
    );
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(
      <FormGroup label="Address" hint="Enter your mailing address">
        <div>child</div>
      </FormGroup>,
    );
    expect(screen.getByText('Enter your mailing address')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(
      <FormGroup label="Address" error="Address is required">
        <div>child</div>
      </FormGroup>,
    );
    const errorEl = screen.getByText('Address is required');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('renders children', () => {
    render(
      <FormGroup label="Address">
        <div>Street line 1</div>
        <div>City</div>
      </FormGroup>,
    );
    expect(screen.getByText('Street line 1')).toBeTruthy();
    expect(screen.getByText('City')).toBeTruthy();
  });

  it('sets accessibility label combining parts', () => {
    render(
      <FormGroup name="addr" label="Address" hint="Mailing address" error="Required" required>
        <div>child</div>
      </FormGroup>,
    );
    const group = screen.getByTestId('civ-form-group-addr');
    expect(group.getAttribute('aria-label')).toBe(
      'Address, required. Mailing address. Error: Required',
    );
  });
});
