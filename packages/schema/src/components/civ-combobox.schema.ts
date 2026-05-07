import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-combobox',
  description: 'Accessible combobox with autocomplete filtering, keyboard navigation, and screen reader announcements. Uses ARIA 1.2 combobox pattern with listbox popup.',
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
      },
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text for the input',
      default: '',
    },
    noResultsText: {
      type: 'string',
      description: 'Text shown when filter matches no options',
      default: 'No results found',
      attribute: 'no-results-text',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every filter text change',
      detail: {
        value: { type: 'string', description: 'Current filter text' },
      },
    },
    'civ-change': {
      description: 'Fires when an option is selected',
      detail: {
        value: { type: 'string', description: 'Selected option value' },
      },
    },
  },

  a11y: {
    role: 'combobox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-expanded': '_open',
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
      type: 'input',
      bindings: {
        value: 'value',
        placeholder: 'placeholder',
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
      controlClasses: ['civ-input'],
    },
  },
};

export default schema;
