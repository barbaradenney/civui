/**
 * MCP prompt: conditional-form
 * Build a multi-step or conditional form with show/hide logic.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  FORM_TEMPLATES,
} from '../resources/index.js';

export const CONDITIONAL_FORM_NAME = 'conditional-form';

export const CONDITIONAL_FORM_DESCRIPTION =
  'Build a conditional or multi-step government form with show/hide logic. ' +
  'Generates CivUI markup with data-civ-show-when/data-civ-hide-when attributes ' +
  'and companion JavaScript for conditional field visibility.';

export function conditionalFormPrompt(description: string) {
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
            uri: 'civui://templates',
            mimeType: 'text/markdown',
            text: FORM_TEMPLATES,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `# Build Conditional Form

## Form description
${description}

## Instructions

You are building a conditional or multi-step government form using CivUI components. Follow these steps:

### Step 1: Gather conditional requirements
Based on the description above, identify:
- Which fields are always visible
- Which fields depend on other field values (conditional visibility)
- Whether the form needs multi-step navigation (\`data-civ-step\` attributes)
- Any validation rules that differ based on conditional state

### Step 2: Design the schema
Create a FormSchema JSON object with all fields (including conditional ones). Add metadata notes about conditions.

### Step 3: Generate HTML with conditional attributes
Call the \`generate_civui_form\` tool, then enhance the markup with:

- \`data-civ-show-when="fieldName=value"\` — show this element when the specified field equals the value
- \`data-civ-hide-when="fieldName=value"\` — hide this element when the specified field equals the value
- \`data-civ-step="1"\`, \`data-civ-step="2"\`, etc. — for multi-step form navigation

Example:
\`\`\`html
<civ-radio-group legend="Do you have a disability?" name="has-disability">
  <civ-radio label="Yes" value="yes"></civ-radio>
  <civ-radio label="No" value="no"></civ-radio>
</civ-radio-group>

<civ-fieldset legend="Disability details" data-civ-show-when="has-disability=yes">
  <civ-form-field label="Type of disability">
    <civ-text-input name="disability-type"></civ-text-input>
  </civ-form-field>
  <civ-form-field label="Description">
    <civ-textarea name="disability-description"></civ-textarea>
  </civ-form-field>
</civ-fieldset>
\`\`\`

### Step 4: Generate companion JavaScript
Create a JavaScript snippet that:
- Listens for \`civ-change\` events on controlling fields
- Shows/hides dependent sections based on \`data-civ-show-when\`/\`data-civ-hide-when\`
- Manages \`data-civ-step\` navigation with next/previous buttons
- Disables hidden required fields to prevent validation errors

### Step 5: Validate
Call the \`validate_form\` tool on the generated markup (with conditional sections visible) to verify Section 508 compliance.

### Step 6: Present results
Show:
1. The complete HTML markup with conditional attributes
2. The companion JavaScript
3. Validation results
4. Instructions for integration`,
        },
      },
    ],
  };
}
