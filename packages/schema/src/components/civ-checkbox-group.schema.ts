import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-checkbox-group',
  description: 'Accessible checkbox group with fieldset and legend. Child civ-checkbox elements support multiple selections. Submits as FormData with multiple values.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Group legend text (rendered as `<legend>`). The component is self-contained. Do not wrap in civ-fieldset.',
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
    tightHint: {
      type: 'boolean',
      description: 'Pull the hint visually flush with the controls below it. Useful for compact compounds where legend + hint should read as one stacked header.',
      default: false,
      attribute: 'tight-hint',
      webOnly: true,
    },
    tile: {
      type: 'boolean',
      description: 'Tile variant with bordered card styling for child checkboxes. Default true. Tiles are the standard treatment',
      default: true,
      reflect: true,
    },
    orientation: {
      type: 'enum',
      description: 'Layout orientation for child checkboxes',
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      reflect: true,
    },
    layout: {
      type: 'enum',
      description: 'Tile rendering variant. auto picks card for ≤4 options and list for 5+. Vertical + tile only',
      default: 'auto',
      values: ['auto', 'card', 'list'],
      reflect: true,
    },
    showSelectAll: {
      type: 'boolean',
      description: 'When true, renders a "Select all" / "Deselect all" toggle button above the group',
      default: false,
      attribute: 'show-select-all',
    },
    preset: {
      type: 'enum',
      description: 'Pre-built option list. Renders `<civ-checkbox>` children automatically when no slotted children are present',
      values: ['us-state', 'service-branch', 'discharge-type', 'suffix', 'relationship-type', 'marital-status', 'ethnicity', 'gender', 'language', 'housing-status', 'education-level', 'employment-status', 'income-source', 'veteran-status'],
    },
    presetVariant: {
      type: 'string',
      description: 'Variant of the preset (e.g. "territories", "all", "binary")',
      attribute: 'preset-variant',
    },
    maxSelections: {
      type: 'number',
      description: 'Maximum number of options the user may check. Blocks the over-pick interactively + auto-appends a "Select up to N" hint',
      attribute: 'max-selections',
    },
    minSelections: {
      type: 'number',
      description: 'Minimum required count. Positive value implicitly marks the group as required and surfaces "Select at least N" on submit',
      attribute: 'min-selections',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when any child checkbox changes',
      detail: {
        values: { type: 'string[]', description: 'Array of checked checkbox values' },
      },
    },
    'civ-change': {
      description: 'Fires when any child checkbox changes (committed)',
      detail: {
        values: { type: 'string[]', description: 'Array of checked checkbox values' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event fired on interaction',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action that triggered the event' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-invalid': 'error ? "true" : nothing',
    },
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'fieldset' },
      children: [
        { type: 'label', bindings: { text: 'legend', required: 'required' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        { type: 'slot', bindings: { orientation: 'orientation' } },
      ],
    },
  ],

  form: {
    valueMode: 'multi',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
