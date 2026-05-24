import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-race-ethnicity',
  description: 'OMB-standard race & ethnicity compound for federal forms. Renders Race (multi-select checkbox group, 6 OMB categories) followed by Ethnicity (single-choice radio group, 3 OMB categories). JSON-serialized form value.',
  category: 'form-group',
  extends: 'CivFormElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the two sub-groups',
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
    ethnicityLegend: {
      type: 'string',
      description: 'Sub-legend for the Ethnicity radio group. Defaults to "Ethnicity"',
      default: '',
      attribute: 'ethnicity-legend',
    },
    raceLegend: {
      type: 'string',
      description: 'Sub-legend for the Race checkbox group. Defaults to "Race"',
      default: '',
      attribute: 'race-legend',
    },
    ethnicityError: {
      type: 'string',
      description: 'Per-field error for the ethnicity radio group',
      default: '',
      attribute: 'ethnicity-error',
    },
    raceError: {
      type: 'string',
      description: 'Per-field error for the race checkbox group',
      default: '',
      attribute: 'race-error',
    },
    layout: {
      type: 'enum',
      description: 'Tile rendering variant forwarded to both inner groups. auto picks card for ≤4 options and list for 5+. Race (6 options) renders as list, Ethnicity (3 options) stays card',
      default: 'auto',
      values: ['auto', 'card', 'list'],
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-group change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized: {race: string[], ethnicity: string}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-group change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized RaceEthnicityValue (same shape as civ-input)' },
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
        { type: 'slot', bindings: { name: 'race' } },
        { type: 'slot', bindings: { name: 'ethnicity' } },
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
