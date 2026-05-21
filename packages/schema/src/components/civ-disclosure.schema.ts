import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-disclosure',
  description: 'Inline expandable content with a clickable trigger. Use for "Why we ask?" justifications next to PII fields, definitions of jargon, or supplementary text that does not need to be visible by default. Built on native `<details>`/`<summary>` semantics. Works without JavaScript and is announced as a disclosure widget by screen readers.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Trigger text. When empty, falls back to the locale-aware default (English: "Why we ask?"). Override via the `t()` registry or set explicitly.',
      default: '',
    },
    open: {
      type: 'boolean',
      description: 'Whether the disclosure content is currently visible',
      default: false,
      reflect: true,
    },
  },

  events: {
    'civ-toggle': {
      description: 'Fires when the open/closed state changes',
      detail: {
        open: { type: 'boolean', description: 'Whether the disclosure is now open' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event on toggle',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`change`)' },
        details: { type: 'object', description: '{ open: boolean }. The resulting state' },
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
      bindings: { tag: 'details' },
      children: [
        {
          type: 'container',
          bindings: { tag: 'summary' },
          children: [
            { type: 'label', bindings: { text: 'label' } },
          ],
        },
        { type: 'slot' },
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
      controlClasses: ['civ-disclosure'],
    },
    ios: {
      // SwiftUI DisclosureGroup
    },
    android: {
      // Compose ExpandableCard / animated visibility
    },
  },
};

export default schema;
