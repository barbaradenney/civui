import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-action-button',
  description: 'Compact action button intended for inline / contextual actions (e.g. inside cards, list rows, table cells). Distinct from `civ-button` which is the page-level primary affordance. Supports a tri-state `pressed` prop for toggle / mute / favorite affordances.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    emphasis: {
      type: 'enum',
      description: 'Visual emphasis. Same scale as civ-button but defaults to `tertiary` (text-only) for inline contexts',
      default: 'tertiary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    spacing: {
      type: 'enum',
      description: 'Density variant. `sm` shrinks padding, min-height, and font-size so the button sits flush next to `civ-input--sm` in dense surfaces like data-grid cell editors or compact input-groups',
      default: 'default',
      values: ['default', 'sm'],
    },
    danger: {
      type: 'boolean',
      description: 'Apply destructive-action styling',
      default: false,
      reflect: true,
    },
    loading: {
      type: 'boolean',
      description: 'Async-in-flight state. Swaps the leading icon for a `civ-spinner`, disables the button, and sets `aria-busy`. Use during in-flight async work (apply filter, refresh data, archive selected). Link-mode (`href` set) ignores `loading` because navigation isn\'t a state we wait on',
      default: false,
      reflect: true,
    },
    loadingLabel: {
      type: 'string',
      description: 'Accessible name applied as `aria-label` while `loading` is true, and announced once via `@civui/core`\'s shared `announce()` queue on the loading transition. Empty default falls back to the locale\'s `buttonLoadingLabel` ("Loading…" in English). Pass an action-specific present-participle verb ("Applying…", "Archiving…")',
      default: '',
      attribute: 'loading-label',
    },
    pressed: {
      type: 'boolean',
      description: 'Tri-state pressed/active indicator. `true` = active (e.g. favorited); `false` = inactive but toggle-aware (sets aria-pressed="false"); omitted = no toggle semantics',
      reflect: true,
    },
    current: {
      type: 'boolean',
      description: 'Marks this button as the current item in a navigation set (e.g. active page in pagination, current step in a wizard). Renders `aria-current="page"` on the inner `<button>`. Distinct from `pressed` (toggle-button semantics)',
      default: false,
      reflect: true,
    },
    ariaLabel: {
      type: 'string',
      description: 'Override the inner `<button>`\'s accessible name with a richer label for AT (e.g. pagination "Page 3 of 10" vs the visible "3"). When unset (omitted) or set to the empty string, the visible `label` doubles as the accessible name (an empty `aria-label` would otherwise strip the accessible name per ARIA spec — the component coerces it to "no override"). While `loading` is true, the host\'s `aria-label` is replaced by `loadingLabel` for the duration of the loading state; the consumer-supplied override is restored when loading flips off. Native platforms handle this through their own accessibility APIs (`.accessibilityLabel` on iOS, `contentDescription` on Android) so this prop is web-specific',
      attribute: 'aria-label',
      webOnly: true,
    },
    type: {
      type: 'enum',
      description: 'HTML button type',
      default: 'button',
      values: ['button', 'submit', 'reset'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name',
      default: '',
      attribute: 'icon-end',
    },
    iconOnly: {
      type: 'boolean',
      description: 'Render the `label` visually hidden so only the icon is visible; the label still provides the accessible name. Use for square icon buttons such as kebab triggers, close buttons, or compact toolbar actions. Requires at least one of `iconStart` / `iconEnd` to be set',
      default: false,
      attribute: 'icon-only',
      reflect: true,
    },
    href: {
      type: 'string',
      description: 'When set, renders as `<a href>` instead of `<button>`. For navigation affordances that visually belong with other action buttons (e.g. an Edit link next to a Remove button in a list row). The label gets underlined so the link identity stays visible',
      default: '',
    },
    target: {
      type: 'string',
      description: 'HTML `target` attribute (link mode only). Web-only. Use `new-tab` for the common "open in new tab" case',
      default: '',
      webOnly: true,
    },
    rel: {
      type: 'string',
      description: 'HTML `rel` attribute (link mode only). Web-only. `new-tab` automatically sets `rel="noopener noreferrer"`',
      default: '',
      webOnly: true,
    },
    download: {
      type: 'string',
      description: 'HTML `download` attribute (link mode only, suggested filename). Web-only. Native platforms handle downloads via OS share/save sheets',
      default: '',
      webOnly: true,
    },
    newTab: {
      type: 'boolean',
      description: 'Open the link in a new tab/window (link mode only). Sets `target="_blank"` + `rel="noopener noreferrer"`. Web-only. Native platforms route URLs through the OS, which has no "new tab" concept',
      default: false,
      attribute: 'new-tab',
      webOnly: true,
    },
  },

  events: {},

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
