/**
 * MCP prompt: build-complex-form
 * Build complex government forms with repeatable sections, conditional logic,
 * sub-form composition, and entity-relationship modeling.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  COMPLEX_PATTERNS,
} from '../resources/index.js';

export const BUILD_COMPLEX_FORM_NAME = 'build-complex-form';

export const BUILD_COMPLEX_FORM_DESCRIPTION =
  'Build a complex government form with repeatable sections, conditional fields, ' +
  'sub-form composition, and cross-field validation. Generates CivUI markup, ' +
  'companion JavaScript, entity-relationship analysis, and validation results.';

export function buildComplexFormPrompt(description: string) {
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
            uri: 'civui://complex-patterns',
            mimeType: 'text/markdown',
            text: COMPLEX_PATTERNS,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `# Build Complex Government Form

## Form description
${description}

## Instructions

You are building a complex government form with repeatable sections, conditional logic, and/or sub-form composition using CivUI components. Follow these steps:

### Step 1: Identify entities and relationships
Based on the form description above, identify:
- What entities are involved (people, addresses, employment records, etc.)
- Which relationships exist (one-to-many, conditional dependencies)
- Which sections need to be repeatable (e.g., dependents, employment history)
- Which fields are conditional (visible/required based on other field values)

### Step 2: Determine repeatable and conditional patterns
- Decide which sections are repeatable (add/remove multiple entries)
- Identify which fields should use \`visibleWhen\` (shown conditionally)
- Identify which fields should use \`requiredWhen\` (required conditionally)
- Design cross-field validation rules

### Step 3: Design schema with sub-forms
- Extract shared field groups into \`subForms\` (e.g., address used for mailing + billing)
- Set up \`ref\` and \`namespace\` on sections that reference sub-forms
- Define \`crossFieldRules\` for complex validation logic

### Step 4: Generate base markup
Call the \`generate_civui_form\` tool with the schema to produce CivUI HTML markup.

### Step 5: Generate companion JavaScript
Call the \`generate_companion_js\` tool with the schema to produce client-side JavaScript for:
- Repeatable section add/remove/re-index
- Conditional visibility show/hide
- Conditional required field toggling

### Step 6: Analyze entity relationships
Call the \`analyze_relationships\` tool with the schema to document the entity model and relationships.

### Step 7: Validate Section 508 compliance
Call the \`validate_form\` tool with the generated markup to check for accessibility issues.

### Step 8: Estimate PRA burden
Call the \`estimate_burden\` tool with the schema to assess completion time (accounting for repeatable sections).

### Step 9: Present complete results
Show:
1. **HTML markup** — the complete CivUI form with repeatable containers and conditional attributes
2. **Companion JavaScript** — the IIFE for client-side behavior
3. **Entity diagram** — entities, relationships, and one-to-many cardinalities
4. **Validation report** — Section 508 compliance status
5. **Burden estimate** — estimated completion time and complexity`,
        },
      },
    ],
  };
}
