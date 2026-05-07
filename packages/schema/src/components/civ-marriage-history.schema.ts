import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-marriage-history',
  description: 'Compound marriage record — captures spouse name, marriage date, location (city/state/jurisdiction), optional cohabitation start, status (current / divorced / widowed / annulled), and end date when applicable. Used in benefits applications that require dependent or beneficiary documentation.',
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
    },
    size: {
      type: 'enum',
      description: 'Visual size of the legend',
      values: ['sm', 'md', 'lg', 'xl'],
    },
    showMarriageType: {
      type: 'boolean',
      description: 'Render the marriage-type selector (civil / religious / common-law / other). Default off — most forms only need date and location',
      default: false,
      attribute: 'show-marriage-type',
    },
    statusAssumed: {
      type: 'string',
      description: 'When set, suppresses the status sub-field and uses this value instead. Useful for "current spouse" contexts where status is implied',
      default: '',
      attribute: 'status-assumed',
    },
    spouseError: {
      type: 'string',
      description: 'Per-field error for the spouse-name input',
      default: '',
      attribute: 'spouse-error',
    },
    marriageTypeError: {
      type: 'string',
      description: 'Per-field error for the marriage-type selector',
      default: '',
      attribute: 'marriage-type-error',
    },
    marriageDateError: {
      type: 'string',
      description: 'Per-field error for the marriage-date input',
      default: '',
      attribute: 'marriage-date-error',
    },
    cityError: {
      type: 'string',
      description: 'Per-field error for the marriage-location city input',
      default: '',
      attribute: 'city-error',
    },
    stateError: {
      type: 'string',
      description: 'Per-field error for the marriage-location state select',
      default: '',
      attribute: 'state-error',
    },
    jurisdictionError: {
      type: 'string',
      description: 'Per-field error for the foreign-jurisdiction input (when state = "Other / outside US")',
      default: '',
      attribute: 'jurisdiction-error',
    },
    cohabitationStartError: {
      type: 'string',
      description: 'Per-field error for the cohabitation-start date input (common-law marriages)',
      default: '',
      attribute: 'cohabitation-start-error',
    },
    cohabitationStateError: {
      type: 'string',
      description: 'Per-field error for the cohabitation-state select',
      default: '',
      attribute: 'cohabitation-state-error',
    },
    statusError: {
      type: 'string',
      description: 'Per-field error for the status selector',
      default: '',
      attribute: 'status-error',
    },
    endDateError: {
      type: 'string',
      description: 'Per-field error for the end-date input (when status = divorced / widowed / annulled)',
      default: '',
      attribute: 'end-date-error',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized MarriageHistoryValue: {spouse, marriageType?, marriageDate, city, state, jurisdiction?, cohabitationStart?, cohabitationState?, status, endDate?}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized MarriageHistoryValue (same shape as civ-input)' },
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
        { type: 'slot', bindings: { name: 'spouse' } },
        { type: 'slot', condition: 'showMarriageType', bindings: { name: 'marriageType' } },
        { type: 'slot', bindings: { name: 'marriageDate' } },
        { type: 'slot', bindings: { name: 'location' } },
        { type: 'slot', bindings: { name: 'cohabitation' } },
        { type: 'slot', condition: '!statusAssumed', bindings: { name: 'status' } },
        { type: 'slot', bindings: { name: 'endDate' } },
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
