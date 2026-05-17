import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-menu-item',
  description: 'Individual item inside a `civ-menu`. Renders as a `<button>` by default, or as an `<a>` when `href` is set. The parent menu listens for clicks at the panel level and dispatches `civ-menu-select`, so consumers typically do not need to wire per-item handlers — the native `click` event still fires on the item if a more granular listener is desired.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    disabled: {
      type: 'boolean',
      description: 'When true, the item is non-interactive and skipped during keyboard navigation. The host receives `aria-disabled="true"` and the inner button gets the `disabled` attribute',
      default: false,
      reflect: true,
    },
    destructive: {
      type: 'boolean',
      description: 'Apply destructive (red) styling for delete-style actions. Use for items whose effect cannot be easily undone',
      default: false,
      reflect: true,
    },
    href: {
      type: 'string',
      description: 'When set, the item renders as an `<a>` link instead of a `<button>`. The href is sanitized — unsafe schemes (`javascript:`, `data:` text payloads) are replaced with `#`',
      default: '',
    },
    value: {
      type: 'string',
      description: 'Stable identifier surfaced in the parent menu\'s `civ-menu-select` event detail. Use to identify which item was activated when handling selection at the menu level',
      default: '',
    },
  },

  events: {},

  a11y: {
    role: 'menuitem',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'button' },
      children: [
        { type: 'slot', bindings: { name: 'icon' } },
        { type: 'slot', bindings: { name: 'default' } },
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
