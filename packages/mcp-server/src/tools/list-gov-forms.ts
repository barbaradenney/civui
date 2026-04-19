/**
 * list_gov_forms tool — returns all available government form definitions.
 */

import { GOV_FORMS } from '../resources/gov-form-registry.js';

export interface FormListItem {
  formNumber: string;
  title: string;
  description: string;
  chapterCount: number;
  respondentBurden: string;
}

export interface ListGovFormsResult {
  forms: FormListItem[];
  totalCount: number;
}

/**
 * List all registered government forms.
 */
export function listGovForms(): ListGovFormsResult {
  const forms = GOV_FORMS.map(f => ({
    formNumber: f.formNumber,
    title: f.title,
    description: f.description,
    chapterCount: f.chapters.length + (f.customChapters?.length || 0),
    respondentBurden: f.respondentBurden,
  }));

  return {
    forms,
    totalCount: forms.length,
  };
}
