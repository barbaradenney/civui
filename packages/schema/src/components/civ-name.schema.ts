import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-name',
  description: 'Compound name field — first / middle / last with optional suffix selector. Renders bare text inputs (no inline labels) so the parent legend names the whole field. JSON-serialized form value.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the sub-fields',
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
      default: 'md',
      values: ['sm', 'md', 'lg', 'xl'],
      webOnly: true,
    },
    showMiddle: {
      type: 'boolean',
      description: 'Render the middle-name input',
      default: true,
      attribute: 'show-middle',
    },
    showSuffix: {
      type: 'boolean',
      description: 'Render the suffix select (Jr, Sr, II, III, etc.)',
      default: true,
      attribute: 'show-suffix',
    },
    firstError: {
      type: 'string',
      description: 'Per-field error for the first-name input',
      default: '',
      attribute: 'first-error',
    },
    middleError: {
      type: 'string',
      description: 'Per-field error for the middle-name input',
      default: '',
      attribute: 'middle-error',
    },
    lastError: {
      type: 'string',
      description: 'Per-field error for the last-name input',
      default: '',
      attribute: 'last-error',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized NameValue: {first, middle?, last, suffix?}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized NameValue (same shape as civ-input)' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'asterisk',
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
        { type: 'slot', bindings: { name: 'first' } },
        { type: 'slot', condition: 'showMiddle', bindings: { name: 'middle' } },
        { type: 'slot', bindings: { name: 'last' } },
        { type: 'slot', condition: 'showSuffix', bindings: { name: 'suffix' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
