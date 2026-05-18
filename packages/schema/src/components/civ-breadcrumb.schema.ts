import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-breadcrumb',
  description: 'Breadcrumb trail navigation. Renders a `<nav>` landmark with an `<ol>` of `<civ-breadcrumb-item>` children. The last item should set `current` (or omit `href`) so it renders as a non-link `<span aria-current="page">`. Chevron separators are rendered by CSS between adjacent items so consumers don\'t ship a separator per item.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name for the navigation landmark (defaults to "Breadcrumb"). Set this when a page renders more than one breadcrumb trail so each landmark has a distinct name',
      default: 'Breadcrumb',
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
          bindings: { tag: 'ol' },
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
