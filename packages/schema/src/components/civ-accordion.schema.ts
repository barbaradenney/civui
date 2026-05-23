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
    disabled: {
      type: 'boolean',
      description: 'Disables every direct-child item. Each item checks the nearest ancestor accordion\'s `disabled` when deciding whether to accept a toggle; setting `disabled` here cascades to all items without mutating their own `disabled` prop. Individual items can also be disabled independently.',
      default: false,
      reflect: true,
    },
    variant: {
      type: 'enum',
      description: 'Visual variant. `tertiary` (default) is a bordered group with transparent triggers — list-like, quiet. `secondary` renders each item as a filled primary-lightest button matching `civ-action-btn--secondary`. `primary` uses the same palette but with the larger padding and bolder type of `civ-btn--secondary`. Items in primary / secondary stack with a small gap; no outer border or inter-item dividers.',
      values: ['primary', 'secondary', 'tertiary'],
      default: 'tertiary',
      reflect: true,
    },
  },

  methods: {
    expandAll: {
      description: 'Open every direct-child item. In `single` mode, opens only the first non-disabled item (since "all open" would violate the invariant). Disabled items are skipped.',
      returns: 'void',
    },
    collapseAll: {
      description: 'Close every direct-child item. Disabled items are skipped — their `open` setter rejects programmatic changes, matching the contract that `disabled` freezes the item state.',
      returns: 'void',
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
