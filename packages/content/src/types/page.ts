import type { FormContent } from './form.js';

/** Content for a full page — future expansion point. */
export interface PageContent {
  $schema?: string;
  title?: string;
  description?: string;
  alerts?: Array<{
    type: 'info' | 'warning' | 'error' | 'success';
    heading?: string;
    body: string;
  }>;
  forms?: Record<string, FormContent>;
}
