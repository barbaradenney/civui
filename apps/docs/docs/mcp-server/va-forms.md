---
title: VA Forms
sidebar_position: 5
sidebar_label: VA Forms
---

# VA Form Definitions

The MCP server includes 20 pre-built VA form definitions that can be assembled into complete working applications with a single tool call.

## Available Forms

| Form Number | Title | Category |
|-------------|-------|----------|
| 21-526EZ | Apply for disability compensation | Disability |
| 10-10EZ | Apply for VA health care | Health Care |
| 22-1990 | Apply for education benefits | Education |
| 21P-527EZ | Apply for Veterans Pension | Pension |
| 21-22 | Appoint a Veterans Service Organization as your representative | Representation |
| 10-10CG | Apply for the Program of Comprehensive Assistance for Family Caregivers | Caregiver |
| 21-686C | Add or remove dependents from your VA benefits | Dependents |
| 21-0966 | Submit an intent to file | Claims |
| 21-4142 | Authorize VA to release your medical records | Medical Records |
| 22-5490 | Apply for dependent education benefits | Education |
| 22-1995 | Request a change of school or program | Education |
| 26-1880 | Request a Certificate of Eligibility for a VA home loan | Housing |
| 28-1900 | Apply for Veteran Readiness and Employment | Vocational Rehab |
| 20-0995 | File a Supplemental Claim | Appeals |
| 20-0996 | Request a Higher-Level Review | Appeals |
| 10182 | Request a Board Appeal | Appeals |
| 21P-530 | Apply for burial benefits | Burial |
| 21-0845 | Authorize VA to disclose your information | Disclosure |
| 40-10007 | Apply for pre-need burial eligibility | Burial |
| 10-10D | Apply for CHAMPVA benefits | Health Care |

## How Form Definitions Work

Each form definition (`GovFormDefinition`) contains everything needed to generate a complete application:

### Structure

```typescript
interface GovFormDefinition {
  formNumber: string;           // "21-526EZ"
  title: string;                // "Apply for disability compensation"
  description: string;          // Intro page description
  ombNumber: string;            // OMB control number
  respondentBurden: string;     // "25 minutes"
  chapters: GovChapterId[];     // Shared chapter templates to use
  customChapters?: [];          // Form-specific chapters
  preparationItems: string[];   // Documents to gather before starting
  nextSteps: string[];          // What happens after submission
  eligibility?: {};             // Optional eligibility screener
  workflow?: {};                // Optional multi-actor workflow
  delegation?: {};              // Optional representative support
  dynamicChapters?: [];         // Conditional chapters
}
```

### Chapters

Forms are composed from shared chapter templates and form-specific custom chapters:

**Shared Chapters** (reusable across forms):

| Chapter ID | Heading | Description |
|-----------|---------|-------------|
| `personal-info` | Personal information | Name, SSN, date of birth |
| `contact-info` | Contact information | Address, phone, email, preferred contact method |
| `service-history` | Service history | Branch, dates, discharge type |
| `direct-deposit` | Direct deposit | Bank account for payment |
| `document-upload` | Supporting documents | File upload with accepted formats |
| `review-submit` | Review and submit | Summary, certification, submit |

**Custom Chapters** are form-specific sections inserted at a specified position:

```typescript
customChapters: [
  {
    id: 'disabilities',
    heading: 'Disabilities',
    hint: 'Conditions you are claiming',
    afterChapter: 'service-history',  // Insert position
    section: {
      heading: 'Disabilities and conditions',
      repeatable: true,
      repeatableMin: 1,
      fields: [
        { type: 'text', name: 'conditionName', label: 'Name of condition', required: true },
        { type: 'memorable-date', name: 'conditionOnsetDate', label: 'Approximate date condition began' },
        // ...
      ],
    },
  },
]
```

### Preparation Items

Documents and information the applicant should gather before starting:

```typescript
preparationItems: [
  'Your Social Security number',
  'Your military service history (dates, branch, discharge)',
  'A copy of your DD214 or other separation documents',
  'Medical records related to your claimed conditions',
  'Bank account information for direct deposit (optional)',
]
```

These render on the introduction page.

### Next Steps

What happens after submission (shown on the confirmation page):

```typescript
nextSteps: [
  'We will review your claim and may contact you if we need more information.',
  'You can check the status of your claim online at VA.gov.',
  'Most claims are processed within 125 days.',
]
```

### Eligibility Screener (Optional)

Pass/fail questions shown before the form begins:

```typescript
eligibility: {
  questions: [
    { text: 'Are you a Veteran?', type: 'yes-no', disqualifyIf: 'no' },
    { text: 'Do you have a service-connected condition?', type: 'yes-no', disqualifyIf: 'no' },
  ],
  passMessage: 'You may be eligible. Continue to apply.',
  failMessage: 'You may not be eligible for this benefit.',
}
```

### Workflow (Optional)

Multi-actor state machine for forms that require review/approval:

```typescript
workflow: {
  initialState: 'draft',
  states: [
    { id: 'draft', label: 'Draft', editableBy: ['applicant'] },
    { id: 'submitted', label: 'Submitted', editableBy: ['reviewer'] },
    { id: 'approved', label: 'Approved', terminal: true },
  ],
  transitions: [
    { from: 'draft', to: 'submitted', actor: 'applicant', label: 'Submit' },
    { from: 'submitted', to: 'approved', actor: 'reviewer', label: 'Approve' },
  ],
}
```

### Delegation (Optional)

Representative or Power of Attorney support:

```typescript
delegation: {
  types: [
    { id: 'vso', label: 'Veterans Service Organization' },
    { id: 'attorney', label: 'Attorney', requiresDocumentation: true },
    { id: 'agent', label: 'Claims Agent', requiresDocumentation: true },
  ],
  attestation: { text: 'I authorize this representative...', signatureType: 'typed-signature' },
}
```

## Adding a New Form

To add a new VA form definition:

1. **Identify shared chapters** that apply (personal-info, contact-info, etc.)

2. **Define custom chapters** for form-specific sections with fields, types, and validation

3. **Add the definition** to the appropriate batch file:
   - `gov-form-registry.ts` — forms 1-10
   - `gov-forms-batch2.ts` — forms 11-15
   - `gov-forms-batch3.ts` — forms 16-20

4. **Include metadata**: OMB number, respondent burden, preparation items, next steps

5. **Test with**:
   ```
   assemble_gov_form({ formNumber: "XX-XXXX", format: "html" })
   validate_gov_form({ formNumber: "XX-XXXX" })
   ```

### Minimal Example

```typescript
{
  formNumber: '99-TEST',
  title: 'Test form application',
  description: 'Use this form to test the form generation pipeline.',
  ombNumber: '2900-9999',
  respondentBurden: '5 minutes',
  chapters: ['personal-info', 'contact-info', 'review-submit'],
  preparationItems: ['Your Social Security number'],
  nextSteps: ['We will process your request within 5 business days.'],
}
```
