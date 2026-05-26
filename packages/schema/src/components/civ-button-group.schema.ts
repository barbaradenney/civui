import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-button-group',
  description: 'Layout container for a row of related action buttons. Enforces consistent spacing, optional vertical orientation on narrow viewports, and a shared accessible label for the action set. On iOS the group is bundled inside CivActionButton; Android renders a Row of buttons.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name (`aria-label`) applied to the `role="toolbar"` wrapper. **Strongly recommended.** Without a name, assistive tech reads an unnamed toolbar landmark',
      default: '',
    },
    orientation: {
      type: 'enum',
      description: 'Stacking direction. `horizontal` (default) places buttons side-by-side; `vertical` stacks them. Useful for narrow viewports or full-width primary actions',
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
    },
    allowOverflow: {
      type: 'boolean',
      description: 'Opt-in. When set on a horizontal group, measure available width on mount + resize and collapse trailing buttons that don\'t fit into a "More" popover-menu. The collapsed buttons stay in the DOM (hidden) so author-attached event listeners keep firing. Web-only because the overflow depends on DOM layout measurement (ResizeObserver) that doesn\'t translate to SwiftUI / Compose.',
      default: false,
      attribute: 'allow-overflow',
      webOnly: true,
    },
    overflowLabel: {
      type: 'string',
      description: 'Accessible name for the "More" trigger that opens the overflow menu. Defaults to the localized "More" string. Web-only. Paired with `allowOverflow`.',
      default: '',
      attribute: 'overflow-label',
      webOnly: true,
    },
    overflowIcon: {
      type: 'string',
      description: 'Icon name on the "More" trigger. Defaults to `more-horiz`. Web-only. Paired with `allowOverflow`.',
      default: 'more-horiz',
      attribute: 'overflow-icon',
      webOnly: true,
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
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
