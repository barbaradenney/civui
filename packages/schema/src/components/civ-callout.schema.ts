import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-callout',
  description: 'A presentational primitive that frames slotted content with a left accent border and consistent padding. Five color variants map to the semantic palette. Use for important notices, tips, or contextual information. For dismissible / live-region alerts use `civ-alert`; for section openers with a heading use `civ-section-intro` (which composes `civ-callout` internally).',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    intent: {
      type: 'enum',
      description: 'Accent border color. `default` is a neutral gray for callouts with no semantic urgency; `info`, `warning`, `error`, and `success` map to their semantic palette counterparts',
      default: 'default',
      values: ['default', 'info', 'warning', 'error', 'success'],
    },
    emphasis: {
      type: 'enum',
      description: 'Visual weight. `primary` (default) keeps the 5px accent rail — the established callout treatment. `secondary` drops the rail to 3px for a subtler affordance that doesn\'t compete with body content when stacked next to primary surfaces. Padding, variant colors, and content layout stay identical so the two styles read as the same family at different weights.',
      default: 'primary',
      values: ['primary', 'secondary'],
      attribute: 'emphasis',
      reflect: true,
    },
    spacing: {
      type: 'enum',
      description: 'Inner padding density. `default` keeps the established 12px / 16px padding; `sm` shrinks to 8px / 12px for placements inside dense surfaces (data-grid empty state, compact reference tables, sidebar notes). Pure shrink per Contract A — accent rail, intent colors, and content layout unchanged.',
      default: 'default',
      values: ['default', 'sm'],
      reflect: true,
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
