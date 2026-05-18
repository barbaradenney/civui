import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-nav',
  description: 'Top-level horizontal site navigation. Renders a `<nav>` landmark containing a horizontal `<ul>` of `<civ-nav-item>` links. Stacks vertically on mobile (≤480px). Single-level only — submenus and dropdowns are deliberately out of scope; use a separate menu component for those.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name for the navigation landmark (e.g. "Primary navigation", "Footer navigation"). Set this when a page renders more than one `<nav>` so screen-reader landmark navigation can distinguish them',
      default: '',
    },
  },

  events: {},

  a11y: {
    role: 'navigation',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'nav', ariaLabel: 'label' },
      children: [
        {
          type: 'container',
          bindings: { tag: 'ul' },
          children: [{ type: 'slot' }],
        },
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
