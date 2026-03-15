import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-select',
  description: 'Accessible dropdown select with label, hint, error, and option list. Uses native <select> on web for maximum accessibility.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    options: {
      type: 'array',
      description: 'Array of selectable options',
      default: [],
      items: {
        value: { type: 'string', description: 'Option value for form submission', required: true },
        label: { type: 'string', description: 'Display text for the option', required: true },
        disabled: { type: 'boolean', description: 'Whether this option is disabled', default: false },
      },
    },
    emptyLabel: {
      type: 'string',
      description: 'Label for the default empty/placeholder option',
      default: '- Select -',
      attribute: 'empty-label',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on selection change',
      detail: {
        value: { type: 'string', description: 'Selected option value' },
      },
    },
    'civ-change': {
      description: 'Fires on selection change (same timing as civ-input for select)',
      detail: {
        value: { type: 'string', description: 'Selected option value' },
      },
    },
  },

  a11y: {
    role: 'listbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-invalid': 'error ? "true" : nothing',
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
      type: 'select',
      bindings: {
        value: 'value',
        options: 'options',
        emptyLabel: 'emptyLabel',
        disabled: 'disabled',
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
      controlClasses: ['civ-input', 'civ-appearance-auto', 'focus-visible:civ-focus-ring'],
    },
    ios: {
      // SwiftUI Picker with menu style
    },
    android: {
      // Compose ExposedDropdownMenuBox
    },
  },
};

export default schema;
