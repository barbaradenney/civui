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
