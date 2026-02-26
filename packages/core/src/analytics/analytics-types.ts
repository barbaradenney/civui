export const ANALYTICS_EVENT_NAME = 'civ-analytics';

export type AnalyticsAction =
  | 'change'
  | 'click'
  | 'submit'
  | 'invalid'
  | 'select'
  | 'upload'
  | 'remove'
  | 'dismiss'
  | 'expand'
  | 'collapse';

export interface AnalyticsEventDetail {
  componentName: string;
  action: AnalyticsAction;
  fieldName?: string;
  label?: string;
  timestamp: string;
  details?: Record<string, string | number | boolean>;
}
