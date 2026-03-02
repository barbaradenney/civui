/**
 * Pre-built FormSchema templates for common government forms.
 * Registered as civui://templates resource.
 */

export const FORM_TEMPLATES = `# CivUI Form Templates

Pre-built FormSchema templates for common government forms. All templates follow
Section 508 compliance, use plain language, and include proper hints, autocomplete,
and required-messages.

---

## 1. Contact Form

\`\`\`json
{
  "title": "Contact Us",
  "description": "Submit a question or comment to our office.",
  "action": "/api/contact",
  "method": "POST",
  "sections": [
    {
      "heading": "Your information",
      "fields": [
        {
          "type": "text",
          "name": "full-name",
          "label": "Full name",
          "required": true,
          "autocomplete": "name"
        },
        {
          "type": "email",
          "name": "email",
          "label": "Email address",
          "required": true,
          "autocomplete": "email"
        },
        {
          "type": "tel",
          "name": "phone",
          "label": "Phone number",
          "autocomplete": "tel",
          "inputmode": "tel",
          "hint": "For example: 555-123-4567"
        },
        {
          "type": "select",
          "name": "topic",
          "label": "Topic",
          "required": true,
          "options": [
            { "value": "general", "label": "General inquiry" },
            { "value": "benefits", "label": "Benefits question" },
            { "value": "technical", "label": "Technical issue" },
            { "value": "feedback", "label": "Feedback" },
            { "value": "other", "label": "Other" }
          ]
        },
        {
          "type": "textarea",
          "name": "message",
          "label": "Message",
          "required": true,
          "maxlength": 2000,
          "rows": 6
        }
      ]
    }
  ]
}
\`\`\`

---

## 2. Benefits Application

\`\`\`json
{
  "title": "Benefits Application",
  "description": "Apply for benefits. All information is kept confidential.",
  "action": "/api/benefits/apply",
  "method": "POST",
  "sections": [
    {
      "heading": "Personal information",
      "fields": [
        {
          "type": "text",
          "name": "first-name",
          "label": "First name",
          "required": true,
          "autocomplete": "given-name"
        },
        {
          "type": "text",
          "name": "last-name",
          "label": "Last name",
          "required": true,
          "autocomplete": "family-name"
        },
        {
          "type": "ssn",
          "name": "ssn",
          "label": "Social Security number",
          "required": true,
          "hint": "For example: 123 45 6789"
        },
        {
          "type": "memorable-date",
          "name": "date-of-birth",
          "label": "Date of birth",
          "required": true,
          "hint": "For example: January 15 1990"
        }
      ]
    },
    {
      "heading": "Eligibility",
      "fields": [
        {
          "type": "radio",
          "name": "citizen",
          "label": "Are you a United States citizen?",
          "required": true,
          "options": [
            { "value": "yes", "label": "Yes" },
            { "value": "no", "label": "No" }
          ]
        },
        {
          "type": "radio",
          "name": "veteran",
          "label": "Are you a veteran?",
          "required": true,
          "options": [
            { "value": "yes", "label": "Yes" },
            { "value": "no", "label": "No" }
          ]
        }
      ]
    },
    {
      "heading": "Supporting documents",
      "fields": [
        {
          "type": "file",
          "name": "documents",
          "label": "Upload supporting documents",
          "accept": ".pdf,.jpg,.png",
          "multiple": true,
          "maxFiles": 5,
          "maxSize": 10485760,
          "hint": "Accepted formats: PDF, JPG, PNG. Maximum 5 files, 10 MB each."
        }
      ]
    }
  ]
}
\`\`\`

---

## 3. Change of Address

\`\`\`json
{
  "title": "Change of Address",
  "description": "Update your mailing address on file.",
  "action": "/api/address/change",
  "method": "POST",
  "sections": [
    {
      "heading": "Previous address",
      "fields": [
        {
          "type": "text",
          "name": "old-street",
          "label": "Street address",
          "required": true,
          "autocomplete": "street-address"
        },
        {
          "type": "text",
          "name": "old-city",
          "label": "City",
          "required": true
        },
        {
          "type": "select",
          "name": "old-state",
          "label": "State",
          "required": true,
          "options": [
            { "value": "AL", "label": "Alabama" },
            { "value": "AK", "label": "Alaska" },
            { "value": "AZ", "label": "Arizona" },
            { "value": "CA", "label": "California" },
            { "value": "NY", "label": "New York" },
            { "value": "TX", "label": "Texas" }
          ]
        },
        {
          "type": "zip",
          "name": "old-zip",
          "label": "ZIP code",
          "required": true,
          "autocomplete": "postal-code",
          "hint": "For example: 12345 or 12345-6789"
        }
      ]
    },
    {
      "heading": "New address",
      "fields": [
        {
          "type": "text",
          "name": "new-street",
          "label": "Street address",
          "required": true,
          "autocomplete": "street-address"
        },
        {
          "type": "text",
          "name": "new-city",
          "label": "City",
          "required": true
        },
        {
          "type": "select",
          "name": "new-state",
          "label": "State",
          "required": true,
          "options": [
            { "value": "AL", "label": "Alabama" },
            { "value": "AK", "label": "Alaska" },
            { "value": "AZ", "label": "Arizona" },
            { "value": "CA", "label": "California" },
            { "value": "NY", "label": "New York" },
            { "value": "TX", "label": "Texas" }
          ]
        },
        {
          "type": "zip",
          "name": "new-zip",
          "label": "ZIP code",
          "required": true,
          "autocomplete": "postal-code",
          "hint": "For example: 12345 or 12345-6789"
        }
      ]
    },
    {
      "heading": "Effective date",
      "fields": [
        {
          "type": "date",
          "name": "effective-date",
          "label": "When should this change take effect?",
          "required": true,
          "hint": "For example: 01/15/2024"
        }
      ]
    }
  ]
}
\`\`\`

---

## 4. Document Submission

\`\`\`json
{
  "title": "Document Submission",
  "description": "Submit documents for review.",
  "action": "/api/documents/submit",
  "method": "POST",
  "sections": [
    {
      "heading": "Your information",
      "fields": [
        {
          "type": "text",
          "name": "full-name",
          "label": "Full name",
          "required": true,
          "autocomplete": "name"
        },
        {
          "type": "email",
          "name": "email",
          "label": "Email address",
          "required": true,
          "autocomplete": "email"
        },
        {
          "type": "text",
          "name": "case-number",
          "label": "Case number",
          "hint": "Found on your correspondence letter"
        }
      ]
    },
    {
      "heading": "Document details",
      "fields": [
        {
          "type": "select",
          "name": "document-type",
          "label": "Document type",
          "required": true,
          "options": [
            { "value": "id", "label": "Government-issued ID" },
            { "value": "proof-of-income", "label": "Proof of income" },
            { "value": "proof-of-residence", "label": "Proof of residence" },
            { "value": "medical", "label": "Medical record" },
            { "value": "other", "label": "Other" }
          ]
        },
        {
          "type": "file",
          "name": "files",
          "label": "Upload documents",
          "required": true,
          "accept": ".pdf,.jpg,.png,.tiff",
          "multiple": true,
          "maxFiles": 10,
          "maxSize": 26214400,
          "hint": "Accepted formats: PDF, JPG, PNG, TIFF. Maximum 10 files, 25 MB each."
        }
      ]
    }
  ]
}
\`\`\`

---

## 5. Feedback Form

\`\`\`json
{
  "title": "Share Your Feedback",
  "description": "Help us improve our services by sharing your experience.",
  "action": "/api/feedback",
  "method": "POST",
  "sections": [
    {
      "heading": "Contact information",
      "fields": [
        {
          "type": "text",
          "name": "full-name",
          "label": "Full name",
          "autocomplete": "name"
        },
        {
          "type": "email",
          "name": "email",
          "label": "Email address",
          "autocomplete": "email",
          "hint": "Optional. Provide if you would like a response."
        }
      ]
    },
    {
      "heading": "Your feedback",
      "fields": [
        {
          "type": "radio",
          "name": "category",
          "label": "What is your feedback about?",
          "required": true,
          "options": [
            { "value": "website", "label": "Website usability" },
            { "value": "service", "label": "Customer service" },
            { "value": "process", "label": "Application process" },
            { "value": "other", "label": "Other" }
          ]
        },
        {
          "type": "textarea",
          "name": "description",
          "label": "Describe your experience",
          "required": true,
          "maxlength": 5000,
          "rows": 8,
          "hint": "Please be as specific as possible."
        },
        {
          "type": "file",
          "name": "attachments",
          "label": "Attachments",
          "accept": ".pdf,.jpg,.png",
          "multiple": true,
          "maxFiles": 3,
          "maxSize": 5242880,
          "hint": "Optional. Maximum 3 files, 5 MB each."
        }
      ]
    }
  ]
}
\`\`\`

---

## 6. Benefits Application with Review Workflow

\`\`\`json
{
  "title": "Benefits Application",
  "description": "Apply for benefits. Your application will be reviewed by our staff.",
  "action": "/api/benefits/apply",
  "method": "POST",
  "actors": [
    { "id": "applicant", "label": "Applicant" },
    { "id": "reviewer", "label": "Benefits Reviewer" },
    { "id": "approver", "label": "Benefits Approver" }
  ],
  "workflow": {
    "initialState": "draft",
    "states": [
      { "id": "draft", "label": "Draft", "editableBy": ["applicant"] },
      { "id": "submitted", "label": "Submitted", "editableBy": [] },
      { "id": "under-review", "label": "Under Review", "editableBy": ["reviewer"], "allowsFeedback": true },
      { "id": "needs-revision", "label": "Needs Revision", "editableBy": ["applicant"] },
      { "id": "approved", "label": "Approved", "terminal": true },
      { "id": "denied", "label": "Denied", "terminal": true }
    ],
    "transitions": [
      { "from": "draft", "to": "submitted", "actor": "applicant", "label": "Submit application", "requiresAllSectionsComplete": true },
      { "from": "submitted", "to": "under-review", "actor": "reviewer", "label": "Begin review" },
      { "from": "under-review", "to": "needs-revision", "actor": "reviewer", "label": "Request revision", "requiresComment": true },
      { "from": "under-review", "to": "approved", "actor": "approver", "label": "Approve", "confirmationMessage": "Are you sure you want to approve this application?" },
      { "from": "under-review", "to": "denied", "actor": "approver", "label": "Deny", "requiresComment": true, "confirmationMessage": "Are you sure you want to deny this application?" },
      { "from": "needs-revision", "to": "submitted", "actor": "applicant", "label": "Re-submit" }
    ]
  },
  "feedback": {
    "granularity": "section",
    "requiresResolution": true
  },
  "sections": [
    {
      "heading": "Personal information",
      "editableBy": ["applicant"],
      "fields": [
        { "type": "text", "name": "first-name", "label": "First name", "required": true, "autocomplete": "given-name" },
        { "type": "text", "name": "last-name", "label": "Last name", "required": true, "autocomplete": "family-name" },
        { "type": "ssn", "name": "ssn", "label": "Social Security number", "required": true, "hint": "For example: 123 45 6789" },
        { "type": "memorable-date", "name": "date-of-birth", "label": "Date of birth", "required": true, "hint": "For example: January 15 1990" }
      ]
    },
    {
      "heading": "Eligibility",
      "editableBy": ["applicant"],
      "fields": [
        { "type": "radio", "name": "citizen", "label": "Are you a United States citizen?", "required": true, "options": [{ "value": "yes", "label": "Yes" }, { "value": "no", "label": "No" }] },
        { "type": "radio", "name": "income-eligible", "label": "Is your household income below the eligibility threshold?", "required": true, "options": [{ "value": "yes", "label": "Yes" }, { "value": "no", "label": "No" }, { "value": "unsure", "label": "I am not sure" }] }
      ]
    },
    {
      "heading": "Supporting documents",
      "editableBy": ["applicant"],
      "fields": [
        { "type": "file", "name": "documents", "label": "Upload supporting documents", "accept": ".pdf,.jpg,.png", "multiple": true, "maxFiles": 10, "maxSize": 10485760, "hint": "Accepted formats: PDF, JPG, PNG. Maximum 10 files, 10 MB each." }
      ]
    },
    {
      "heading": "Attestation",
      "editableBy": ["applicant"],
      "fields": [
        { "type": "checkbox", "name": "attestation", "label": "I certify that the information provided is true and correct to the best of my knowledge.", "required": true }
      ]
    }
  ]
}
\`\`\`

---

## 7. Petition with Delegation

\`\`\`json
{
  "title": "Petition for Relative",
  "description": "File a petition on behalf of a family member.",
  "action": "/api/petition/relative",
  "method": "POST",
  "actors": [
    { "id": "petitioner", "label": "Petitioner" },
    { "id": "attorney", "label": "Attorney" },
    { "id": "adjudicator", "label": "Adjudicator" }
  ],
  "workflow": {
    "initialState": "draft",
    "states": [
      { "id": "draft", "label": "Draft", "editableBy": ["petitioner", "attorney"] },
      { "id": "submitted", "label": "Submitted", "editableBy": [] },
      { "id": "initial-review", "label": "Initial Review", "editableBy": ["adjudicator"], "allowsFeedback": true },
      { "id": "approved", "label": "Approved", "terminal": true },
      { "id": "denied", "label": "Denied", "terminal": true }
    ],
    "transitions": [
      { "from": "draft", "to": "submitted", "actor": "petitioner", "label": "Submit petition", "requiresAllSectionsComplete": true },
      { "from": "draft", "to": "submitted", "actor": "attorney", "label": "Submit on behalf of petitioner", "requiresAllSectionsComplete": true },
      { "from": "submitted", "to": "initial-review", "actor": "adjudicator", "label": "Begin review" },
      { "from": "initial-review", "to": "approved", "actor": "adjudicator", "label": "Approve petition", "confirmationMessage": "Approve this petition?" },
      { "from": "initial-review", "to": "denied", "actor": "adjudicator", "label": "Deny petition", "requiresComment": true, "confirmationMessage": "Deny this petition?" }
    ]
  },
  "delegation": {
    "types": [
      { "id": "power-of-attorney", "label": "Attorney (G-28)", "requiresDocumentation": true },
      { "id": "authorized-representative", "label": "Accredited representative" }
    ],
    "attestation": {
      "text": "I certify under penalty of perjury under the laws of the United States of America that the information provided is true and correct.",
      "signatureType": "typed-signature"
    },
    "subjectLabel": "Beneficiary",
    "representativeLabel": "Attorney",
    "requiresConsentUpload": true,
    "requiresAuthorizationNumber": true
  },
  "sections": [
    {
      "heading": "Petitioner information",
      "editableBy": ["petitioner", "attorney"],
      "fields": [
        { "type": "text", "name": "petitioner-first-name", "label": "Petitioner first name", "required": true, "autocomplete": "given-name" },
        { "type": "text", "name": "petitioner-last-name", "label": "Petitioner last name", "required": true, "autocomplete": "family-name" },
        { "type": "memorable-date", "name": "petitioner-dob", "label": "Petitioner date of birth", "required": true, "hint": "For example: January 15 1990" }
      ]
    },
    {
      "heading": "Beneficiary information",
      "editableBy": ["petitioner", "attorney"],
      "fields": [
        { "type": "text", "name": "beneficiary-first-name", "label": "Beneficiary first name", "required": true },
        { "type": "text", "name": "beneficiary-last-name", "label": "Beneficiary last name", "required": true },
        { "type": "select", "name": "relationship", "label": "Relationship to petitioner", "required": true, "options": [{ "value": "spouse", "label": "Spouse" }, { "value": "parent", "label": "Parent" }, { "value": "child", "label": "Child" }, { "value": "sibling", "label": "Sibling" }] }
      ]
    },
    {
      "heading": "Evidence",
      "editableBy": ["petitioner", "attorney"],
      "fields": [
        { "type": "file", "name": "evidence-documents", "label": "Upload evidence of relationship", "required": true, "accept": ".pdf,.jpg,.png", "multiple": true, "maxFiles": 20, "maxSize": 10485760, "hint": "Upload marriage certificates, birth certificates, or other evidence. PDF, JPG, or PNG. Maximum 20 files." }
      ]
    }
  ]
}
\`\`\`

---

## 8. Building Permit (Multi-Actor)

\`\`\`json
{
  "title": "Building Permit Application",
  "description": "Apply for a building permit for construction or renovation work.",
  "action": "/api/permits/building",
  "method": "POST",
  "actors": [
    { "id": "property-owner", "label": "Property Owner" },
    { "id": "contractor", "label": "Contractor" },
    { "id": "plan-reviewer", "label": "Plan Reviewer" },
    { "id": "building-official", "label": "Building Official" }
  ],
  "workflow": {
    "initialState": "draft",
    "states": [
      { "id": "draft", "label": "Draft", "editableBy": ["property-owner", "contractor"] },
      { "id": "submitted", "label": "Submitted", "editableBy": [] },
      { "id": "plan-review", "label": "Plan Review", "editableBy": ["plan-reviewer"], "allowsFeedback": true },
      { "id": "approved", "label": "Approved", "editableBy": [] },
      { "id": "inspection", "label": "Inspection", "editableBy": ["building-official"] },
      { "id": "closed", "label": "Closed", "terminal": true }
    ],
    "transitions": [
      { "from": "draft", "to": "submitted", "actor": "property-owner", "label": "Submit application", "requiresAllSectionsComplete": true },
      { "from": "draft", "to": "submitted", "actor": "contractor", "label": "Submit on behalf of owner", "requiresAllSectionsComplete": true },
      { "from": "submitted", "to": "plan-review", "actor": "plan-reviewer", "label": "Begin plan review" },
      { "from": "plan-review", "to": "approved", "actor": "plan-reviewer", "label": "Approve plans", "confirmationMessage": "Approve these building plans?" },
      { "from": "plan-review", "to": "draft", "actor": "plan-reviewer", "label": "Request revision", "requiresComment": true },
      { "from": "approved", "to": "inspection", "actor": "building-official", "label": "Schedule inspection" },
      { "from": "inspection", "to": "closed", "actor": "building-official", "label": "Close permit", "confirmationMessage": "Close this permit as complete?" }
    ]
  },
  "delegation": {
    "types": [
      { "id": "contractor-rep", "label": "Licensed contractor", "requiresDocumentation": true }
    ],
    "attestation": {
      "text": "I certify that I am authorized to submit this application on behalf of the property owner.",
      "signatureType": "typed-signature"
    },
    "subjectLabel": "Property Owner",
    "representativeLabel": "Contractor",
    "requiresConsentUpload": true,
    "requiresAuthorizationNumber": false
  },
  "feedback": {
    "granularity": "section",
    "requiresResolution": true
  },
  "sections": [
    {
      "heading": "Property information",
      "editableBy": ["property-owner", "contractor"],
      "fields": [
        { "type": "text", "name": "property-address", "label": "Property address", "required": true, "autocomplete": "street-address" },
        { "type": "text", "name": "parcel-number", "label": "Parcel number", "required": true, "hint": "Found on your property tax statement" },
        { "type": "text", "name": "owner-name", "label": "Property owner name", "required": true, "autocomplete": "name" }
      ]
    },
    {
      "heading": "Project scope",
      "editableBy": ["property-owner", "contractor"],
      "fields": [
        { "type": "select", "name": "work-type", "label": "Type of work", "required": true, "options": [{ "value": "new-construction", "label": "New construction" }, { "value": "addition", "label": "Addition" }, { "value": "renovation", "label": "Renovation" }, { "value": "demolition", "label": "Demolition" }, { "value": "other", "label": "Other" }] },
        { "type": "textarea", "name": "project-description", "label": "Describe the proposed work", "required": true, "rows": 6, "maxlength": 5000 },
        { "type": "number", "name": "estimated-cost", "label": "Estimated project cost", "required": true, "hint": "In US dollars", "min": "0" }
      ]
    },
    {
      "heading": "Contractor information",
      "editableBy": ["contractor"],
      "fields": [
        { "type": "text", "name": "contractor-name", "label": "Contractor name", "required": true },
        { "type": "text", "name": "license-number", "label": "Contractor license number", "required": true },
        { "type": "tel", "name": "contractor-phone", "label": "Contractor phone number", "required": true, "autocomplete": "tel" }
      ]
    },
    {
      "heading": "Plans and drawings",
      "editableBy": ["property-owner", "contractor"],
      "fields": [
        { "type": "file", "name": "building-plans", "label": "Upload building plans", "required": true, "accept": ".pdf", "multiple": true, "maxFiles": 10, "maxSize": 52428800, "hint": "Upload PDF plans. Maximum 10 files, 50 MB each." }
      ]
    },
    {
      "heading": "Plan review notes",
      "editableBy": ["plan-reviewer"],
      "visibleTo": ["plan-reviewer", "building-official"],
      "phase": "plan-review",
      "fields": [
        { "type": "textarea", "name": "review-notes", "label": "Plan review notes", "rows": 6 },
        { "type": "radio", "name": "code-compliance", "label": "Do the plans meet current building codes?", "required": true, "options": [{ "value": "yes", "label": "Yes" }, { "value": "no", "label": "No" }, { "value": "conditional", "label": "Conditional" }] }
      ]
    },
    {
      "heading": "Inspection notes",
      "editableBy": ["building-official"],
      "visibleTo": ["building-official"],
      "phase": "inspection",
      "fields": [
        { "type": "memorable-date", "name": "inspection-date", "label": "Date of inspection", "required": true, "hint": "For example: March 15 2024" },
        { "type": "radio", "name": "inspection-result", "label": "Inspection result", "required": true, "options": [{ "value": "pass", "label": "Pass" }, { "value": "fail", "label": "Fail" }, { "value": "partial", "label": "Partial — re-inspection required" }] },
        { "type": "textarea", "name": "inspection-notes", "label": "Inspection notes", "rows": 6 }
      ]
    }
  ]
}
\`\`\`
`;
