import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-memorable-date',
  description: 'Three-field date input (month select, day input, year input) for known dates like birthdays and document dates. Assembles YYYY-MM-DD value from individual fields.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Fieldset legend rendered above the date sub-fields. The component is self-contained. Do not wrap in civ-fieldset.',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'When set, promotes the legend to a heading via role="heading" + aria-level=N',
      attribute: 'heading-level',
      webOnly: true,
    },
    size: {
      type: 'enum',
      description: 'Visual size of the legend',
      values: ['sm', 'md', 'lg', 'xl'],
      webOnly: true,
    },
    monthLabel: {
      type: 'string',
      description: 'Label for the month select',
      default: 'Month',
      attribute: 'month-label',
    },
    dayLabel: {
      type: 'string',
      description: 'Label for the day input',
      default: 'Day',
      attribute: 'day-label',
    },
    yearLabel: {
      type: 'string',
      description: 'Label for the year input',
      default: 'Year',
      attribute: 'year-label',
    },
    monthEmptyLabel: {
      type: 'string',
      description: 'Empty option text for month select',
      default: '- Month -',
      attribute: 'month-empty-label',
    },
    dayPlaceholder: {
      type: 'string',
      description: 'Placeholder for day input',
      default: 'DD',
      attribute: 'day-placeholder',
    },
    yearPlaceholder: {
      type: 'string',
      description: 'Placeholder for year input',
      default: 'YYYY',
      attribute: 'year-placeholder',
    },
    dateSetMessage: {
      type: 'string',
      description: 'Screen reader announcement when date is set ({date} interpolated)',
      default: 'Date set to {date}',
      attribute: 'date-set-message',
    },
    invalidDateMessage: {
      type: 'string',
      description: 'Error message for invalid date combinations',
      default: 'Enter a valid date',
      attribute: 'invalid-date-message',
    },
    locale: {
      type: 'string',
      description: 'Locale for month name formatting',
      default: 'en-US',
    },
    monthError: {
      type: 'string',
      description: 'Per-field error flag for the Month sub-field. Any truthy string applies a red inline-start border and sets `aria-invalid="true"` on the native select; no per-field error text renders (the group-level `error` carries the description, GOV.UK / USWDS convention). Use a value that reads in your validator (`"missing"`, `"invalid"`) — CivUI only treats it as a boolean',
      default: '',
      attribute: 'month-error',
    },
    dayError: {
      type: 'string',
      description: 'Per-field error flag for the Day sub-field. See `monthError` for semantics',
      default: '',
      attribute: 'day-error',
    },
    yearError: {
      type: 'string',
      description: 'Per-field error flag for the Year sub-field. See `monthError` for semantics',
      default: '',
      attribute: 'year-error',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when any date field changes',
      detail: {
        value: { type: 'string', description: 'Assembled date in YYYY-MM-DD format' },
      },
    },
    'civ-change': {
      description: 'Fires when a date field commits (blur)',
      detail: {
        value: { type: 'string', description: 'Assembled date in YYYY-MM-DD format' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event fired on interaction',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action that triggered the event' },
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
        { type: 'slot' },
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
