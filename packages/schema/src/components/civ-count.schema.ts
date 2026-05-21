import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-count',
  description: 'Numeric badge for counts (e.g. unread messages, items in cart). Caps at `max` and renders as `${max}+` beyond that. Optional `aria-live` for dynamic updates.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    count: {
      type: 'number',
      description: 'Current count. `null` hides the badge entirely',
    },
    max: {
      type: 'number',
      description: 'Display cap. Counts above this render as `${max}+`',
      default: 99,
    },
    variant: {
      type: 'enum',
      description: 'Semantic tone',
      default: 'neutral',
      values: ['info', 'success', 'warning', 'error', 'neutral'],
    },
    countStyle: {
      type: 'enum',
      description: 'Visual treatment. `primary` = solid fill; `secondary` (default) = subtle background; `tertiary` = outlined',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
      attribute: 'count-style',
    },
    spacing: {
      type: 'enum',
      description: 'Padding density. `default` for standalone; `sm` for inline / overlay contexts',
      default: 'default',
      values: ['default', 'sm'],
    },
    overlay: {
      type: 'boolean',
      description: 'Position as overlay over a parent (notification-count style)',
      default: false,
      reflect: true,
    },
    live: {
      type: 'enum',
      description: 'aria-live politeness for dynamic count changes. `off` (default) skips announcements; `polite` announces on idle; `assertive` interrupts',
      default: 'off',
      values: ['off', 'polite', 'assertive'],
    },
  },

  events: {},

  a11y: {
    role: 'status',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [{ type: 'label', bindings: { text: 'count' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
