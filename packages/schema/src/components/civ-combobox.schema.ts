import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-combobox',
  description: 'Accessible combobox with autocomplete filtering, keyboard navigation, and screen reader announcements. Uses ARIA 1.2 combobox pattern with listbox popup.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    options: {
      type: 'array',
      description: 'Array of selectable options',
      default: [],
      items: {
        value: { type: 'string', description: 'Option value for form submission', required: true },
        label: { type: 'string', description: 'Display text for the option', required: true },
      },
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text for the input',
      default: '',
    },
    inputmode: {
      type: 'enum',
      description: 'Mobile keyboard hint passed through to the inner `<input>`. Use `"numeric"` for digit-keyed option lists (time slots, ZIP/postal lookups). Empty (default) lets the browser pick the alphabetic keyboard.',
      default: '',
      values: ['', 'text', 'numeric', 'decimal', 'tel', 'search', 'email', 'url'],
    },
    noResultsText: {
      type: 'string',
      description: 'Text shown when filter matches no options',
      default: 'No results found',
      attribute: 'no-results-text',
    },
    width: {
      type: 'enum',
      description: 'Width variant',
      default: 'default',
      values: ['default', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    spacing: {
      type: 'enum',
      description: 'Density variant. `default` renders the full label/hint/error chrome. `sm` (compact) renders just the bare `<input>` with the host\'s `aria-label` propagated. Used inside dense surfaces like data-grid cell editors. Web-only because the compact mode is specific to web data-grid cell-editing.',
      default: 'default',
      values: ['default', 'sm'],
      webOnly: true,
    },
    loadOptions: {
      type: 'string',
      description: 'Async loader function `(query: string) => Promise<ComboboxOption[]>` for remote-driven option lists. Set programmatically (not as an attribute)',
      webOnly: true,
    },
    loadDebounce: {
      type: 'number',
      description: 'Debounce in ms before invoking loadOptions on input',
      default: 300,
      attribute: 'load-debounce',
    },
    minQueryLength: {
      type: 'number',
      description: 'Minimum query length before loadOptions is called. 0 means call on first focus',
      default: 0,
      attribute: 'min-query-length',
    },
    loadingText: {
      type: 'string',
      description: 'Text shown in the dropdown while loadOptions is in flight',
      default: '',
      attribute: 'loading-text',
    },
    loadingErrorText: {
      type: 'string',
      description: 'Text shown when loadOptions rejects',
      default: '',
      attribute: 'loading-error-text',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every filter text change',
      detail: {
        value: { type: 'string', description: 'Current filter text' },
      },
    },
    'civ-change': {
      description: 'Fires when an option is selected',
      detail: {
        value: { type: 'string', description: 'Selected option value' },
      },
    },
    'civ-open': {
      description: 'Fires when the listbox opens',
      detail: {},
    },
    'civ-close': {
      description: 'Fires when the listbox closes',
      detail: {},
    },
    'civ-analytics': {
      description: 'Analytics tracking event fired on selection',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`select`)' },
      },
    },
  },

  a11y: {
    // Role describes the rendered control: the inner <input role="combobox">.
    // Matches the codebase convention (civ-text-input → textbox, civ-country
    // → combobox, etc.) — the schema documents the rendered native/inner
    // element's role for native implementers. The lint:schema-a11y-role gate
    // permits this; it only fails on roles that CONTRADICT what's rendered.
    role: 'combobox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-expanded': '_open',
      'aria-invalid': 'error ? "true" : nothing',
    },
  },

  renderOrder: [
    {
      type: 'label',
      bindings: { text: 'label', required: 'required' },
    },
    {
      type: 'hint',
      condition: 'hint',
      bindings: { text: 'hint' },
    },
    {
      type: 'error',
      condition: 'error',
      bindings: { text: 'error' },
    },
    {
      type: 'input',
      bindings: {
        value: 'value',
        placeholder: 'placeholder',
        disabled: 'disabled',
        required: 'required',
      },
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: ['civ-input'],
    },
  },
};

export default schema;
