import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-phone',
  description: 'Pre-configured text input for phone-number entry. Ships with the US `(###) ###-####` mask, the `phone` validator, `tel` keyboard, `autocomplete="tel"`, and the plain-language default label/hint. Set `international` to drop the US mask and switch to the `phoneIntl` validator (7–15 digits, optional `+` / `00` country-code prefix) for international flows. Thin wrapper over `civ-text-input` — same event surface (`civ-input`, `civ-change` with `{ value: string }`).',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    international: {
      type: 'boolean',
      description: 'Use international (E.164-friendly) phone format. When true, the US-specific mask is suppressed and the `phoneIntl` validator is used instead of `phone`',
      default: false,
    },
  },

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
    { type: 'input', bindings: { value: 'value', international: 'international', disabled: 'disabled', required: 'required' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
