import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-checkbox-group',
  description: 'Accessible checkbox group with fieldset and legend. Child civ-checkbox elements support multiple selections. Submits as FormData with multiple values.',
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
      description: 'Tile variant with bordered card styling for child checkboxes',
      default: false,
      reflect: true,
    },
    orientation: {
      type: 'enum',
      description: 'Layout orientation for child checkboxes',
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      reflect: true,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when any child checkbox changes',
      detail: {
        values: { type: 'string[]', description: 'Array of checked checkbox values' },
      },
    },
    'civ-change': {
      description: 'Fires when any child checkbox changes (committed)',
      detail: {
        values: { type: 'string[]', description: 'Array of checked checkbox values' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
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
    valueMode: 'multi',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
