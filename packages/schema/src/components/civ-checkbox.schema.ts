import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-checkbox',
  description: 'Accessible checkbox with inline label, optional description, and tile variant. Uses ElementInternals for native form participation.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    checked: {
      type: 'boolean',
      description: 'Whether the checkbox is checked',
      default: false,
      reflect: true,
    },
    indeterminate: {
      type: 'boolean',
      description: 'Tri-state mixed/indeterminate state',
      default: false,
      reflect: true,
    },
    description: {
      type: 'string',
      description: 'Secondary descriptive text below the label',
      default: '',
    },
    tile: {
      type: 'boolean',
      description: 'Tile variant with bordered card styling. Default is true — tiles are the standard treatment; opt out for blank inline checkboxes',
      default: true,
      reflect: true,
    },
    spacing: {
      type: 'enum',
      description: 'Density variant. `default` renders the full tap-target with label, hint, description, and required-mark chrome. `sm` renders a compact 20px input with no chrome — for use inside data-grid rows, column-toggle panels, and other dense surfaces where the surrounding context labels the control. In `sm` mode, the tile is forced off and the host\'s `aria-label` is propagated to the inner `<input>` when `label` is empty',
      default: 'default',
      values: ['default', 'sm'],
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every checked state change',
      detail: {
        checked: { type: 'boolean', description: 'Current checked state' },
        value: { type: 'string', description: 'Form submission value' },
      },
    },
    'civ-change': {
      description: 'Fires on every checked state change (same as civ-input for checkboxes)',
      detail: {
        checked: { type: 'boolean', description: 'Current checked state' },
        value: { type: 'string', description: 'Form submission value' },
      },
    },
  },

  a11y: {
    role: 'checkbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['description', 'hint', 'error'],
    ariaAttributes: {
      'aria-checked': 'indeterminate ? "mixed" : checked',
      'aria-invalid': 'error ? "true" : nothing',
    },
  },

  renderOrder: [
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
      type: 'container',
      children: [
        {
          type: 'checkbox',
          bindings: {
            checked: 'checked',
            indeterminate: 'indeterminate',
            disabled: 'disabled',
            required: 'required',
          },
        },
        {
          type: 'label',
          bindings: { text: 'label', required: 'required' },
        },
      ],
    },
  ],

  form: {
    valueMode: 'boolean',
    formAssociated: true,
    resetBehavior: 'restore-default-checked',
  },

  platform: {
    web: {
      controlClasses: ['civ-check-input'],
    },
    ios: {
      // SwiftUI Toggle with checkbox style
    },
    android: {
      // Compose Checkbox composable
    },
  },
};

export default schema;
