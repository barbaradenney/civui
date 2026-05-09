/**
 * MCP prompt: add-field
 * Generate a single ready-to-paste CivUI field snippet with correct attributes.
 */
import { COMPONENT_CATALOG } from '../resources/index.js';
import { FieldType as FieldTypeSchema } from '../schema/index.js';

/** Valid field types for the add-field prompt, derived from the canonical schema. */
export const FIELD_TYPES = FieldTypeSchema.options;

export type FieldType = FieldTypeSchema;

export const ADD_FIELD_NAME = 'add-field';

export const ADD_FIELD_DESCRIPTION =
  'Generate a single ready-to-paste CivUI field snippet with correct label, name, hint, ' +
  'required-message, autocomplete, and inputmode attributes.';

export function addFieldPrompt(fieldType: FieldType, label: string) {
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
          type: 'text' as const,
          text: `# Add Field

Generate a single CivUI component snippet for a **${fieldType}** field with label **"${label}"**.

## Requirements

1. Use the correct CivUI tag for the field type:
   - text/email/tel/number/password/search/url/ssn/zip → \`<civ-form-field>\` wrapping \`<civ-text-input>\`
   - textarea → \`<civ-form-field>\` wrapping \`<civ-textarea>\`
   - select → \`<civ-form-field>\` wrapping \`<civ-select>\`
   - combobox → \`<civ-form-field>\` wrapping \`<civ-combobox>\`
   - radio → \`<civ-radio-group legend="...">\` with \`<civ-radio>\` children (self-contained, no external wrapper)
   - checkbox → \`<civ-checkbox>\` (self-contained, no wrapper)
   - checkbox-group → \`<civ-checkbox-group legend="...">\` with \`<civ-checkbox>\` children (self-contained, no external wrapper)
   - date → \`<civ-form-field>\` wrapping \`<civ-date-picker>\`
   - memorable-date → \`<civ-memorable-date legend="...">\` (self-contained, no external wrapper)
   - file → \`<civ-form-field>\` wrapping \`<civ-file-upload>\`
   - toggle → \`<civ-toggle>\` (self-contained, no wrapper)

2. Wrap the component in the correct wrapper:
   - Single-value inputs (text, textarea, select, combobox, date-picker, file) → \`<civ-form-field label="..." required>\`
   - Self-contained (radio-group, checkbox-group, memorable-date, checkbox, toggle, all compounds) → no wrapper needed; pass \`legend\` (or \`label\` for checkbox/toggle) directly

3. Include these attributes:
   - On the **wrapper**: \`label\`/\`legend\`, \`hint\`, \`required\`, \`required-message\` with field-specific text
   - On the **input**: \`name\` (kebab-case from the label), \`required\`, \`autocomplete\`, \`inputmode\`, \`type\`
   - \`hint\` for date and SSN fields with expected format
   - \`autocomplete\` for identity fields (email, tel, name, address, zip)
   - \`inputmode\` for numeric input (tel, ssn, zip)
   - \`type\` attribute for civ-text-input variants (email, tel, number, etc.)

4. For group fields (radio, checkbox-group), include 3 placeholder option children.

5. For select/combobox, include a placeholder \`options\` attribute. If a preset is appropriate (\`us-state\`, \`service-branch\`, \`country\`, \`suffix\`, \`month\`), use the \`preset\` attribute instead.

6. Output only the HTML snippet — no explanation needed. Mark it as required by default.`,
        },
      },
    ],
  };
}
