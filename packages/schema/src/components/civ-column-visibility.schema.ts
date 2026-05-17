import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-column-visibility',
  description: 'A popover that lets users toggle which columns of a `civ-data-grid` are visible. Renders a trigger button + checkbox panel; the consumer wires the panel\'s `civ-column-visibility-change` event back into the grid\'s `columns` array by flipping each entry\'s `hidden` flag. Multi-select semantics — the panel stays open while the user toggles several checkboxes (different from `civ-menu`, which is single-select and closes on click). Enforces a `minVisible` floor so the user can\'t hide every column.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    columns: {
      type: 'array',
      description: 'The full column set, mirrored from the host data-grid. Each entry is a `GridColumn` with at least `key` and `header`. The component derives its checkbox list from this array',
      webOnly: true,
    },
    hiddenColumns: {
      type: 'array',
      description: 'Keys of columns currently hidden. Controlled — the component never mutates this without dispatching `civ-column-visibility-change` first. Pass `[]` for "all visible"',
      webOnly: true,
    },
    label: {
      type: 'string',
      description: 'Trigger button text. Defaults to the i18n "Columns" string. Override for localization or to be more specific ("Show columns", "Columns visible")',
      default: '',
    },
    minVisible: {
      type: 'number',
      description: 'Minimum number of columns that must stay visible. Prevents the user from hiding everything by unchecking the last checkbox — the component refuses the toggle and re-renders to restore the checked state. Default `1`',
      default: 1,
      attribute: 'min-visible',
    },
    align: {
      type: 'enum',
      description: 'Horizontal alignment of the popover panel relative to the trigger. `end` (default) right-aligns; `start` left-aligns',
      values: ['start', 'end'],
      default: 'end',
    },
    open: {
      type: 'boolean',
      description: 'Controlled open state. Reflects as the host `open` attribute. Setting it programmatically opens / closes the panel; the component also toggles it internally on trigger click and Escape key',
      default: false,
      reflect: true,
    },
  },

  events: {
    'civ-column-visibility-change': {
      description: 'Fires when the user toggles a column\'s visibility checkbox. Consumers should update the underlying data-grid\'s `columns` array — typically by mapping over a master `allColumns` list and setting `hidden: detail.hiddenColumns.includes(c.key)`',
      detail: {
        hiddenColumns: { type: 'string[]', description: 'Column keys now hidden after the toggle' },
        visibleColumns: { type: 'string[]', description: 'Column keys still visible after the toggle' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div' },
      children: [
        { type: 'button' },
        { type: 'container' },
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
