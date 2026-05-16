import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-time-picker',
  description: 'Self-contained time input rendered as three selects: hour, minute, and AM/PM (12-hour mode only). Always stores its value in 24-hour ISO format (`HH:MM`) — the format prop controls display, not storage. Use it for appointment scheduling, hearing times, and any time-of-day question.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Fieldset legend rendered above the sub-fields',
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
      description: 'Increment for the minute select. Defaults to 5; use 1 for fine-grained, 15/30 for coarser.',
      default: 5,
      attribute: 'minute-step',
    },
    hourLabel: {
      type: 'string',
      description: 'Custom label for the hour select',
      default: '',
      attribute: 'hour-label',
    },
    minuteLabel: {
      type: 'string',
      description: 'Custom label for the minute select',
      default: '',
      attribute: 'minute-label',
    },
    periodLabel: {
      type: 'string',
      description: 'Custom label for the AM/PM select',
      default: '',
      attribute: 'period-label',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when any sub-field changes',
      detail: {
        value: { type: 'string', description: '24-hour ISO time string (HH:MM)' },
        hour: { type: 'string', description: 'Hour sub-field value as shown to the user' },
        minute: { type: 'string', description: 'Minute sub-field value' },
        period: { type: 'string', description: 'AM/PM (empty in 24-hour mode)' },
      },
    },
    'civ-change': {
      description: 'Fires when any sub-field commits',
      detail: {
        value: { type: 'string', description: '24-hour ISO time string (HH:MM)' },
        hour: { type: 'string', description: 'Hour sub-field value' },
        minute: { type: 'string', description: 'Minute sub-field value' },
        period: { type: 'string', description: 'AM/PM (empty in 24-hour mode)' },
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
        { type: 'select', condition: 'format', bindings: { name: 'period' } },
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
