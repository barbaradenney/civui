import type { ComponentSchema } from '../schema.types.js';

/**
 * Child of `civ-segmented-control`. Renders a single segment button with a
 * label. Selection state is managed by the parent control via roving
 * tabindex; consumers should set `value` on the group rather than
 * `selected` on individual segments.
 */
const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-segment',
  description: 'Single segment rendered as a child of `civ-segmented-control`. Owns its label, value, and per-segment disabled state; selection and focus management belong to the parent control.',
  category: 'form-control',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    value: {
      type: 'string',
      description: 'The segment\'s value. The parent `civ-segmented-control`\'s `value` matches this when this segment is the active selection',
      default: '',
    },
    label: {
      type: 'string',
      description: 'Segment-button text',
      default: '',
    },
    selected: {
      type: 'boolean',
      description: 'Whether this segment is the active option. Web-only. Native platforms encode the active segment via the parent control\'s `value` binding pointing at one of its options',
      default: false,
      reflect: true,
      webOnly: true,
    },
    managedTabIndex: {
      type: 'number',
      description: 'Tabindex assigned by the parent `civ-segmented-control` for roving-tabindex keyboard navigation. Web-only. Set programmatically, never as an attribute',
      webOnly: true,
    },
  },

  events: {
    'civ-change': {
      description: 'Fires when this segment is activated (clicked or selected via keyboard)',
      detail: {
        value: { type: 'string', description: 'The activated segment\'s `value`' },
      },
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    ariaAttributes: {
      'aria-checked': 'selected',
    },
  },

  renderOrder: [
    {
      type: 'button',
      bindings: {
        selected: 'selected',
        disabled: 'disabled',
        value: 'value',
        label: 'label',
      },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
