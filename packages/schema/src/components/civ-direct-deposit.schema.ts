import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-direct-deposit',
  description: 'Compound bank-account field for direct-deposit enrollment — routing number, account number, and account type (checking/savings). Uses the routing-number preset for inline validation. JSON-serialized form value.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the sub-fields',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'When set, promotes the legend to a heading via role="heading" + aria-level=N',
      attribute: 'heading-level',
    },
    size: {
      type: 'enum',
      description: 'Visual size of the legend',
      values: ['sm', 'md', 'lg', 'xl'],
    },
    routingError: {
      type: 'string',
      description: 'Per-field error for the routing-number input',
      default: '',
      attribute: 'routing-error',
    },
    accountError: {
      type: 'string',
      description: 'Per-field error for the account-number input',
      default: '',
      attribute: 'account-error',
    },
    typeError: {
      type: 'string',
      description: 'Per-field error for the account-type radio group',
      default: '',
      attribute: 'type-error',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized: {routing, account, type: "checking" | "savings"}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized DirectDepositValue (same shape as civ-input)' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'fieldset' },
      children: [
        { type: 'label', bindings: { text: 'legend', required: 'required' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        { type: 'slot', bindings: { name: 'routing' } },
        { type: 'slot', bindings: { name: 'account' } },
        { type: 'slot', bindings: { name: 'type' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
