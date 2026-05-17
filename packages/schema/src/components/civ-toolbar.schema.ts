import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-toolbar',
  description: 'Horizontal layout container for the row of controls above a list, grid, or filtered collection — search input, filter chips, density toggle, "Add new" button, etc. Children landing in the `data-civ-toolbar-end` slot align to the trailing edge; everything else (including unattributed children) sits at the leading edge. Stacks vertically on viewports ≤480px so the controls stay reachable on mobile. Renders as `<div role="toolbar">` so assistive tech announces it as a discrete group.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    caption: {
      type: 'string',
      description: 'Accessible name applied as `aria-label` on the toolbar landmark. Strongly recommended when the toolbar contains more than one or two controls — without it screen readers announce only "toolbar"',
      default: '',
    },
  },

  events: {},

  a11y: {
    role: 'toolbar',
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
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
