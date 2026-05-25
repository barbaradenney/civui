import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-va-file-number',
  description: 'Pre-configured text input for Veterans Affairs file numbers. VA file numbers are typically 8 or 9 digits — often the same as the Veteran\'s SSN, but not always — so this component ships with the right label, hint, 8–9 character bounds, numeric pattern, numeric keyboard, and no autocomplete (PII-adjacent). Thin wrapper over `civ-text-input` — same event surface (`civ-input`, `civ-change` with `{ value: string }`).',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {},

  events: {
    'civ-input': {
      description: 'Fires on every value change',
      detail: {
        value: { type: 'string', description: 'Current input value' },
      },
    },
    'civ-change': {
      description: 'Fires on committed value change (blur/enter)',
      detail: {
        value: { type: 'string', description: 'Committed input value' },
      },
    },
  },

  a11y: {
    role: 'textbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
  },

  renderOrder: [
    { type: 'label', bindings: { text: 'label', required: 'required' } },
    { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
    { type: 'error', condition: 'error', bindings: { text: 'error' } },
    { type: 'input', bindings: { value: 'value', disabled: 'disabled', required: 'required' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
