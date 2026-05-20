import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-service-history',
  description: 'Compound military-service record. Branch (Army, Navy, Air Force, Marines, Coast Guard, Space Force), service start and end dates, discharge type, and optional service number. Used in VA benefits forms and similar veterans applications.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the sub-fields',
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
    showServiceNumber: {
      type: 'boolean',
      description: 'Render the service-number input. Default off. Sensitive PII, only requested when the form actually needs it',
      default: false,
      attribute: 'show-service-number',
    },
    branchError: {
      type: 'string',
      description: 'Per-field error for the branch-of-service selector',
      default: '',
      attribute: 'branch-error',
    },
    startDateError: {
      type: 'string',
      description: 'Per-field error for the service-start date input',
      default: '',
      attribute: 'start-date-error',
    },
    endDateError: {
      type: 'string',
      description: 'Per-field error for the service-end date input',
      default: '',
      attribute: 'end-date-error',
    },
    dischargeError: {
      type: 'string',
      description: 'Per-field error for the discharge-type selector',
      default: '',
      attribute: 'discharge-error',
    },
    serviceNumberError: {
      type: 'string',
      description: 'Per-field error for the service-number input (only shown when showServiceNumber is true)',
      default: '',
      attribute: 'service-number-error',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized ServiceHistoryValue: {branch, startDate, endDate, discharge, serviceNumber?}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized ServiceHistoryValue (same shape as civ-input)' },
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
        { type: 'slot', bindings: { name: 'branch' } },
        { type: 'slot', bindings: { name: 'startDate' } },
        { type: 'slot', bindings: { name: 'endDate' } },
        { type: 'slot', bindings: { name: 'discharge' } },
        { type: 'slot', condition: 'showServiceNumber', bindings: { name: 'serviceNumber' } },
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
