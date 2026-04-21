---
title: Workflows
sidebar_position: 3
sidebar_label: Workflows
---

# Workflows

The MCP server supports four primary workflows for generating accessible government forms.

## 1. VA Form Generation (Fastest)

If you know the VA form number, you can generate a complete working application in two steps:

```
list_gov_forms()                              → see all 20 available forms
assemble_gov_form({ formNumber, format })     → complete HTML or React app
validate_gov_form({ formNumber })             → check for issues
```

The `assemble_gov_form` tool produces a single working file with:
- Routing and navigation
- Form persistence (save and resume)
- Task list tracking
- Submission handling
- Introduction and confirmation pages

Use `format: "react"` for a multi-file React app with TypeScript.

### Available Forms

21-526EZ, 10-10EZ, 22-1990, 21P-527EZ, 21-22, 10-10CG, 21-686C, 21-0966, 21-4142, 22-5490, 22-1995, 26-1880, 28-1900, 20-0995, 20-0996, 10182, 21P-530, 21-0845, 40-10007, 10-10D.

## 2. PDF to Application (4 Steps)

Convert an existing government PDF form into an accessible web application:

```
parse_pdf_form({ pdf: "<base64>" })     → FormSchema (extracts fields, labels, options)
generate_civui_form({ schema })         → Accessible CivUI HTML
   OR generate_react_form({ schema })   → React TSX component
validate_form({ html })                 → Check for 508 violations
generate_tests({ html })                → Generate test suite
```

The `parse_pdf_form` tool accepts base64-encoded PDFs up to ~37.5 MB decoded. It extracts:
- Field names, types, and labels
- Required flags
- Select/radio options
- Field groupings into logical sections

## 3. HTML to CivUI (3 Steps)

Migrate an existing HTML form to accessible CivUI components:

```
parse_html_form({ html })           → FormSchema
generate_civui_form({ schema })     → CivUI web component HTML
validate_form({ html })             → Accessibility check
```

The parser handles standard HTML `<form>` elements, `<input>`, `<select>`, `<textarea>`, fieldsets, and labels.

## 4. Build from Scratch (3 Steps)

Start from a template or your own schema:

```
scaffold_from_template({ template: "Benefits Application" })
   OR provide your own FormSchema

generate_civui_form({ schema })     → CivUI HTML
validate_form({ html })             → Check accessibility
generate_tests({ html })            → Generate test suite
```

### Available Templates

| Template | Description |
|----------|-------------|
| Contact Form | Basic contact information collection |
| Benefits Application | Multi-section benefits application with eligibility |
| Change of Address | Address update form with verification |
| Authorization | Consent and authorization with signature |

## Tool Chaining Reference

Use this table to determine the next logical step after each tool:

| After this tool... | Do this next |
|-------------------|-------------|
| `parse_pdf_form` | `generate_civui_form` or `generate_react_form` |
| `parse_html_form` | `generate_civui_form` or `generate_react_form` |
| `generate_civui_form` | `validate_form` then `generate_tests` |
| `generate_react_form` | `validate_form` then `generate_tests` |
| `validate_form` (has errors) | `suggest_fix` then `validate_form` again |
| `validate_form` (clean) | `generate_tests` or `generate_508_report` |
| `list_gov_forms` | `assemble_gov_form` |
| `assemble_gov_form` | `validate_gov_form` |
| `scaffold_from_template` | `generate_civui_form` or `generate_react_form` |

## Common Enhancements

After generating a form, add features with these tools:

```
generate_address_block({ includeTerritories: true, includeMilitary: true })
generate_save_resume_ui(schema, { autoSaveIntervalMs: 30000 })
generate_signature_block(schema, { type: "typed", legalText: "I certify..." })
generate_eligibility_screener(schema)
generate_document_checklist(schema)
generate_conditional_reveal(schema)
```
