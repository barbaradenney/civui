import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from './useAnalytics.js';
import type { AnalyticsEvent } from './useAnalytics.js';

describe('useAnalytics', () => {
  it('returns a trackInteraction function', () => {
    const { result } = renderHook(() => useAnalytics());
    expect(typeof result.current.trackInteraction).toBe('function');
  });

  it('fires the handler when trackInteraction is called', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useAnalytics({ onAnalytics: handler }));

    act(() => {
      result.current.trackInteraction('TextInput', 'change', {
        fieldName: 'email',
        label: 'Email',
      });
    });

    expect(handler).toHaveBeenCalledTimes(1);
    const event: AnalyticsEvent = handler.mock.calls[0][0];
    expect(event.componentName).toBe('TextInput');
    expect(event.action).toBe('change');
    expect(event.fieldName).toBe('email');
    expect(event.label).toBe('Email');
    expect(event.timestamp).toBeTruthy();
  });

  it('does not fire the handler when disabled', () => {
    const handler = vi.fn();
    const { result } = renderHook(() =>
      useAnalytics({ onAnalytics: handler, disabled: true }),
    );

    act(() => {
      result.current.trackInteraction('TextInput', 'change');
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not throw when no handler is provided', () => {
    const { result } = renderHook(() => useAnalytics());
    expect(() => {
      act(() => {
        result.current.trackInteraction('TextInput', 'change');
      });
    }).not.toThrow();
  });

  it('never includes a value property in the event payload (PII safety)', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useAnalytics({ onAnalytics: handler }));

    act(() => {
      result.current.trackInteraction('TextInput', 'change', {
        fieldName: 'ssn',
        label: 'Social Security number',
      });
    });

    const event = handler.mock.calls[0][0];
    expect(event).not.toHaveProperty('value');
  });

  it('includes details metadata in the event', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useAnalytics({ onAnalytics: handler }));

    act(() => {
      result.current.trackInteraction('FileUpload', 'upload', {
        details: { fileCount: 3 },
      });
    });

    const event = handler.mock.calls[0][0];
    expect(event.details).toEqual({ fileCount: 3 });
  });

  it('produces a valid ISO timestamp', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useAnalytics({ onAnalytics: handler }));

    act(() => {
      result.current.trackInteraction('Toggle', 'change');
    });

    const event = handler.mock.calls[0][0];
    const parsed = new Date(event.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });
});
