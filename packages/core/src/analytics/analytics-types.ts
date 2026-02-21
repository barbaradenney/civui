export const ANALYTICS_EVENT_NAME = 'civds-analytics';

export type AnalyticsAction =
  | 'change'
  | 'submit'
  | 'invalid'
  | 'select'
  | 'upload'
  | 'remove'
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
