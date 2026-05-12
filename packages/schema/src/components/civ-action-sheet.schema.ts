import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-action-sheet',
  description: 'Bottom-anchored action sheet for mobile-first selection / confirmation flows. On web it is a fixed-positioned panel that slides up from the bottom; iOS uses `.confirmationDialog`/`.sheet`; Android uses a `ModalBottomSheet`.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    open: {
      type: 'boolean',
      description: 'Whether the action sheet is visible. Reflects to the host attribute',
      default: false,
      reflect: true,
    },
    maxHeight: {
      type: 'string',
      description: 'Maximum height of the sheet. CSS length value on web (e.g. `50vh`, `400px`)',
      default: '50vh',
      attribute: 'max-height',
    },
    trapFocus: {
      type: 'boolean',
      description: 'Trap keyboard focus inside the sheet while open. Web-specific behavior — native platforms manage focus via the OS sheet primitive',
      default: false,
      attribute: 'trap-focus',
      webOnly: true,
    },
    noClickOutside: {
      type: 'boolean',
      description: 'Disable click-outside-to-close. Force users to the explicit dismiss affordance',
      default: false,
      attribute: 'no-click-outside',
    },
  },

  events: {
    'civ-action-sheet-close': {
      description: 'Fires when the sheet closes (via swipe-down, backdrop tap, Escape, or programmatic close)',
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
      children: [{ type: 'slot', bindings: { name: 'default' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
