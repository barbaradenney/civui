import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-modal',
  description: 'Accessible modal dialog. Renders as a native `<dialog>` on web (auto-traps focus, restores focus on close, closes on Escape). On mobile (≤480px) the dialog is bottom-anchored as a sheet via `.civ-bottom-sheet`. Native platforms use platform-idiomatic full-screen / sheet presentations.',
  category: 'overlay',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name (`aria-label`) for the dialog when no `heading` is set. If both are provided, `heading` wins for the visible title and `label` is ignored',
      default: '',
    },
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
      description: 'Semantic heading level (2–6) for the modal heading. Web-only. Native platforms expose headings via `accessibilityAddTraits(.isHeader)` / Compose semantics',
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
    spacing: {
      type: 'enum',
      description: 'Inner padding density. `default` keeps the established 24px chrome with 16px header/body/footer rhythm. `sm` shrinks to 16px chrome + 12px rhythm for dense admin quick-action dialogs. Pure shrink per Contract A — no chrome dropped. Web-only: native platforms have their own density mechanisms (iOS size classes, Compose dynamic type) and modal presentation styles vary by OS.',
      default: 'default',
      values: ['default', 'sm'],
      reflect: true,
      webOnly: true,
    },
  },

  events: {
    'civ-close': {
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
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
