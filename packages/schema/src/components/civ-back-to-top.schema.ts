import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-back-to-top',
  description: 'Floating chip-style button anchored to the bottom-right viewport corner. Appears once the user has scrolled past `threshold` pixels; clicking smooth-scrolls back to the top. Honors `prefers-reduced-motion: reduce` — the scroll-to-top jump is instant for users who opted out of animations.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name for the button. Also shown as a tooltip via `title`',
      default: 'Back to top',
    },
    threshold: {
      type: 'number',
      description: 'Pixels scrolled before the button appears',
      default: 400,
    },
    hidden: {
      type: 'boolean',
      description: '**Internal state — treat as read-only.** Controlled by the component\'s `IntersectionObserver` (flips to `false` when the user scrolls past `threshold`, `true` when they scroll back up). Reflected so the global `[hidden]` HTML rule applies `display: none`. Consumers should NOT set this prop directly — writes are overwritten on the next scroll. Native implementers should expose visibility as derived state from their own scroll listener rather than as a writable input.',
      default: true,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'button',
      bindings: { ariaLabel: 'label', title: 'label' },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
