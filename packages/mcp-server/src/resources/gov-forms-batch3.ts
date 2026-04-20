import type { FormSection } from '../schema/index.js';

/** Batch 3 VA form definitions — appeals, burial, CHAMPVA, disclosure. */
export const GOV_FORMS_BATCH3 = [
  // ── 10182: Board Appeal (Notice of Disagreement) ──────────
  {
    formNumber: '10182',
    title: 'Request a Board Appeal',
    description: 'Use this form to appeal a VA decision to the Board of Veterans\' Appeals.',
    ombNumber: '2900-0674',
    respondentBurden: '20 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'appeal-details',
        heading: 'Appeal details',
        hint: 'Information about the decision you are appealing',
        afterChapter: 'contact-info',
        section: {
          heading: 'Appeal details',
          fields: [
            {
              type: 'memorable-date',
              name: 'decisionDate',
              label: 'Date of decision being appealed',
              required: true,
              hint: 'The date on your decision letter',
            },
            {
              type: 'textarea',
              name: 'issuesOnAppeal',
              label: 'Issues on appeal',
              required: true,
              hint: 'List each issue you are appealing, one per line',
            },
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
                { value: 'insurance', label: 'Insurance' },
                { value: 'vocationalRehab', label: 'Vocational Rehabilitation' },
                { value: 'loanGuaranty', label: 'Loan Guaranty' },
              ],
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'board-options',
        heading: 'Board review options',
        hint: 'Choose how the Board will review your appeal',
        afterChapter: 'appeal-details',
        section: {
          heading: 'Board review options',
          fields: [
            {
              type: 'radio',
              name: 'reviewOption',
              label: 'Review option',
              required: true,
              options: [
                { value: 'direct-review', label: 'Direct Review — board reviews existing evidence' },
                { value: 'evidence-submission', label: 'Evidence Submission — submit new evidence within 90 days' },
                { value: 'hearing', label: 'Hearing — present your case at a hearing' },
              ],
            },
            {
              type: 'select',
              name: 'hearingType',
              label: 'Hearing type',
              visibleWhen: { field: 'reviewOption', operator: 'eq', value: 'hearing' },
              options: [
                { value: 'videoconference', label: 'Video conference' },
                { value: 'virtual', label: 'Virtual' },
                { value: 'in-person', label: 'In person at the Board in Washington DC' },
              ],
            },
            {
              type: 'radio',
              name: 'hasRepresentative',
              label: 'Do you have a representative?',
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
      'Your VA decision letter',
      'The specific issues you want to appeal',
      'Any new evidence (if choosing Evidence Submission)',
      'Representative information (if applicable)',
    ],
    nextSteps: [
      'Board will acknowledge receipt of your appeal',
      'If you chose a hearing it will be scheduled',
      'Direct Review appeals average 365 days',
      'You can check status at VA.gov',
    ],
  },

  // ── 21P-530: Burial Benefits ──────────────────────────────
  {
    formNumber: '21P-530',
    title: 'Apply for burial benefits',
    description: 'Use this form to apply for VA burial allowance to help cover burial, funeral, and transportation costs.',
    ombNumber: '2900-0003',
    respondentBurden: '20 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'direct-deposit',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'deceased-veteran',
        heading: 'Deceased Veteran information',
        hint: 'Information about the Veteran who passed away',
        afterChapter: 'contact-info',
        section: {
          heading: 'Deceased Veteran information',
          fields: [
            {
              type: 'text',
              name: 'veteranFullName',
              label: 'Veteran\'s full name',
              required: true,
            },
            {
              type: 'ssn',
              name: 'veteranSsn',
              label: 'Veteran\'s Social Security number',
              required: true,
            },
            {
              type: 'memorable-date',
              name: 'veteranDateOfBirth',
              label: 'Veteran\'s date of birth',
              required: true,
            },
            {
              type: 'memorable-date',
              name: 'veteranDateOfDeath',
              label: 'Veteran\'s date of death',
              required: true,
            },
            {
              type: 'text',
              name: 'veteranPlaceOfBurial',
              label: 'Veteran\'s place of burial',
              required: true,
            },
            {
              type: 'radio',
              name: 'veteranReceivingBenefits',
              label: 'Was the Veteran receiving VA compensation or pension at time of death?',
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
        id: 'burial-expenses',
        heading: 'Burial expenses',
        hint: 'Details about burial costs and expenses',
        afterChapter: 'deceased-veteran',
        section: {
          heading: 'Burial expenses',
          fields: [
            {
              type: 'radio',
              name: 'burialType',
              label: 'Type of burial',
              required: true,
              options: [
                { value: 'non-service-connected', label: 'Non-service-connected death' },
                { value: 'service-connected', label: 'Service-connected death' },
                { value: 'unclaimed-remains', label: 'Unclaimed remains' },
              ],
            },
            {
              type: 'memorable-date',
              name: 'dateOfBurial',
              label: 'Date of burial',
              required: true,
            },
            {
              type: 'text',
              name: 'totalBurialCosts',
              label: 'Total burial costs',
              required: true,
              inputmode: 'numeric',
              hint: 'Enter total amount of burial expenses',
            },
            {
              type: 'radio',
              name: 'govPaid',
              label: 'Has government or employer already paid part of costs?',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'text',
              name: 'amountAlreadyReceived',
              label: 'Amount already received',
              inputmode: 'numeric',
              visibleWhen: { field: 'govPaid', operator: 'eq', value: 'yes' },
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'claimant-info',
        heading: 'Claimant information',
        hint: 'Your relationship to the Veteran and payment details',
        afterChapter: 'burial-expenses',
        section: {
          heading: 'Claimant information',
          fields: [
            {
              type: 'select',
              name: 'relationshipToVeteran',
              label: 'Your relationship to the Veteran',
              required: true,
              options: [
                { value: 'spouse', label: 'Spouse' },
                { value: 'child', label: 'Child' },
                { value: 'parent', label: 'Parent' },
                { value: 'executor', label: 'Executor' },
                { value: 'funeral-director', label: 'Funeral director' },
                { value: 'other', label: 'Other' },
              ],
            },
            {
              type: 'radio',
              name: 'paidBurialExpenses',
              label: 'Did you pay the burial expenses?',
              required: true,
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
      'Veteran\'s DD214 or discharge papers',
      'Death certificate',
      'Itemized burial expense receipts',
      'Veteran\'s Social Security number',
      'Your bank account information for direct deposit',
    ],
    nextSteps: [
      'We\'ll review your claim and verify the Veteran\'s service',
      'Decision usually within 60 days',
      'Payment sent by direct deposit or check',
      'Contact us if you need to submit additional receipts',
    ],
  },

  // ── 21-0845: Authorization to Disclose ────────────────────
  {
    formNumber: '21-0845',
    title: 'Authorize VA to disclose your information',
    description: 'Use this form to authorize VA to release your personal information to a third party.',
    ombNumber: '2900-0736',
    respondentBurden: '10 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'disclosure-details',
        heading: 'Disclosure details',
        hint: 'Who you are authorizing and what information to release',
        afterChapter: 'contact-info',
        section: {
          heading: 'Disclosure details',
          fields: [
            {
              type: 'text',
              name: 'authorizedRecipient',
              label: 'Who are you authorizing VA to release information to?',
              required: true,
              hint: 'Name of person or organization',
            },
            {
              type: 'text',
              name: 'recipientMailingAddress',
              label: 'Their mailing address',
            },
            {
              type: 'tel',
              name: 'recipientPhone',
              label: 'Their phone number',
            },
            {
              type: 'checkbox-group',
              name: 'informationToDisclose',
              label: 'Information to disclose',
              required: true,
              options: [
                { value: 'claim-status', label: 'Claim or appeal status' },
                { value: 'payment-info', label: 'Payment information' },
                { value: 'medical-records', label: 'Medical records' },
                { value: 'service-records', label: 'Service records' },
                { value: 'personal-info', label: 'Personal information' },
              ],
            },
            {
              type: 'textarea',
              name: 'purposeOfDisclosure',
              label: 'Purpose of disclosure',
              hint: 'Why do you need this information released?',
            },
            {
              type: 'radio',
              name: 'authExpiration',
              label: 'Authorization expiration',
              options: [
                { value: 'one-year', label: 'One year from today' },
                { value: 'specific-date', label: 'Specific date' },
                { value: 'no-expiration', label: 'Until I revoke it' },
              ],
            },
            {
              type: 'memorable-date',
              name: 'expirationDate',
              label: 'Expiration date',
              visibleWhen: { field: 'authExpiration', operator: 'eq', value: 'specific-date' },
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Name and address of the person or organization',
      'The specific information you want to release',
      'How long you want the authorization to last',
    ],
    nextSteps: [
      'Your authorization will be recorded',
      'The authorized party can now request your information',
      'You can revoke this authorization at any time',
      'Contact us to update or cancel',
    ],
  },

  // ── 40-10007: Pre-Need Burial Eligibility ─────────────────
  {
    formNumber: '40-10007',
    title: 'Apply for pre-need burial eligibility',
    description: 'Use this form to find out in advance if you or your family members can be buried in a VA national cemetery.',
    ombNumber: '2900-0784',
    respondentBurden: '20 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'service-history',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'burial-preferences',
        heading: 'Burial preferences',
        hint: 'Your preferred cemetery and burial type',
        afterChapter: 'service-history',
        section: {
          heading: 'Burial preferences',
          fields: [
            {
              type: 'text',
              name: 'preferredCemetery',
              label: 'Preferred VA national cemetery',
              hint: 'Enter the name of the cemetery, or leave blank for any',
            },
            {
              type: 'radio',
              name: 'burialType',
              label: 'Type of burial',
              required: true,
              options: [
                { value: 'casket', label: 'Casket (in-ground)' },
                { value: 'cremation', label: 'Cremation (in-ground or columbarium)' },
                { value: 'both', label: 'No preference' },
              ],
            },
            {
              type: 'radio',
              name: 'designateSpouse',
              label: 'Do you want to designate a spouse or dependent for burial?',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'designee-info',
        heading: 'Designee information',
        hint: 'Information about the spouse or dependent you are designating',
        afterChapter: 'burial-preferences',
        section: {
          heading: 'Designee information',
          visibleWhen: { field: 'designateSpouse', operator: 'eq', value: 'yes' },
          fields: [
            {
              type: 'text',
              name: 'designeeFullName',
              label: 'Designee full name',
              required: true,
            },
            {
              type: 'memorable-date',
              name: 'designeeDateOfBirth',
              label: 'Designee date of birth',
              required: true,
            },
            {
              type: 'select',
              name: 'designeeRelationship',
              label: 'Relationship',
              required: true,
              options: [
                { value: 'spouse', label: 'Spouse' },
                { value: 'dependent-child', label: 'Dependent child' },
              ],
            },
            {
              type: 'ssn',
              name: 'designeeSsn',
              label: 'Designee Social Security number',
            },
          ],
        } satisfies FormSection,
      },
    ],
    preparationItems: [
      'Your DD214 or other proof of service',
      'Your Social Security number',
      'Preferred cemetery name (optional)',
      'Spouse or dependent information (optional)',
    ],
    nextSteps: [
      'We\'ll determine your eligibility and send a decision letter',
      'Eligibility determination usually within 30 days',
      'Keep your decision letter in a safe place',
      'Your family will need the letter at time of need',
    ],
    eligibility: {
      questions: [
        {
          text: 'Are you a Veteran, active duty service member, or eligible family member?',
          type: 'yes-no' as const,
          disqualifyIf: 'no',
        },
      ],
      passMessage: 'You may be eligible. Continue to apply.',
      failMessage: 'Based on your answer, you may not be eligible for pre-need burial in a VA national cemetery.',
    },
  },

  // ── 10-10D: CHAMPVA Benefits ──────────────────────────────
  {
    formNumber: '10-10D',
    title: 'Apply for CHAMPVA benefits',
    description: 'Use this form to apply for the Civilian Health and Medical Program of the Department of Veterans Affairs (CHAMPVA).',
    ombNumber: '2900-0219',
    respondentBurden: '25 minutes',
    chapters: [
      'personal-info',
      'contact-info',
      'document-upload',
      'review-submit',
    ],
    customChapters: [
      {
        id: 'sponsor-veteran',
        heading: 'Sponsor Veteran',
        hint: 'Information about the Veteran who sponsors your CHAMPVA eligibility',
        afterChapter: 'contact-info',
        section: {
          heading: 'Sponsor Veteran information',
          fields: [
            {
              type: 'text',
              name: 'sponsorVeteranName',
              label: 'Sponsor Veteran\'s full name',
              required: true,
            },
            {
              type: 'ssn',
              name: 'sponsorVeteranSsn',
              label: 'Sponsor Veteran\'s Social Security number',
              required: true,
            },
            {
              type: 'memorable-date',
              name: 'sponsorVeteranDob',
              label: 'Sponsor Veteran\'s date of birth',
            },
            {
              type: 'radio',
              name: 'sponsorPermanentlyDisabled',
              label: 'Is the sponsor Veteran permanently and totally disabled?',
              required: true,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'radio',
              name: 'sponsorDeceased',
              label: 'Is the sponsor Veteran deceased?',
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
          ],
        } satisfies FormSection,
      },
      {
        id: 'beneficiary-info',
        heading: 'Beneficiary information',
        hint: 'Your relationship to the sponsor and insurance details',
        afterChapter: 'sponsor-veteran',
        section: {
          heading: 'Beneficiary information',
          fields: [
            {
              type: 'select',
              name: 'relationshipToSponsor',
              label: 'Your relationship to the sponsor',
              required: true,
              options: [
                { value: 'spouse', label: 'Spouse' },
                { value: 'surviving-spouse', label: 'Surviving spouse' },
                { value: 'child', label: 'Child' },
                { value: 'stepchild', label: 'Stepchild' },
              ],
            },
            {
              type: 'memorable-date',
              name: 'beneficiaryDob',
              label: 'Your date of birth',
              required: true,
            },
            {
              type: 'radio',
              name: 'otherInsurance',
              label: 'Do you have other health insurance?',
              required: true,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ],
            },
            {
              type: 'text',
              name: 'otherInsuranceProvider',
              label: 'Other insurance provider',
              visibleWhen: { field: 'otherInsurance', operator: 'eq', value: 'yes' },
            },
            {
              type: 'text',
              name: 'otherInsurancePolicyNumber',
              label: 'Other insurance policy number',
              visibleWhen: { field: 'otherInsurance', operator: 'eq', value: 'yes' },
            },
            {
              type: 'radio',
              name: 'medicareEligible',
              label: 'Are you eligible for Medicare?',
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
      'Sponsor Veteran\'s Social Security number and disability rating info',
      'Your Social Security number',
      'Marriage certificate or birth certificate',
      'Other health insurance information',
      'Medicare card (if applicable)',
    ],
    nextSteps: [
      'We\'ll verify the sponsor\'s disability rating',
      'Eligibility determination within 45 days',
      'You\'ll receive a CHAMPVA authorization card',
      'You can then use CHAMPVA at any provider who accepts it',
    ],
  },
];
