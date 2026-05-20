import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-signature',
  description: 'Compound electronic-signature field. A name input plus a "I certify..." checkbox tied together. The statement prop renders the certification statement above the certify checkbox. JSON-serialized form value records both the typed name and a timestamp.',
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
      description: 'Visual size of the legend. Defaults to `xl` because signatures are typically the prominent end-of-form legal affirmation. The large heading paired with the default card framing communicates the weight of the action',
      default: 'xl',
      values: ['sm', 'md', 'lg', 'xl'],
      webOnly: true,
    },
    statement: {
      type: 'string',
      description: 'Certification statement rendered above the certify checkbox. May contain inline HTML (rendered via unsafeHTML for `<a>` links). Empty = no statement block',
      default: '',
    },
    nameError: {
      type: 'string',
      description: 'Per-field error for the typed-name input',
      default: '',
      attribute: 'name-error',
    },
    certifyError: {
      type: 'string',
      description: 'Per-field error for the certify checkbox',
      default: '',
      attribute: 'certify-error',
    },
    card: {
      type: 'boolean',
      description: 'Render the signature block as an outlined card. Defaults to true. Signature blocks carry legal weight (statement of truth, certify-and-submit) and the card framing communicates that. Set false for a bare fieldset when nesting inside an already-bordered container',
      default: true,
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized: {name, certified, signedAt? (ISO timestamp set when certified flips true)}' },
      },
    },
    'civ-change': {
      description: 'Fires on committed sub-field change',
      detail: {
        value: { type: 'string', description: 'JSON-serialized SignatureValue (same shape as civ-input)' },
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
        { type: 'slot', bindings: { name: 'name' } },
        { type: 'container', condition: 'statement', bindings: { content: 'statement' } },
        { type: 'slot', bindings: { name: 'certify' } },
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
