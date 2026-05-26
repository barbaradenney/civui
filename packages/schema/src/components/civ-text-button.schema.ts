import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-text-button',
  description: 'The small button primitive — a thin element wrapping the shared `.civ-text-btn` chrome that `civ-disclosure`, `civ-read-more`, `civ-confirm-button`, and `civ-toggle-button` all compose. Use when you need a click affordance with the text-btn visual idiom but none of the state-machine behaviors of the confirm / toggle siblings. For heavier page-level CTAs use `civ-button`; for toolbar / row actions use `civ-action-button`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Button text. Required — there is no fallback because the verb is intent-specific',
      default: '',
    },
    emphasis: {
      type: 'enum',
      description: 'Visual emphasis. `primary` is a filled brand pill — loudest text-btn, reserve for the rare inline CTA. `secondary` (default) is the gray pill, the common case (state-toggling, helper-row affordances). `tertiary` is the transparent text-link style for quiet shortcuts inside dense surfaces (date-picker "Today", time-picker "Now")',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    spacing: {
      type: 'enum',
      description: 'Density. `sm` shrinks padding and font-size for dense prose / read-more contexts',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name. Rendered with `aria-hidden="true"` so the label remains the accessible name',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name. Rendered with `aria-hidden="true"`',
      default: '',
      attribute: 'icon-end',
    },
    type: {
      type: 'enum',
      description: 'HTML button type. Defaults to `button` so the text-button never accidentally submits a surrounding form when placed inside one',
      default: 'button',
      values: ['button', 'submit', 'reset'],
    },
    loading: {
      type: 'boolean',
      description: 'Async-in-flight state. Swaps the leading icon for a `civ-spinner` (xs size), disables the button, and sets `aria-busy`. Use during in-flight async work (Generate / Scan / Copy that hits the network)',
      default: false,
      reflect: true,
    },
    loadingLabel: {
      type: 'string',
      description: 'Accessible name applied as `aria-label` while `loading` is true, and announced once via `@civui/core`\'s shared `announce()` queue on the loading transition. Empty default falls back to the locale\'s `buttonLoadingLabel` ("Loading…" in English). Pass an action-specific present-participle verb ("Generating…", "Scanning…")',
      default: '',
      attribute: 'loading-label',
    },
  },

  events: {
    'civ-click': {
      description: 'Fires on activation. Disabled buttons do not dispatch',
      detail: {},
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'button',
      children: [
        { type: 'icon', condition: 'iconStart', bindings: { name: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
        { type: 'icon', condition: 'iconEnd', bindings: { name: 'iconEnd' } },
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
