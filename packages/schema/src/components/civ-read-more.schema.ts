import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-read-more',
  description: 'Two-stage content disclosure: an always-visible teaser paragraph with a "Read more" button that reveals additional content kept hidden in the DOM until expansion. Differs from `civ-disclosure`, which hides ALL content behind a trigger — `civ-read-more` keeps a teaser visible so the user can decide whether to expand. Trigger is a real `<button>` with `aria-expanded` and `aria-controls`; the rest region carries the `hidden` attribute when collapsed so screen readers skip it entirely.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    expanded: {
      type: 'boolean',
      description: 'Whether the rest region is currently visible',
      default: false,
      reflect: true,
    },
    moreLabel: {
      type: 'string',
      description: 'Override the "Read more" trigger text. When empty, falls back to the locale-aware `readMoreButton` string (English: "Read more").',
      default: '',
      attribute: 'more-label',
    },
    lessLabel: {
      type: 'string',
      description: 'Override the "Read less" trigger text. When empty, falls back to the locale-aware `readLessButton` string (English: "Read less").',
      default: '',
      attribute: 'less-label',
    },
    icon: {
      type: 'string',
      description: 'Optional icon name from the civ-icon library shown before the label. Empty by default — the trigger text alone is the affordance. Pass e.g. `chevron-down` for a 180° rotate-on-expand visual cue.',
      default: '',
    },
    size: {
      type: 'enum',
      description: 'Trigger text size',
      default: 'default',
      values: ['default', 'sm'],
    },
  },

  events: {
    'civ-toggle': {
      description: 'Fires when the expanded state changes',
      detail: {
        expanded: { type: 'boolean', description: 'Whether the rest region is now visible' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event on toggle',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`change`)' },
        details: { type: 'object', description: '{ expanded: boolean } — the resulting state' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div' },
      children: [
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'slot', bindings: { name: 'rest' } },
        {
          type: 'container',
          bindings: { tag: 'button' },
          children: [
            { type: 'label', bindings: { text: 'moreLabel' } },
          ],
        },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: ['civ-read-more'],
    },
    ios: {
      // SwiftUI two-stage VStack with show/hide via @State boolean
    },
    android: {
      // Compose Column with AnimatedVisibility for the rest region
    },
  },
};

export default schema;
