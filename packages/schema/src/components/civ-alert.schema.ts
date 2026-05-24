import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-alert',
  description: 'Status / informational banner with semantic variants (info / success / warning / error / neutral). Includes optional dismiss, heading, slim layout, and primary or secondary visual treatments. Native platforms expose the same variants with platform-idiomatic icons.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Semantic tone. Drives icon and color palette',
      default: 'info',
      values: ['info', 'success', 'warning', 'error'],
    },
    alertStyle: {
      type: 'enum',
      description: 'Visual treatment. `primary` = filled with stronger emphasis; `secondary` = subtle background (default); `tertiary` = transparent with a colored leading border',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
      attribute: 'alert-style',
    },
    heading: {
      type: 'string',
      description: 'Optional heading rendered above the body content',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2–6) for the alert heading. Web-only. Native platforms use platform-idiomatic header semantics',
      default: 4,
      attribute: 'heading-level',
      webOnly: true,
    },
    dismissible: {
      type: 'boolean',
      description: 'Render a dismiss (×) button. Fires `civ-dismiss` (cancelable) when clicked',
      default: false,
    },
    slim: {
      type: 'boolean',
      description: 'Compact single-line layout (no heading, smaller padding). Use for inline / inside-form messages',
      default: false,
    },
    spacing: {
      type: 'enum',
      description: 'Vertical padding. `default` for standalone alerts; `sm` for nested/dense contexts',
      default: 'default',
      values: ['default', 'sm'],
    },
  },

  events: {
    'civ-dismiss': {
      description: 'Fires (cancelable) when the user clicks the dismiss button. Call `preventDefault()` to keep the alert visible (e.g. while async cleanup runs)',
      detail: {},
    },
  },

  a11y: {
    role: 'status',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'button', condition: 'dismissible', bindings: { action: 'dismiss' } },
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
