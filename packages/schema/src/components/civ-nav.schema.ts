import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-nav',
  description: 'Top-level horizontal site navigation. Renders a `<nav>` landmark containing a horizontal `<ul>` of `<civ-nav-item>` links. Stacks vertically on mobile (≤480px). Single-level only. Submenus and dropdowns are deliberately out of scope; use a separate menu component for those.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name for the navigation landmark (e.g. "Primary navigation", "Footer navigation"). Set this when a page renders more than one `<nav>` so screen-reader landmark navigation can distinguish them',
      default: '',
    },
    emphasis: {
      type: 'enum',
      description: 'Typographic weight of the nav links. `primary` (default) is the bold primary-site-navigation treatment with the heavier active/hover accent bar. `secondary` switches to normal-weight links and a thinner accent bar — the quiet treatment used for footer / utility navigation, mirroring `civ-side-nav`\'s `secondary` emphasis. The default is the inverse of `civ-side-nav` because a top nav is usually the primary surface while a side nav is usually a sub-nav',
      default: 'primary',
      values: ['primary', 'secondary'],
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
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
