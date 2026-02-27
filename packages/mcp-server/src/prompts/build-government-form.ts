/**
 * MCP prompt: build-government-form
 * Plain English description → clarifying questions → schema → generate → validate.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  TAILWIND_REFERENCE,
} from '../resources/index.js';

export const BUILD_GOVERNMENT_FORM_NAME = 'build-government-form';

export const BUILD_GOVERNMENT_FORM_DESCRIPTION =
  'Build a new accessible government form from a plain-English description. ' +
  'Asks clarifying questions, creates a FormSchema, generates CivUI markup, and validates Section 508 compliance.';

export function buildGovernmentFormPrompt(formPurpose: string) {
  return {
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'resource' as const,
          resource: {
            uri: 'civui://catalog',
            mimeType: 'text/markdown',
            text: COMPONENT_CATALOG,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'resource' as const,
          resource: {
            uri: 'civui://gov-patterns',
            mimeType: 'text/markdown',
            text: GOVERNMENT_PATTERNS,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'resource' as const,
          resource: {
            uri: 'civui://tailwind',
            mimeType: 'text/markdown',
            text: TAILWIND_REFERENCE,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `# Build Government Form

## Form purpose
${formPurpose}

## Instructions

You are building a new accessible government form using CivUI components. Follow these steps:

### Step 1: Clarify requirements
Based on the form purpose above, ask the user clarifying questions about:
- What fields are needed and which are required
- Any conditional logic or field dependencies
- Date fields: are they known past dates (use civ-memorable-date) or scheduling dates (use civ-date-picker)?
- Selection fields: how many options? (2–7 → radio-group, 8+ → select, searchable → combobox)
- File uploads: accepted file types, size limits, multiple files?
- Form action URL and method

### Step 2: Create a FormSchema
Build a FormSchema JSON object with:
- Sections with descriptive headings
- Correct field types from the component catalog
- Plain language labels (not abbreviations)
- Required fields with field-specific required-message text
- Hints for date, SSN, and format-sensitive fields
- Autocomplete attributes for identity fields (email, tel, name, address, zip)

### Step 3: Generate CivUI markup
Call the \`generate_civui_form\` tool with the schema. Set \`wrapInCivForm: true\`.

### Step 4: Validate compliance
Call the \`validate_form\` tool with the generated markup. Fix any errors (Section 508 violations) and address warnings (best practices).

### Step 5: Present the result
Show the final validated markup with:
- A summary of all fields and their types
- Section 508 compliance status
- Any recommendations for testing with assistive technology`,
        },
      },
    ],
  };
}
