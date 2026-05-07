import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-action-button',
  description: 'Compact action button intended for inline / contextual actions (e.g. inside cards, list rows, table cells). Distinct from `civ-button` which is the page-level primary affordance. Supports a tri-state `pressed` prop for toggle / mute / favorite affordances.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Visual emphasis. Same scale as civ-button but defaults to `tertiary` (text-only) for inline contexts',
      default: 'tertiary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    danger: {
      type: 'boolean',
      description: 'Apply destructive-action styling',
      default: false,
      reflect: true,
    },
    pressed: {
      type: 'boolean',
      description: 'Tri-state pressed/active indicator. `true` = active (e.g. favorited); `false` = inactive but toggle-aware (sets aria-pressed="false"); omitted = no toggle semantics',
      reflect: true,
    },
    type: {
      type: 'enum',
      description: 'HTML button type',
      default: 'button',
      values: ['button', 'submit', 'reset'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name',
      default: '',
      attribute: 'icon-end',
    },
  },

  events: {},

  a11y: {
    role: 'button',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'button',
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', condition: 'iconEnd', bindings: { text: 'iconEnd' } },
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
