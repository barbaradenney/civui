import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-textarea',
  description: 'Accessible multiline text input with character count, label, hint, and error. Uses debounced screen reader announcements for character remaining.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    rows: {
      type: 'number',
      description: 'Number of visible text rows',
      default: 5,
    },
    maxlength: {
      type: 'number',
      description: 'Maximum character length (enables character counter when set)',
    },
    minlength: {
      type: 'number',
      description: 'Minimum character length',
    },
    maxwords: {
      type: 'number',
      description: 'Maximum word count. Switches the counter from characters to words and surfaces a "{n} words remaining" hint',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text (never use as sole label)',
      default: '',
    },
    spacing: {
      type: 'enum',
      description: 'Density variant. `default` renders the full label / hint / error / char-count chrome. `sm` (compact) renders just the bare `<textarea>` with the host\'s `aria-label` propagated. For dense surfaces like data-grid cell editors',
      default: 'default',
      values: ['default', 'sm'],
    },
    autogrow: {
      type: 'boolean',
      description: 'Auto-expand the textarea height to fit the content as the user types',
      default: false,
    },
    maxHeight: {
      type: 'string',
      description: 'Cap on autogrow height (any CSS length, e.g. "20rem"). Empty string = unlimited',
      default: '',
      attribute: 'max-height',
    },
    validateType: {
      type: 'enum',
      description: 'Declarative validation preset. length checks min/max boundaries on blur',
      default: '',
      values: ['', 'length'],
      attribute: 'validate',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every value change',
      detail: {
        value: { type: 'string', description: 'Current textarea value' },
      },
    },
    'civ-change': {
      description: 'Fires on committed value change (blur)',
      detail: {
        value: { type: 'string', description: 'Committed textarea value' },
      },
    },
  },

  a11y: {
    role: 'textbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error', 'charcount'],
    ariaAttributes: {
      'aria-multiline': 'true',
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
        rows: 'rows',
        maxlength: 'maxlength',
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
      controlClasses: ['civ-input', 'civ-resize-y'],
    },
    ios: {
      // SwiftUI TextEditor with character count overlay
    },
    android: {
      // Compose TextField with singleLine = false and character counter
    },
  },
};

export default schema;
