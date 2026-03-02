/**
 * MCP prompt: build-workflow-form
 * Build multi-actor government forms with workflow state machines,
 * delegation, feedback, and case-style dashboards.
 */
import {
  COMPONENT_CATALOG,
  GOVERNMENT_PATTERNS,
  COMPLEX_PATTERNS,
  WORKFLOW_PATTERNS,
} from '../resources/index.js';

export const BUILD_WORKFLOW_FORM_NAME = 'build-workflow-form';

export const BUILD_WORKFLOW_FORM_DESCRIPTION =
  'Build a multi-actor government form with workflow state machines, delegation, ' +
  'feedback, and case-style dashboards. Generates CivUI markup, workflow UI, ' +
  'lock matrix, delegation sections, and validation results.';

export function buildWorkflowFormPrompt(description: string) {
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
          type: 'resource' as const,
          resource: {
            uri: 'civui://workflow-patterns',
            mimeType: 'text/markdown',
            text: WORKFLOW_PATTERNS,
          },
        },
      },
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `# Build Multi-Actor Workflow Form

## Form description
${description}

## Instructions

You are building a multi-actor government form with workflow state machines, delegation support, and/or case-style features using CivUI components. Follow these steps:

### Step 1: Identify actors and workflow states
Based on the form description above, identify:
- Who interacts with the form (applicant, reviewer, approver, representative, etc.)
- What states the form moves through (draft, submitted, under-review, approved, etc.)
- What transitions exist between states and which actors trigger them
- Whether delegation (representative filling on behalf of someone) is needed

### Step 2: Design schema with actors, workflow, delegation, feedback
- Define \`actors\` array with IDs and labels
- Design \`workflow\` state machine with states and transitions
- Add \`delegation\` config if representatives are involved
- Add \`feedback\` config if reviewer comments are needed
- Set section-level \`editableBy\`, \`visibleTo\`, and \`phase\` as appropriate

### Step 3: Generate base markup
Call the \`generate_civui_form\` tool with the schema to produce CivUI HTML markup.

### Step 4: Generate workflow UI
Call the \`generate_workflow_ui\` tool with the schema to produce status banner and transition buttons.

### Step 5: Generate lock matrix
Call the \`generate_lock_matrix\` tool with the schema to verify section permissions across all state/actor combinations.

### Step 6: Generate delegation sections (if applicable)
Call the \`generate_delegation_sections\` tool to produce representative information and attestation sections.

### Step 7: Generate feedback UI (if applicable)
Call the \`generate_feedback_ui\` tool to produce inline comment panels for reviewer workflow.

### Step 8: Generate section progress
Call the \`generate_section_progress\` tool to produce a completion tracking sidebar.

### Step 9: Validate Section 508 compliance
Call the \`validate_form\` tool with the generated markup to check for accessibility issues.

### Step 10: Estimate PRA burden
Call the \`estimate_burden\` tool with the schema to assess completion time.

### Step 11: Present complete results
Show:
1. **Schema JSON** — the complete FormSchema with actors, workflow, delegation, feedback
2. **HTML markup** — the CivUI form with workflow status and delegation sections
3. **Lock matrix** — state × actor permission summary
4. **Companion JavaScript** — workflow transitions, feedback, and progress tracking
5. **Validation report** — Section 508 compliance status
6. **Burden estimate** — estimated completion time and complexity`,
        },
      },
    ],
  };
}
