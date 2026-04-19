/**
 * Government Form Registry — maps form numbers to their chapter structure.
 *
 * Each form definition specifies which shared chapters it uses, any
 * form-specific custom chapters, preparation items, and post-submission
 * next steps. Complex forms can include workflow states, multi-actor
 * roles, delegation/representative support, and dynamic chapters.
 */

import type { FormSection } from '../schema/index.js';
import type { GovChapterId } from './gov-chapters.js';

export interface GovFormDefinition {
  /** VA form number (e.g., "21-526EZ"). */
  formNumber: string;

  /** Plain language title (e.g., "Apply for disability compensation"). */
  title: string;

  /** Intro paragraph shown on the introduction page. */
  description: string;

  /** OMB control number from the paper form. */
  ombNumber: string;

  /** Estimated time to complete (e.g., "25 minutes"). */
  respondentBurden: string;

  /** Ordered list of shared chapter IDs from gov-chapters.ts. */
  chapters: GovChapterId[];

  /** Form-specific chapters not in the shared set. */
  customChapters?: Array<{
    id: string;
    heading: string;
    hint: string;
    section: FormSection;
    /** Insert after this chapter ID. If omitted, appended at end (before review). */
    afterChapter?: string;
  }>;

  /** Documents the applicant should gather before starting. */
  preparationItems: string[];

  /** What happens after submission — shown on confirmation page. */
  nextSteps: string[];

  /** Eligibility screener questions (optional). */
  eligibility?: {
    questions: Array<{
      text: string;
      type: 'yes-no' | 'select';
      options?: Array<{ value: string; label: string }>;
      disqualifyIf?: string;
    }>;
    passMessage: string;
    failMessage: string;
  };

  // ── Complex form features (optional) ──────────────────────

  /** Workflow state machine for multi-step review/approval. */
  workflow?: {
    initialState: string;
    states: Array<{
      id: string;
      label: string;
      description?: string;
      editableBy?: string[];
      visibleTo?: string[];
      allowsFeedback?: boolean;
      terminal?: boolean;
    }>;
    transitions: Array<{
      from: string;
      to: string;
      actor: string;
      label: string;
      requiresComment?: boolean;
      requiresAllSectionsComplete?: boolean;
      confirmationMessage?: string;
    }>;
  };

  /** Roles that interact with this form. */
  actors?: Array<{ id: string; label: string; description?: string }>;

  /** Representative/POA delegation support. */
  delegation?: {
    types: Array<{ id: string; label: string; requiresDocumentation?: boolean }>;
    attestation?: { text: string; signatureType: 'checkbox' | 'typed-signature' };
    subjectLabel?: string;
    representativeLabel?: string;
  };

  /** Chapters that appear/disappear based on form answers. */
  dynamicChapters?: Array<{
    chapterId: string;
    showWhen: { field: string; operator: 'eq' | 'neq'; value: string };
  }>;

  /** Feedback/comment configuration for reviewer workflows. */
  feedback?: {
    granularity: 'section' | 'field';
    requiresResolution?: boolean;
  };
}

/**
 * Look up a VA form definition by form number.
 */
export function getFormDefinition(formNumber: string): GovFormDefinition | undefined {
  const normalized = formNumber.toUpperCase().replace(/^VA\s*/i, '');
  return GOV_FORMS.find(f =>
    f.formNumber === normalized ||
    f.formNumber.replace(/-/g, '') === normalized.replace(/-/g, '')
  );
}

/**
 * Get all registered form numbers.
 */
export function getFormNumbers(): string[] {
  return GOV_FORMS.map(f => f.formNumber);
}

export const GOV_FORMS: GovFormDefinition[] = [
  // ── 21-526EZ: Disability Compensation ────────────────────────
  {
    formNumber: '21-526EZ',
    title: 'Apply for disability compensation',
    description: 'Use this form to file a claim for a new service-connected disability or to increase your disability rating.',
    ombNumber: '2900-0747',
    respondentBurden: '25 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'disabilities',
        heading: 'Disabilities',
        hint: 'Conditions you are claiming',
        afterChapter: 'service-history',
        section: {
          heading: 'Disabilities and conditions',
          repeatable: true,
          repeatableMin: 1,
          fields: [
            {
              type: 'text',
              name: 'conditionName',
              label: 'Name of condition',
              required: true,
              hint: 'For example: PTSD, tinnitus, knee pain',
            },
            {
              type: 'memorable-date',
              name: 'conditionOnsetDate',
              label: 'Approximate date condition began',
              hint: 'Enter your best estimate',
            },
            {
              type: 'radio',
              name: 'conditionCause',
              label: 'What caused this condition?',
              required: true,
              options: [
                { value: 'in-service', label: 'Caused by service' },
                { value: 'secondary', label: 'Caused by another service-connected condition' },
                { value: 'aggravated', label: 'Made worse by service' },
              ],
            },
          ],
        },
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'Your military service history (dates, branch, discharge)',
      'A copy of your DD214 or other separation documents',
      'Medical records related to your claimed conditions',
      'Bank account information for direct deposit (optional)',
    ],
    nextSteps: [
      'We\'ll review your claim and may contact you if we need more information.',
      'You can check the status of your claim online at VA.gov.',
      'Most claims are processed within 125 days.',
      'If we need you to attend a medical exam, we\'ll contact you to schedule one.',
    ],
    eligibility: {
      questions: [
        {
          text: 'Are you a Veteran or active-duty service member?',
          type: 'yes-no',
          disqualifyIf: 'no',
        },
        {
          text: 'Do you have a condition that was caused or made worse by your service?',
          type: 'yes-no',
          disqualifyIf: 'no',
        },
      ],
      passMessage: 'Based on your answers, you may be eligible for disability compensation. Continue to apply.',
      failMessage: 'Based on your answers, you may not be eligible for this benefit. Contact us if you have questions.',
    },
  },

  // ── 10-10EZ: Healthcare Enrollment ───────────────────────────
  {
    formNumber: '10-10EZ',
    title: 'Apply for VA health care',
    description: 'Use this form to apply for enrollment in VA health care benefits.',
    ombNumber: '2900-0091',
    respondentBurden: '30 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'insurance-info',
        heading: 'Insurance information',
        hint: 'Current health insurance details',
        afterChapter: 'contact-info',
        section: {
          heading: 'Health insurance information',
          fields: [
            {
              type: 'radio',
              name: 'hasInsurance',
              label: 'Do you have health insurance?',
              required: true,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'text',
              name: 'insuranceProvider',
              label: 'Insurance provider name',
              visibleWhen: { field: 'hasInsurance', operator: 'eq', value: 'yes' },
            },
            {
              type: 'text',
              name: 'insurancePolicyNumber',
              label: 'Policy or group number',
              visibleWhen: { field: 'hasInsurance', operator: 'eq', value: 'yes' },
            },
          ],
        },
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'Your military service history',
      'Your most recent tax return (for income verification)',
      'Health insurance information (if applicable)',
      'Information about any dependents',
    ],
    nextSteps: [
      'We\'ll review your application and determine your eligibility.',
      'You\'ll receive a decision letter by mail within 1-2 weeks.',
      'If approved, we\'ll help you schedule your first appointment.',
      'You can check your application status online at VA.gov.',
    ],
  },

  // ── 22-1990: Education Benefits ──────────────────────────────
  {
    formNumber: '22-1990',
    title: 'Apply for education benefits',
    description: 'Use this form to apply for Post-9/11 GI Bill or other VA education benefits.',
    ombNumber: '2900-0154',
    respondentBurden: '20 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'direct-deposit',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'education-info',
        heading: 'Education details',
        hint: 'School and program information',
        afterChapter: 'service-history',
        section: {
          heading: 'Education and training',
          fields: [
            {
              type: 'select',
              name: 'benefitType',
              label: 'Which benefit are you applying for?',
              required: true,
              options: [
                { value: 'post-911', label: 'Post-9/11 GI Bill (Chapter 33)' },
                { value: 'montgomery', label: 'Montgomery GI Bill (Chapter 30)' },
                { value: 'reserve', label: 'Reserve Educational Assistance (Chapter 1606)' },
                { value: 'vrap', label: 'Veterans Retraining Assistance Program' },
              ],
            },
            {
              type: 'text',
              name: 'schoolName',
              label: 'Name of school or training facility',
              required: true,
            },
            {
              type: 'memorable-date',
              name: 'schoolStartDate',
              label: 'Expected start date',
              required: true,
            },
          ],
        },
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'Your military service history',
      'The name and address of the school you plan to attend',
      'Your bank account information for direct deposit',
    ],
    nextSteps: [
      'We\'ll review your application and send you a Certificate of Eligibility (COE).',
      'Share your COE with your school\'s veterans certifying official.',
      'Your school will certify your enrollment to VA.',
      'Processing usually takes 30 days.',
    ],
  },

  // ── 21P-527EZ: Veterans Pension ──────────────────────────────
  {
    formNumber: '21P-527EZ',
    title: 'Apply for Veterans Pension',
    description: 'Use this form to apply for pension benefits for wartime Veterans with limited income.',
    ombNumber: '2900-0002',
    respondentBurden: '35 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'direct-deposit',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'financial-info',
        heading: 'Financial information',
        hint: 'Income, assets, and expenses',
        afterChapter: 'service-history',
        section: {
          heading: 'Financial information',
          fields: [
            {
              type: 'text',
              name: 'annualIncome',
              label: 'Total annual household income',
              hint: 'Include all sources of income',
              required: true,
              inputmode: 'numeric',
            },
            {
              type: 'text',
              name: 'netWorth',
              label: 'Total net worth',
              hint: 'Include bank accounts, investments, and property value',
              required: true,
              inputmode: 'numeric',
            },
            {
              type: 'text',
              name: 'medicalExpenses',
              label: 'Unreimbursed medical expenses in the past year',
              inputmode: 'numeric',
            },
          ],
        },
      },
      {
        id: 'marital-info',
        heading: 'Marital information',
        hint: 'Current marital status and spouse details',
        afterChapter: 'financial-info',
        section: {
          heading: 'Marital information',
          fields: [
            {
              type: 'radio',
              name: 'maritalStatus',
              label: 'What is your current marital status?',
              required: true,
              options: [
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced or annulled' },
                { value: 'separated', label: 'Separated' },
                { value: 'widowed', label: 'Widowed' },
                { value: 'never-married', label: 'Never married' },
              ],
            },
          ],
        },
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'Your military service history (dates, branch, discharge)',
      'Your DD214 or other separation documents',
      'Income and asset information for you and your spouse',
      'Medical expense records for the past year',
      'Bank account information for direct deposit',
    ],
    nextSteps: [
      'We\'ll review your application and may request additional financial information.',
      'You may need to attend a medical exam.',
      'Processing usually takes 3-6 months.',
      'You can check your application status at VA.gov.',
    ],
  },

  // ── 21-22: Representative Appointment (Complex Form) ─────
  {
    formNumber: '21-22',
    title: 'Appoint a Veterans Service Organization as your representative',
    description: 'Use this form to appoint a Veterans Service Organization (VSO) to help you with your VA claim.',
    ombNumber: '2900-0321',
    respondentBurden: '15 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'representative-info',
        heading: 'Representative information',
        hint: 'Organization and representative details',
        afterChapter: 'contact-info',
        section: {
          heading: 'Representative information',
          fields: [
            {
              type: 'text',
              name: 'organizationName',
              label: 'Veterans Service Organization name',
              required: true,
              hint: 'For example: Disabled American Veterans, American Legion',
            },
            {
              type: 'text',
              name: 'representativeName',
              label: 'Representative name',
              required: true,
            },
            {
              type: 'email',
              name: 'representativeEmail',
              label: 'Representative email',
              required: true,
            },
            {
              type: 'tel',
              name: 'representativePhone',
              label: 'Representative phone number',
            },
          ],
        },
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'The name of the VSO you want to appoint',
      'Your representative\'s contact information',
    ],
    nextSteps: [
      'We\'ll process your appointment request.',
      'Your VSO representative will be notified.',
      'They can then access your claim records and act on your behalf.',
      'You can change or revoke your representative at any time.',
    ],

    // ── Complex form features ──────────────────────────
    actors: [
      { id: 'veteran', label: 'Veteran' },
      { id: 'representative', label: 'VSO Representative' },
      { id: 'reviewer', label: 'VA Reviewer' },
    ],

    workflow: {
      initialState: 'draft',
      states: [
        { id: 'draft', label: 'Draft', editableBy: ['veteran', 'representative'] },
        { id: 'submitted', label: 'Submitted', editableBy: [] },
        { id: 'under-review', label: 'Under review', editableBy: ['reviewer'], allowsFeedback: true },
        { id: 'needs-changes', label: 'Changes requested', editableBy: ['veteran', 'representative'], allowsFeedback: true },
        { id: 'approved', label: 'Approved', terminal: true },
        { id: 'denied', label: 'Denied', terminal: true },
      ],
      transitions: [
        { from: 'draft', to: 'submitted', actor: 'veteran', label: 'Submit for review' },
        { from: 'draft', to: 'submitted', actor: 'representative', label: 'Submit on behalf of veteran' },
        { from: 'submitted', to: 'under-review', actor: 'reviewer', label: 'Begin review' },
        { from: 'under-review', to: 'needs-changes', actor: 'reviewer', label: 'Request changes', requiresComment: true },
        { from: 'under-review', to: 'approved', actor: 'reviewer', label: 'Approve', confirmationMessage: 'Are you sure you want to approve this appointment?' },
        { from: 'under-review', to: 'denied', actor: 'reviewer', label: 'Deny', requiresComment: true },
        { from: 'needs-changes', to: 'submitted', actor: 'veteran', label: 'Resubmit' },
        { from: 'needs-changes', to: 'submitted', actor: 'representative', label: 'Resubmit on behalf of veteran' },
      ],
    },

    delegation: {
      types: [
        { id: 'vso', label: 'Veterans Service Organization' },
        { id: 'attorney', label: 'Attorney', requiresDocumentation: true },
        { id: 'claims-agent', label: 'Claims Agent', requiresDocumentation: true },
      ],
      attestation: {
        text: 'I authorize the above-named organization/individual to act on my behalf in the preparation, presentation, and prosecution of my claim.',
        signatureType: 'typed-signature',
      },
      subjectLabel: 'Veteran',
      representativeLabel: 'Representative',
    },

    feedback: {
      granularity: 'section',
      requiresResolution: true,
    },

    dynamicChapters: [
      {
        chapterId: 'representative-info',
        showWhen: { field: 'fillingFor', operator: 'eq', value: 'representative' },
      },
    ],
  },
];
