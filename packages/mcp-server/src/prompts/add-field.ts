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

1. Use the correct CivUI tag for the field type — every CivUI control carries its own \`label\` (or \`legend\` for groups), \`hint\`, \`error\`, and \`required\` attributes; no external wrapper is needed:
   - text/email/tel/number/password/search/url/ssn/zip → \`<civ-text-input label="...">\`
   - textarea → \`<civ-textarea label="...">\`
   - select → \`<civ-select label="...">\`
   - combobox → \`<civ-combobox label="...">\`
   - radio → \`<civ-radio-group legend="...">\` with \`<civ-radio>\` children
   - checkbox → \`<civ-checkbox label="...">\`
   - checkbox-group → \`<civ-checkbox-group legend="...">\` with \`<civ-checkbox>\` children
   - date → \`<civ-date-picker label="...">\`
   - memorable-date → \`<civ-memorable-date legend="...">\`
   - file → \`<civ-file-upload label="...">\`
   - toggle → \`<civ-toggle label="...">\`

2. Include these attributes directly on the control:
   - \`label\` (single inputs) or \`legend\` (group components)
   - \`hint\` for date and SSN fields with expected format
   - \`required\` and \`required-message\` with field-specific text
   - \`name\` (kebab-case from the label)
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
