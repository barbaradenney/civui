import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-filter-chip-group',
  description: 'Container for a set of `civ-filter-chip` elements with shared selection semantics. `mode="multi"` (default) allows any subset to be selected; `mode="single"` enforces radio-like single-selection. Aggregates child `civ-change` events into a single `civ-change` on the group.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: true,

  props: {
    label: {
      type: 'string',
      description: 'Accessible label for the chip group (sets the group\'s `aria-label`)',
      default: '',
    },
    mode: {
      type: 'enum',
      description: 'Selection mode. `multi` = any subset can be selected; `single` = radio-like, one at a time',
      default: 'multi',
      values: ['multi', 'single'],
    },
  },

  events: {
    'civ-change': {
      description: 'Fires when any chip\'s selected state changes. The detail aggregates the group\'s current selection. Single mode emits a string; multi mode emits a string array',
      detail: {
        value: { type: 'string', description: 'In single mode: the selected value (or empty). In multi mode: a string[] of selected values' },
        aggregated: { type: 'boolean', description: 'Always true on the group event. Distinguishes it from the underlying chip\'s civ-change' },
      },
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [{ type: 'slot', bindings: { name: 'default' } }],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
