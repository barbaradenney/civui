import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-confirmation-panel',
  description: 'Post-submission success surface for government forms. Renders an accessible status header (success icon + heading), an optional reference-number callout (or pending-reference message), a "what happens next" section, and an action row. Aligned with the USWDS confirmation pattern — restrained left-border success treatment rather than a full-bleed banner. The host focuses the heading on mount and announces the message politely to screen readers.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    heading: {
      type: 'string',
      description: 'Success message heading. Required for accessible labelling.',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (1–6). Defaults to 1 because confirmation pages typically replace the form page entirely. Web-only. Native platforms expose headings via accessibility traits',
      default: 1,
      attribute: 'heading-level',
      webOnly: true,
    },
    reference: {
      type: 'string',
      description: 'Optional reference / case / confirmation number. When set, renders the bordered summary-box callout. Omit to render the `pending-reference` slot instead (e.g. when an async backend produces the reference later).',
      default: '',
    },
    referenceLabel: {
      type: 'string',
      description: 'Label shown above the reference number.',
      default: 'Reference number',
      attribute: 'reference-label',
    },
    noAutofocus: {
      type: 'boolean',
      description: 'When true, the panel does not move focus to the heading on mount. Use when the surrounding page manages focus / SR announcements itself.',
      default: false,
      attribute: 'no-autofocus',
    },
  },

  events: {},

  a11y: {
    role: 'status',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'default' } },
        // The reference callout and the pending-reference slot are
        // mutually exclusive — `reference` set renders the callout
        // and suppresses the pending slot; `reference` empty does
        // the opposite. The `!reference` convention is the same
        // negation pattern used in civ-modal / civ-drawer
        // (`!noCloseButton`) and civ-form-step (`!hideNav`).
        { type: 'label', condition: 'reference', bindings: { text: 'reference' } },
        { type: 'slot', condition: '!reference', bindings: { name: 'pending-reference' } },
        { type: 'slot', bindings: { name: 'next-steps' } },
        { type: 'slot', bindings: { name: 'actions' } },
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
