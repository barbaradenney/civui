import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-radio-group',
  description: 'Accessible radio button group with fieldset, legend, and roving tabindex keyboard navigation. Child civ-radio elements are mutually exclusive.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Group legend text (rendered as <legend>)',
      default: '',
    },
    tile: {
      type: 'boolean',
      description: 'Tile variant with bordered card styling for child radios',
      default: false,
      reflect: true,
    },
    orientation: {
      type: 'enum',
      description: 'Layout orientation for child radio buttons',
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      reflect: true,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when a radio selection changes',
      detail: {
        value: { type: 'string', description: 'Selected radio value' },
      },
    },
    'civ-change': {
      description: 'Fires when a radio selection changes (committed)',
      detail: {
        value: { type: 'string', description: 'Selected radio value' },
      },
    },
  },

  a11y: {
    role: 'radiogroup',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-orientation': 'orientation',
      'aria-invalid': 'error ? "true" : nothing',
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
        { type: 'slot', bindings: { orientation: 'orientation' } },
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
