import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-country',
  description: 'Pre-configured combobox for country selection. Ships the full ISO 3166-1 country list (value is the alpha-2 code, e.g. "US", "GB"), pins the United States to the top of the list by default, and supports `include` / `exclude` filters for placement-specific use cases (military assignments, sanctioned-country exclusions). Thin wrapper over `civ-combobox` — same event surface (`civ-input` with `{ value: string }`, `civ-change` with `{ value, label }`).',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    usFirst: {
      type: 'boolean',
      description: 'Pin United States to the top of the country list. Defaults to true (most US-government forms collect a US-resident audience). Set false for international-first flows',
      default: true,
      attribute: 'us-first',
    },
    include: {
      type: 'string',
      description: 'Comma-separated list of ISO 3166-1 alpha-2 codes to include. When set, only those countries are shown in the list. Empty (default) means show every country',
      default: '',
    },
    exclude: {
      type: 'string',
      description: 'Comma-separated list of ISO 3166-1 alpha-2 codes to exclude (e.g. sanctioned countries like "KP,IR,SY"). Empty (default) means exclude none',
      default: '',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every filter-text change',
      detail: {
        value: { type: 'string', description: 'Current filter text' },
      },
    },
    'civ-change': {
      description: 'Fires when a country is selected',
      detail: {
        value: { type: 'string', description: 'Selected country code (ISO 3166-1 alpha-2)' },
        label: { type: 'string', description: 'Selected country display name' },
      },
    },
  },

  a11y: {
    role: 'combobox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
    },
  },

  renderOrder: [
    { type: 'label', bindings: { text: 'label', required: 'required' } },
    { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
    { type: 'error', condition: 'error', bindings: { text: 'error' } },
    { type: 'input', bindings: { value: 'value', usFirst: 'usFirst', include: 'include', exclude: 'exclude', disabled: 'disabled', required: 'required' } },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
