import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-income',
  description: 'Compound field for dollar amount + pay frequency. Pairs `civ-currency` (dollar input with mask + validation) with `civ-select` (frequency) inside a single fieldset. Use for any means-tested benefit application. Wages, household income, expense estimates, support payments. The value is serialized to JSON as `{ amount, frequency }`; sub-fields are also exposed as `${name}.amount` and `${name}.frequency`.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Fieldset legend rendered above the sub-fields',
      default: '',
    },
    amountLabel: {
      type: 'string',
      description: 'Override the default amount label',
      default: '',
      attribute: 'amount-label',
    },
    frequencyLabel: {
      type: 'string',
      description: 'Override the default frequency label',
      default: '',
      attribute: 'frequency-label',
    },
    amountError: {
      type: 'string',
      description: 'Error message for the amount sub-field',
      default: '',
      attribute: 'amount-error',
    },
    frequencyError: {
      type: 'string',
      description: 'Error message for the frequency sub-field',
      default: '',
      attribute: 'frequency-error',
    },
    frequencies: {
      type: 'array',
      description: 'Restrict the available frequency options. Defaults to all seven. Order is preserved.',
      default: ['weekly', 'biweekly', 'semimonthly', 'monthly', 'quarterly', 'annually', 'one-time'],
      items: { value: { type: 'string', description: 'A frequency identifier' } },
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'object', description: 'Income value with amount and frequency' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'object', description: 'Income value with amount and frequency' },
      },
    },
  },

  a11y: {
    role: 'group',
    // Multi-field compound (address-style). The legend is a section
    // heading; `required` cascades to leaf controls (amount, frequency),
    // which render their own per-control "(required)" markers.
    requiredIndicator: 'none',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'fieldset' },
      children: [
        { type: 'label', bindings: { text: 'legend' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        { type: 'input', bindings: { name: 'amount', type: 'text' } },
        { type: 'select', bindings: { name: 'frequency' } },
      ],
    },
  ],

  form: {
    // String transport. The structured `{ amount, frequency }` shape
    // is JSON-stringified into `value` for ElementInternals form
    // participation, matching the civ-address / civ-name convention.
    // Sub-fields are ALSO exposed as separate form values
    // (`${name}.amount`, `${name}.frequency`) for servers that prefer
    // flat keys.
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: ['civ-income-fields'],
    },
    ios: {
      // SwiftUI HStack of CivCurrency + CivSelect
    },
    android: {
      // Compose Row with CivCurrency + CivSelect
    },
  },
};

export default schema;
