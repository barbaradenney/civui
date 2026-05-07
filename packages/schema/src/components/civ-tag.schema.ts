import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tag',
  description: 'Inline keyword / category tag. Distinct from `civ-badge` (status indicators) — `civ-tag` is for descriptive labels (topics, categories). Renders as a small pill with optional leading icon.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Color palette. `gray` is neutral; the others map to semantic palettes for category emphasis',
      default: 'gray',
      values: ['gray', 'primary', 'info', 'success', 'warning', 'error'],
    },
    tagStyle: {
      type: 'enum',
      description: 'Visual treatment. `primary` = solid fill; `secondary` = subtle background (default)',
      default: 'secondary',
      values: ['primary', 'secondary'],
      attribute: 'tag-style',
    },
    spacing: {
      type: 'enum',
      description: 'Padding density',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name',
      default: '',
      attribute: 'icon-start',
    },
  },

  events: {},

  a11y: {
    role: 'status',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
