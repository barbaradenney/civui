import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-action-button',
  description: 'Compact action button intended for inline / contextual actions (e.g. inside cards, list rows, table cells). Distinct from `civ-button` which is the page-level primary affordance. Supports a tri-state `pressed` prop for toggle / mute / favorite affordances.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    variant: {
      type: 'enum',
      description: 'Visual emphasis. Same scale as civ-button but defaults to `tertiary` (text-only) for inline contexts',
      default: 'tertiary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    danger: {
      type: 'boolean',
      description: 'Apply destructive-action styling',
      default: false,
      reflect: true,
    },
    pressed: {
      type: 'boolean',
      description: 'Tri-state pressed/active indicator. `true` = active (e.g. favorited); `false` = inactive but toggle-aware (sets aria-pressed="false"); omitted = no toggle semantics',
      reflect: true,
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
    href: {
      type: 'string',
      description: 'When set, renders as `<a href>` instead of `<button>` — for navigation affordances that visually belong with other action buttons (e.g. an Edit link next to a Remove button in a list row). The label gets underlined so the link identity stays visible',
      default: '',
    },
    target: {
      type: 'string',
      description: 'HTML `target` attribute (link mode only). Web-only — use `new-tab` for the common "open in new tab" case',
      default: '',
      webOnly: true,
    },
    rel: {
      type: 'string',
      description: 'HTML `rel` attribute (link mode only). Web-only — `new-tab` automatically sets `rel="noopener noreferrer"`',
      default: '',
      webOnly: true,
    },
    download: {
      type: 'string',
      description: 'HTML `download` attribute (link mode only, suggested filename). Web-only — native platforms handle downloads via OS share/save sheets',
      default: '',
      webOnly: true,
    },
    newTab: {
      type: 'boolean',
      description: 'Open the link in a new tab/window (link mode only). Sets `target="_blank"` + `rel="noopener noreferrer"`. Web-only — native platforms route URLs through the OS, which has no "new tab" concept',
      default: false,
      attribute: 'new-tab',
      webOnly: true,
    },
  },

  events: {},

  a11y: {
    role: 'button',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'button',
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', condition: 'iconEnd', bindings: { text: 'iconEnd' } },
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
