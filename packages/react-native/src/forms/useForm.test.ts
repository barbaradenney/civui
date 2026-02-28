import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm.js';

describe('useForm', () => {
  it('initializes with default empty state', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.errorList).toEqual([]);
    expect(result.current.submitted).toBe(false);
  });

  it('initializes with provided initial values', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { name: 'John', email: 'john@test.com' } }),
    );
    expect(result.current.values).toEqual({ name: 'John', email: 'john@test.com' });
  });

  it('getValue returns the value for a field', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { name: 'John' } }),
    );
    expect(result.current.getValue('name')).toBe('John');
  });

  it('getValue returns empty string for unknown field', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current.getValue('missing')).toBe('');
  });

  it('setValue updates a field value', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { name: '' } }),
    );

    act(() => {
      result.current.setValue('name', 'Jane');
    });

    expect(result.current.getValue('name')).toBe('Jane');
  });

  it('setError sets a field error', () => {
    const { result } = renderHook(() => useForm());

    act(() => {
      result.current.setError('email', 'Email is invalid');
    });

    expect(result.current.getError('email')).toBe('Email is invalid');
    expect(result.current.errors).toEqual({ email: 'Email is invalid' });
  });

  it('getError returns empty string for field with no error', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current.getError('name')).toBe('');
  });

  it('validate returns true when all fields are valid', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John' },
        fields: { name: { label: 'Name', required: true } },
      }),
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });
    expect(isValid!).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('validate returns false and sets errors for required empty fields', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: {
          name: { label: 'Name', required: true },
          email: { label: 'Email', required: true },
        },
      }),
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });
    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.email).toBe('Email is required');
  });

  it('validate runs custom validation', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'bad-email' },
        fields: {
          email: {
            label: 'Email',
            validate: (v) => (v.includes('@') ? undefined : 'Must be valid email'),
          },
        },
      }),
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });
    expect(isValid!).toBe(false);
    expect(result.current.errors.email).toBe('Must be valid email');
  });

  it('validate checks required before custom validation', () => {
    const validateFn = vi.fn().mockReturnValue(undefined);
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: {
          email: {
            label: 'Email',
            required: true,
            validate: validateFn,
          },
        },
      }),
    );

    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.email).toBe('Email is required');
    expect(validateFn).not.toHaveBeenCalled();
  });

  it('validate skips custom validation for empty non-required fields', () => {
    const validateFn = vi.fn().mockReturnValue('Bad');
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: {
          email: { label: 'Email', validate: validateFn },
        },
      }),
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });
    expect(isValid!).toBe(true);
    expect(validateFn).not.toHaveBeenCalled();
  });

  it('validate treats whitespace-only as empty for required', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: '   ' },
        fields: { name: { label: 'Name', required: true } },
      }),
    );

    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.name).toBe('Name is required');
  });

  it('validate uses field name when label is missing', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: { phone: { required: true } },
      }),
    );

    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.phone).toBe('phone is required');
  });

  it('handleSubmit calls onSubmit when valid', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John' },
        fields: { name: { label: 'Name', required: true } },
        onSubmit,
      }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    expect(result.current.submitted).toBe(true);
  });

  it('handleSubmit does not call onSubmit when invalid', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: { name: { label: 'Name', required: true } },
        onSubmit,
      }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.submitted).toBe(true);
    expect(result.current.errors.name).toBe('Name is required');
  });

  it('handleSubmit fires analytics on success', () => {
    const onAnalytics = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John' },
        fields: { name: { label: 'Name', required: true } },
        onSubmit: vi.fn(),
        onAnalytics,
      }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(onAnalytics).toHaveBeenCalledTimes(1);
    expect(onAnalytics.mock.calls[0][0].action).toBe('submit');
  });

  it('handleSubmit fires analytics on invalid with error count', () => {
    const onAnalytics = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: {
          name: { label: 'Name', required: true },
          email: { label: 'Email', required: true },
        },
        onAnalytics,
      }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(onAnalytics).toHaveBeenCalledTimes(1);
    expect(onAnalytics.mock.calls[0][0].action).toBe('invalid');
    expect(onAnalytics.mock.calls[0][0].details).toEqual({ errorCount: 2 });
  });

  it('setValue clears error for that field after submit', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: { name: { label: 'Name', required: true } },
      }),
    );

    // First submit to trigger errors
    act(() => {
      result.current.handleSubmit();
    });
    expect(result.current.errors.name).toBe('Name is required');

    // Setting value should clear the error
    act(() => {
      result.current.setValue('name', 'Jane');
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  it('setValue does not clear errors before first submit', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: { name: { label: 'Name', required: true } },
      }),
    );

    // Manually set an error
    act(() => {
      result.current.setError('name', 'Server error');
    });
    expect(result.current.errors.name).toBe('Server error');

    // Setting value before submit should not clear the error
    act(() => {
      result.current.setValue('name', 'Jane');
    });
    expect(result.current.errors.name).toBe('Server error');
  });

  it('reset restores initial values and clears errors', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John' },
        fields: { name: { label: 'Name', required: true } },
      }),
    );

    act(() => {
      result.current.setValue('name', 'Modified');
      result.current.setError('name', 'Some error');
      result.current.handleSubmit();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({ name: 'John' });
    expect(result.current.errors).toEqual({});
    expect(result.current.submitted).toBe(false);
  });

  it('fieldProps returns correct shape', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: 'John' },
      }),
    );

    const props = result.current.fieldProps('name');
    expect(props.name).toBe('name');
    expect(props.value).toBe('John');
    expect(props.error).toBeUndefined();
    expect(typeof props.onChange).toBe('function');
  });

  it('fieldProps includes error when present', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: { name: { label: 'Name', required: true } },
      }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    const props = result.current.fieldProps('name');
    expect(props.error).toBe('Name is required');
  });

  it('fieldProps onChange updates the value', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { name: '' } }),
    );

    act(() => {
      result.current.fieldProps('name').onChange('Jane');
    });

    expect(result.current.getValue('name')).toBe('Jane');
  });

  it('errorList reflects current errors', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: {},
        fields: {
          name: { label: 'Name', required: true },
          email: { label: 'Email', required: true },
        },
      }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.errorList).toHaveLength(2);
    expect(result.current.errorList).toContainEqual({ name: 'name', message: 'Name is required' });
    expect(result.current.errorList).toContainEqual({ name: 'email', message: 'Email is required' });
  });
});
