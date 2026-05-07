import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-yes-no',
  description: 'Two- or three-button yes/no group rendered as a custom radiogroup. Buttons share the same form value so the field reads as a single radio question to assistive tech.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    yesLabel: {
      type: 'string',
      description: 'Visible label for the affirmative button',
      default: 'Yes',
      attribute: 'yes-label',
    },
    noLabel: {
      type: 'string',
      description: 'Visible label for the negative button',
      default: 'No',
      attribute: 'no-label',
    },
    unsureLabel: {
      type: 'string',
      description: 'Visible label for the optional third button. When empty, only Yes/No are rendered',
      default: '',
      attribute: 'unsure-label',
    },
    unsureValue: {
      type: 'string',
      description: 'Form value submitted when the third button is selected',
      default: 'unsure',
      attribute: 'unsure-value',
    },
    skipLabel: {
      type: 'string',
      description: 'When non-empty, renders a "Prefer not to answer" affordance below the buttons. Outside the roving tabindex',
      default: '',
      attribute: 'skip-label',
    },
    skipValue: {
      type: 'string',
      description: 'Form value submitted when the skip affordance is selected',
      default: 'skip',
      attribute: 'skip-value',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when the selected value changes',
      detail: {
        value: { type: 'string', description: 'Selected value: yes, no, unsureValue, or skipValue' },
      },
    },
    'civ-change': {
      description: 'Fires when the selected value changes (committed)',
      detail: {
        value: { type: 'string', description: 'Selected value: yes, no, unsureValue, or skipValue' },
      },
    },
  },

  a11y: {
    role: 'radiogroup',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-invalid': 'error ? "true" : nothing',
      'aria-required': 'required || nothing',
    },
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div', role: 'radiogroup' },
      children: [
        { type: 'label', bindings: { text: 'label', required: 'required' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        { type: 'button', bindings: { label: 'yesLabel', value: '"yes"', role: 'radio' } },
        { type: 'button', bindings: { label: 'noLabel', value: '"no"', role: 'radio' } },
        { type: 'button', condition: 'unsureLabel', bindings: { label: 'unsureLabel', value: 'unsureValue', role: 'radio' } },
        { type: 'button', condition: 'skipLabel', bindings: { label: 'skipLabel', value: 'skipValue' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },

  platform: {
    web: {
      controlClasses: ['civ-btn', 'civ-btn--yesno'],
    },
    ios: {
      // SwiftUI Picker (segmented style) or HStack of toggle buttons
    },
    android: {
      // Compose SegmentedButton or ToggleButton row
    },
  },
};

export default schema;
