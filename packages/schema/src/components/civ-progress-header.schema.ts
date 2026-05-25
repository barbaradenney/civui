import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-progress-header',
  description: 'Compact step counter for multi-step forms. Renders "Step X of Y: Title" in three size variants. Pure display; no navigation logic. Pair with `civ-form-step` (which owns the back-button) or use standalone above a custom step UI.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    current: {
      type: 'number',
      description: 'Current step index (0-based). Clamped to 0..total-1 at render',
      default: 0,
    },
    total: {
      type: 'number',
      description: 'Total number of steps. The component renders nothing when total ≤ 1',
      default: 0,
    },
    stepTitle: {
      type: 'string',
      description: 'Title of the current step, rendered after the counter',
      default: '',
      attribute: 'step-title',
    },
    emphasis: {
      type: 'enum',
      description: 'Visual emphasis level (renamed from `size`; the prop never controlled pixel size). `primary` adds dividers + large heading for standalone page-header use; `secondary` is the default mid-page emphasis; `tertiary` is compact for use alongside other progress indicators',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (1–6) applied to the step title via role="heading" + aria-level',
      default: 2,
      attribute: 'heading-level',
    },
  },

  events: {},

  a11y: {
    role: 'region',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-live': 'polite',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', bindings: { text: 'progressStepsCounter' } },
        { type: 'label', bindings: { text: 'stepTitle', headingLevel: 'headingLevel' } },
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
