import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-filter-chip',
  description: 'Compact selection chip for filter / tag / category UI. Two roles via `chip-role`: `toggle` (single-button toggle) or `select` (member of a multi-select group via `civ-filter-chip-group`). Supports an optional removal affordance (×) and an optional count badge.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    selected: {
      type: 'boolean',
      description: 'Active state. Reflects to the host attribute. In `select` role this is managed by the parent group',
      default: false,
      reflect: true,
    },
    removable: {
      type: 'boolean',
      description: 'Render a trailing × button. Fires `civ-remove` when clicked',
      default: false,
      reflect: true,
    },
    chipStyle: {
      type: 'enum',
      description: 'Visual treatment. `primary` = solid filled when selected; `secondary` = subtle background',
      default: 'secondary',
      values: ['primary', 'secondary'],
      attribute: 'chip-style',
    },
    chipRole: {
      type: 'enum',
      description: 'Interaction model. `toggle` (default) = standalone on/off; `radio` = single member of a single-select group (use civ-filter-chip-group to enforce mutual exclusivity)',
      default: 'toggle',
      values: ['toggle', 'radio'],
      attribute: 'chip-role',
    },
    spacing: {
      type: 'enum',
      description: 'Padding density. `default` for standalone; `sm` for dense filter strips',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name (e.g. category emoji-replacement)',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name (note: `removable` overrides this with a × icon)',
      default: '',
      attribute: 'icon-end',
    },
    count: {
      type: 'number',
      description: 'Optional count badge appended after the label (e.g. `Open jobs (12)`). `null` hides the badge',
    },
  },

  events: {
    'civ-change': {
      description: 'Fires when the selected state changes (user click on the chip body)',
      detail: {
        value: { type: 'string', description: 'The chip\'s `value` attribute' },
        selected: { type: 'boolean', description: 'New selected state' },
      },
    },
    'civ-remove': {
      description: 'Fires when the user clicks the × button (only when `removable` is set)',
      detail: {
        value: { type: 'string', description: 'The chip\'s `value` attribute' },
      },
    },
  },

  a11y: {
    role: 'button',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-pressed': 'computed-from-selected',
    },
  },

  renderOrder: [
    {
      type: 'button',
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', condition: 'count', bindings: { text: 'count' } },
        { type: 'button', condition: 'removable', bindings: { action: 'remove' } },
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
