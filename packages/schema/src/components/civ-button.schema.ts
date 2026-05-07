import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-button',
  description: 'Standard interactive button. Three visual variants (primary / secondary / tertiary) with an optional `danger` modifier for destructive actions. Renders a real `<button>` element on web (native focus ring applied automatically); native platforms map to `Button` / `Button { Text }`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Visual emphasis. `primary` = solid filled (main page action); `secondary` = bordered; `tertiary` = text-only',
      default: 'primary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    danger: {
      type: 'boolean',
      description: 'Apply destructive-action styling (red palette). Combine with any variant',
      default: false,
      reflect: true,
    },
    type: {
      type: 'enum',
      description: 'HTML button type. `submit` triggers the enclosing form; `reset` clears it; `button` (default) does neither',
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
      bindings: { label: 'label' },
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
