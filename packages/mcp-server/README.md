# @civui/mcp-server

MCP (Model Context Protocol) server that exposes ~80 tools for AI agents working with CivUI — component discovery, form generation, validation, accessibility auditing, and structured introspection of the design system.

## What this gives an AI agent

Instead of grepping source files or pulling `docs/ai-guide.md` into context, an agent connected via MCP can call focused tools that return structured JSON. The server reads live source (`@civui/schema`, `*.stories.ts`, `.claude/rules/common-traps.md`) so answers can't drift from the codebase.

## Quick start

```bash
# From this package
pnpm build
node dist/index.js
```

Wire into your MCP-capable client (Claude Desktop, Claude Code, Continue, Cursor, etc.) by adding the server to its config and pointing at the built `dist/index.js`.

## Tool tiers

The server exposes ~80 tools total. The `CIV_MCP_TIER` environment variable controls which are registered:

| Tier        | Count | Use when                                                                    |
| ----------- | ----- | --------------------------------------------------------------------------- |
| `essential` | ~12   | Working in a low-context client — only the most-used tools.                 |
| `standard`  | ~35   | Most agent setups. Essential + advanced (specific feature generators).      |
| `all`       | ~80   | Full catalogue. Default — backwards compatible.                             |

The full categorised registry lives in `src/tool-registry.ts`; the `discover_tools` MCP tool returns it at runtime.

## Tool categories

### Component discovery (start here)

When you're not sure which component matches the affordance you need:

| Tool                     | Returns                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `search_components`      | Ranked component matches for a natural-language query (`"user uploads ID and signs"`).           |
| `get_component_guide`    | Schema + canonical examples + matching trap excerpts in one focused payload for a component.     |
| `get_component_examples` | Canonical HTML snippets pulled from `*.stories.ts` for a component.                              |
| `style_civui_element`    | CSS classes, states, and design tokens for a CivUI element.                                      |
| `query_tokens`           | Look up design tokens (colours, spacing, motion, z-index).                                       |
| `discover_tools`         | List every available MCP tool with categories and descriptions.                                  |

### Government-form pipeline (5 tools)

End-to-end conversion from a government form number into a working CivUI app:

| Tool                    | What it does                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `list_gov_forms`        | List available templates with form numbers, titles, and chapter counts.                        |
| `generate_gov_form`     | Generate structured pages (intro / chapters / review / confirmation) from a form number.       |
| `assemble_gov_form`     | Generate a complete working form app (HTML or React) from a form number.                       |
| `validate_gov_form`     | Validate generated form HTML against CivUI component usage and consistency rules.              |
| `generate_508_report`   | Section 508 accessibility audit report for a generated form.                                   |

### Form generation (32 tools)

Generate self-contained CivUI markup or React TSX from a structured `FormSchema`:

- **Conversion** — `parse_html_form`, `parse_pdf_form`, `generate_civui_form`, `generate_react_form`, `scaffold_from_template`.
- **Page-level** — `generate_intro_page`, `generate_confirmation_page`, `generate_form_steps`, `generate_progress_bar`, `generate_section_progress`.
- **Feature blocks** — `generate_address_block`, `generate_signature_block`, `generate_document_checklist`, `generate_eligibility_screener`, `generate_repeatable_section`, `generate_conditional_reveal`, `generate_save_resume_ui`, `generate_timeout_warning`, `generate_help_panel`, `generate_error_messages`, `generate_decision_notice`, `generate_email_template`, `generate_pdf_notice`, `generate_amendment_flow`, `generate_form_chain`.
- **Multi-actor / workflow** — see *Workflow* below.

### Validation (5 tools)

| Tool                       | Checks                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| `validate_form`            | Accessibility, compliance, and CivUI pattern adherence on form HTML.    |
| `validate_schema`          | `FormSchema` structural correctness.                                    |
| `validate_reading_level`   | Plain-language reading level on form text.                              |
| `validate_cross_field`     | Cross-field rule consistency.                                           |
| `check_contrast`           | WCAG colour-contrast validation.                                        |

### Workflow / multi-actor (12 tools)

For case-management UIs with reviewers, delegated representatives, audit trails:

`generate_workflow_ui`, `generate_delegation_sections`, `generate_feedback_ui`, `generate_case_dashboard`, `generate_audit_trail`, `generate_decision_notice`, `generate_amendment_flow`, `generate_lock_matrix`, `generate_data_table`, `generate_field_dependencies_graph`, `analyze_relationships`, `visualize_form_flow`.

### Testing (6 tools)

| Tool                       | Output                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| `generate_tests`           | Unit / e2e / a11y test suite for form HTML.                         |
| `generate_e2e_tests`       | Playwright-style end-to-end tests.                                  |
| `generate_a11y_tests`      | axe-core accessibility test suite.                                  |
| `generate_story`           | Storybook story from form HTML.                                     |
| `generate_mock_data`       | Mock data for testing form flows.                                   |
| `generate_508_report`      | Section 508 audit report.                                           |

### Content (5 tools)

| Tool                      | Use                                                                |
| ------------------------- | ------------------------------------------------------------------ |
| `extract_strings`         | Pull translatable strings out of form HTML.                        |
| `lint_form_language`      | Flag jargon, passive voice, complex sentences in form copy.        |
| `generate_i18n_files`     | Generate i18n bundles from extracted strings.                      |
| `generate_bilingual_form` | Generate side-by-side bilingual form layout.                       |
| `sync_content_registry`   | Sync extracted strings to the content registry.                    |

### Utility (14 tools)

Schema introspection, code generation, contrast checks, burden estimation, etc.:

`style_civui_element`, `query_tokens`, `export_schema`, `compare_schemas`, `diff_forms`, `inline_sub_forms`, `compose_forms`, `migrate_saved_data`, `estimate_burden`, `check_contrast`, `suggest_fix`, `round_trip`, `generate_payload_schema`, `generate_validation_schema`.

## Tool discoverability at runtime

Every tool registered with the server is queryable via `discover_tools`. The response includes the tool name, tier, category, and one-line description — useful for an agent that needs to scan capabilities before deciding which tool to call.

For the full schema (input / output types), call any tool's MCP discovery endpoint (`tools/list` in the protocol).

## Adding a new tool

1. Write the implementation in `src/tools/<tool-name>.ts` with co-located tests.
2. Add a `ToolDefinition` to the matching category file in `src/tool-defs/` (`generation.ts`, `validation.ts`, etc.).
3. Add a `ToolInfo` entry to `src/tool-registry.ts` with the correct tier and category.
4. Re-run `pnpm build` and `pnpm test`.

## What this is not

- **Not a UI library** — install `@civui/inputs`, `@civui/controls`, `@civui/compound`, etc. for the actual web components.
- **Not a runtime dependency for apps** — tools are agent-time helpers, not browser code.
- **Not a substitute for the schemas** — `@civui/schema` is the canonical contract. Tools read from it; they don't replace it.

## See also

- `CLAUDE.md` (repo root) — architecture and conventions.
- `docs/ai-guide.md` — long-form component catalogue for agents.
- `apps/docs/docs/foundations/ai-agent-friendly.md` — what makes CivUI AI-agent-friendly overall.
- `packages/schema/README.md` — the schema authoring guide and naming conventions.
