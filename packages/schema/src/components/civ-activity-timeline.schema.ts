import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-activity-timeline',
  description: 'Vertical timeline that lists `<civ-activity-item>` entries in chronological order. Renders as an ordered list so screen readers announce sequence and count, while sighted users see a rail of intent-colored dots with a connecting line between them. Order in the markup is the visual order — author oldest-first for narrative history, newest-first for audit logs.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {},

  events: {},

  a11y: {
    role: 'list',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'slot', bindings: { name: 'default' } },
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
