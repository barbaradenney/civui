import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-card',
  description: 'Generic content container with optional border / fill / icon affordances. Uses slot-based composition (heading, body, actions). Distinct from `civ-link-card` which is interactive.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    color: {
      type: 'enum',
      description: 'Background tint. Empty (default) = no fill; the other values are aesthetic colors (not semantic status). Same palette as civ-tag and civ-link-card so categorization carries across components',
      default: '',
      values: ['', 'blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'],
    },
    cardStyle: {
      type: 'enum',
      description: 'Visual treatment. `primary` = solid fill; `secondary` = light fill; `tertiary` = bordered (default)',
      default: 'tertiary',
      values: ['primary', 'secondary', 'tertiary'],
      attribute: 'card-style',
    },
    spacing: {
      type: 'enum',
      description: 'Inner padding density',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name (rendered before slotted content)',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name',
      default: '',
      attribute: 'icon-end',
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'label', condition: 'iconEnd', bindings: { text: 'iconEnd' } },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
