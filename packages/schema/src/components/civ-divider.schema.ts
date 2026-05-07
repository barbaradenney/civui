import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-divider',
  description: 'Horizontal section divider. Two variants — `default` (subtle base-lighter line) and `primary` (slightly stronger emphasis). Use between sections; for list rows prefer the `dividers` prop on `civ-list`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    spacing: {
      type: 'enum',
      description: 'Vertical margin around the line',
      default: 'default',
      values: ['default', 'sm'],
    },
    variant: {
      type: 'enum',
      description: 'Visual emphasis. `default` is the standard subtle line; `primary` is slightly heavier for major section breaks',
      default: 'default',
      values: ['default', 'primary'],
    },
  },

  events: {},

  a11y: {
    role: 'separator',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'hr' },
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
