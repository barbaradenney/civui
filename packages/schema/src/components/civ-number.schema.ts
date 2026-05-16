import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-number',
  description: 'Generic numeric input for quantities, counts, ages, and other non-currency numbers. Renders `<input type="text" inputmode="numeric">` (or `inputmode="decimal"` when `allow-decimal` is set) — more accessible than native `type="number"`, which has known issues with scroll-wheel mutation, locale decimal separators, and missing iOS spinners. For dollar amounts use `civ-currency`; for SSN, ZIP, EIN, phone, etc. use the dedicated preset components.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    min: {
      type: 'number',
      description: 'Minimum allowed value (inclusive). Validates on blur.',
    },
    max: {
      type: 'number',
      description: 'Maximum allowed value (inclusive). Validates on blur.',
    },
    allowDecimal: {
      type: 'boolean',
      description: 'Allow a decimal separator. When false (default), only integers are accepted.',
      default: false,
      attribute: 'allow-decimal',
    },
    allowNegative: {
      type: 'boolean',
      description: 'Allow a leading minus sign. Default is false; set true for temperature, deltas, etc.',
      default: false,
      attribute: 'allow-negative',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text',
      default: '',
    },
    prefix: {
      type: 'string',
      description: 'Prefix text rendered before the input (e.g., "#")',
      default: '',
    },
    suffix: {
      type: 'string',
      description: 'Suffix text rendered after the input (e.g., "%", "kg")',
      default: '',
    },
    width: {
      type: 'enum',
      description: 'Input width variant',
      default: 'default',
      values: ['default', 'tiny', 'small', 'medium', 'large'],
      webOnly: true,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every value change',
      detail: {
        value: { type: 'string', description: 'Current value as a string (preserves leading zeros and decimals)' },
      },
    },
    'civ-change': {
      description: 'Fires on committed value change',
      detail: {
        value: { type: 'string', description: 'Current value as a string' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event on commit',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`change`)' },
      },
    },
  },

  a11y: {
    role: 'textbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-valuemin': 'min',
      'aria-valuemax': 'max',
    },
  },

  renderOrder: [
    {
      type: 'label',
      bindings: { text: 'label', required: 'required' },
    },
    {
      type: 'hint',
      condition: 'hint',
      bindings: { text: 'hint' },
    },
    {
      type: 'error',
      condition: 'error',
      bindings: { text: 'error' },
    },
    {
      type: 'input',
      bindings: {
        type: 'text',
        inputmode: 'allowDecimal',
        value: 'value',
        disabled: 'disabled',
        readonly: 'readonly',
        required: 'required',
      },
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: ['civ-input'],
    },
    ios: {
      // SwiftUI TextField with numeric keyboard, .keyboardType(.numberPad) / .decimalPad
    },
    android: {
      // Compose TextField with KeyboardOptions(keyboardType = KeyboardType.Number/Decimal)
    },
  },
};

export default schema;
