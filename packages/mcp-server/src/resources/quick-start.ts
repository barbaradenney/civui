/**
 * Resource: Quick Start guide for LLMs using the CivUI MCP server.
 * Covers the 3 main workflows, FormSchema basics, and tool chaining.
 */

export const QUICK_START = `# CivUI MCP Quick Start

Start here. This guide shows the fastest path from input to working form.

---

## Three Workflows

### 1. Build a VA.gov Form (fastest)

If you know the VA form number:

\`\`\`
list_gov_forms                         → see available forms
assemble_gov_form(formNumber, format)  → complete HTML or React app
validate_gov_form(formNumber)          → check for issues
\`\`\`

Available forms (20): 21-526EZ (disability), 10-10EZ (health care), 22-1990 (education), 21P-527EZ (pension), 21-22 (POA), 10-10CG (caregiver), 21-686C (dependents), 21-0966 (intent to file), 21-4142 (medical records), 22-5490 (dependent education), 22-1995 (change of school), 26-1880 (home loan COE), 28-1900 (vocational rehab), 20-0995 (supplemental claim), 20-0996 (higher-level review), 10182 (board appeal), 21P-530 (burial), 21-0845 (disclosure auth), 40-10007 (pre-need burial), 10-10D (CHAMPVA).

The \`assemble_gov_form\` tool produces a **single working file** with routing, navigation, form persistence, task list tracking, and submission handling. Use \`format: "react"\` for a multi-file React app.

### 2. Convert an Existing Form (PDF or HTML)

\`\`\`
parse_pdf_form(pdfBase64)   → FormSchema
  OR
parse_html_form(html)       → FormSchema

generate_civui_form(schema) → accessible CivUI HTML
  OR
generate_react_form(schema) → React TSX component

validate_form(html)         → check for 508 violations
\`\`\`

The parse tools extract field structure (names, types, labels, options, required flags) and return a **FormSchema** — the universal intermediate format all generation tools accept.

### 3. Build from Scratch

\`\`\`
scaffold_from_template(templateName)  → FormSchema from template
  OR
generate_civui_form(schema)           → build from your own FormSchema

validate_form(html)                   → check accessibility
generate_tests(html)                  → generate test suite
\`\`\`

Available templates: "Contact Form", "Benefits Application", "Change of Address", "Authorization".

---

## FormSchema Basics

FormSchema is the universal format that connects all tools. Here's the minimum:

\`\`\`json
{
  "title": "Change of Address",
  "action": "/api/submit",
  "method": "POST",
  "sections": [
    {
      "heading": "New Address",
      "fields": [
        { "name": "street", "label": "Street address", "type": "text", "required": true },
        { "name": "city", "label": "City", "type": "text", "required": true },
        { "name": "state", "label": "State", "type": "select", "required": true,
          "options": [
            { "label": "California", "value": "CA" },
            { "label": "Texas", "value": "TX" }
          ]
        },
        { "name": "zip", "label": "ZIP code", "type": "zip", "required": true }
      ]
    }
  ]
}
\`\`\`

### Field Types

| Type | Component | Notes |
|------|-----------|-------|
| \`text\`, \`email\`, \`tel\`, \`url\`, \`number\`, \`password\` | \`<civ-text-input>\` | Set \`type\` accordingly |
| \`ssn\` | \`<civ-text-input mask="ssn">\` | Auto-masked |
| \`zip\` | \`<civ-text-input mask="zip">\` | Auto-masked |
| \`textarea\` | \`<civ-textarea>\` | Multi-line text |
| \`select\` | \`<civ-select>\` | Requires \`options\` |
| \`combobox\` | \`<civ-combobox>\` | Typeahead search |
| \`radio\` | \`<civ-radio-group>\` | Requires \`options\` |
| \`checkbox\` | \`<civ-checkbox>\` | Single boolean |
| \`checkbox-group\` | \`<civ-checkbox-group>\` | Multiple selections |
| \`memorable-date\` | \`<civ-memorable-date>\` | For known dates (birthday, DOB) |
| \`date\` | \`<civ-date-picker>\` | For scheduling dates |
| \`file\` | \`<civ-file-upload>\` | Document upload |
| \`toggle\` | \`<civ-toggle>\` | On/off switch |

### Adding Conditions

Show/hide fields based on other field values:

\`\`\`json
{
  "name": "otherReason",
  "label": "Please describe",
  "type": "textarea",
  "visibleWhen": { "field": "reason", "operator": "eq", "value": "other" }
}
\`\`\`

### Cross-Field Validation

\`\`\`json
{
  "crossFieldRules": [
    {
      "id": "phone-required-if-call",
      "description": "Phone is required when contact method is call",
      "when": { "field": "contactMethod", "operator": "eq", "value": "call" },
      "then": { "action": "require", "targets": ["phone"] }
    }
  ]
}
\`\`\`

Or use \`generate_cross_field_rules\` with plain English:
- "Phone is required if contact method is call"
- "End date must be after start date"
- "Confirm email must match email address"

---

## Tool Chaining Quick Reference

| After this tool... | Do this next |
|-------------------|-------------|
| \`parse_pdf_form\` / \`parse_html_form\` | \`generate_civui_form\` or \`generate_react_form\` |
| \`generate_civui_form\` | \`validate_form\` → \`generate_tests\` |
| \`generate_react_form\` | \`validate_form\` → \`generate_tests\` |
| \`validate_form\` (has errors) | \`suggest_fix\` → \`validate_form\` again |
| \`validate_form\` (clean) | \`generate_tests\` or \`generate_508_report\` |
| \`list_gov_forms\` | \`assemble_gov_form\` |
| \`assemble_gov_form\` | \`validate_gov_form\` |
| \`scaffold_from_template\` | \`generate_civui_form\` or \`generate_react_form\` |

---

## Common Patterns

### Add an address block
\`\`\`
generate_address_block({ includeTerritories: true, includeMilitary: true })
\`\`\`

### Add save-and-resume
\`\`\`
generate_save_resume_ui(schema, { autoSaveIntervalMs: 30000 })
\`\`\`

### Add a signature
\`\`\`
generate_signature_block(schema, { type: "typed", legalText: "I certify..." })
\`\`\`

### Add a page header
\`\`\`html
<civ-page-header>
  <span data-eyebrow>Benefits</span>
  <h1 data-heading class="civ-heading-xl">Apply for benefits</h1>
  <span data-subheading>VA Form 21-526EZ</span>
</civ-page-header>
\`\`\`

### Add a back link
\`\`\`html
<civ-link href="/hub" variant="back" label="Back to task list"></civ-link>
\`\`\`

### Add a link card
\`\`\`html
<civ-link-card href="/apply" heading="Apply now" description="Start your application." variant="primary"></civ-link-card>
\`\`\`

### Add a task list
\`\`\`html
<civ-task-list>
  <civ-task-group>
    <h3 data-task-group-heading class="civ-heading-md">Section</h3>
    <civ-task label="Step 1" href="#/step1" status="complete"></civ-task>
    <civ-task label="Step 2" href="#/step2" status="in-progress"></civ-task>
    <civ-task label="Step 3" status="cannot-start"></civ-task>
  </civ-task-group>
</civ-task-list>
\`\`\`

### Validate accessibility
\`\`\`
validate_form(html)           → quick check (46 rules)
generate_508_report(html)     → full audit with WCAG mapping and remediation plan
\`\`\`

---

## Resources

For deeper reference, read these MCP resources:

- **civui://catalog** — Full component catalog with props, events, HTML examples
- **civui://schema-reference** — Complete FormSchema specification
- **civui://gov-patterns** — Government design patterns (Section 508, plain language)
- **civui://templates** — Pre-built form templates
- **civui://decision-tree** — Which component to use when
- **civui://tailwind** — CivUI Tailwind classes and design tokens
`;
