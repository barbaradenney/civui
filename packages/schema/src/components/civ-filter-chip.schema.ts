import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-filter-chip',
  description: 'Compact selection chip for filter / tag / category UI. Two roles via `variant`: `toggle` (single-button toggle) or `radio` (member of a single-select group via `civ-filter-chip-group`). Supports an optional count badge. For removable user-entered tokens (recipient lists, applied-filter readouts) use `civ-input-chip` instead — its always-present × is the canonical removable-chip affordance.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    selected: {
      type: 'boolean',
      description: 'Active state. Reflects to the host attribute. In `radio` variant this is managed by the parent group',
      default: false,
      reflect: true,
    },
    emphasis: {
      type: 'enum',
      description: 'Visual treatment. `primary` = solid filled when selected; `secondary` = subtle background',
      default: 'secondary',
      values: ['primary', 'secondary'],
      attribute: 'emphasis',
    },
    variant: {
      type: 'enum',
      description: 'Interaction model. `toggle` (default) = standalone on/off; `radio` = single member of a single-select group (use civ-filter-chip-group to enforce mutual exclusivity)',
      default: 'toggle',
      values: ['toggle', 'radio'],
    },
    spacing: {
      type: 'enum',
      description: 'Padding density. `default` (24px, WCAG 2.5.8 AA target) is the common case for standalone filter rows. `sm` also clamps to the 24px floor for ultra-dense filter strips. `lg` (44px, WCAG 2.5.5 AAA Enhanced target) is for AAA-conscious surfaces or fingertip-heavy mobile placements',
      default: 'default',
      values: ['default', 'sm', 'lg'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name (e.g. category emoji-replacement)',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name',
      default: '',
      attribute: 'icon-end',
    },
    count: {
      type: 'number',
      description: 'Optional count badge appended after the label (e.g. `Open jobs (12)`). `null` hides the badge',
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — the chip is inert and the selection cannot be toggled',
      default: false,
      reflect: true,
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
  },

  a11y: {
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
