/**
 * Tool Workflow — defines the logical flow between MCP tools.
 *
 * Each tool can suggest next steps based on what the user likely needs
 * after calling it. This helps LLMs guide users through the form
 * generation workflow without needing to memorize all tool relationships.
 */

export interface NextStep {
  tool: string;
  description: string;
  /** Whether this step is typically needed (vs optional). */
  recommended: boolean;
}

/**
 * Get suggested next steps after a tool runs.
 */
export function getNextSteps(toolName: string, context?: {
  /** Whether the result had errors/violations. */
  hasErrors?: boolean;
  /** The form number if applicable. */
  formNumber?: string;
  /** The output format used. */
  format?: string;
}): NextStep[] {
  const steps: NextStep[] = [];

  switch (toolName) {
    case 'list_gov_forms':
      steps.push(
        { tool: 'assemble_gov_form', description: 'Generate a complete working form app from one of the listed form numbers', recommended: true },
        { tool: 'generate_gov_form', description: 'Generate structured pages to inspect before assembling', recommended: false },
      );
      break;

    case 'generate_gov_form':
      steps.push(
        { tool: 'assemble_gov_form', description: 'Assemble the structured pages into a working HTML or React app', recommended: true },
        { tool: 'validate_gov_form', description: 'Validate the generated HTML for CivUI consistency', recommended: true },
      );
      break;

    case 'assemble_gov_form':
      steps.push(
        { tool: 'validate_gov_form', description: 'Validate the assembled form for consistency', recommended: true },
        { tool: 'generate_tests', description: 'Generate a test suite for the form', recommended: false },
      );
      if (context?.format !== 'react') {
        steps.push(
          { tool: 'assemble_gov_form', description: 'Re-generate in React format with format: "react"', recommended: false },
        );
      }
      break;

    case 'validate_gov_form':
      if (context?.hasErrors) {
        steps.push(
          { tool: 'suggest_fix', description: 'Auto-fix the validation violations', recommended: true },
          { tool: 'assemble_gov_form', description: 'Regenerate the form to fix issues', recommended: false },
        );
      } else {
        steps.push(
          { tool: 'generate_tests', description: 'Generate a test suite for the validated form', recommended: true },
          { tool: 'generate_508_report', description: 'Generate a Section 508 accessibility report', recommended: false },
        );
      }
      break;

    case 'generate_civui_form':
      steps.push(
        { tool: 'validate_form', description: 'Validate the generated HTML for accessibility', recommended: true },
        { tool: 'generate_tests', description: 'Generate tests for the form', recommended: false },
        { tool: 'generate_companion_js', description: 'Generate JavaScript for conditional/repeatable logic', recommended: false },
      );
      break;

    case 'parse_html_form':
      steps.push(
        { tool: 'generate_civui_form', description: 'Convert the parsed schema to CivUI components', recommended: true },
        { tool: 'generate_react_form', description: 'Convert the parsed schema to a React TSX component', recommended: false },
        { tool: 'validate_schema', description: 'Validate the parsed schema structure', recommended: false },
      );
      break;

    case 'parse_pdf_form':
      steps.push(
        { tool: 'generate_civui_form', description: 'Convert the parsed schema to CivUI web component HTML', recommended: true },
        { tool: 'generate_react_form', description: 'Convert the parsed schema to a React TSX component', recommended: true },
        { tool: 'validate_schema', description: 'Check the parsed schema for issues before generating', recommended: false },
        { tool: 'export_schema', description: 'Export as JSON Schema, TypeScript, or Zod for your codebase', recommended: false },
      );
      break;

    case 'form_to_schema':
      steps.push(
        { tool: 'generate_react_form', description: 'Convert the schema to a React component', recommended: true },
        { tool: 'compare_schemas', description: 'Compare this schema against another version', recommended: false },
        { tool: 'validate_schema', description: 'Validate the extracted schema', recommended: false },
      );
      break;

    case 'scaffold_from_template':
      steps.push(
        { tool: 'generate_civui_form', description: 'Generate CivUI HTML from the template schema', recommended: true },
        { tool: 'generate_react_form', description: 'Generate a React component from the template', recommended: false },
        { tool: 'assemble_gov_form', description: 'Assemble into a complete form app', recommended: false },
      );
      break;

    case 'generate_react_form':
      steps.push(
        { tool: 'validate_form', description: 'Validate the underlying HTML for accessibility', recommended: true },
        { tool: 'generate_tests', description: 'Generate tests for the form', recommended: false },
        { tool: 'generate_validation_schema', description: 'Generate Zod validation for the form data', recommended: false },
      );
      break;

    case 'validate_form':
      if (context?.hasErrors) {
        steps.push(
          { tool: 'suggest_fix', description: 'Auto-fix the validation violations', recommended: true },
        );
      } else {
        steps.push(
          { tool: 'generate_tests', description: 'Generate tests for the valid form', recommended: false },
          { tool: 'generate_508_report', description: 'Generate accessibility audit report', recommended: false },
        );
      }
      break;

    case 'suggest_fix':
      steps.push(
        { tool: 'validate_form', description: 'Re-validate to confirm fixes resolved the issues', recommended: true },
        { tool: 'generate_508_report', description: 'Generate a full 508 compliance report', recommended: false },
      );
      break;

    case 'generate_tests':
      steps.push(
        { tool: 'generate_story', description: 'Generate a Storybook story for visual testing', recommended: false },
        { tool: 'generate_e2e_tests', description: 'Generate Playwright E2E tests', recommended: false },
      );
      break;

    case 'export_schema':
      steps.push(
        { tool: 'generate_validation_schema', description: 'Generate validation rules from the schema', recommended: false },
        { tool: 'generate_api_handler', description: 'Generate a server-side API handler', recommended: false },
      );
      break;

    case 'discover_tools':
      steps.push(
        { tool: 'list_gov_forms', description: 'Start by listing available government forms', recommended: true },
      );
      break;

    default:
      // Generic suggestion for any generate_* tool
      if (toolName.startsWith('generate_')) {
        steps.push(
          { tool: 'validate_form', description: 'Validate the generated output', recommended: false },
        );
      }
      break;
  }

  return steps;
}
