import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-button-group',
  description: 'Layout container for a row of related action buttons. Enforces consistent spacing, optional vertical orientation on narrow viewports, and a shared accessible label for the action set. On iOS the group is bundled inside CivActionButton; Android renders a Row of buttons.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    orientation: {
      type: 'enum',
      description: 'Stacking direction. `horizontal` (default) places buttons side-by-side; `vertical` stacks them — useful for narrow viewports or full-width primary actions',
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
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
      children: [{ type: 'slot', bindings: { name: 'default' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
