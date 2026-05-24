import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-list',
  description: 'Vertical list of `civ-list-item` rows. Optional dividers between rows. Use for navigation hubs (task lists), summary breakdowns, or any uniform vertical collection. List-item is bundled into the list on native platforms.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    dividers: {
      type: 'boolean',
      description: 'Render thin separators between rows. Mutually compatible with `spacing`. Use both for dense, divided lists',
      default: false,
    },
    spacing: {
      type: 'enum',
      description: 'Row padding density. `default` is comfortable; `sm` is dense (e.g. inside cards)',
      default: 'default',
      values: ['default', 'sm'],
    },
  },

  events: {},

  a11y: {
    role: 'list',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'ul' },
      children: [{ type: 'slot', bindings: { name: 'default' } }],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
