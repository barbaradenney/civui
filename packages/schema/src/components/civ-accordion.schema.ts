import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-accordion',
  description: 'A grouped stack of full-width expandable rows. Children are `<civ-accordion-item>`. Each item composes the same visual language as `<civ-disclosure>` (chevron caret, 90° rotation on open) but spans the row with a larger tap target. Multiple items can be open at once by default. Pass `single` to enforce one-open-at-a-time. Built on native `<details>` / `<summary>` so it works without JavaScript and is announced as a disclosure widget by every screen reader.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: true,

  props: {
    single: {
      type: 'boolean',
      description: 'When true, opening one item collapses any other open siblings. Default behavior (omitted) allows multiple items open at once.',
      default: false,
      reflect: true,
    },
  },

  events: {
    'civ-accordion-item-toggle': {
      description: 'Bubbling internal event from `<civ-accordion-item>` children. The parent listens for this to drive `single`-open coordination. Consumers should subscribe to `civ-toggle` on individual items instead.',
      detail: {
        open: { type: 'boolean', description: 'The item\'s new open state' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      children: [{ type: 'slot' }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: ['civ-accordion'],
    },
    ios: {
      // SwiftUI: VStack of DisclosureGroup with a @State coordinator for single-open mode
    },
    android: {
      // Compose: Column of ExpandableCard / animated visibility with shared state
    },
  },
};

export default schema;
