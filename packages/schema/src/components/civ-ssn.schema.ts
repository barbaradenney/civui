import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-ssn',
  description: 'Pre-configured text input for Social Security number entry. Ships with the SSN mask (###-##-####), the `ssn` validator, the plain-language default label/hint, PII flagging (excluded from autosave snapshots, masked in analytics), and numeric keyboard. Supports both full 9-digit collection and the `last4` minimization pattern for re-identification flows. Thin wrapper over `civ-text-input` — same event surface (`civ-input`, `civ-change` with `{ value: string }`).',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    mode: {
      type: 'enum',
      description: 'SSN collection mode. `full` (default) collects the entire 9-digit number with the standard mask and `ssn` validator. `last4` collects only the last four digits with a 4-char maxlength, no mask, and no validator — the minimization pattern used to re-identify a record without storing the full SSN',
      default: 'full',
      values: ['full', 'last4'],
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
    { type: 'input', bindings: { value: 'value', mode: 'mode', disabled: 'disabled', required: 'required' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
