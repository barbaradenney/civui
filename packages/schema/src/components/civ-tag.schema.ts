import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tag',
  description: 'Inline keyword / category tag. Distinct from `civ-badge` (status indicators). `civ-tag` is for descriptive labels (topics, categories). Renders as a small pill with optional leading icon.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Color palette for categorization. `gray` is the neutral default; the other values are aesthetic colors (not semantic status) — use them to distinguish category groupings, not to encode meaning (success/error)',
      default: 'gray',
      values: ['blue', 'orange', 'purple', 'gray'],
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
