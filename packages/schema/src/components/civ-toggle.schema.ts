import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-toggle',
  description: 'Accessible toggle switch with inline label and optional description. Uses button with role="switch" for screen reader compatibility.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    checked: {
      type: 'boolean',
      description: 'Whether the toggle is in the on state',
      default: false,
      reflect: true,
    },
    description: {
      type: 'string',
      description: 'Secondary descriptive text below the label',
      default: '',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every toggle state change',
      detail: {
        checked: { type: 'boolean', description: 'Current toggle state' },
        value: { type: 'string', description: 'Form submission value' },
      },
    },
    'civ-change': {
      description: 'Fires on every toggle state change (same as civ-input for toggles)',
      detail: {
        checked: { type: 'boolean', description: 'Current toggle state' },
        value: { type: 'string', description: 'Form submission value' },
      },
    },
  },

  a11y: {
    role: 'switch',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['description', 'hint', 'error'],
    ariaAttributes: {
      'aria-checked': 'checked',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        {
          type: 'switch',
          bindings: {
            checked: 'checked',
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
  ],

  form: {
    valueMode: 'boolean',
    formAssociated: true,
    resetBehavior: 'restore-default-checked',
  },

  platform: {
    web: {
      controlClasses: ['civ-toggle-track', 'focus-visible:civ-focus-ring'],
    },
    ios: {
      // SwiftUI Toggle with default switch style
    },
    android: {
      // Compose Switch composable
    },
  },
};

export default schema;
