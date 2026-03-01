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
    <civ-text-input label="First name" name="dependents[0].first-name"></civ-text-input>
    <civ-text-input label="Last name" name="dependents[0].last-name"></civ-text-input>
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
`;
