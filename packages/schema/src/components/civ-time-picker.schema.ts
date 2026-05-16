import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-time-picker',
  description: 'Self-contained time input with two modes: `combo` (USWDS-style typeable combobox with pre-built slots — default, best for scheduling) and `select` (three dropdowns for hour, minute, AM/PM — predictable on every device). Always stores its value in 24-hour ISO `HH:MM`; the format prop controls display, not storage. Use for appointment scheduling, hearing times, and any time-of-day prompt.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    mode: {
      type: 'enum',
      description: 'Input mode. `combo` (default) renders a single typeable combobox with pre-built slots — fastest for scheduling. `select` renders three dropdowns (hour, minute, AM/PM) — best for free-form precision or when slot filtering would be confusing.',
      default: 'combo',
      values: ['combo', 'select'],
    },
    legend: {
      type: 'string',
      description: 'Fieldset legend (select mode) or label fallback (combo mode)',
      default: '',
    },
    format: {
      type: 'enum',
      description: 'Display format: "12" (with AM/PM) or "24"',
      default: '12',
      values: ['12', '24'],
    },
    minuteStep: {
      type: 'number',
      description: 'Increment for the minute slots. Defaults to 15 in combo mode (scheduling-friendly slot density), 5 in select mode. Use 1 for arbitrary precision (best with select mode).',
      default: 0,
      attribute: 'minute-step',
    },
    min: {
      type: 'string',
      description: 'Earliest allowed time, 24-hour `HH:MM`. Combo mode only — restricts the slot list (e.g. `"09:00"` for business hours).',
      default: '',
    },
    max: {
      type: 'string',
      description: 'Latest allowed time, 24-hour `HH:MM`. Combo mode only.',
      default: '',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder for the combo-mode input. Defaults to the locale `timePickerPlaceholder` ("e.g. 9:00 AM"). Ignored in select mode.',
      default: '',
    },
    hourLabel: {
      type: 'string',
      description: 'Custom label for the hour select (select mode only)',
      default: '',
      attribute: 'hour-label',
    },
    minuteLabel: {
      type: 'string',
      description: 'Custom label for the minute select (select mode only)',
      default: '',
      attribute: 'minute-label',
    },
    periodLabel: {
      type: 'string',
      description: 'Custom label for the AM/PM select (select mode only)',
      default: '',
      attribute: 'period-label',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when the value changes (every keystroke in combo mode, every sub-field commit in select mode)',
      detail: {
        value: { type: 'string', description: '24-hour ISO time string (HH:MM)' },
        hour: { type: 'string', description: 'Hour sub-field value as shown to the user' },
        minute: { type: 'string', description: 'Minute sub-field value' },
        period: { type: 'string', description: 'AM/PM (empty in 24-hour mode)' },
      },
    },
    'civ-change': {
      description: 'Fires when the value commits',
      detail: {
        value: { type: 'string', description: '24-hour ISO time string (HH:MM)' },
        hour: { type: 'string', description: 'Hour sub-field value' },
        minute: { type: 'string', description: 'Minute sub-field value' },
        period: { type: 'string', description: 'AM/PM (empty in 24-hour mode)' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event on commit',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`change`)' },
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
        { type: 'label', bindings: { text: 'legend' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        { type: 'select', bindings: { name: 'hour' } },
        { type: 'select', bindings: { name: 'minute' } },
        // AM/PM select is rendered only in 12-hour mode. `condition` is
        // a free-form hint to platform implementers — the literal token
        // describes the predicate, not the prop name.
        { type: 'select', condition: "format === '12'", bindings: { name: 'period' } },
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
      controlClasses: ['civ-time-picker-fields'],
    },
    ios: {
      // SwiftUI DatePicker with displayedComponents: [.hourAndMinute]
    },
    android: {
      // Compose TimePicker / TimeInput from Material3
    },
  },
};

export default schema;
