import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-side-nav',
  description: 'Vertical, hierarchical navigation panel — typically a left-rail in documentation pages, admin layouts, or any view with a stable secondary navigation. Renders a `<nav>` landmark with a vertical `<ul>` of `<civ-side-nav-item>` links. Sub-sections are expressed by nesting `<civ-side-nav-item>` elements inside another item.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name for the navigation landmark (e.g. "Documentation navigation"). Strongly recommended when the page contains more than one `<nav>`',
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
