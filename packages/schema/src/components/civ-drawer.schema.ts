import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-drawer',
  description: 'Full-viewport-height dialog that slides in from the start or end edge. Built on the native `<dialog>` element on web (auto focus trap, Escape close, top-layer stacking). Sized to a configurable width; spans the full viewport height. Used for navigation menus (mobile main nav), settings panels, secondary content, and filter trays where a centered modal or bottom sheet would feel wrong.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    open: {
      type: 'boolean',
      description: 'Whether the drawer is currently visible. Reflects to the host attribute',
      default: false,
      reflect: true,
    },
    position: {
      type: 'enum',
      description: 'Which viewport edge the drawer slides in from. `start` = left in LTR, right in RTL; `end` = right in LTR, left in RTL. Uses logical properties so layouts mirror automatically.',
      default: 'start',
      values: ['start', 'end'],
    },
    width: {
      type: 'string',
      description: 'Drawer width as a CSS length (e.g. `320px`, `min(360px, 90vw)`). Mobile (≤480px) caps to the viewport width regardless of this value so content never overflows offscreen.',
      default: 'min(320px, 90vw)',
    },
    heading: {
      type: 'string',
      description: 'Visible heading rendered inside the drawer header',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2–6) for the drawer heading. Web-only — native platforms expose headings via `accessibilityAddTraits(.isHeader)` / Compose semantics',
      default: 2,
      attribute: 'heading-level',
      webOnly: true,
    },
    label: {
      type: 'string',
      description: 'Accessible label for the drawer (announced as the dialog name). Use this when no visible `heading` is set — e.g. a slide-in main-nav drawer might use `label="Main menu"` with the nav itself as its only content.',
      default: '',
    },
    noCloseButton: {
      type: 'boolean',
      description: 'Suppress the built-in close (×) button. Use when the consumer renders its own dismiss affordance',
      default: false,
      attribute: 'no-close-button',
    },
    noBackdropClose: {
      type: 'boolean',
      description: 'Disable click-outside-to-close. Useful when the drawer contains required-action affordances',
      default: false,
      attribute: 'no-backdrop-close',
    },
    noEscapeClose: {
      type: 'boolean',
      description: 'Disable Escape-key close. Pair with `noBackdropClose` to force users to the explicit affordance',
      default: false,
      attribute: 'no-escape-close',
    },
  },

  events: {
    'civ-drawer-close': {
      description: 'Fires when the drawer closes (via close button, backdrop, Escape, or programmatic close)',
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
