import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-process-list-item',
  description: 'A single step inside `<civ-process-list>`. Renders the numbered (or icon) marker + connecting segment on the leading edge, then a stack of heading + slotted body on the trailing edge. The marker shows an auto-incremented step number by default (via a CSS counter on the parent list); the `complete` state swaps the number for a check icon plus a success-tinted background, and an explicit `icon` prop overrides both.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    heading: {
      type: 'string',
      description: 'Step title rendered prominently above the body content.',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2-6) used for the rendered heading\'s `aria-level`. Set to one below the surrounding section heading so the screen-reader rotor lists steps under their parent.',
      default: 3,
      attribute: 'heading-level',
    },
    state: {
      type: 'enum',
      description: 'Visual state. `default` shows the auto-incremented step number in a primary-tinted marker. `complete` swaps to a check icon in a success-tinted marker — use when the step has been finished.',
      default: 'default',
      values: ['default', 'complete'],
      reflect: true,
    },
    icon: {
      type: 'string',
      description: 'Optional icon name from the CivUI icon library. When set, replaces the auto-number or check icon in the marker — use for steps with a more specific affordance (e.g. `lock` for authentication, `mail` for verification).',
      default: '',
    },
  },

  events: {},

  a11y: {
    role: 'listitem',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading' } },
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
