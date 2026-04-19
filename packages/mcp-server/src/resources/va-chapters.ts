/**
 * VA Chapter Templates — reusable FormSchema sections for VA.gov forms.
 *
 * Each chapter is a complete section definition with fields, validation,
 * hints, error messages, and autocomplete attributes pre-configured to
 * VA design standards. Chapters produce CivUI component HTML.
 */

import type { FormSection } from '../schema/index.js';

/** All available VA chapter template IDs. */
export type VAChapterId =
  | 'personal-info'
  | 'contact-info'
  | 'service-history'
  | 'direct-deposit'
  | 'document-upload'
  | 'review-submit';

/** Chapter metadata for task list display. */
export interface VAChapterMeta {
  id: VAChapterId;
  heading: string;
  hint: string;
  section: FormSection;
}

const BRANCH_OPTIONS = [
  { value: 'army', label: 'Army' },
  { value: 'navy', label: 'Navy' },
  { value: 'air-force', label: 'Air Force' },
  { value: 'marine-corps', label: 'Marine Corps' },
  { value: 'coast-guard', label: 'Coast Guard' },
  { value: 'space-force', label: 'Space Force' },
  { value: 'noaa', label: 'National Oceanic and Atmospheric Administration' },
  { value: 'usphs', label: 'United States Public Health Service' },
];

const DISCHARGE_OPTIONS = [
  { value: 'honorable', label: 'Honorable' },
  { value: 'general', label: 'General (under honorable conditions)' },
  { value: 'other-than-honorable', label: 'Other than honorable' },
  { value: 'bad-conduct', label: 'Bad conduct' },
  { value: 'dishonorable', label: 'Dishonorable' },
  { value: 'undesirable', label: 'Undesirable' },
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'homePhone', label: 'Home phone' },
  { value: 'mobilePhone', label: 'Mobile phone' },
  { value: 'mail', label: 'U.S. mail' },
];

/**
 * Get a chapter template by ID.
 */
export function getChapter(id: VAChapterId): VAChapterMeta {
  const chapter = VA_CHAPTERS[id];
  if (!chapter) throw new Error(`Unknown VA chapter: ${id}`);
  return chapter;
}

/**
 * Get multiple chapter templates by ID.
 */
export function getChapters(ids: VAChapterId[]): VAChapterMeta[] {
  return ids.map(getChapter);
}

/** All VA chapter templates. */
export const VA_CHAPTERS: Record<VAChapterId, VAChapterMeta> = {
  'personal-info': {
    id: 'personal-info',
    heading: 'Personal information',
    hint: 'Name, date of birth, Social Security number',
    section: {
      heading: 'Personal information',
      fields: [
        {
          type: 'text',
          name: 'fullName',
          label: 'component:civ-name',
          hint: 'component-props:legend="Your name" required',
          required: true,
        },
        {
          type: 'memorable-date',
          name: 'dateOfBirth',
          label: 'Date of birth',
          hint: 'For example: January 15 1990',
          required: true,
          autocomplete: 'bday',
        },
        {
          type: 'ssn',
          name: 'ssn',
          label: 'Social Security number',
          hint: 'We need this to verify your identity',
          required: true,
          autocomplete: 'off',
          inputmode: 'numeric',
        },
      ],
    },
  },

  'contact-info': {
    id: 'contact-info',
    heading: 'Contact information',
    hint: 'Address, phone, email',
    section: {
      heading: 'Contact information',
      fields: [
        {
          type: 'text',
          name: 'mailingAddress',
          label: 'component:civ-address',
          hint: 'component-props:legend="Mailing address" required',
          required: true,
        },
        {
          type: 'tel',
          name: 'homePhone',
          label: 'Home phone number',
          hint: 'Enter a 10-digit phone number',
          autocomplete: 'tel',
          inputmode: 'numeric',
        },
        {
          type: 'tel',
          name: 'mobilePhone',
          label: 'Mobile phone number',
          autocomplete: 'tel',
          inputmode: 'numeric',
        },
        {
          type: 'email',
          name: 'email',
          label: 'Email address',
          required: true,
          autocomplete: 'email',
        },
        {
          type: 'radio',
          name: 'contactMethod',
          label: 'How should we contact you if we have questions?',
          required: true,
          options: CONTACT_METHOD_OPTIONS,
        },
      ],
    },
  },

  'service-history': {
    id: 'service-history',
    heading: 'Service history',
    hint: 'Branch, dates, and character of service',
    section: {
      heading: 'Service history',
      repeatable: true,
      repeatableMin: 1,
      repeatableMax: 20,
      fields: [
        {
          type: 'combobox',
          name: 'branch',
          label: 'Branch of service',
          required: true,
          options: BRANCH_OPTIONS,
        },
        {
          type: 'memorable-date',
          name: 'serviceStartDate',
          label: 'Service start date',
          hint: 'If you don\'t know the exact date, enter your best estimate',
          required: true,
        },
        {
          type: 'memorable-date',
          name: 'serviceEndDate',
          label: 'Service end date',
          hint: 'If you don\'t know the exact date, enter your best estimate',
          required: true,
        },
        {
          type: 'select',
          name: 'dischargeType',
          label: 'Character of service',
          required: true,
          options: DISCHARGE_OPTIONS,
        },
      ],
    },
  },

  'direct-deposit': {
    id: 'direct-deposit',
    heading: 'Direct deposit',
    hint: 'Bank account for benefit payments',
    section: {
      heading: 'Direct deposit information',
      fields: [
        {
          type: 'text',
          name: 'directDeposit',
          label: 'component:civ-direct-deposit',
          hint: 'component-props:legend="Direct deposit information"',
        },
      ],
    },
  },

  'document-upload': {
    id: 'document-upload',
    heading: 'Supporting documents',
    hint: 'Upload DD214 and supporting evidence',
    section: {
      heading: 'Supporting documents',
      fields: [
        {
          type: 'file',
          name: 'documents',
          label: 'Upload supporting documents',
          hint: 'Upload PDF, JPG, or PNG files. Maximum file size: 20MB',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          maxSize: 20_000_000,
          maxFiles: 10,
        },
      ],
    },
  },

  'review-submit': {
    id: 'review-submit',
    heading: 'Review and submit',
    hint: 'Review your answers and submit your application',
    section: {
      heading: 'Review your application',
      fields: [],
    },
  },
};
