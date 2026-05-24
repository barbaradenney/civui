import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-toolbar',
  description: 'Horizontal layout container for the row of controls above a list, grid, or filtered collection. Search input, filter chips, density toggle, "Add new" button, etc. Children landing in the `data-civ-toolbar-end` slot align to the trailing edge; everything else (including unattributed children) sits at the leading edge. Stacks vertically on viewports ≤480px so the controls stay reachable on mobile. Renders as `<div role="group">` with `label` as `aria-label`. (Not `role="toolbar"`. That role implies WAI-ARIA Toolbar Pattern arrow-key navigation, which this layout primitive deliberately does not implement; children keep their own Tab-stop semantics.)',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name applied as `aria-label` on the toolbar wrapper. Strongly recommended when the toolbar contains more than one or two controls. Without it screen readers announce only an unnamed group',
      default: '',
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
      bindings: { tag: 'div' },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
