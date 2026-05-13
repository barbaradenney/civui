import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-date-range-picker',
  description: 'Two `civ-date-picker` instances cross-bound as a start/end range. The end picker\'s effective `min` follows `start`, and vice versa. Submits as `${name}.start` and `${name}.end` form fields. Cross-field range validation via `minRangeDays` and `maxRangeDays`.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    legend: {
      type: 'string',
      description: 'Group legend rendered as `<legend>`. The component is self-contained — do not wrap in civ-fieldset.',
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
    min: {
      type: 'string',
      description: 'Outer lower bound for both pickers (ISO yyyy-mm-dd). Empty disables the bound',
      default: '',
    },
    max: {
      type: 'string',
      description: 'Outer upper bound for both pickers (ISO yyyy-mm-dd). Empty disables the bound',
      default: '',
    },
    minRangeDays: {
      type: 'number',
      description: 'Inclusive minimum range duration in days. 0 disables the cross-field check',
      default: 0,
      attribute: 'min-range-days',
    },
    maxRangeDays: {
      type: 'number',
      description: 'Inclusive maximum range duration in days. 0 disables the cross-field check',
      default: 0,
      attribute: 'max-range-days',
    },
    startLabel: {
      type: 'string',
      description: 'Label for the start date picker. Defaults to the i18n string "Start date"',
      default: '',
      attribute: 'start-label',
    },
    endLabel: {
      type: 'string',
      description: 'Label for the end date picker. Defaults to the i18n string "End date"',
      default: '',
      attribute: 'end-label',
    },
    startHint: {
      type: 'string',
      description: 'Hint text shown under the start picker',
      default: '',
      attribute: 'start-hint',
    },
    endHint: {
      type: 'string',
      description: 'Hint text shown under the end picker',
      default: '',
      attribute: 'end-hint',
    },
    startError: {
      type: 'string',
      description: 'Field-level error rendered on the start picker (independent of host-level cross-field errors)',
      default: '',
      attribute: 'start-error',
    },
    endError: {
      type: 'string',
      description: 'Field-level error rendered on the end picker',
      default: '',
      attribute: 'end-error',
    },
    locale: {
      type: 'string',
      description: 'BCP-47 locale forwarded to both pickers for date formatting',
      default: 'en-US',
    },
    weekStartsOn: {
      type: 'number',
      description: 'Day-of-week the calendar starts on (0 = Sunday, 1 = Monday). Forwarded to both pickers',
      default: 0,
      attribute: 'week-starts-on',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every change to either the start or end date',
      detail: {
        value: { type: 'object', description: '`{ start: string, end: string }` — ISO yyyy-mm-dd dates; either may be empty if not yet picked' },
      },
    },
    'civ-change': {
      description: 'Fires when the user commits a change (either date picker emits civ-change)',
      detail: {
        value: { type: 'object', description: '`{ start: string, end: string }`' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'text',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div' },
      children: [
        { type: 'input', bindings: { label: 'startLabel', value: 'value' } },
        { type: 'input', bindings: { label: 'endLabel', value: 'value' } },
      ],
    },
  ],

  form: {
    // Submits as `${name}.start` and `${name}.end` — multiple FormData entries.
    valueMode: 'multi',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
