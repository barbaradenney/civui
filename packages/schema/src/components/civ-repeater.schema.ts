import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-repeater',
  description: 'Repeating-section orchestration for "Add another N" patterns. Wraps a templated child structure and lets the user dynamically add / remove / reorder instances. Renders as a fieldset with per-instance remove buttons (inline mode) or as a sequence of form-steps (form-steps mode).',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: true,

  props: {
    name: {
      type: 'string',
      description: 'Form field name prefix used to namespace the repeater\'s child-row field names when serialized for form submission. Required when binding to a form',
      default: '',
    },
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the repeated instances',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'When set, promotes the legend to a heading via role="heading" + aria-level=N',
      attribute: 'heading-level',
      webOnly: true,
    },
    size: {
      type: 'enum',
      description: 'Visual size of the legend',
      values: ['sm', 'md', 'lg', 'xl'],
      webOnly: true,
    },
    itemLabel: {
      type: 'string',
      description: 'Singular noun for the repeated thing. Interpolated into "Add another {item}" and remove labels',
      default: 'item',
      attribute: 'item-label',
    },
    mode: {
      type: 'enum',
      description: 'Layout mode. `inline` = all rows visible at once; `form-steps` = summary cards with an in-place wizard on add/edit (same page); `route` = summary cards with Add/Edit linking to host-rendered routes (separate page, controlled `rows` prop)',
      default: 'inline',
      values: ['inline', 'form-steps', 'route'],
    },
    formStepsSensitive: {
      type: 'boolean',
      description: 'In form-steps mode, treat the repeater as a sensitive flow. Auto-pause / save state on navigation away',
      default: false,
      attribute: 'form-steps-sensitive',
    },
    formStepsShowPause: {
      type: 'boolean',
      description: 'In form-steps mode, render an explicit "Save and continue later" affordance on each step',
      default: false,
      attribute: 'form-steps-show-pause',
    },
    min: {
      type: 'number',
      description: 'Minimum number of instances. Defaults to 0. The repeater renders only the "Add" button until the user clicks to create the first instance. Set higher to render that many rows up front. Also acts as the floor for removal',
      default: 0,
    },
    max: {
      type: 'number',
      description: 'Maximum number of instances. 0 = no limit. Above this, the "Add another" button is hidden',
      default: 0,
    },

    // ── Route mode props ────────────────────────────────────
    rows: {
      type: 'array',
      description: 'Host-owned array of row objects. Only used in `mode="route"`. The repeater renders one summary card per entry and never mutates this array',
      default: [],
      items: {
        // Row shape is host-defined; `id` is the only field the repeater
        // itself reads (via `idField`). Anything else is consumed by
        // `summaryFields` / `rowSummary` on the consumer side.
        id: { type: 'string', description: 'Stable identifier. Property name is configurable via `id-field`. Other row fields are host-defined' },
      },
    },
    addHref: {
      type: 'string',
      description: 'URL the "Add" affordance links to in `mode="route"`. Required when route mode is used',
      default: '',
      attribute: 'add-href',
    },
    editHrefPattern: {
      type: 'string',
      description: 'URL template for the "Edit" link on each row in `mode="route"`. Interpolates `{id}` (from `row[idField]`) and `{index}` (zero-based). Example: `/dependents/{id}/edit`',
      default: '',
      attribute: 'edit-href-pattern',
    },
    idField: {
      type: 'string',
      description: 'Name of the row property that holds the stable identifier interpolated into `{id}` in `editHrefPattern`',
      default: 'id',
      attribute: 'id-field',
    },
    summaryFields: {
      type: 'string',
      description: 'Comma-separated row property names joined into each summary card. Declarative alternative to the JS `rowSummary` function for non-JS hosts',
      default: '',
      attribute: 'summary-fields',
    },
    summaryTemplate: {
      type: 'string',
      description: 'Format string with `{prop}` placeholders for the per-row summary line (e.g. `"{firstName} {lastName} ({relationship})"`). Cross-platform; takes precedence over `summary-fields` when set; loses to `rowSummary` function when both are set',
      default: '',
      attribute: 'summary-template',
    },
    rowSummary: {
      type: 'string',
      description: 'Function `(row: object, index: number) => string` that returns the summary line for each row in `mode="route"`. Set programmatically (not as an attribute). When set, takes precedence over `summary-template` and `summary-fields`',
      webOnly: true,
    },
    emptyStateText: {
      type: 'string',
      description: 'Hint shown between the header and the Add button when the list has no rows. Leave blank to omit',
      default: '',
      attribute: 'empty-state-text',
    },
  },

  events: {
    'civ-repeater-add': {
      description: 'Fires when a new instance is added',
      detail: {
        index: { type: 'number', description: 'Index of the new instance' },
      },
    },
    'civ-repeater-before-remove': {
      description: 'Cancelable. Fires before an instance is removed (inline / form-steps modes). `preventDefault()` aborts. Listen here to insert a confirmation step (typically a `civ-modal`), then re-call `removeRow(index, { skipConfirm: true })` from the confirm handler. Route mode does not need this event because the repeater never mutates the host\'s `rows` array; the consumer wraps confirmation around their own array update in the `civ-repeater-remove` handler',
      detail: {
        index: { type: 'number', description: 'Index of the instance being removed' },
      },
    },
    'civ-repeater-remove': {
      description: 'Fires when an instance is removed',
      detail: {
        index: { type: 'number', description: 'Index of the removed instance' },
        id: { type: 'string', description: 'Stable id of the removed row (route mode only. Value of `row[idField]`)' },
        row: { type: 'object', description: 'The full row object that was removed (route mode only)' },
      },
    },
    'civ-repeater-form-steps-open': {
      description: 'Fires when an instance opens for editing in form-steps mode (either a new instance being added or an existing one re-opened)',
      detail: {
        index: { type: 'number', description: 'Index of the instance being opened' },
        isNew: { type: 'boolean', description: 'True when this is a freshly-added instance (not a re-edit of an existing one)' },
      },
    },
    'civ-repeater-form-steps-close': {
      description: 'Fires when the form-steps editor closes. Either via Save or Cancel',
      detail: {
        index: { type: 'number', description: 'Index of the instance being closed' },
        action: { type: 'string', description: 'Either "save" (committed) or "cancel" (aborted, edits discarded)' },
      },
    },
  },

  a11y: {
    role: 'group',
    // The repeater is a list manager, not a form control. It does not
    // mark itself "(required)" on the legend. List-level constraints
    // come from `min`, field-level constraints come from the inner
    // fields' own `required` markers.
    requiredIndicator: 'none',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'fieldset' },
      children: [
        { type: 'label', bindings: { text: 'legend', required: 'required' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        // Each instance renders the templated child plus a remove button (when count > min)
        { type: 'slot', bindings: { name: 'instances' } },
        // Add button rendered when count < max (or max = 0)
        { type: 'button', bindings: { label: '"Add another {itemLabel}"', action: 'add' } },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
