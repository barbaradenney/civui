import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-disclosure',
  description: 'Inline expandable content with a clickable trigger. Use for "Why we ask?" justifications next to PII fields, definitions of jargon, or supplementary text that does not need to be visible by default. Built on native `<details>`/`<summary>` semantics — works without JavaScript and is announced as a disclosure widget by screen readers.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Trigger text. Defaults to "Why we ask?" when empty.',
      default: '',
    },
    open: {
      type: 'boolean',
      description: 'Whether the disclosure content is currently visible',
      default: false,
      reflect: true,
    },
    icon: {
      type: 'string',
      description: 'Icon name from the civ-icon library shown before the label. Pass an empty string to suppress.',
      default: 'info',
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
        details: { type: 'object', description: '{ open: boolean } — the resulting state' },
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
