import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tab-nav',
  description: 'Section navigation styled as tabs. Renders a `<nav>` landmark containing a horizontal `<ul>` of `<civ-tab-nav-item>` links. Each item is a real `<a href>` — use this when the URL is the source of truth for which tab is active (one route per tab, deep-linkable, back-button friendly). Not a `role="tablist"` — these are links, not tabs in the ARIA sense; if you need in-page panel switching, use `<civ-tabs>` instead. Stacks vertically on mobile (≤480px).',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name for the navigation landmark (e.g. "Section navigation", "Settings sections"). Set this when a page renders more than one `<nav>` so screen-reader landmark navigation can distinguish them',
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
