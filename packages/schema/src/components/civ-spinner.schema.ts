import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-spinner',
  description: 'Indeterminate loading indicator for short waits (200ms–~1s) where the shape of incoming content is unknown. For longer waits with a known content shape, use `civ-skeleton` instead. Host gains `role="img"` + `aria-label="${label}"` when visible (so AT users discovering it later hear the label) and fires a single announcement via `@civui/core`\'s shared queue (so concurrent spinners don\'t stack). Built-in `delay` (default 200ms before render) and `minDuration` (default 400ms minimum on-screen) protect against flash on fast responses; reconnects reset visibility so the contract holds across every mount cycle. Spinner rotation is functional, not decorative — it keeps animating (slowed) under `prefers-reduced-motion`. Use `decorative` when nesting inside a parent that already announces busy state (e.g. `civ-button[loading]`).',
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
      description: 'Accessible name applied as `aria-label` on the host and announced once via @civui/core\'s `announce()` queue when the spinner becomes visible. Empty default — the locale\'s `spinnerDefaultLabel` ("Loading…" in English) is used when unset. Pass an action-specific present-participle verb ("Saving your application…") for clarity',
      default: '',
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
    decorative: {
      type: 'boolean',
      description: 'Suppress all AT semantics — no `role`, no `aria-label`, no announcement. Use when nesting the spinner inside a parent that already signals busy state (e.g. `<civ-button loading>` which sets `aria-busy="true"` and announces `loadingLabel` itself). Avoids the NVDA/JAWS aria-busy-buffering trap that would swallow the spinner\'s own live region',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    // The host carries `role="img"` + `aria-label="${label}"` when
    // visible, suppressed entirely under `decorative` or an
    // `aria-busy` ancestor. The "Loading" announcement uses the
    // shared aria-live region, not the host itself, so the host
    // doesn't need `role="status"` semantics.
    role: 'img',
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
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
