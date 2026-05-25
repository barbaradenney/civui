import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-zip',
  description: 'Pre-configured text input for US ZIP-code entry. Ships with the 5-digit ZIP mask and `zip` validator by default; set `extended` to switch to the 9-digit ZIP+4 mask (`#####-####`) and `zip4` validator. Also wires `autocomplete="postal-code"`, numeric keyboard, and the plain-language default label/hint. Thin wrapper over `civ-text-input` — same event surface (`civ-input`, `civ-change` with `{ value: string }`).',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    extended: {
      type: 'boolean',
      description: 'Use the ZIP+4 (9-digit) extended format with a dash separator. When true, swaps the `zip` mask/validator for `zip4`',
      default: false,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every value change',
      detail: {
        value: { type: 'string', description: 'Current input value (raw digits, mask stripped)' },
      },
    },
    'civ-change': {
      description: 'Fires on committed value change (blur/enter)',
      detail: {
        value: { type: 'string', description: 'Committed input value (raw digits)' },
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
    { type: 'input', bindings: { value: 'value', extended: 'extended', disabled: 'disabled', required: 'required' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
