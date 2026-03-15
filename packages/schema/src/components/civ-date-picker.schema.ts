import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-date-picker',
  description: 'Accessible date picker with text input and calendar dialog. Supports keyboard navigation, min/max date constraints, and locale-aware formatting.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    min: {
      type: 'string',
      description: 'Minimum selectable date (YYYY-MM-DD)',
      default: '',
    },
    max: {
      type: 'string',
      description: 'Maximum selectable date (YYYY-MM-DD)',
      default: '',
    },
    placeholder: {
      type: 'string',
      description: 'Input placeholder showing expected format',
      default: 'mm/dd/yyyy',
    },
    locale: {
      type: 'string',
      description: 'Locale for date formatting',
      default: 'en-US',
    },
    weekStartsOn: {
      type: 'number',
      description: 'Day the week starts on (0=Sunday, 1=Monday)',
      default: 0,
      attribute: 'week-starts-on',
    },
    chooseDateLabel: {
      type: 'string',
      description: 'Aria label for the calendar toggle button',
      default: 'Choose date',
      attribute: 'choose-date-label',
    },
    selectedDateLabel: {
      type: 'string',
      description: 'Aria label template when a date is selected ({date} interpolated)',
      default: 'Choose date, selected date is {date}',
      attribute: 'selected-date-label',
    },
    dialogLabel: {
      type: 'string',
      description: 'Aria label for the calendar dialog',
      default: 'Choose Date',
      attribute: 'dialog-label',
    },
    previousMonthLabel: {
      type: 'string',
      description: 'Aria label for previous month button',
      default: 'Previous month',
      attribute: 'previous-month-label',
    },
    nextMonthLabel: {
      type: 'string',
      description: 'Aria label for next month button',
      default: 'Next month',
      attribute: 'next-month-label',
    },
    dialogOpenedMessage: {
      type: 'string',
      description: 'Screen reader announcement when calendar opens',
      default: 'Calendar dialog opened',
      attribute: 'dialog-opened-message',
    },
    dateSelectedMessage: {
      type: 'string',
      description: 'Screen reader announcement when date is selected ({date} interpolated)',
      default: 'Selected {date}',
      attribute: 'date-selected-message',
    },
    todayLabel: {
      type: 'string',
      description: 'Text appended to today\'s date for screen readers',
      default: 'today',
      attribute: 'today-label',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every text input change',
      detail: {
        value: { type: 'string', description: 'Current input text' },
      },
    },
    'civ-change': {
      description: 'Fires when a date is committed (via calendar selection or input blur)',
      detail: {
        value: { type: 'string', description: 'Selected date in YYYY-MM-DD format' },
      },
    },
  },

  a11y: {
    role: 'textbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
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
      controlClasses: ['civ-input', 'focus-visible:civ-focus-ring'],
    },
    ios: {
      // Uses native DatePicker
    },
    android: {
      // Uses Material DatePickerDialog
    },
  },
};

export default schema;
