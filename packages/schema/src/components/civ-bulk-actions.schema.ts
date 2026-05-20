import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-bulk-actions',
  description: 'Selection-aware action bar that appears above or below a data-grid / list when one or more rows are selected. Shows "{count} {itemName(s)} selected" on the leading edge, action buttons in the default slot, and a Clear button on the trailing edge (suppressible via `hideClear`). Hidden via `display: none` when `count === 0` so consumer-supplied action buttons stay in the DOM across selection changes. The status text is wrapped in an `aria-live="polite"` region so screen readers announce *only* the count when it changes. Not the Clear button label or action labels. Wired to a sibling `civ-data-grid` (or other selection-capable component) via the consumer: listen for `civ-selection-change` on the grid, update `count`, and listen for `civ-clear-selection` on the bar to reset the grid\'s `selectedRowIds`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    count: {
      type: 'number',
      description: 'How many items are currently selected. When `0`, the bar is hidden (display:none) but stays in the DOM so default-slot action buttons survive selection toggling',
      default: 0,
    },
    itemName: {
      type: 'string',
      description: 'Singular noun used in the status text ("row", "application", "user"). The bar pluralizes by appending "s". Pass an already-plural fallback in `itemNamePlural` if your word doesn\'t pluralize that way',
      default: 'item',
      attribute: 'item-name',
    },
    itemNamePlural: {
      type: 'string',
      description: 'Override for the pluralized noun when simple "+s" pluralization is wrong ("entries", "people", "children"). Defaults to `itemName + "s"` when omitted',
      default: '',
      attribute: 'item-name-plural',
    },
    clearLabel: {
      type: 'string',
      description: 'Override the Clear button text. Defaults to the i18n "Clear" string. Use to localize or to be more specific ("Clear selection", "Deselect all")',
      default: '',
      attribute: 'clear-label',
    },
    hideClear: {
      type: 'boolean',
      description: 'Suppress the trailing Clear button. Use when consumer-supplied actions inherently clear selection (e.g., "Approve all selected" then resets), so a separate Clear affordance would be redundant',
      default: false,
      attribute: 'hide-clear',
    },
  },

  events: {
    'civ-clear-selection': {
      description: 'Fires when the user activates the Clear button. Consumers should reset the underlying selection state (e.g. `grid.selectedRowIds = []`) in response. Carries no detail payload',
      detail: {},
    },
  },

  a11y: {
    role: 'none',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div' },
      children: [
        { type: 'label' },
        { type: 'button' },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
