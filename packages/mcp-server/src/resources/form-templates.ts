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
`;
