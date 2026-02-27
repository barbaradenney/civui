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
   - text/email/tel/number/password/search/url/ssn/zip → \`<civ-text-input>\`
   - textarea → \`<civ-textarea>\`
   - select → \`<civ-select>\`
   - combobox → \`<civ-combobox>\`
   - radio → \`<civ-radio-group>\` with \`<civ-radio>\` children
   - checkbox → \`<civ-checkbox>\`
   - checkbox-group → \`<civ-checkbox-group>\` with \`<civ-checkbox>\` children
   - date → \`<civ-date-picker>\`
   - memorable-date → \`<civ-memorable-date>\`
   - file → \`<civ-file-upload>\`
   - toggle → \`<civ-toggle>\`

2. Include these attributes:
   - \`label\` (or \`legend\` for group components: radio, checkbox-group, memorable-date)
   - \`name\` (kebab-case from the label)
   - \`required\` and \`required-message\` with field-specific text
   - \`hint\` for date and SSN fields with expected format
   - \`autocomplete\` for identity fields (email, tel, name, address, zip)
   - \`inputmode\` for numeric input (tel, ssn, zip)
   - \`type\` attribute for civ-text-input variants (email, tel, number, etc.)

3. For group fields (radio, checkbox-group), include 3 placeholder option children.

4. For select/combobox, include a placeholder \`options\` attribute.

5. Output only the HTML snippet — no explanation needed. Mark it as required by default.`,
        },
      },
    ],
  };
}
