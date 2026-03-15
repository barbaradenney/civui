import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-fieldset',
  description: 'Native fieldset wrapper with legend, hint, and error support. Uses native <fieldset> for automatic disabled cascade to child form elements.',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Fieldset legend text',
      default: '',
    },
    hint: {
      type: 'string',
      description: 'Hint text displayed below the legend',
      default: '',
    },
    error: {
      type: 'string',
      description: 'Error message (triggers role="alert")',
      default: '',
    },
    required: {
      type: 'boolean',
      description: 'Whether the fieldset is required (shows asterisk on legend)',
      default: false,
      reflect: true,
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the fieldset and all children are disabled',
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
      type: 'container',
      bindings: { tag: 'fieldset' },
      children: [
        { type: 'label', bindings: { text: 'legend', required: 'required' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        { type: 'slot' },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
