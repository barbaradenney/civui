import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-spinner',
  description: 'Indeterminate loading indicator for short waits (200ms–~1s) where the shape of incoming content is unknown. For longer waits with a known content shape, use `civ-skeleton` instead. Host carries `role="status"` + `aria-live="polite"` so the visually-hidden `label` is announced once on first appearance. Built-in `delay` (default 200ms before render) and `minDuration` (default 400ms minimum on-screen) protect against flash on fast responses. Spinner rotation is functional, not decorative — it keeps animating (slowed) under `prefers-reduced-motion`, the lone carve-out in CivUI\'s otherwise global motion-kill rule.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    size: {
      type: 'enum',
      description: 'Diameter. `sm` = 1rem, `md` = 1.5rem (default), `lg` = 2rem. Color inherits from `currentColor` so the spinner sits naturally on top of any container',
      default: 'md',
      values: ['sm', 'md', 'lg'],
      reflect: true,
    },
    label: {
      type: 'string',
      description: 'Accessible name announced via the host\'s `aria-live="polite"` region. Use a present-participle verb specific to the action ("Saving your application…", not generic "Loading")',
      default: 'Loading…',
    },
    delay: {
      type: 'number',
      description: 'Milliseconds to wait before rendering anything. Fast responses (sub-200ms) never paint a spinner at all, avoiding the flash-then-disappear flicker',
      default: 200,
    },
    minDuration: {
      type: 'number',
      description: 'Minimum on-screen time once the spinner has appeared. Once visible, the spinner stays for at least this long so the user perceives a state change rather than a flicker. Consumers awaiting `waitForMinDuration()` honor this before unmounting',
      default: 400,
      attribute: 'min-duration',
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
      bindings: { label: 'label' },
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
