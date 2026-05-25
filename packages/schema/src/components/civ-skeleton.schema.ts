import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-skeleton',
  description: 'Decorative content-shape placeholder for waits longer than ~1s where the incoming content\'s shape is known (lists, cards, table rows, page chrome). For shorter waits with unknown shape, use `civ-spinner` instead. The skeleton itself is `aria-hidden` and never announced — the *parent region* carries `aria-busy="true"` while skeletons are visible and flips to `false` when real content lands. Compose multiple skeletons in the consumer\'s layout to mirror the real page; there is no page-orchestrator component because layouts diverge too much to abstract. Shimmer animation is decorative and disabled by `prefers-reduced-motion`; the static shape still reserves layout space (the accessibility-critical behavior).',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    shape: {
      type: 'enum',
      description: 'Shape. `text` (default) is one or more 1em-high text lines; `heading` is a taller text block for h1–h3 placeholders; `block` is a rectangular media / card body; `circle` is an avatar / icon round',
      default: 'text',
      values: ['text', 'heading', 'block', 'circle'],
      reflect: true,
    },
    width: {
      type: 'string',
      description: 'CSS length for the skeleton width (e.g. `100%`, `12rem`, `80px`). Defaults to `100%` for text / heading / block and `2.5rem` for circle',
      default: '',
    },
    lines: {
      type: 'number',
      description: 'Number of text lines to render. Only meaningful for the `text` variant. When > 1, the last line renders at 70% width to mimic a paragraph\'s natural ragged-right edge',
      default: 1,
    },
  },

  events: {},

  a11y: {
    role: 'presentation',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { variant: 'variant' },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
