import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-section-intro',
  description: 'Mid-form section header with semantic tone (info / sensitive / neutral). The `sensitive` tone applies an emphasized treatment for sections collecting PII (SSN, financial info). Pair with form-step or fieldset to introduce a logical group of fields.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    heading: {
      type: 'string',
      description: 'Section heading text',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2–6). Web-only. Native platforms expose headings via accessibility traits',
      default: 3,
      attribute: 'heading-level',
      webOnly: true,
    },
    tone: {
      type: 'enum',
      description: 'Visual tone. `info` is the default informational treatment; `sensitive` adds emphasis for PII / financial sections; `neutral` is the quietest variant for inline section breaks',
      default: 'info',
      values: ['info', 'sensitive', 'neutral'],
    },
  },

  events: {},

  a11y: {
    role: 'region',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'default' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
