import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-data-grid',
  description: 'Semantic `<table>`-based data grid for admin and back-office screens. Renders sortable column headers, selectable rows, and per-row action menus. Pagination is composed as a sibling `<civ-pagination>` element rather than a slot. On viewports ≤480px, rows collapse to vertical label/value blocks via CSS (no JS re-template). Defaults to native `<table>` semantics for simple readable data; opt in to `keyboardNav` for spreadsheet-style 2D arrow-key navigation per the WAI-ARIA Grid Pattern.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    caption: {
      type: 'string',
      description: 'Accessible name for the table, rendered as `<caption>`. Strongly recommended — the caption serves as the table\'s accessible name for screen readers',
      default: '',
    },
    captionHidden: {
      type: 'boolean',
      description: 'Visually hide the caption while keeping it in the accessibility tree. Use when an external heading already names the table',
      default: false,
      attribute: 'caption-hidden',
    },
    columns: {
      type: 'array',
      description: 'Column definitions: `{ key, header, sortable?, align?, width?, hidden?, sticky?, formatter?, editable?, inputType?, options?, validate? }`. Set `sticky: \'start\' | \'end\'` to pin a column to the leading or trailing edge so it stays visible while the rest of the table scrolls horizontally; multi-column sticky requires explicit `width` on each pinned column so CSS can compute cumulative offsets. Set `editable: true` + `inputType: \'text\' | \'number\' | \'select\'` to make cells in this column click-to-edit; provide `validate(value, row) => string | null` to block invalid commits. The formatter / validate callbacks are web-only; native platforms render and validate values through their own type-mapping logic',
      webOnly: true,
    },
    rows: {
      type: 'array',
      description: 'Row data: `{ id, cells, disabled?, actions? }`. Each row\'s `cells` keys map to the columns\' `key` values. `actions` triggers the per-row kebab menu',
      webOnly: true,
    },
    sortBy: {
      type: 'string',
      description: 'Column key currently being sorted by. Empty string when no column is sorted. The consumer is expected to update this in response to `civ-sort`',
      default: '',
      attribute: 'sort-by',
    },
    sortDirection: {
      type: 'enum',
      description: 'Current sort direction. `none` clears the sort indicator',
      values: ['asc', 'desc', 'none'],
      default: 'none',
      attribute: 'sort-direction',
    },
    responsive: {
      type: 'enum',
      description: 'Mobile responsive behavior. `stacked` (default) collapses each row to a vertical label/value block on ≤480px (USWDS stacked pattern). `scroll` wraps the table in a horizontally-scrollable region; rows stay tabular',
      values: ['stacked', 'scroll'],
      default: 'stacked',
    },
    stickyHeader: {
      type: 'boolean',
      description: 'Stick the header row to the top while the table body scrolls vertically. Requires the table to be inside a scrollable container with a constrained height',
      default: false,
      attribute: 'sticky-header',
    },
    selectable: {
      type: 'enum',
      description: 'Row-selection mode. `multiple` shows a checkbox column with a select-all header; `single` shows radio inputs; `none` (default) hides selection UI',
      values: ['none', 'single', 'multiple'],
      default: 'none',
    },
    selectedRowIds: {
      type: 'array',
      description: 'IDs of currently-selected rows. Controlled — update in response to `civ-selection-change`',
      webOnly: true,
    },
    loading: {
      type: 'boolean',
      description: 'Show a loading state in place of rows. Announced via `aria-live="polite"`',
      default: false,
    },
    errorMessage: {
      type: 'string',
      description: 'When set, render an error state with this message instead of rows. Announced via `role="alert"`',
      default: '',
      attribute: 'error-message',
    },
    emptyMessage: {
      type: 'string',
      description: 'Override the default "No data to display" message shown when `rows` is empty',
      default: '',
      attribute: 'empty-message',
    },
    striped: {
      type: 'boolean',
      description: 'Apply zebra striping to body rows for visual row separation',
      default: false,
    },
    bordered: {
      type: 'boolean',
      description: 'Apply borders between cells (in addition to the default row-bottom borders)',
      default: false,
    },
    interactive: {
      type: 'boolean',
      description: 'When true, clicking a row body fires `civ-row-activate`. Use to wire a master-detail drawer or navigate-to-record flow. Clicks that originate inside the selection checkbox cell, the row-actions cell, or any inner `<a>`/`<button>`/`<input>`/`<select>`/`<textarea>`/`[role="button"]` are ignored so those affordances retain their own behavior. Disabled rows (`row.disabled`) are not interactive even when this prop is set',
      default: false,
    },
    expandedRowIds: {
      type: 'array',
      description: 'IDs of currently-expanded rows. Controlled — update in response to `civ-row-expand`. Pass `[]` for "none expanded". Only takes effect on rows whose `expandable` flag is true',
      webOnly: true,
    },
    expandTemplate: {
      type: 'string',
      description: 'Render callback for expanded-row detail content. `(row) => string | number | TemplateResult`. Required when any row has `expandable: true` — without it the detail row renders empty. Web-only (Lit `TemplateResult` is web-specific)',
      webOnly: true,
    },
    groupBy: {
      type: 'string',
      description: 'When set to a column key, rows are grouped by `row.cells[groupBy]` and each group gets a collapsible header row spanning all columns. Groups appear in the order their first member appears in `rows` — pre-sort to control group order. Pass empty string to disable grouping',
      default: '',
      attribute: 'group-by',
    },
    expandedGroups: {
      type: 'array',
      description: 'Group keys currently expanded. Controlled — update in response to `civ-group-toggle`. When undefined (the default), all groups render expanded; pass an array (even `[]`) to take control',
      webOnly: true,
    },
    groupLabel: {
      type: 'string',
      description: 'Render callback for group header labels. `(groupKey, rows) => string`. When omitted, the header reads `{groupKey} ({count})`. Use to render readable labels for technical keys (e.g. `\'in-review\'` → `\'In review (3)\'`)',
      webOnly: true,
    },
    keyboardNav: {
      type: 'boolean',
      description: 'Promote the table to `role="grid"` with 2D arrow-key navigation per the WAI-ARIA Grid Pattern. Inner controls (sort buttons, expand toggles, action menus, edit triggers, checkboxes) drop to `tabindex="-1"` so the whole grid becomes a single tab stop; Enter / Space activate the cell\'s primary control, F2 enters edit mode on editable cells, Home / End move to row bounds, Ctrl+Home / Ctrl+End move to grid corners, PageUp / PageDown step ±10 rows. Recommended for admin screens with many interactive cells; leave off for simple readable tables',
      default: false,
      attribute: 'keyboard-nav',
    },
  },

  events: {
    'civ-sort': {
      description: 'Fires when the user activates a sortable column header. The consumer should update `sortBy` and `sortDirection` accordingly (and re-fetch / re-sort data)',
      detail: {
        column: { type: 'string', description: 'The new column key being sorted by (empty string when sort was cleared)' },
        direction: { type: 'string', description: 'The new direction: `asc`, `desc`, or `none`' },
      },
    },
    'civ-selection-change': {
      description: 'Fires when the user toggles a row\'s selection or activates the select-all checkbox. Detail carries the new selection set; update `selectedRowIds` to reflect it',
      detail: {
        selectedRowIds: { type: 'string[]', description: 'IDs of all currently-selected rows after the change' },
      },
    },
    'civ-row-action': {
      description: 'Fires when the user activates a row-action menu item',
      detail: {
        rowId: { type: 'string', description: 'The activated row\'s `id`' },
        action: { type: 'string', description: 'The activated action\'s `id`' },
        row: { type: 'object', description: 'The full row object for convenience' },
      },
    },
    'civ-row-activate': {
      description: 'Fires when the user clicks a row body and `interactive` is set. The master-detail trigger. Suppressed when the click originates inside the select cell, the actions cell, or any interactive descendant (`<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, `[role="button"]`) so those affordances retain their own behavior',
      detail: {
        rowId: { type: 'string', description: 'The activated row\'s `id`' },
        row: { type: 'object', description: 'The full row object' },
      },
    },
    'civ-row-expand': {
      description: 'Fires when the user toggles an expandable row\'s chevron. Consumers should add `rowId` to `expandedRowIds` when `expanded === true`, or remove it when `expanded === false`. Disabled rows do not dispatch',
      detail: {
        rowId: { type: 'string', description: 'The toggled row\'s `id`' },
        expanded: { type: 'boolean', description: 'Whether the row should now be expanded (the consumer\'s target state, not the previous state)' },
        row: { type: 'object', description: 'The full row object' },
      },
    },
    'civ-cell-edit-start': {
      description: 'Fires when the user activates edit mode on an editable cell (click). Consumers can use this to track "currently editing" UI state or to fetch context for the edit',
      detail: {
        rowId: { type: 'string', description: 'The row being edited' },
        columnKey: { type: 'string', description: 'The column key of the cell' },
        row: { type: 'object', description: 'The full row object' },
      },
    },
    'civ-cell-edit-commit': {
      description: 'Fires when the user commits a valid new cell value (Enter / blur / click-outside). Consumers should update the underlying row data; the grid does not mutate `rows` directly. Validation errors block this event from firing',
      detail: {
        rowId: { type: 'string', description: 'The row that was edited' },
        columnKey: { type: 'string', description: 'The column key of the cell' },
        value: { type: 'object', description: 'The committed value. String for `inputType: text` / `select`; number for `inputType: number` (or empty string when blank)' },
        row: { type: 'object', description: 'The full row object (pre-update)' },
      },
    },
    'civ-cell-edit-cancel': {
      description: 'Fires when the user cancels an in-progress edit (Escape). The cell reverts to its previous displayed value without any consumer state change',
      detail: {
        rowId: { type: 'string', description: 'The row whose edit was cancelled' },
        columnKey: { type: 'string', description: 'The column key of the cell' },
        row: { type: 'object', description: 'The full row object' },
      },
    },
    'civ-group-toggle': {
      description: 'Fires when the user clicks a group header\'s chevron. Consumers manage `expandedGroups` in response: add the key when `expanded === true`, remove it when `false`',
      detail: {
        groupKey: { type: 'string', description: 'The stringified group key (the value of `row.cells[groupBy]` for the group)' },
        expanded: { type: 'boolean', description: 'The target expanded state (not the previous state) — reducer-friendly' },
      },
    },
  },

  a11y: {
    role: 'table',
    requiredIndicator: 'none',
    errorAnnouncement: 'assertive',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'container', bindings: { tag: 'table' } },
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
