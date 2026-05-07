import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-modal',
  description: 'Accessible modal dialog. Renders as a native `<dialog>` on web (auto-traps focus, restores focus on close, closes on Escape). On mobile (≤480px) the dialog is bottom-anchored as a sheet via `.civ-bottom-sheet`. Native platforms use platform-idiomatic full-screen / sheet presentations.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    open: {
      type: 'boolean',
      description: 'Whether the modal is currently visible. Reflects to the host attribute',
      default: false,
      reflect: true,
    },
    heading: {
      type: 'string',
      description: 'Visible heading rendered inside the modal',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2–6) for the modal heading. Web-only — native platforms expose headings via `accessibilityAddTraits(.isHeader)` / Compose semantics',
      default: 2,
      attribute: 'heading-level',
      webOnly: true,
    },
    noCloseButton: {
      type: 'boolean',
      description: 'Suppress the built-in close (×) button. Use when the consumer renders its own dismiss affordance',
      default: false,
      attribute: 'no-close-button',
    },
    noBackdropClose: {
      type: 'boolean',
      description: 'Disable click-outside-to-close. Useful when the modal contains required-action affordances',
      default: false,
      attribute: 'no-backdrop-close',
    },
    noEscapeClose: {
      type: 'boolean',
      description: 'Disable Escape-key close. Pair with noBackdropClose to force users to the explicit affordance',
      default: false,
      attribute: 'no-escape-close',
    },
  },

  events: {
    'civ-modal-close': {
      description: 'Fires when the modal closes (via close button, backdrop, Escape, or programmatic close)',
      detail: {},
    },
  },

  a11y: {
    role: 'dialog',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-modal': 'true',
    },
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'dialog' },
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'button', condition: '!noCloseButton', bindings: { action: 'close' } },
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
