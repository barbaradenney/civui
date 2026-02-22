import { describe, it, expect } from 'vitest';
import { mapAriaRole, buildAccessibilityState, buildAccessibilityLabel } from './a11y.js';

describe('mapAriaRole', () => {
  it('maps alert to alert', () => {
    expect(mapAriaRole('alert')).toBe('alert');
  });

  it('maps button to button', () => {
    expect(mapAriaRole('button')).toBe('button');
  });

  it('maps checkbox to checkbox', () => {
    expect(mapAriaRole('checkbox')).toBe('checkbox');
  });

  it('maps heading to header', () => {
    expect(mapAriaRole('heading')).toBe('header');
  });

  it('maps radio to radio', () => {
    expect(mapAriaRole('radio')).toBe('radio');
  });

  it('returns undefined for unknown roles', () => {
    expect(mapAriaRole('foobar')).toBeUndefined();
  });
});

describe('buildAccessibilityState', () => {
  it('returns empty state for no props', () => {
    const state = buildAccessibilityState({});
    expect(state).toEqual({});
  });

  it('includes disabled', () => {
    const state = buildAccessibilityState({ disabled: true });
    expect(state.disabled).toBe(true);
  });

  it('includes checked', () => {
    const state = buildAccessibilityState({ checked: true });
    expect(state.checked).toBe(true);
  });

  it('includes mixed checked state', () => {
    const state = buildAccessibilityState({ checked: 'mixed' });
    expect(state.checked).toBe('mixed');
  });

  it('includes selected', () => {
    const state = buildAccessibilityState({ selected: false });
    expect(state.selected).toBe(false);
  });

  it('includes expanded', () => {
    const state = buildAccessibilityState({ expanded: true });
    expect(state.expanded).toBe(true);
  });

  it('includes multiple states', () => {
    const state = buildAccessibilityState({ disabled: true, checked: false });
    expect(state).toEqual({ disabled: true, checked: false });
  });
});

describe('buildAccessibilityLabel', () => {
  it('returns label only', () => {
    expect(buildAccessibilityLabel({ label: 'Name' })).toBe('Name');
  });

  it('adds required to label', () => {
    expect(buildAccessibilityLabel({ label: 'Email', required: true })).toBe(
      'Email, required',
    );
  });

  it('combines label and hint', () => {
    expect(
      buildAccessibilityLabel({ label: 'Name', hint: 'Enter your name' }),
    ).toBe('Name. Enter your name');
  });

  it('combines label and error', () => {
    expect(
      buildAccessibilityLabel({ label: 'Email', error: 'Required' }),
    ).toBe('Email. Error: Required');
  });

  it('combines all parts', () => {
    expect(
      buildAccessibilityLabel({
        label: 'Email',
        hint: 'Work email',
        error: 'Invalid',
        required: true,
      }),
    ).toBe('Email, required. Work email. Error: Invalid');
  });

  it('handles empty parts', () => {
    expect(buildAccessibilityLabel({})).toBe('');
  });
});
