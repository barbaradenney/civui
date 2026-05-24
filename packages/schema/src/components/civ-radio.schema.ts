import type { ComponentSchema } from '../schema.types.js';

/**
 * Child of `civ-radio-group`. Renders a single radio input with inline label,
 * optional description, and tile variant. Selection state (`checked`) is
 * managed by the parent group via roving tabindex; consumers should rarely
 * set `checked` directly. Set `value` on the group instead.
 */
const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-radio',
  description: 'Single radio button rendered as a child of `civ-radio-group`. Owns its label, value, description, tile flag, and per-radio disabled state; selection and focus management belong to the parent group.',
  category: 'form-control',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    checked: {
      type: 'boolean',
      description: 'Whether this radio is the selected option. Managed by the parent group. Setting it directly is uncommon',
      default: false,
      reflect: true,
    },
    description: {
      type: 'string',
      description: 'Secondary descriptive text below the label',
      default: '',
    },
    tile: {
      type: 'boolean',
      description: 'Tile variant with bordered card styling. Default is true. Tiles are the standard treatment; opt out for blank inline radios',
      default: true,
      reflect: true,
    },
    managedTabIndex: {
      type: 'number',
      description: 'Tabindex assigned by the parent `civ-radio-group` for roving-tabindex keyboard navigation. Web-only. Set programmatically, never as an attribute',
      webOnly: true,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when the radio is selected (clicked or activated via keyboard)',
      detail: {
        value: { type: 'string', description: 'The selected radio\'s `value`' },
      },
    },
    'civ-change': {
      description: 'Fires when the radio is selected (same as `civ-input` for radios)',
      detail: {
        value: { type: 'string', description: 'The selected radio\'s `value`' },
      },
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    describedBy: ['description'],
    ariaAttributes: {
      'aria-checked': 'checked',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        {
          type: 'input',
          bindings: {
            checked: 'checked',
            disabled: 'disabled',
            value: 'value',
          },
        },
        { type: 'label', bindings: { text: 'label' } },
        {
          type: 'hint',
          condition: 'description',
          bindings: { text: 'description' },
        },
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
