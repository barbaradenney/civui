---
title: Tool Reference
sidebar_position: 2
sidebar_label: Tools
---

# Tool Reference

All 80 MCP tools organized by category. Each tool shows its tier:

- **Essential** — Always available, core LLM workflow
- **Advanced** — Available in standard/all modes, feature-specific
- **Internal** — Composed by other tools, hidden in essential/standard modes

## Gov Forms (5 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `list_gov_forms` | Essential | List all available government form templates with numbers, titles, and chapter counts |
| `assemble_gov_form` | Essential | Generate a complete working form app (HTML or React) from a form number |
| `generate_gov_form` | Essential | Generate structured form pages from a form number (intro, chapters, review, confirmation) |
| `validate_gov_form` | Essential | Validate generated form HTML for CivUI component usage and consistency |
| `generate_intro_page` | Advanced | Generate government form introduction page |

## Form Generation (24 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `generate_civui_form` | Essential | Convert a FormSchema to CivUI web component HTML |
| `parse_html_form` | Essential | Parse existing HTML form into a FormSchema |
| `scaffold_from_template` | Essential | Generate a FormSchema from a pre-built template |
| `parse_pdf_form` | Essential | Parse a fillable PDF form into a FormSchema (base64 input, max ~37.5 MB decoded) |
| `generate_react_form` | Advanced | Generate a React TSX component from FormSchema using CivUI web components |
| `generate_wizard` | Advanced | Generate multi-step wizard navigation |
| `generate_signature_block` | Advanced | Generate e-signature block (typed, drawn, or checkbox) |
| `generate_eligibility_screener` | Advanced | Generate eligibility questionnaire with pass/fail logic |
| `generate_confirmation_page` | Advanced | Generate post-submission confirmation page |
| `generate_save_resume_ui` | Advanced | Generate save-and-resume flow with session persistence |
| `generate_document_checklist` | Advanced | Generate file upload checklist |
| `generate_address_block` | Advanced | Generate US address fieldset |
| `generate_error_messages` | Advanced | Generate error message library from schema |
| `generate_conditional_reveal` | Advanced | Generate conditional show/hide logic |
| `export_schema` | Advanced | Export FormSchema as JSON Schema, TypeScript, or Zod |
| `form_to_schema` | Internal | Convert CivUI HTML back to FormSchema (reverse of generate_civui_form) |
| `generate_repeatable_section` | Internal | Generate add-another repeatable section |
| `generate_progress_bar` | Internal | Generate progress indicator |
| `generate_timeout_warning` | Internal | Generate session timeout dialog |
| `generate_help_panel` | Internal | Generate contextual help panel |
| `generate_data_table` | Internal | Generate tabular data display |
| `generate_form_chain` | Internal | Generate multi-form sequence |
| `generate_bilingual_form` | Internal | Generate bilingual form support |
| `generate_print_css` | Internal | Generate print stylesheet |
| `generate_summary` | Internal | Generate read-only summary page |
| `generate_companion_js` | Internal | Generate companion JavaScript for repeatable/conditional |
| `generate_validation_schema` | Internal | Generate validation rules from schema |
| `generate_payload_schema` | Internal | Generate API payload schema |
| `generate_openapi_spec` | Internal | Generate OpenAPI specification |
| `generate_cross_field_rules` | Internal | Generate cross-field validation rules |
| `compose_forms` | Internal | Merge multiple FormSchemas |
| `inline_sub_forms` | Internal | Embed sub-forms into parent |

## Validation (7 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `validate_form` | Essential | Validate form HTML for accessibility, compliance, and CivUI patterns |
| `validate_schema` | Advanced | Validate FormSchema structure |
| `validate_reading_level` | Advanced | Check form text reading level for plain language compliance |
| `check_contrast` | Advanced | WCAG color contrast validation |
| `validate_forms` | Internal | Batch validate multiple forms |
| `validate_cross_field` | Internal | Validate cross-field rules |

## Testing (6 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `generate_tests` | Essential | Generate test suite (unit, e2e, or a11y) for form HTML |
| `generate_story` | Advanced | Generate Storybook story from form HTML |
| `generate_508_report` | Advanced | Generate Section 508 accessibility audit report |
| `generate_e2e_tests` | Internal | Generate E2E test file |
| `generate_a11y_tests` | Internal | Generate accessibility test suite |
| `generate_mock_data` | Internal | Generate mock test data |

## Content (5 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `extract_strings` | Advanced | Extract translatable strings from form HTML |
| `lint_form_language` | Advanced | Check form text for plain language compliance |
| `generate_i18n_files` | Internal | Generate locale bundles |
| `generate_content_registry` | Internal | Generate content registry |
| `sync_content_registry` | Internal | Sync with content system |

## Component Discovery (4 tools)

Find the right CivUI component for an intent, see canonical usage snippets, or get a focused per-component reference. Pair these to avoid loading the full `civui://ai-guide` resource when an agent only needs to use one or two components.

| Tool | Tier | Description |
|------|------|-------------|
| `search_components` | Essential | Natural-language query → ranked component matches. Tokenizes the query, scans every schema's name / category / description / prop docs, weights matches by field, and returns up to N results with their prop+event lists attached. Per-field score breakdown shows *why* a result matched. |
| `get_component_examples` | Essential | Canonical HTML snippets for a component, extracted from its `*.stories.ts` files at build time. Returns story name, optional display name, source file, and the rendered template. Suggests close-matching component names if the requested tag is unknown (`civ-input` → suggests `civ-text-input`). |
| `list_components_with_examples` | Essential | Catalog of every component with at least one extracted example, plus the per-component count. Use to discover what's available before calling `get_component_examples`. |
| `get_component_guide` | Essential | Per-component focused reference synthesized on demand from the schema + the top N examples + matching trap excerpts from `common-traps.md` + same-category neighbors. Cheaper than loading the full `civui://ai-guide` resource when only one component is needed. |

**Workflow:** `search_components({ query })` → pick a result → `get_component_guide({ name })` → write the markup. Fetch `civui://ai-guide` only for the broader catalog overview.

## Utility (14 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `style_civui_element` | Essential | Look up CSS classes, states, and design tokens for CivUI elements |
| `estimate_burden` | Essential | Estimate Paperwork Reduction Act respondent burden |
| `query_tokens` | Advanced | Query design token values |
| `suggest_fix` | Advanced | Auto-fix validation violations in form HTML |
| `diff_forms` | Advanced | Diff two form HTML documents |
| `compare_schemas` | Advanced | Compare two FormSchemas |
| `generate_analytics_plan` | Internal | Generate analytics instrumentation plan |
| `generate_prefill_js` | Internal | Generate prefill JavaScript |
| `generate_prefill_mapping` | Internal | Generate API-to-form field mapping |
| `generate_field_dependencies_graph` | Internal | Generate field dependency visualization |
| `migrate_saved_data` | Internal | Migrate saved form data between schema versions |
| `analyze_relationships` | Internal | Analyze field relationships in schema |
| `visualize_form_flow` | Internal | Generate Mermaid flowchart of form flow |

## Workflow (12 tools)

| Tool | Tier | Description |
|------|------|-------------|
| `generate_workflow_ui` | Advanced | Generate workflow status banner and transition buttons |
| `generate_delegation_sections` | Advanced | Generate representative/POA delegation sections |
| `generate_feedback_ui` | Advanced | Generate inline reviewer comment/feedback panels |
| `generate_case_dashboard` | Advanced | Generate combined case dashboard with workflow + progress + history |
| `generate_audit_trail` | Advanced | Generate change history timeline |
| `generate_amendment_flow` | Internal | Generate post-submission amendment UI |
| `generate_decision_notice` | Internal | Generate decision notification page |
| `generate_email_template` | Internal | Generate email notification template |
| `generate_pdf_notice` | Internal | Generate PDF notice document |
| `generate_lock_matrix` | Internal | Generate role-based field permission matrix |
| `generate_section_progress` | Internal | Generate section completion checklist |
| `generate_api_handler` | Internal | Generate API endpoint handler |

## Meta (1 tool)

| Tool | Tier | Description |
|------|------|-------------|
| `discover_tools` | Essential | List all available tools with categories and descriptions |
