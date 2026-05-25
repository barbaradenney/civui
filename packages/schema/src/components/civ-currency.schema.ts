import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-currency',
  description: 'Pre-configured text input for US-dollar amount entry. Ships with the `currency` mask (commas, configurable decimals), the `currency` validator, a `$` prefix, decimal keyboard, and the plain-language default label/hint. Configure `decimals` for whole-dollar fields (W-4 line 4c, VA benefits use `decimals="0"`), `min` / `max` to enforce bounds inline at blur, and `allowNegative` for refund / adjustment / expense-report flows. Thin wrapper over `civ-text-input` — same event surface (`civ-input`, `civ-change` with `{ value: string }`).',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    decimals: {
      type: 'number',
      description: 'Decimal places to keep. `2` (default) for standard cents formatting ("1,234.56"). `0` for whole-dollar mode ("1,234") — used on tax-style fields where cents are not collected',
      default: 2,
      attribute: 'decimals',
    },
    min: {
      type: 'number',
      description: 'Minimum allowed amount. Out-of-range values surface an inline error on blur. Undefined (default) means no floor',
      attribute: 'min',
    },
    max: {
      type: 'number',
      description: 'Maximum allowed amount. Out-of-range values surface an inline error on blur. Undefined (default) means no ceiling',
      attribute: 'max',
    },
    allowNegative: {
      type: 'boolean',
      description: 'Accept negative amounts. Defaults to false (the `currency` validator rejects values below zero). Set true for refund / adjustment / expense-report fields where a debit makes sense',
      default: false,
      attribute: 'allow-negative',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every value change',
      detail: {
        value: { type: 'string', description: 'Current input value (raw digits and decimal point, mask formatting stripped)' },
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
    { type: 'input', bindings: { value: 'value', decimals: 'decimals', min: 'min', max: 'max', allowNegative: 'allowNegative', disabled: 'disabled', required: 'required' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
