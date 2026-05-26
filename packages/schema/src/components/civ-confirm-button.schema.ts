import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-confirm-button',
  description: 'Text button that fires an action and shows a transient ✓ confirmation before reverting. Used for fire-and-forget actions whose feedback needs to be visible inline without yanking the user to a toast — Copy, Paste, Scan, Generate. Consumer does the actual work in the `civ-confirm` listener; the component manages the success-window timing and visual swap. Padding stays stable across states (the variant class is held constant; only the `.is-success` flag is added) so the button does not visibly shrink mid-confirmation. For two-state toggles (Show / Hide) use `civ-toggle-button`; for primary form CTAs use `civ-button`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Resting label ("Copy", "Generate", "Scan"). Required — there is no fallback because the verb is intent-specific',
      default: '',
    },
    successLabel: {
      type: 'string',
      description: 'Transient receipt label shown during the success window ("Copied", "Generated"). Defaults to the localized "Done"',
      default: '',
      attribute: 'success-label',
    },
    successMs: {
      type: 'number',
      description: 'How long the success state stays visible, in milliseconds. Default 1500. Re-clicks during the window restart the timer (no stacking)',
      default: 1500,
      attribute: 'success-ms',
    },
    emphasis: {
      type: 'enum',
      description: 'Visual emphasis. `secondary` (default) is the gray pill — the common case (helper-row Copy buttons). `primary` is the filled brand pill for a louder inline CTA (e.g. "Generate" alongside a read-only field). `tertiary` is the transparent text-link style for quiet shortcuts inside dense surfaces',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    variant: {
      type: 'enum',
      description: '**Deprecated** alias for `emphasis`. `variant="chip"` maps to `emphasis="secondary"`; `variant="inline"` maps to `emphasis="tertiary"`. Setting this prop emits a one-time dev warning and overrides `emphasis`. Will be removed in the next major release',
      default: '',
      values: ['', 'chip', 'inline'],
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — the button is inert and suppresses the `civ-confirm` event. The success-state receipt does not appear',
      default: false,
      reflect: true,
    },
  },

  events: {
    'civ-confirm': {
      description: 'Fires on activation, BEFORE entering the success window. Consumer does the work in the listener (clipboard write, file save, share). The component starts the success timer immediately regardless of whether the work succeeds; consumers can call `.reset()` to cancel the receipt if the work fails',
      detail: {},
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    // The receipt label is announced on activation via the shared
    // polite live-region queue owned by the platform's a11y
    // infrastructure (web: @civui/core/a11y/live-region.ts; native
    // platforms route through their own accessibility APIs:
    // AccessibilityNotification.announcement on iOS,
    // AccessibilityEvent.TYPE_ANNOUNCEMENT on Android). The button
    // itself does not carry an `aria-live` attribute — toggling it
    // during the success window is racy on NVDA / JAWS.
  },

  renderOrder: [
    // Renders a single button whose label text swaps between
    // `label` (resting) and `successLabel` (during the success
    // window, with a check icon ✓ prefix). Native implementers
    // toggle the displayed text on activation and revert after
    // `successMs`. The component does NOT accept slotted children.
    {
      type: 'button',
      children: [
        { type: 'label', bindings: { text: 'label' } },
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
