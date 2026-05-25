import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-email',
  description: 'Pre-configured text input for email-address entry. Ships with `type="email"`, the `email` validator, `autocomplete="email"`, and the plain-language default label/hint. Thin wrapper over `civ-text-input` — same event surface (`civ-input`, `civ-change` with `{ value: string }`).',
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
