import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-relationship',
  description: 'Compound family-relationship record. Relationship type (spouse, child, parent, sibling, other), name of the related person, and conditional date fields per type (marriage date, divorce date, date of birth, adoption date, date of death). Drives common dependent / beneficiary patterns.',
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
    preset: {
      type: 'enum',
      description: 'Built-in relationship-type preset. Determines which options appear in the relationship selector and which date fields are conditionally rendered',
      default: 'general',
      values: ['general', 'detailed', 'dependent', 'survivor', 'benefits-survivor', 'immigration', 'tax'],
    },
    options: {
      type: 'array',
      description: 'Custom relationship-type configuration. When set, overrides the preset. Web: typed array of `{value, label, fields?}` objects (set as JS property, attribute: false). Native: passed as a JSON-encoded string for serialization. Conceptually the same data, different wire format per platform',
      items: {
        value: { type: 'string', description: 'Form value for this relationship type', required: true },
        label: { type: 'string', description: 'Visible label', required: true },
      },
      webOnly: true,
    },
    hideName: {
      type: 'boolean',
      description: 'Hide the inner name fields. Defaults to false (name fields render). Use when an enclosing repeater step already captures the name and you want to avoid duplicating it inside civ-relationship.',
      default: false,
      attribute: 'hide-name',
    },
    showDeceased: {
      type: 'boolean',
      description: 'Render the "Is this person deceased?" toggle. When true, shows the date-of-death input',
      default: false,
      attribute: 'show-deceased',
    },
    deceasedAssumed: {
      type: 'boolean',
      description: 'Suppress the deceased toggle and treat all entries as deceased. Used for survivor-only contexts',
      default: false,
      attribute: 'deceased-assumed',
    },
    showDivorceDate: {
      type: 'boolean',
      description: 'Render the divorce-date input when the relationship type is spouse-related',
      default: false,
      attribute: 'show-divorce-date',
    },
    showAdoptionDate: {
      type: 'boolean',
      description: 'Render the adoption-date input when the relationship type is child-related',
      default: false,
      attribute: 'show-adoption-date',
    },
    nameError: {
      type: 'string',
      description: 'Compound-level error for the relative-name section',
      default: '',
      attribute: 'name-error',
    },
    firstError: {
      type: 'string',
      description: 'Per-field error for the first-name input inside the relative-name section',
      default: '',
      attribute: 'first-error',
    },
    middleError: {
      type: 'string',
      description: 'Per-field error for the middle-name input inside the relative-name section',
      default: '',
      attribute: 'middle-error',
    },
    lastError: {
      type: 'string',
      description: 'Per-field error for the last-name input inside the relative-name section',
      default: '',
      attribute: 'last-error',
    },
    relationshipError: {
      type: 'string',
      description: 'Per-field error for the relationship-type selector',
      default: '',
      attribute: 'relationship-error',
    },
    marriageDateError: {
      type: 'string',
      description: 'Per-field error for the marriage-date input',
      default: '',
      attribute: 'marriage-date-error',
    },
    divorceDateError: {
      type: 'string',
      description: 'Per-field error for the divorce-date input',
      default: '',
      attribute: 'divorce-date-error',
    },
    dateOfBirthError: {
      type: 'string',
      description: 'Per-field error for the date-of-birth input',
      default: '',
      attribute: 'date-of-birth-error',
    },
    adoptionDateError: {
      type: 'string',
      description: 'Per-field error for the adoption-date input',
      default: '',
      attribute: 'adoption-date-error',
    },
    dateOfDeathError: {
      type: 'string',
      description: 'Per-field error for the date-of-death input',
      default: '',
      attribute: 'date-of-death-error',
    },
    otherDescriptionError: {
      type: 'string',
      description: 'Per-field error for the "describe the relationship" free-text input (shown when relationship = other)',
      default: '',
      attribute: 'other-description-error',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized RelationshipValue: {relationship, name?, otherDescription?, marriageDate?, divorceDate?, dateOfBirth?, adoptionDate?, dateOfDeath?, deceased?}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized RelationshipValue (same shape as civ-input)' },
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
        { type: 'slot', bindings: { name: 'relationship' } },
        { type: 'slot', condition: '!hideName', bindings: { name: 'name' } },
        { type: 'slot', bindings: { name: 'conditionalDates' } },
        { type: 'slot', condition: 'showDeceased', bindings: { name: 'deceased' } },
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
