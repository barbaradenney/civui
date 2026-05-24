import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-metric-tile',
  description: 'Display-only dashboard tile for a single key figure. The value is the dominant element, with a small caption label above and an optional delta indicator and description below. Visual hierarchy is inverted from `civ-card` — the value dominates, the label rides above as a small caption. `trend` controls the arrow direction; `intent` controls the color. The two are independent because "up" doesn\'t always mean "good".',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Small caption rendered above the value',
      default: '',
    },
    value: {
      type: 'string',
      description: 'The primary figure — rendered large and bold',
      default: '',
    },
    unit: {
      type: 'string',
      description: 'Optional unit string appended after the value (e.g. `ms`, `applications`)',
      default: '',
    },
    icon: {
      type: 'string',
      description: 'Optional icon name from the CivUI icon library, rendered before the label',
      default: '',
    },
    description: {
      type: 'string',
      description: 'Optional secondary text below the delta — extra context (e.g. "vs. last 30 days")',
      default: '',
    },
    delta: {
      type: 'string',
      description: 'Optional delta string (e.g. "+12%", "-3.2%", "+248")',
      default: '',
    },
    trend: {
      type: 'enum',
      description: 'Arrow direction next to the delta. `up` renders an upward arrow, `down` a downward arrow, `flat` a horizontal minus. Empty omits the arrow.',
      values: ['', 'up', 'down', 'flat'],
      default: '',
      reflect: true,
    },
    intent: {
      type: 'enum',
      description: 'Color treatment for the delta. `positive` is green, `negative` is red, `neutral` is base color. Independent of `trend` because "up" can be good (active users) or bad (errors).',
      values: ['', 'positive', 'negative', 'neutral'],
      default: '',
      reflect: true,
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'icon', bindings: { text: 'icon' } },
        { type: 'label', condition: 'label', bindings: { text: 'label' } },
        { type: 'label', bindings: { text: 'value' } },
        { type: 'label', condition: 'unit', bindings: { text: 'unit' } },
        { type: 'label', condition: 'delta', bindings: { text: 'delta' } },
        { type: 'label', condition: 'description', bindings: { text: 'description' } },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },

  platform: {
    web: {
      controlClasses: ['civ-metric-tile'],
    },
    ios: {
      // SwiftUI: VStack with caption label + large title value + optional HStack delta row
    },
    android: {
      // Compose: Column with Text label + Text value (headlineMedium) + Row delta
    },
  },
};

export default schema;
