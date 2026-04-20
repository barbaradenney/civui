/**
 * Tool Registry — categorizes all MCP tools into tiers for effective LLM interaction.
 *
 * Tiers:
 * - essential: Always registered. The ~12 tools an LLM primarily needs.
 * - advanced: Registered by default. Specific feature generators an LLM may request.
 * - internal: Composed by other tools. Hidden in essential/standard modes.
 *
 * Set CIV_MCP_TIER env var to control which tools are registered:
 * - 'all' (default): All tools registered (backwards compatible)
 * - 'standard': Essential + advanced tools (~35 tools)
 * - 'essential': Only essential tools (~12 tools)
 */

export type ToolTier = 'essential' | 'advanced' | 'internal';

export type ToolCategory =
  | 'gov-forms'
  | 'form-generation'
  | 'validation'
  | 'testing'
  | 'workflow'
  | 'content'
  | 'utility'
  | 'meta';

export interface ToolInfo {
  name: string;
  tier: ToolTier;
  category: ToolCategory;
  description: string;
}

/**
 * Complete registry of all MCP tools with tier and category metadata.
 */
export const TOOL_REGISTRY: ToolInfo[] = [
  // ── Essential (Tier 1) — always registered ──────────────────

  // Gov form pipeline
  { name: 'list_gov_forms', tier: 'essential', category: 'gov-forms', description: 'List all available government form templates with numbers, titles, and chapter counts' },
  { name: 'assemble_gov_form', tier: 'essential', category: 'gov-forms', description: 'Generate a complete working form app (HTML or React) from a form number' },
  { name: 'generate_gov_form', tier: 'essential', category: 'gov-forms', description: 'Generate structured form pages from a form number (intro, chapters, review, confirmation)' },
  { name: 'validate_gov_form', tier: 'essential', category: 'gov-forms', description: 'Validate generated form HTML for CivUI component usage and consistency' },

  // Core form tools
  { name: 'generate_civui_form', tier: 'essential', category: 'form-generation', description: 'Convert a FormSchema to CivUI web component HTML' },
  { name: 'parse_html_form', tier: 'essential', category: 'form-generation', description: 'Parse existing HTML form into a FormSchema' },
  { name: 'scaffold_from_template', tier: 'essential', category: 'form-generation', description: 'Generate a FormSchema from a pre-built template' },
  { name: 'validate_form', tier: 'essential', category: 'validation', description: 'Validate form HTML for accessibility, compliance, and CivUI patterns' },

  // Parsing
  { name: 'parse_pdf_form', tier: 'essential', category: 'form-generation', description: 'Parse a fillable PDF form into a FormSchema (base64 input, max ~37.5 MB decoded)' },

  // Utility
  { name: 'style_civui_element', tier: 'essential', category: 'utility', description: 'Look up CSS classes, states, and design tokens for CivUI elements' },
  { name: 'generate_tests', tier: 'essential', category: 'testing', description: 'Generate test suite (unit, e2e, or a11y) for form HTML' },
  { name: 'estimate_burden', tier: 'essential', category: 'utility', description: 'Estimate Paperwork Reduction Act respondent burden' },

  // Meta
  { name: 'discover_tools', tier: 'essential', category: 'meta', description: 'List all available tools with categories and descriptions' },

  // ── Advanced (Tier 2) — registered in standard + all modes ──

  // Form generation variants
  { name: 'generate_react_form', tier: 'advanced', category: 'form-generation', description: 'Generate a React TSX component from FormSchema using CivUI web components as custom elements' },
  { name: 'generate_intro_page', tier: 'advanced', category: 'gov-forms', description: 'Generate government form introduction page' },
  { name: 'generate_wizard', tier: 'advanced', category: 'form-generation', description: 'Generate multi-step wizard navigation' },

  // Feature generators
  { name: 'generate_signature_block', tier: 'advanced', category: 'form-generation', description: 'Generate e-signature block (typed, drawn, or checkbox)' },
  { name: 'generate_eligibility_screener', tier: 'advanced', category: 'form-generation', description: 'Generate eligibility questionnaire with pass/fail logic' },
  { name: 'generate_confirmation_page', tier: 'advanced', category: 'form-generation', description: 'Generate post-submission confirmation page' },
  { name: 'generate_save_resume_ui', tier: 'advanced', category: 'form-generation', description: 'Generate save-and-resume flow with session persistence' },
  { name: 'generate_document_checklist', tier: 'advanced', category: 'form-generation', description: 'Generate file upload checklist' },
  { name: 'generate_address_block', tier: 'advanced', category: 'form-generation', description: 'Generate US address fieldset' },
  { name: 'generate_error_messages', tier: 'advanced', category: 'form-generation', description: 'Generate error message library from schema' },
  { name: 'generate_conditional_reveal', tier: 'advanced', category: 'form-generation', description: 'Generate conditional show/hide logic' },

  // Workflow / multi-actor
  { name: 'generate_workflow_ui', tier: 'advanced', category: 'workflow', description: 'Generate workflow status banner and transition buttons' },
  { name: 'generate_delegation_sections', tier: 'advanced', category: 'workflow', description: 'Generate representative/POA delegation sections' },
  { name: 'generate_feedback_ui', tier: 'advanced', category: 'workflow', description: 'Generate inline reviewer comment/feedback panels' },
  { name: 'generate_case_dashboard', tier: 'advanced', category: 'workflow', description: 'Generate combined case dashboard with workflow + progress + history' },
  { name: 'generate_audit_trail', tier: 'advanced', category: 'workflow', description: 'Generate change history timeline' },

  // Testing
  { name: 'generate_story', tier: 'advanced', category: 'testing', description: 'Generate Storybook story from form HTML' },
  { name: 'generate_508_report', tier: 'advanced', category: 'testing', description: 'Generate Section 508 accessibility audit report' },

  // Validation
  { name: 'validate_schema', tier: 'advanced', category: 'validation', description: 'Validate FormSchema structure' },
  { name: 'validate_reading_level', tier: 'advanced', category: 'validation', description: 'Check form text reading level for plain language compliance' },
  { name: 'check_contrast', tier: 'advanced', category: 'utility', description: 'WCAG color contrast validation' },

  // Content
  { name: 'extract_strings', tier: 'advanced', category: 'content', description: 'Extract translatable strings from form HTML' },
  { name: 'lint_form_language', tier: 'advanced', category: 'content', description: 'Check form text for plain language compliance' },

  // Utility
  { name: 'query_tokens', tier: 'advanced', category: 'utility', description: 'Query design token values' },
  { name: 'suggest_fix', tier: 'advanced', category: 'utility', description: 'Auto-fix validation violations in form HTML' },
  { name: 'diff_forms', tier: 'advanced', category: 'utility', description: 'Diff two form HTML documents' },
  { name: 'compare_schemas', tier: 'advanced', category: 'utility', description: 'Compare two FormSchemas' },
  { name: 'export_schema', tier: 'advanced', category: 'form-generation', description: 'Export FormSchema as JSON Schema, TypeScript, or Zod' },

  // ── Internal (Tier 3) — composed by other tools, hidden ─────

  // Parsing
  { name: 'form_to_schema', tier: 'internal', category: 'form-generation', description: 'Convert CivUI HTML back to FormSchema (reverse of generate_civui_form)' },

  // Feature generators (composed by gov form tools)
  { name: 'generate_repeatable_section', tier: 'internal', category: 'form-generation', description: 'Generate add-another repeatable section' },
  { name: 'generate_progress_bar', tier: 'internal', category: 'form-generation', description: 'Generate progress indicator' },
  { name: 'generate_timeout_warning', tier: 'internal', category: 'form-generation', description: 'Generate session timeout dialog' },
  { name: 'generate_help_panel', tier: 'internal', category: 'form-generation', description: 'Generate contextual help panel' },
  { name: 'generate_data_table', tier: 'internal', category: 'form-generation', description: 'Generate tabular data display' },
  { name: 'generate_form_chain', tier: 'internal', category: 'form-generation', description: 'Generate multi-form sequence' },
  { name: 'generate_bilingual_form', tier: 'internal', category: 'form-generation', description: 'Generate bilingual form support' },
  { name: 'generate_print_css', tier: 'internal', category: 'form-generation', description: 'Generate print stylesheet' },
  { name: 'generate_summary', tier: 'internal', category: 'form-generation', description: 'Generate read-only summary page' },
  { name: 'generate_companion_js', tier: 'internal', category: 'form-generation', description: 'Generate companion JavaScript for repeatable/conditional' },
  { name: 'generate_amendment_flow', tier: 'internal', category: 'workflow', description: 'Generate post-submission amendment UI' },
  { name: 'generate_decision_notice', tier: 'internal', category: 'workflow', description: 'Generate decision notification page' },
  { name: 'generate_email_template', tier: 'internal', category: 'workflow', description: 'Generate email notification template' },
  { name: 'generate_pdf_notice', tier: 'internal', category: 'workflow', description: 'Generate PDF notice document' },

  // Validation internals
  { name: 'validate_forms', tier: 'internal', category: 'validation', description: 'Batch validate multiple forms' },
  { name: 'validate_cross_field', tier: 'internal', category: 'validation', description: 'Validate cross-field rules' },

  // Testing internals
  { name: 'generate_e2e_tests', tier: 'internal', category: 'testing', description: 'Generate E2E test file' },
  { name: 'generate_a11y_tests', tier: 'internal', category: 'testing', description: 'Generate accessibility test suite' },
  { name: 'generate_mock_data', tier: 'internal', category: 'testing', description: 'Generate mock test data' },

  // Schema internals
  { name: 'generate_validation_schema', tier: 'internal', category: 'form-generation', description: 'Generate validation rules from schema' },
  { name: 'generate_payload_schema', tier: 'internal', category: 'form-generation', description: 'Generate API payload schema' },
  { name: 'generate_openapi_spec', tier: 'internal', category: 'form-generation', description: 'Generate OpenAPI specification' },
  { name: 'generate_cross_field_rules', tier: 'internal', category: 'form-generation', description: 'Generate cross-field validation rules' },
  { name: 'compose_forms', tier: 'internal', category: 'form-generation', description: 'Merge multiple FormSchemas' },
  { name: 'inline_sub_forms', tier: 'internal', category: 'form-generation', description: 'Embed sub-forms into parent' },

  // Content internals
  { name: 'generate_i18n_files', tier: 'internal', category: 'content', description: 'Generate locale bundles' },
  { name: 'generate_content_registry', tier: 'internal', category: 'content', description: 'Generate content registry' },
  { name: 'sync_content_registry', tier: 'internal', category: 'content', description: 'Sync with content system' },

  // Workflow internals
  { name: 'generate_lock_matrix', tier: 'internal', category: 'workflow', description: 'Generate role-based field permission matrix' },
  { name: 'generate_section_progress', tier: 'internal', category: 'workflow', description: 'Generate section completion checklist' },
  { name: 'generate_api_handler', tier: 'internal', category: 'workflow', description: 'Generate API endpoint handler' },

  // Utility internals
  { name: 'generate_analytics_plan', tier: 'internal', category: 'utility', description: 'Generate analytics instrumentation plan' },
  { name: 'generate_prefill_js', tier: 'internal', category: 'utility', description: 'Generate prefill JavaScript' },
  { name: 'generate_prefill_mapping', tier: 'internal', category: 'utility', description: 'Generate API-to-form field mapping' },
  { name: 'generate_field_dependencies_graph', tier: 'internal', category: 'utility', description: 'Generate field dependency visualization' },
  { name: 'migrate_saved_data', tier: 'internal', category: 'utility', description: 'Migrate saved form data between schema versions' },
  { name: 'analyze_relationships', tier: 'internal', category: 'utility', description: 'Analyze field relationships in schema' },
  { name: 'visualize_form_flow', tier: 'internal', category: 'utility', description: 'Generate Mermaid flowchart of form flow' },
];

/**
 * Get tools for a specific tier level.
 */
export function getToolsForTier(tier: string): ToolInfo[] {
  switch (tier) {
    case 'essential':
      return TOOL_REGISTRY.filter(t => t.tier === 'essential');
    case 'standard':
      return TOOL_REGISTRY.filter(t => t.tier !== 'internal');
    case 'all':
    default:
      return TOOL_REGISTRY;
  }
}

/**
 * Get tool info by name.
 */
export function getToolInfo(name: string): ToolInfo | undefined {
  return TOOL_REGISTRY.find(t => t.name === name);
}

/**
 * Get tools grouped by category.
 */
export function getToolsByCategory(): Record<ToolCategory, ToolInfo[]> {
  const groups: Record<string, ToolInfo[]> = {};
  for (const tool of TOOL_REGISTRY) {
    if (!groups[tool.category]) groups[tool.category] = [];
    groups[tool.category].push(tool);
  }
  return groups as Record<ToolCategory, ToolInfo[]>;
}
