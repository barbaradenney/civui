import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-badge',
  description: 'Inline status / category indicator. Pairs with list rows, action buttons, or page headers. `dot` mode renders a colored circle without text (notification dot); `overlay` positions the badge over a parent element (e.g. notification count on a button).',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    dot: {
      type: 'boolean',
      description: 'Render as a colored dot (no text). For notification indicators',
      default: false,
      reflect: true,
    },
    variant: {
      type: 'enum',
      description: 'Semantic tone. Drives color palette and (with `with-icon`) the auto-rendered icon',
      default: 'neutral',
      values: ['info', 'success', 'warning', 'error', 'neutral'],
    },
    badgeStyle: {
      type: 'enum',
      description: 'Visual treatment. `primary` = solid fill; `secondary` = subtle background',
      default: 'secondary',
      values: ['primary', 'secondary'],
      attribute: 'badge-style',
    },
    spacing: {
      type: 'enum',
      description: 'Padding density. `default` for standalone badges; `sm` for inline / table contexts',
      default: 'default',
      values: ['default', 'sm'],
    },
    overlay: {
      type: 'boolean',
      description: 'Position the badge as an overlay over a parent element (notification-count style)',
      default: false,
      reflect: true,
    },
    withIcon: {
      type: 'boolean',
      description: 'Auto-render the icon corresponding to the variant (info / success / warning / error)',
      default: false,
      attribute: 'with-icon',
    },
    iconStart: {
      type: 'string',
      description: 'Override the leading icon name. Takes precedence over with-icon when both are set',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name (e.g. dismiss / chevron)',
      default: '',
      attribute: 'icon-end',
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
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', condition: 'iconEnd', bindings: { text: 'iconEnd' } },
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
