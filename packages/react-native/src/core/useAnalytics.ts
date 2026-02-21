import { useCallback, useRef } from 'react';

export interface AnalyticsEvent {
  componentName: string;
  action: string;
  fieldName?: string;
  label?: string;
  timestamp: string;
  details?: Record<string, string | number | boolean>;
}

export type AnalyticsHandler = (event: AnalyticsEvent) => void;

export interface UseAnalyticsOptions {
  onAnalytics?: AnalyticsHandler;
  disabled?: boolean;
}

export interface UseAnalyticsReturn {
  trackInteraction: (
    componentName: string,
    action: string,
    opts?: { fieldName?: string; label?: string; details?: Record<string, string | number | boolean> },
  ) => void;
}

/**
 * useAnalytics — React hook for CivDS analytics tracking.
 *
 * Provides a `trackInteraction` function that builds analytics payloads
 * and forwards them to the provided handler. Payloads never contain
 * user input values (PII safety).
 */
export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const { onAnalytics, disabled = false } = options;
  const handlerRef = useRef(onAnalytics);
  handlerRef.current = onAnalytics;

  const trackInteraction = useCallback(
    (
      componentName: string,
      action: string,
      opts?: { fieldName?: string; label?: string; details?: Record<string, string | number | boolean> },
    ) => {
      if (disabled || !handlerRef.current) return;

      const event: AnalyticsEvent = {
        componentName,
        action,
        timestamp: new Date().toISOString(),
      };

      if (opts?.fieldName) event.fieldName = opts.fieldName;
      if (opts?.label) event.label = opts.label;
      if (opts?.details) event.details = opts.details;

      handlerRef.current(event);
    },
    [disabled],
  );

  return { trackInteraction };
}
