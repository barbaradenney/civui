import type { FormSection } from '../schema/index.js';

/** Batch 2 VA form definitions — education change, home loan, vocational rehab, appeals. */
export const GOV_FORMS_BATCH2 = [
  // ── 22-1995: Change of School ───────────────────────────────
  {
    formNumber: '22-1995',
    title: 'Request a change of school or program',
    description:
      'Use this form to request a change of school, program, or place of training under your VA education benefits.',
    ombNumber: '2900-0074',
    respondentBurden: '10 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'direct-deposit',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'current-education',
        heading: 'Current education',
        hint: 'Your current school and VA file information',
        afterChapter: 'contact-info',
        section: {
          heading: 'Current education details',
          fields: [
            {
              type: 'text',
              name: 'currentSchoolName',
              label: 'Current school name',
              required: true,
            },
            {
              type: 'text',
              name: 'vaFileNumber',
              label: 'VA file number',
              hint: 'Your VA file number or SSN',
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'new-education',
        heading: 'New education',
        hint: 'Where you plan to attend and program details',
        afterChapter: 'current-education',
        section: {
          heading: 'New school and program information',
          fields: [
            {
              type: 'text',
              name: 'newSchoolName',
              label: 'New school name',
              required: true,
            },
            {
              type: 'text',
              name: 'newSchoolAddress',
              label: 'New school address',
            },
            {
              type: 'text',
              name: 'newProgramName',
              label: 'New program name',
              required: true,
            },
            {
              type: 'select',
              name: 'reasonForChange',
              label: 'Reason for change',
              options: [
                { value: 'relocation', label: 'Relocation' },
                { value: 'better-program', label: 'Better program' },
                { value: 'financial', label: 'Financial' },
                { value: 'personal', label: 'Personal' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              type: 'memorable-date',
              name: 'expectedStartDate',
              label: 'Expected start date',
              required: true,
            },
            {
              type: 'select',
              name: 'typeOfTraining',
              label: 'Type of training',
              options: [
                { value: 'college', label: 'College' },
                { value: 'vocational', label: 'Vocational' },
                { value: 'correspondence', label: 'Correspondence' },
                { value: 'on-the-job', label: 'On-the-job' },
                { value: 'flight', label: 'Flight' },
              ],
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Your VA file number or SSN',
      'Current school information',
      'New school name and address',
      'New program details',
      'Expected start date',
    ],
    nextSteps: [
      'We\'ll update your education records.',
      'Your new school\'s certifying official will be notified.',
      'Benefits transfer within 30 days.',
      'Contact your new school to complete enrollment.',
    ],
  },

  // ── 26-1880: Home Loan Certificate of Eligibility ───────────
  {
    formNumber: '26-1880',
    title: 'Request a Certificate of Eligibility for a VA home loan',
    description:
      'Use this form to request a Certificate of Eligibility for a VA-guaranteed home loan.',
    ombNumber: '2900-0086',
    respondentBurden: '15 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'loan-info',
        heading: 'Loan information',
        hint: 'Previous VA loan history and loan type',
        afterChapter: 'service-history',
        section: {
          heading: 'Loan information',
          fields: [
            {
              type: 'radio',
              name: 'previousLoan',
              label: 'Have you used VA home loan benefit before?',
              required: true,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'text',
              name: 'previousLoanAddress',
              label: 'Property address of previous VA loan',
              visibleWhen: { field: 'previousLoan', operator: 'eq', value: 'yes' },
            },
            {
              type: 'select',
              name: 'loanTypeRequested',
              label: 'Loan type requested',
              options: [
                { value: 'purchase', label: 'Purchase' },
                { value: 'refinance', label: 'Refinance' },
                { value: 'cash-out-refinance', label: 'Cash-out refinance' },
                { value: 'interest-rate-reduction', label: 'Interest rate reduction' },
              ],
            },
            {
              type: 'radio',
              name: 'survivingSpouse',
              label: 'Are you a surviving spouse?',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'Your DD214 or other proof of service',
      'Previous VA loan information if applicable',
      'Lender information',
    ],
    nextSteps: [
      'We\'ll verify your service and entitlement.',
      'COE issued within 5 business days if eligible.',
      'Share your COE with your lender.',
      'Your lender can also request your COE electronically.',
    ],
  },

  // ── 28-1900: Vocational Rehabilitation ──────────────────────
  {
    formNumber: '28-1900',
    title: 'Apply for Veteran Readiness and Employment',
    description:
      'Use this form to apply for Veteran Readiness and Employment (VR&E, formerly Vocational Rehabilitation) to help you find and keep a suitable job.',
    ombNumber: '2900-0154',
    respondentBurden: '20 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'disability-info',
        heading: 'Disability information',
        hint: 'Service-connected disability details',
        afterChapter: 'service-history',
        section: {
          heading: 'Disability information',
          fields: [
            {
              type: 'radio',
              name: 'disabilityRating',
              label: 'Do you have a service-connected disability rating?',
              required: true,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'select',
              name: 'disabilityRatingPercentage',
              label: 'Disability rating percentage',
              visibleWhen: { field: 'disabilityRating', operator: 'eq', value: 'yes' },
              options: [
                { value: '10', label: '10%' },
                { value: '20', label: '20%' },
                { value: '30', label: '30%' },
                { value: '40', label: '40%' },
                { value: '50', label: '50%' },
                { value: '60', label: '60%' },
                { value: '70', label: '70%' },
                { value: '80', label: '80%' },
                { value: '90', label: '90%' },
                { value: '100', label: '100%' },
              ],
            },
            {
              type: 'radio',
              name: 'disabilityAffectsEmployment',
              label: 'Does your disability make it hard to find or keep a job?',
              required: true,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'employment-goals',
        heading: 'Employment goals',
        hint: 'Your current status and career objectives',
        afterChapter: 'disability-info',
        section: {
          heading: 'Employment goals',
          fields: [
            {
              type: 'select',
              name: 'currentEmploymentStatus',
              label: 'Current employment status',
              options: [
                { value: 'employed-full-time', label: 'Employed full-time' },
                { value: 'employed-part-time', label: 'Employed part-time' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'student', label: 'Student' },
                { value: 'retired', label: 'Retired' },
              ],
            },
            {
              type: 'select',
              name: 'employmentGoal',
              label: 'Employment goal',
              options: [
                { value: 'new-career', label: 'New career' },
                { value: 'return-to-work', label: 'Return to work' },
                { value: 'self-employment', label: 'Self-employment' },
                { value: 'independent-living', label: 'Independent living' },
              ],
            },
            {
              type: 'select',
              name: 'educationCompleted',
              label: 'Education completed',
              options: [
                { value: 'high-school', label: 'High school' },
                { value: 'some-college', label: 'Some college' },
                { value: 'associates', label: 'Associate\'s degree' },
                { value: 'bachelors', label: 'Bachelor\'s degree' },
                { value: 'masters', label: 'Master\'s degree' },
                { value: 'doctorate', label: 'Doctorate' },
              ],
            },
            {
              type: 'textarea',
              name: 'additionalSkills',
              label: 'Any additional skills or training',
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Your Social Security number',
      'Your disability rating information',
      'Your employment history',
      'Your education history',
      'Any vocational goals or interests',
    ],
    nextSteps: [
      'A counselor will contact you within 2 weeks.',
      'You\'ll have an initial evaluation meeting.',
      'Together you\'ll create an individualized plan.',
      'Services may include training, education, or job placement.',
    ],
    eligibility: {
      questions: [
        {
          text: 'Do you have a service-connected disability rating of at least 10%?',
          type: 'yes-no' as const,
          disqualifyIf: 'no',
        },
        {
          text: 'Do you have a discharge that is other than dishonorable?',
          type: 'yes-no' as const,
          disqualifyIf: 'no',
        },
      ],
      passMessage:
        'You may be eligible for VR&E services. Continue to apply.',
      failMessage:
        'Based on your answers, you may not be eligible. Contact your local VA office for more information.',
    },
  },

  // ── 20-0995: Supplemental Claim ─────────────────────────────
  {
    formNumber: '20-0995',
    title: 'File a Supplemental Claim',
    description:
      'Use this form to file a Supplemental Claim if you have new and relevant evidence to support a previously denied claim.',
    ombNumber: '2900-0862',
    respondentBurden: '15 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'claim-details',
        heading: 'Claim details',
        hint: 'Information about your previous decision',
        afterChapter: 'contact-info',
        section: {
          heading: 'Claim details',
          fields: [
            {
              type: 'select',
              name: 'benefitType',
              label: 'Benefit type',
              required: true,
              options: [
                { value: 'compensation', label: 'Compensation' },
                { value: 'pension', label: 'Pension' },
                { value: 'survivors', label: 'Survivors' },
                { value: 'education', label: 'Education' },
                { value: 'vocationalRehab', label: 'Vocational rehabilitation' },
                { value: 'insurance', label: 'Insurance' },
              ],
            },
            {
              type: 'memorable-date',
              name: 'previousDecisionDate',
              label: 'Date of previous decision',
              required: true,
              hint: 'The date on your decision letter',
            },
            {
              type: 'textarea',
              name: 'issuesOnAppeal',
              label: 'Issues on appeal',
              required: true,
              hint: 'List each issue you are contesting, one per line',
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'new-evidence',
        heading: 'New evidence',
        hint: 'Details about your new and relevant evidence',
        afterChapter: 'claim-details',
        section: {
          heading: 'New and relevant evidence',
          fields: [
            {
              type: 'checkbox-group',
              name: 'newEvidenceType',
              label: 'Type of new evidence',
              options: [
                { value: 'va-medical-records', label: 'VA medical records' },
                { value: 'private-medical-records', label: 'Private medical records' },
                { value: 'lay-statements', label: 'Lay statements' },
                { value: 'service-records', label: 'Service records' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              type: 'textarea',
              name: 'newEvidenceDescription',
              label: 'Description of new evidence',
              required: true,
              hint: 'Describe what new evidence you have and why it is relevant',
            },
            {
              type: 'radio',
              name: 'vaHelpObtainRecords',
              label: 'Do you want VA to help obtain records?',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Your previous decision letter',
      'New and relevant evidence',
      'Details about the issues you\'re contesting',
      'Names of medical providers with new records',
    ],
    nextSteps: [
      'We\'ll review your new evidence.',
      'You may be asked to attend a new exam.',
      'Decision usually within 125 days.',
      'You can check status at VA.gov.',
    ],
  },

  // ── 20-0996: Higher-Level Review ────────────────────────────
  {
    formNumber: '20-0996',
    title: 'Request a Higher-Level Review',
    description:
      'Use this form to request a Higher-Level Review of a VA decision you disagree with. A senior reviewer will look at your case.',
    ombNumber: '2900-0862',
    respondentBurden: '10 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'review-details',
        heading: 'Review details',
        hint: 'Information about the decision you want reviewed',
        afterChapter: 'contact-info',
        section: {
          heading: 'Review details',
          fields: [
            {
              type: 'select',
              name: 'benefitType',
              label: 'Benefit type',
              required: true,
              options: [
                { value: 'compensation', label: 'Compensation' },
                { value: 'pension', label: 'Pension' },
                { value: 'survivors', label: 'Survivors' },
                { value: 'education', label: 'Education' },
                { value: 'vocationalRehab', label: 'Vocational rehabilitation' },
                { value: 'insurance', label: 'Insurance' },
              ],
            },
            {
              type: 'memorable-date',
              name: 'previousDecisionDate',
              label: 'Date of previous decision',
              required: true,
              hint: 'The date on your decision letter',
            },
            {
              type: 'textarea',
              name: 'issuesForReview',
              label: 'Issues for review',
              required: true,
              hint: 'List each issue you want reviewed',
            },
            {
              type: 'radio',
              name: 'informalConference',
              label: 'Do you want an informal conference?',
              hint: 'A phone call to discuss your case with the reviewer',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'select',
              name: 'preferredConferenceTime',
              label: 'Preferred conference time',
              visibleWhen: { field: 'informalConference', operator: 'eq', value: 'yes' },
              options: [
                { value: 'morning', label: 'Morning' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'no-preference', label: 'No preference' },
              ],
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Your previous decision letter',
      'The specific issues you disagree with',
      'Your preferred time for an informal conference (if desired)',
    ],
    nextSteps: [
      'A senior reviewer will examine your case.',
      'Informal conference scheduled within 30 days if requested.',
      'Decision usually within 125 days.',
      'No new evidence can be submitted with this request.',
    ],
  },
];
