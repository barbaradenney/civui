import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-page-header',
  description: 'Top-of-page composition: leading icon, slotted heading + description, optional trailing icon (e.g. status badge). Distinct from `civ-section-intro` which is for mid-page sections with semantic tone.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    spacing: {
      type: 'enum',
      description: 'Bottom margin to the content below',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name (e.g. category icon)',
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
    role: 'banner',
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
