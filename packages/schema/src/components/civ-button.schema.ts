import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-button',
  description: 'Standard interactive button. Three visual variants (primary / secondary / tertiary) with an optional `danger` modifier for destructive actions. Renders a real `<button>` element on web (native focus ring applied automatically); native platforms map to `Button` / `Button { Text }`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    emphasis: {
      type: 'enum',
      description: 'Visual emphasis. `primary` = solid filled (main page action); `secondary` = bordered; `tertiary` = text-only',
      default: 'primary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    danger: {
      type: 'boolean',
      description: 'Apply destructive-action styling (red palette). Combine with any variant',
      default: false,
      reflect: true,
    },
    type: {
      type: 'enum',
      description: 'HTML button type. `submit` triggers the enclosing form; `reset` clears it; `button` (default) does neither',
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
    loading: {
      type: 'boolean',
      description: 'Async-in-flight state. Swaps the leading icon for a `civ-spinner`, disables the button, and sets `aria-busy`. Link-mode buttons (`href` set) ignore `loading` because navigation isn\'t a state we wait on',
      default: false,
      reflect: true,
    },
    loadingLabel: {
      type: 'string',
      description: 'Accessible name applied as `aria-label` on the host while `loading` is true, and announced once via `@civui/core`\'s shared `announce()` queue on the loading transition. Empty default falls back to the locale\'s `buttonLoadingLabel` ("Loading…" in English). Pass an action-specific present-participle verb ("Saving…", "Submitting your application…") for clarity',
      default: '',
      attribute: 'loading-label',
    },
    href: {
      type: 'string',
      description: 'When set, renders as `<a href>` instead of `<button>`. For navigation affordances that visually belong with other buttons (e.g. an "Add another" link styled as a secondary button). The label is underlined so the link identity stays visible',
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
      bindings: { label: 'label' },
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
