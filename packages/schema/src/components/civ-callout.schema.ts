import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-callout',
  description: 'A presentational primitive that frames slotted content with a left accent border and consistent padding. Five color variants map to the semantic palette. Use for important notices, tips, or contextual information. For dismissible / live-region alerts use `civ-alert`; for section openers with a heading use `civ-section-intro` (which composes `civ-callout` internally).',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Accent border color. `default` is a neutral gray for callouts with no semantic urgency; `info`, `warning`, `error`, and `success` map to their semantic palette counterparts',
      default: 'default',
      values: ['default', 'info', 'warning', 'error', 'success'],
    },
  },

  events: {},

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
