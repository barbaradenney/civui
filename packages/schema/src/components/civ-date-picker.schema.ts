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
    spacing: {
      type: 'enum',
      description: 'Density variant. `default` renders the full label / hint / error chrome. `sm` (compact) renders just the input + trigger button with the host\'s `aria-label` propagated. For dense surfaces like data-grid cell editors',
      default: 'default',
      values: ['default', 'sm'],
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
    disabledDates: {
      type: 'string',
      description: 'Comma-separated list of YYYY-MM-DD dates to mark unselectable (e.g. holidays)',
      default: '',
      attribute: 'disabled-dates',
    },
    clearLabel: {
      type: 'string',
      description: 'Aria label for the clear (×) button when a value is set',
      default: '',
      attribute: 'clear-label',
    },
    todayButtonLabel: {
      type: 'string',
      description: 'Visible label on the "today" shortcut button inside the calendar dialog',
      default: '',
      attribute: 'today-button-label',
    },
    hideTodayButton: {
      type: 'boolean',
      description: 'Suppress the "today" shortcut button. Useful for date-of-birth and other historical-only fields',
      default: false,
      attribute: 'hide-today-button',
    },
    inlineToday: {
      type: 'boolean',
      description: 'Render an inline "Today" shortcut inset in the input chrome (lets users jump to today without opening the picker dialog). Disabled when today is out of min/max range, when host is disabled/readonly, or when value already matches today',
      default: false,
      attribute: 'inline-today',
    },
    inlineTodayLabel: {
      type: 'string',
      description: 'Override the inline "Today" button label. Defaults to the locale-aware "Today"',
      default: '',
      attribute: 'inline-today-label',
    },
    invalidFormatMessage: {
      type: 'string',
      description: 'Validation error shown when typed text doesn\'t parse as MM/DD/YYYY',
      default: '',
      attribute: 'invalid-format-message',
    },
    dateRangeMessage: {
      type: 'string',
      description: 'Validation error shown when selected date is outside min/max',
      default: '',
      attribute: 'date-range-message',
    },
    minDateMessage: {
      type: 'string',
      description: 'Validation error shown when selected date is before min ({min} interpolated)',
      default: '',
      attribute: 'min-date-message',
    },
    maxDateMessage: {
      type: 'string',
      description: 'Validation error shown when selected date is after max ({max} interpolated)',
      default: '',
      attribute: 'max-date-message',
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
      controlClasses: ['civ-input'],
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
