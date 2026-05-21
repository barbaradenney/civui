import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-time-picker',
  description: 'Self-contained time input with three modes: `combo` (USWDS-style typeable combobox with pre-built slots (default, best for scheduling), `select` (hour + minute dropdowns plus AM/PM segmented control) predictable picking), and `text` (free-form masked text input plus AM/PM segmented control. Best for arbitrary-precision input like incident reports). Always stores its value in 24-hour ISO `HH:MM`; the format prop controls display, not storage.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    mode: {
      type: 'enum',
      description: 'Input mode. `combo` (default) renders a typeable combobox with pre-built slots. Fastest for scheduling. `select` renders hour + minute selects plus an AM/PM segmented control. Best for discrete picking. `text` renders a masked text input (`HH:MM`) plus the AM/PM control. Best for arbitrary precision (incident reports, exact event times). `minute-step` is ignored in `text` mode.',
      default: 'combo',
      values: ['combo', 'select', 'text'],
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
      description: 'Earliest allowed time, 24-hour `HH:MM`, or the literal string `"now"` (resolves at render time to the device\'s current local time, snapped to `minute-step`). Combo mode only. Restricts the slot list (e.g. `"09:00"` for business hours, `"now"` for "no past times today").',
      default: '',
    },
    max: {
      type: 'string',
      description: 'Latest allowed time, 24-hour `HH:MM`, or the literal string `"now"` (see `min`). Combo mode only.',
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
    showNowButton: {
      type: 'boolean',
      description: 'Show the "Now" quick-button. Defaults to false. Opt in only on forms where "current time" is a meaningful default (callback scheduling, incident reports, forward-looking appointments with `min="now"`).',
      default: false,
      attribute: 'show-now-button',
    },
    nowButtonLabel: {
      type: 'string',
      description: 'Override the "Now" button label. Defaults to the locale-aware `timePickerNowButton` string ("Now" in English).',
      default: '',
      attribute: 'now-button-label',
    },
    disabledSlots: {
      type: 'array',
      description: 'Combo-mode only: 24-hour `HH:MM` strings to render as disabled / non-selectable (e.g. booked appointment slots). Disabled slots stay visible in the dropdown so users see the unavailability; arrow-key nav skips them and "snap-to-nearest" picks the closest available neighbor. Defaults to an empty array.',
      default: [],
      items: { value: { type: 'string', description: '24-hour HH:MM time string' } },
      attribute: 'disabled-slots',
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
        // AM/PM is rendered only in 12-hour mode. Implemented as a
        // segmented control (two-option binary choice. Single-tap on
        // every viewport, no dropdown overhead). `condition` is a
        // free-form hint to platform implementers. The literal token
        // describes the predicate, not the prop name.
        { type: 'button', condition: "format === '12'", bindings: { name: 'period' } },
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
