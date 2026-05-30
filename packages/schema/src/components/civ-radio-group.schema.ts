import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-radio-group',
  description: 'Accessible radio button group with fieldset, legend, and roving tabindex keyboard navigation. Child civ-radio elements are mutually exclusive.',
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
    tile: {
      type: 'boolean',
      description: 'Tile variant with bordered card styling for child radios. Default true. Tiles are the standard treatment',
      default: true,
      reflect: true,
    },
    orientation: {
      type: 'enum',
      description: 'Layout orientation for child radio buttons',
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
    preset: {
      type: 'enum',
      description: 'Pre-built option list. Renders `<civ-radio>` children automatically when no slotted children are present',
      values: ['us-state', 'service-branch', 'discharge-type', 'suffix', 'relationship-type', 'marital-status', 'ethnicity', 'gender', 'language', 'housing-status', 'education-level', 'employment-status', 'income-source', 'veteran-status', 'disability-type', 'citizenship-status', 'pay-frequency', 'contact-preference'],
    },
    presetVariant: {
      type: 'string',
      description: 'Variant of the preset (e.g. "territories", "all", "binary")',
      attribute: 'preset-variant',
    },
    skipLabel: {
      type: 'string',
      description: 'When non-empty, renders a "Prefer not to answer" affordance below the radio group. Outside the roving tabindex',
      default: '',
      attribute: 'skip-label',
    },
    skipValue: {
      type: 'string',
      description: 'Form value used when the skip affordance is selected',
      default: 'skip',
      attribute: 'skip-value',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when a radio selection changes',
      detail: {
        value: { type: 'string', description: 'Selected radio value' },
      },
    },
    'civ-change': {
      description: 'Fires when a radio selection changes (committed)',
      detail: {
        value: { type: 'string', description: 'Selected radio value' },
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
    role: 'radiogroup',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-orientation': 'orientation',
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
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
