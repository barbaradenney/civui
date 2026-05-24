import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-metric-group',
  description: 'Responsive grid wrapper for `<civ-metric-tile>` children. Stacks to a single column on mobile (≤480px), two columns on tablet (481–767px), and up to `columns` columns on desktop (≥768px). Pure layout primitive — no headings or chrome. Wrap in a `<section>` with your own heading if the group needs a label.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    columns: {
      type: 'number',
      description: 'Maximum number of columns on desktop (≥768px). Accepts 2–6; values outside the range are clamped. Default is 4.',
      default: 4,
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      children: [{ type: 'slot' }],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },

  platform: {
    web: {
      controlClasses: ['civ-metric-group'],
    },
    ios: {
      // SwiftUI: LazyVGrid with adaptive columns based on size class
    },
    android: {
      // Compose: LazyVerticalGrid with cells = GridCells.Adaptive
    },
  },
};

export default schema;
