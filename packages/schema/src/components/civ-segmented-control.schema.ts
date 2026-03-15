import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-segmented-control',
  description: 'Accessible segmented control acting as a single-select radio group. Child civ-segment elements provide the selectable options with keyboard arrow navigation.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Screen-reader-only legend for the radio group',
      default: '',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when a segment is selected',
      detail: {
        value: { type: 'string', description: 'Selected segment value' },
      },
    },
    'civ-change': {
      description: 'Fires when a segment is selected (committed)',
      detail: {
        value: { type: 'string', description: 'Selected segment value' },
      },
    },
  },

  a11y: {
    role: 'radiogroup',
    requiredIndicator: 'none',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-orientation': 'horizontal',
    },
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
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
