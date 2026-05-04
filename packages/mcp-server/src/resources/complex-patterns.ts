/**
 * Resource: Complex form patterns — repeatable sections, sub-form composition,
 * cross-field validation, and entity relationships.
 */

export const COMPLEX_PATTERNS = `# Complex Form Patterns

## Repeatable Sections

Repeatable sections allow users to add multiple instances of a field group (e.g., dependents, employers, addresses).

### Data Attributes

| Attribute | Purpose |
|-----------|---------|
| \`data-civ-repeatable="key"\` | Container for repeatable items; \`key\` is the array prefix |
| \`data-civ-repeatable-min="N"\` | Minimum number of items (disable remove at this count) |
| \`data-civ-repeatable-max="N"\` | Maximum number of items (disable add at this count) |
| \`data-civ-repeatable-add\` | Add button (placed inside the container, after items) |
| \`data-civ-repeatable-remove\` | Remove button (placed inside each repeatable item) |
| \`data-civ-repeatable-template\` | Hidden template for cloning (skipped by parser and validation) |

### Naming Convention

Field names follow \`key[index].field\` pattern:

\`\`\`
dependents[0].first-name
dependents[0].last-name
dependents[1].first-name
dependents[1].last-name
\`\`\`

### Accessibility

- Container MUST have \`aria-live="polite"\` for screen reader announcements when items are added/removed.
- Add/remove buttons must have descriptive text (not just icons).
- After adding, focus the first input of the new item.
- After removing, announce the remaining count.

### Example

\`\`\`html
<div data-civ-repeatable="dependents" data-civ-repeatable-min="0" data-civ-repeatable-max="10" aria-live="polite">
  <civ-fieldset legend="Dependent 1">
    <civ-form-field label="First name">
      <civ-text-input name="dependents[0].first-name"></civ-text-input>
    </civ-form-field>
    <civ-form-field label="Last name">
      <civ-text-input name="dependents[0].last-name"></civ-text-input>
    </civ-form-field>
    <button type="button" data-civ-repeatable-remove>Remove this dependent</button>
  </civ-fieldset>
  <button type="button" data-civ-repeatable-add>Add another dependent</button>
</div>
\`\`\`

## Sub-Form Composition

Use \`ref\` and \`namespace\` in FormSchema sections to reference reusable field groups.

### When to Extract a Sub-Form

Extract a sub-form when the same field group appears 2+ times (e.g., mailing address and billing address both reference an "address" sub-form).

### Pattern

\`\`\`json
{
  "subForms": {
    "address": {
      "description": "Shared address fields",
      "fields": [
        { "type": "text", "name": "street", "label": "Street address" },
        { "type": "text", "name": "city", "label": "City" },
        { "type": "select", "name": "state", "label": "State" },
        { "type": "zip", "name": "zip", "label": "ZIP code" }
      ]
    }
  },
  "sections": [
    { "heading": "Mailing address", "ref": "address", "namespace": "mailing", "fields": [] },
    { "heading": "Billing address", "ref": "address", "namespace": "billing", "fields": [] }
  ]
}
\`\`\`

After composition, fields become \`mailing.street\`, \`mailing.city\`, \`billing.street\`, \`billing.city\`, etc.

## Cross-Field Validation

Use \`crossFieldRules\` on FormSchema and \`requiredWhen\`/\`visibleWhen\` on individual fields for conditional logic.

### Condition Expressions

\`\`\`typescript
{ field: string, operator: 'eq' | 'neq' | 'in' | 'notIn' | 'exists' | 'notExists', value?: string | string[] }
\`\`\`

### Actions

| Action | Effect |
|--------|--------|
| \`require\` | Target fields become required when condition is met |
| \`show\` | Target fields/sections become visible |
| \`hide\` | Target fields/sections become hidden |
| \`setError\` | Set an error message on target fields |

### Common Government Patterns

- **Veteran → service dates**: When \`is-veteran=yes\`, require \`service-start-date\` and \`service-end-date\`
- **Married → spouse info**: When \`marital-status=married\`, show spouse information section
- **Has dependents → dependent list**: When \`has-dependents=yes\`, show repeatable dependents section
- **Filing status → income fields**: When \`filing-status\` in \`['married-joint', 'head-of-household']\`, require \`spouse-income\`

### Data Attributes for HTML

| Attribute | Purpose |
|-----------|---------|
| \`data-civ-show-when="field=value"\` | Show element when condition is met |
| \`data-civ-hide-when="field!=value"\` | Hide element when condition is met |
| \`data-civ-require-when="field=value"\` | Make field required when condition is met |

## Entity Relationships

### entityType Annotation

Set \`entityType\` on fields to explicitly classify them:

\`\`\`json
{ "type": "text", "name": "first-name", "label": "First name", "entityType": "person" }
\`\`\`

### One-to-Many Patterns

Repeatable sections create one-to-many relationships:
- Form → Dependents (repeatable section)
- Form → Employment History (repeatable section)
- Form → Previous Addresses (repeatable section)

### Naming Conventions for Entity Inference

The system infers entity types from field name patterns:
- \`*-street\`, \`*-city\`, \`*-zip\` → **address**
- \`first-name\`, \`last-name\`, \`ssn\`, \`dob\` → **person**
- \`phone\`, \`email\`, \`tel\` → **contact**
- \`employer\`, \`company\` → **organization**
- \`account\`, \`routing\`, \`bank\` → **financial**

## Multi-Step Form (Form Steps)

Use \`steps\` on the FormSchema and \`step\` on each FormSection to create a multi-step form.

### Schema

\`\`\`json
{
  "steps": [
    { "title": "Personal Info", "description": "Your basic details" },
    { "title": "Contact Info" },
    { "title": "Review" }
  ],
  "sections": [
    { "step": 0, "heading": "Personal", "fields": [...] },
    { "step": 1, "heading": "Contact", "fields": [...] },
    { "step": 2, "fields": [...] }
  ]
}
\`\`\`

### Generated HTML Structure

\`\`\`html
<nav data-civ-progress aria-label="Form progress">
  <ol>
    <li data-civ-progress-step="0" aria-current="step">Personal Info</li>
    <li data-civ-progress-step="1">Contact Info</li>
    <li data-civ-progress-step="2">Review</li>
  </ol>
</nav>
<div data-civ-step="0">...</div>
<div data-civ-step="1" hidden>...</div>
<div data-civ-step="2" hidden>...</div>
<div data-civ-step-nav>
  <button type="button" data-civ-step-prev disabled>Previous</button>
  <button type="button" data-civ-step-next>Next</button>
</div>
\`\`\`

### Companion JS Features

- Step show/hide with \`hidden\` attribute
- Progress indicator updates (\`aria-current\`)
- Per-step required field validation before advancing
- Hash-based history (\`#step-0\`, \`#step-1\`)
- Screen reader announcements on step change
- Focus management (focus first input in new step)
- "Submit" label on last step's next button

### Validation Rules

- \`form-steps-missing-progress\` (error): Step containers without a progress indicator
- \`form-steps-step-gap\` (warning): Non-contiguous step numbers
- \`form-steps-step-no-fields\` (warning): Empty form step

## Compound Conditions

Use \`allOf\` and \`anyOf\` for AND/OR logic in condition expressions.

### Schema

\`\`\`json
{
  "visibleWhen": {
    "allOf": [
      { "field": "married", "operator": "eq", "value": "yes" },
      { "field": "filing", "operator": "eq", "value": "joint" }
    ]
  }
}
\`\`\`

\`\`\`json
{
  "visibleWhen": {
    "anyOf": [
      { "field": "status", "operator": "eq", "value": "employed" },
      { "field": "status", "operator": "eq", "value": "self-employed" }
    ]
  }
}
\`\`\`

Compound conditions can be nested: \`allOf\` containing \`anyOf\` and vice versa.

### HTML Serialization

Compound conditions are serialized as JSON in \`data-civ-show-when\` attributes. The parser detects JSON (starts with \`{\`) and uses \`JSON.parse()\`.

## Section-Level Visibility

Use \`visibleWhen\` on a FormSection to show/hide the entire section conditionally.

### Schema

\`\`\`json
{
  "sections": [
    {
      "heading": "Spouse Information",
      "visibleWhen": { "field": "marital-status", "operator": "eq", "value": "married" },
      "fields": [...]
    }
  ]
}
\`\`\`

- For sections with a heading: \`data-civ-show-when\` is added to the \`<civ-fieldset>\`
- For headless sections: a wrapper \`<div data-civ-show-when="...">\` is generated
- For repeatable sections: \`data-civ-show-when\` is added to the repeatable container
- When the section is hidden, all fields inside are added to \`conditionallyHidden\`
- Per-field \`requiredWhen\` is skipped for hidden sections

## Prefill & Save-Resume

Use \`generate_prefill_js\` to produce JavaScript that populates form fields from a saved values object.

### Features

- Handles all field types: text, radio, checkbox, select, toggle
- Includes \`window.civSerializeForm()\` for serializing form state back to a values object
- Supports repeatable section field names (\`key[index].field\`)

### Pattern

1. User fills out part of a form
2. Call \`window.civSerializeForm('civ-form')\` to get current values
3. Store values (localStorage, server, etc.)
4. On return, use \`generate_prefill_js\` to create JS that restores values
5. Include the generated JS on the page

## Anti-Patterns

### Unbounded Repeatable Sections
Always set \`data-civ-repeatable-max\` to prevent memory/performance issues. A reasonable limit for government forms is 10–20 items.

### Deeply Nested Conditionals
Avoid chaining more than 2 levels of conditional visibility. If field C depends on field B which depends on field A, consider restructuring as a multi-step form instead.

### Circular Dependencies
Never create circular cross-field rules where field A requires field B and field B requires field A. The \`validate_cross_field\` tool does not detect cycles — design schemas to avoid them.

### Missing aria-live on Repeatable Containers
Screen readers need \`aria-live="polite"\` on repeatable containers to announce when items are added or removed.

### Repeatable Sections Without Keyboard Support
Ensure add/remove buttons are focusable and operable with keyboard. Use \`<button type="button">\` — never \`<div>\` or \`<span>\` with click handlers.

## Cascading/Dependent Options

Use \`optionsFrom\` on a FormField to create dependent option lists (e.g., State → County → City).

### Schema

\`\`\`json
{
  "type": "select", "name": "county", "label": "County",
  "optionsFrom": {
    "field": "state",
    "map": {
      "CA": [{ "value": "la", "label": "Los Angeles" }, { "value": "sf", "label": "San Francisco" }],
      "TX": [{ "value": "harris", "label": "Harris" }, { "value": "dallas", "label": "Dallas" }]
    }
  }
}
\`\`\`

### Generated HTML

\`\`\`html
<civ-form-field label="County">
  <civ-select name="county" data-civ-options-from="state"></civ-select>
</civ-form-field>
<script type="application/json" data-civ-options-map="county">{"CA":[...],"TX":[...]}</script>
\`\`\`

### Companion JS Behavior

The \`generate_companion_js\` tool detects \`optionsFrom\` fields and generates an IIFE that:
1. Listens for \`civ-change\` on the parent field
2. Looks up the parent value in the JSON map
3. Sets the child select's options to the matched array
4. Clears the child value and dispatches \`civ-change\` for downstream cascading

### Validation Rules

- \`cascading-source-missing\` (error): Parent field name doesn't exist in the form
- \`cascading-empty-map\` (warning): Options map has no entries

## Table/Grid Input

Use \`layout: 'table'\` on a repeatable FormSection to render fields as table columns.

### Schema

\`\`\`json
{
  "heading": "Income Sources",
  "repeatable": true, "repeatableKey": "income",
  "layout": "table",
  "fields": [
    { "type": "text", "name": "source", "label": "Source" },
    { "type": "text", "name": "amount", "label": "Amount" }
  ]
}
\`\`\`

### Generated HTML

\`\`\`html
<div data-civ-repeatable="income" data-civ-layout="table" aria-live="polite">
  <h3>Income Sources</h3>
  <table class="civ-w-full civ-border-collapse">
    <thead>
      <tr>
        <th scope="col">Source</th>
        <th scope="col">Amount</th>
        <th scope="col"><span class="civ-sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      <tr data-civ-repeatable-item>
        <td><civ-text-input aria-label="Source" name="income[0].source"></civ-text-input></td><!-- no wrapper needed — th serves as visible label -->
        <td><civ-text-input aria-label="Amount" name="income[0].amount"></civ-text-input></td>
        <td><button type="button" data-civ-repeatable-remove>Remove row</button></td>
      </tr>
    </tbody>
  </table>
  <button type="button" data-civ-repeatable-add>Add row</button>
</div>
\`\`\`

### Key Notes

- Fields use \`aria-label\` instead of visible \`label\` (the \`<th>\` serves as the visible label)
- Use \`tableColumns\` array to control column order
- Companion JS clones \`<tr>\` instead of \`<civ-fieldset>\` and appends to \`<tbody>\`
- \`table-layout-not-repeatable\` (warning): table layout without repeatable container

## Print Stylesheets

Use \`generate_print_css\` to produce a \`@media print\` stylesheet for a form.

### Usage

\`\`\`
generate_print_css({ schema: myFormSchema })
\`\`\`

Returns CSS with feature-specific rules:
- **base**: Focus ring removal, page-break avoidance, \`<dl>\` grid formatting
- **form-steps**: Shows all steps, hides navigation and progress indicator
- **repeatable**: Hides add/remove buttons
- **conditional**: Shows all conditional sections
- **table**: Table borders, thead repeat, cell padding

## Schema Migration

Use \`migrate_saved_data\` to map saved form values from an old schema version to a new version.

### Usage

\`\`\`
migrate_saved_data({
  oldSchema: v1Schema,
  newSchema: v2Schema,
  savedValues: { "first-name": "Jane", "ssn": "123-45-6789" },
  fieldMappings: { "first-name": "given-name" }
})
\`\`\`

### Mapping Strategy

1. **Direct match** — same field name in both schemas → copy value
2. **Explicit rename** — \`fieldMappings\` maps old name → new name
3. **Repeatable fields** — parses \`key[N].field\`, applies mappings to base name + key
4. **Type mismatch** — if a mapped field changed type, emits a warning
5. **Dropped** — old field not in new schema → \`droppedFields\`
6. **Unmapped** — new field with no value → \`unmappedFields\`

## Branching Visualization

Use \`visualize_form_flow\` to generate a Mermaid flowchart of a form's structure.

### Usage

\`\`\`
visualize_form_flow({ schema: myFormSchema })
\`\`\`

Returns Mermaid syntax showing:
- **Form steps** as stadium nodes with sequential flow
- **Sections** as rounded rectangles linked to steps
- **Repeatable sections** as hexagons
- **Table sections** as trapezoids
- **Conditional visibility** as dashed edges with condition labels
- **Cross-field rules** as dashed edges with rule descriptions
- **Cascading options** as solid edges labeled "cascading"

### Rendering Tips

Paste the \`mermaid\` field into any Mermaid-compatible renderer (GitHub, VS Code, Mermaid Live Editor). The summary field provides a quick overview of complexity.

## Advanced Analysis & Generation Tools

### Error Message Generation

Use \`generate_error_messages\` to produce a complete error message library for every field and constraint in a form schema. Messages follow government plain language guidelines and cover required, pattern, length, range, file, and cross-field rule constraints.

### Analytics Instrumentation

Use \`generate_analytics_plan\` to create a comprehensive analytics plan including per-field events (focus, blur, change), funnel steps with expected completion rates, drop-off risk analysis, and PRA burden metrics.

### Language Linting

Use \`lint_form_language\` to check form labels, hints, and placeholders for jargon, abbreviations, passive voice, high reading levels, and non-actionable text. Returns a 0–100 score and plain language suggestions.

### Payload Schema Generation

Use \`generate_payload_schema\` to generate the expected JSON submission shape. Unlike \`export_schema\`, this respects structural hierarchy: repeatable sections become arrays, namespaced sections become nested objects. Returns JSON Schema, TypeScript interfaces, and example values.

### Schema Comparison

Use \`compare_schemas\` to diff two FormSchema versions. Detects added, removed, changed, and moved fields, sections, steps, and rules. Automatically identifies breaking changes (removed required fields, type changes, removed options, repeatable→non-repeatable).

### Validation Schema Generation

Use \`generate_validation_schema\` to produce server-side validation code. Supports Zod (with \`.superRefine()\` for cross-field rules) and JSON Schema Draft-07 (with \`if/then\` for conditional requirements).

### Accessibility Test Generation

Use \`generate_a11y_tests\` to generate accessibility-focused Vitest tests from CivUI HTML. Tests cover 6 categories: aria-attributes, keyboard navigation, focus management, screen reader announcements, semantic HTML, and color independence.

### Prefill Mapping

Use \`generate_prefill_mapping\` to intelligently match API schema fields to form fields. Uses 4 strategies (exact, normalized, label, type) with confidence scoring. Generates ready-to-use mapping functions for both directions.
`;
