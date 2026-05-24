import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-support-resources',
  description: 'Inline crisis / support contact panel for sensitive forms. Renders a heading and a slot of action links pointing to hotlines or counselors. The crisis tone applies an error-bordered visual treatment to mark urgent context (suicide / crisis / domestic-violence flows).',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    heading: {
      type: 'string',
      description: 'Heading text rendered above the resource list',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level for the rendered heading (2–6). The component sets `role="heading"` + `aria-level=N`',
      default: 3,
      attribute: 'heading-level',
    },
    tone: {
      type: 'enum',
      description: 'Visual tone. `default` is a quiet supportive panel; `crisis` adds an error-bordered, higher-urgency treatment for suicide / crisis / domestic-violence flows',
      default: 'default',
      values: ['default', 'crisis'],
    },
  },

  events: {},

  a11y: {
    role: 'complementary',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'civ-callout', role: 'complementary' },
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'default' } },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
