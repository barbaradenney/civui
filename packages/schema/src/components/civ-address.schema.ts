import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-address',
  description: 'Compound address field — renders street, optional second/third address lines, city, state (USPS preset), ZIP, and optional country selector. JSON-serialized form value.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    variant: {
      type: 'enum',
      description: 'Layout variant. default = standard postal mail address; general-delivery = relaxed structure for unhoused / general-delivery addresses; contact = single-line contact-card layout',
      default: 'default',
      values: ['default', 'general-delivery', 'contact'],
    },
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the sub-fields',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'When set, promotes the legend to a heading via role="heading" + aria-level=N. Use sparingly',
      attribute: 'heading-level',
      webOnly: true,
    },
    size: {
      type: 'enum',
      description: 'Visual size of the legend. md/lg/xl step up through the typography scale for use as a section/page heading',
      values: ['sm', 'md', 'lg', 'xl'],
      webOnly: true,
    },
    showStreet2: {
      type: 'boolean',
      description: 'Render the optional second address line',
      default: true,
      attribute: 'show-street2',
    },
    showStreet3: {
      type: 'boolean',
      description: 'Render the optional third address line',
      default: false,
      attribute: 'show-street3',
    },
    showCountry: {
      type: 'boolean',
      description: 'Render the country selector. Defaults off — most government forms collect US-only addresses',
      default: false,
      attribute: 'show-country',
    },
    streetError: {
      type: 'string',
      description: 'Per-field error for the street line, surfaced via the inner civ-text-input',
      default: '',
      attribute: 'street-error',
    },
    cityError: {
      type: 'string',
      description: 'Per-field error for the city input',
      default: '',
      attribute: 'city-error',
    },
    stateError: {
      type: 'string',
      description: 'Per-field error for the state select',
      default: '',
      attribute: 'state-error',
    },
    zipError: {
      type: 'string',
      description: 'Per-field error for the ZIP input',
      default: '',
      attribute: 'zip-error',
    },
    validateAddress: {
      type: 'string',
      description: 'Async validator function `(addr: AddressValue) => Promise<{valid: boolean; suggestion?: AddressValue; error?: string}>`. Set programmatically (not as an attribute) — wires into the address-validation flow',
      webOnly: true,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized AddressValue: {street, street2?, street3?, city, state, zip, country?}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized AddressValue (same shape as civ-input)' },
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
        // Sub-fields rendered as nested civ-text-input / civ-select / civ-zip
        { type: 'slot', bindings: { name: 'street' } },
        { type: 'slot', condition: 'showStreet2', bindings: { name: 'street2' } },
        { type: 'slot', condition: 'showStreet3', bindings: { name: 'street3' } },
        { type: 'slot', bindings: { name: 'city' } },
        { type: 'slot', bindings: { name: 'state' } },
        { type: 'slot', bindings: { name: 'zip' } },
        { type: 'slot', condition: 'showCountry', bindings: { name: 'country' } },
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
