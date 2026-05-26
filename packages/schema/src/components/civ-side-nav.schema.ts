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
    spacing: {
      type: 'enum',
      description: 'Tap-target density. `default` (~36px row, WCAG 2.5.8 AA) is the compact left-rail used in docs / admin. `lg` raises every link and trigger to the WCAG 2.5.5 AAA 44px floor — preferred for mobile-primary surfaces. Padding only; pair with `emphasis="primary"` to also match civ-nav typography. Cascades to nested items',
      default: 'default',
      values: ['default', 'lg'],
    },
    emphasis: {
      type: 'enum',
      description: 'Typographic weight of the rail. `secondary` (default) keeps the quiet sub-navigation treatment with normal-weight text. `primary` switches to civ-nav\'s bold base-sized body text so the rail reads as primary site navigation. Compose with `spacing="lg"` for the full mobile-primary look',
      default: 'secondary',
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
