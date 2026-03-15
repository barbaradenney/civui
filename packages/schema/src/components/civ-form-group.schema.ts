import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-form-group',
  description: 'Wrapper that provides label, hint, and error rendering for custom or third-party form controls. Automatically wires ARIA attributes to the first child input.',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Label text for the grouped control',
      default: '',
    },
    hint: {
      type: 'string',
      description: 'Hint text displayed below the label',
      default: '',
    },
    error: {
      type: 'string',
      description: 'Error message (triggers role="alert")',
      default: '',
    },
    inputId: {
      type: 'string',
      description: 'ID of the target input element (for label association)',
      default: '',
      attribute: 'input-id',
    },
    required: {
      type: 'boolean',
      description: 'Whether the field is required (shows asterisk)',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
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
      type: 'slot',
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
