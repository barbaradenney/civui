import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-select',
  description: 'Accessible dropdown select with label, hint, error, and option list. Uses native `<select>` on web for maximum accessibility.',
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
    width: {
      type: 'enum',
      description: 'Width variant',
      default: 'default',
      values: ['default', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    autocomplete: {
      type: 'string',
      description: 'Autocomplete hint forwarded to the underlying `<select>`',
      default: '',
    },
    preset: {
      type: 'enum',
      description: 'Pre-built option list. Populates options when no consumer-provided options array is set',
      values: ['us-state', 'service-branch', 'discharge-type', 'suffix', 'relationship-type', 'marital-status', 'ethnicity', 'gender', 'language', 'housing-status', 'education-level', 'employment-status', 'income-source', 'veteran-status'],
    },
    presetVariant: {
      type: 'string',
      description: 'Variant of the preset (e.g. "territories", "all", "binary")',
      attribute: 'preset-variant',
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
      controlClasses: ['civ-input', 'civ-appearance-auto'],
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
