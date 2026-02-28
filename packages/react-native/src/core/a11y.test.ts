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

  it('maps heading to header (RN convention)', () => {
    expect(mapAriaRole('heading')).toBe('header');
  });

  it('maps img to image', () => {
    expect(mapAriaRole('img')).toBe('image');
  });

  it('maps radio to radio', () => {
    expect(mapAriaRole('radio')).toBe('radio');
  });

  it('maps switch to switch', () => {
    expect(mapAriaRole('switch')).toBe('switch');
  });

  it('maps combobox to combobox', () => {
    expect(mapAriaRole('combobox')).toBe('combobox');
  });

  it('maps listitem to none (RN has no listitem)', () => {
    expect(mapAriaRole('listitem')).toBe('none');
  });

  it('returns undefined for unknown roles', () => {
    expect(mapAriaRole('foobar')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(mapAriaRole('')).toBeUndefined();
  });
});

describe('buildAccessibilityState', () => {
  it('returns empty state for no props', () => {
    const state = buildAccessibilityState({});
    expect(state).toEqual({});
  });

  it('includes disabled when true', () => {
    const state = buildAccessibilityState({ disabled: true });
    expect(state.disabled).toBe(true);
  });

  it('includes disabled when false', () => {
    const state = buildAccessibilityState({ disabled: false });
    expect(state.disabled).toBe(false);
  });

  it('includes checked when true', () => {
    const state = buildAccessibilityState({ checked: true });
    expect(state.checked).toBe(true);
  });

  it('includes checked when false', () => {
    const state = buildAccessibilityState({ checked: false });
    expect(state.checked).toBe(false);
  });

  it('includes mixed checked state', () => {
    const state = buildAccessibilityState({ checked: 'mixed' });
    expect(state.checked).toBe('mixed');
  });

  it('includes selected', () => {
    const state = buildAccessibilityState({ selected: false });
    expect(state.selected).toBe(false);
  });

  it('includes busy', () => {
    const state = buildAccessibilityState({ busy: true });
    expect(state.busy).toBe(true);
  });

  it('includes expanded', () => {
    const state = buildAccessibilityState({ expanded: true });
    expect(state.expanded).toBe(true);
  });

  it('omits undefined props from result', () => {
    const state = buildAccessibilityState({ disabled: true });
    expect(Object.keys(state)).toEqual(['disabled']);
  });

  it('includes multiple states', () => {
    const state = buildAccessibilityState({ disabled: true, checked: false, expanded: true });
    expect(state).toEqual({ disabled: true, checked: false, expanded: true });
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

  it('does not add required when false', () => {
    expect(buildAccessibilityLabel({ label: 'Email', required: false })).toBe('Email');
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

  it('handles hint only (no label)', () => {
    expect(buildAccessibilityLabel({ hint: 'Some hint' })).toBe('Some hint');
  });

  it('handles error only (no label)', () => {
    expect(buildAccessibilityLabel({ error: 'Something wrong' })).toBe('Error: Something wrong');
  });
});
