import type { ComponentSchema } from '../schema.types.js';

/**
 * Row inside `civ-list`. Two convenience string props (`heading`,
 * `description`) cover the common case; richer content goes through the
 * five named slots (start / heading / description / default / end).
 *
 * When `href` is set, the entire row becomes a clickable anchor with
 * `civ-analytics` tracking. `current` adds `aria-current="page"` for the
 * active row in a navigation list.
 */
const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-list-item',
  description: 'Row inside `civ-list`. Five slot zones (start / heading / description / default / end) plus convenience string props for the heading and description.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'When set, the row renders as an anchor that navigates on click. Sanitized — `javascript:` / `data:` schemes are rejected',
      default: '',
    },
    current: {
      type: 'boolean',
      description: 'Mark this row as the current page. Adds `aria-current="page"` to the anchor (only meaningful when `href` is set)',
      default: false,
    },
    heading: {
      type: 'string',
      description: 'Convenience shorthand for the bold heading text. The `data-list-item-heading` slot takes precedence when present',
      default: '',
    },
    description: {
      type: 'string',
      description: 'Convenience shorthand for the secondary text below the heading. The `data-list-item-description` slot takes precedence when present',
      default: '',
    },
  },

  events: {},

  a11y: {
    role: 'listitem',
    requiredIndicator: 'none',
    errorAnnouncement: 'assertive',
    describedBy: ['description', 'error'],
    ariaAttributes: {
      'aria-current': 'current ? "page" : nothing',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'slot', bindings: { name: 'start' } },
        { type: 'label', bindings: { text: 'heading' } },
        {
          type: 'hint',
          condition: 'description',
          bindings: { text: 'description' },
        },
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'slot', bindings: { name: 'end' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
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
