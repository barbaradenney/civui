import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-accordion',
  description: 'A grouped stack of full-width expandable rows. Children are `<civ-accordion-item>`. Each item composes the same visual language as `<civ-disclosure>` (chevron caret, 90° rotation on open) but spans the row with a larger tap target. Multiple items can be open at once by default. Pass `single` to enforce one-open-at-a-time. Built on native `<details>` / `<summary>` so it works without JavaScript and is announced as a disclosure widget by every screen reader.',
  category: 'ui',
  extends: 'CivBaseElement',
  // Not a form-group component. `isGroup` in CivUI's schema convention
  // signals a control that uses `<legend>` instead of `<label>` (e.g.
  // civ-checkbox-group, civ-radio-group); accordion items use `label`,
  // not `legend`, so this is `false` even though the accordion
  // structurally groups children.
  isGroup: false,

  props: {
    single: {
      type: 'boolean',
      description: 'When true, opening one item collapses any other open siblings. Default behavior (omitted) allows multiple items open at once. The single-open invariant is enforced on first paint AND when this prop transitions from false to true at runtime.',
      default: false,
      reflect: true,
    },
  },

  // No own events. The accordion observes a bubbling internal event
  // from its child `<civ-accordion-item>` elements
  // (`civ-accordion-item-toggle`) but does not re-dispatch any event
  // of its own — consumers subscribe to `civ-toggle` on individual
  // items. Listing the child's coordination event here would imply
  // the accordion owns it, which is misleading.
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
