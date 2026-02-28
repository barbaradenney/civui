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
import { Fieldset } from './Fieldset.js';

describe('Fieldset', () => {
  it('renders without crashing', () => {
    render(
      <Fieldset>
        <div>child</div>
      </Fieldset>,
    );
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('renders legend text', () => {
    render(
      <Fieldset legend="Personal information">
        <div>child</div>
      </Fieldset>,
    );
    expect(screen.getByText('Personal information')).toBeTruthy();
  });

  it('renders required indicator with legend', () => {
    render(
      <Fieldset legend="Personal information" required>
        <div>child</div>
      </Fieldset>,
    );
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders hint text', () => {
    render(
      <Fieldset legend="Info" hint="Fill out all fields">
        <div>child</div>
      </Fieldset>,
    );
    expect(screen.getByText('Fill out all fields')).toBeTruthy();
  });

  it('renders error text with alert role', () => {
    render(
      <Fieldset legend="Info" error="Section has errors">
        <div>child</div>
      </Fieldset>,
    );
    const errorEl = screen.getByText('Section has errors');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });

  it('renders children', () => {
    render(
      <Fieldset legend="Info">
        <div>First name</div>
        <div>Last name</div>
      </Fieldset>,
    );
    expect(screen.getByText('First name')).toBeTruthy();
    expect(screen.getByText('Last name')).toBeTruthy();
  });

  it('sets accessibility label combining legend, hint, and error', () => {
    const { container } = render(
      <Fieldset legend="Personal info" hint="All fields required" error="Missing data" required>
        <div>child</div>
      </Fieldset>,
    );
    // The outer View has the accessibility label
    const outer = container.firstChild as HTMLElement;
    expect(outer.getAttribute('aria-label')).toBe(
      'Personal info, required. All fields required. Error: Missing data',
    );
  });

  it('does not render legend when not provided', () => {
    render(
      <Fieldset>
        <div>child content</div>
      </Fieldset>,
    );
    // Only the child should be present, no legend text
    expect(screen.getByText('child content')).toBeTruthy();
  });
});
