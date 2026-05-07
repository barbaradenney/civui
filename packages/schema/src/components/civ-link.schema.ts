import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-link',
  description: 'Anchor-based link with three visual variants (primary / secondary / tertiary). Renders a real `<a>` on web (native focus ring applied automatically); native platforms map to a styled tappable Text. Automatically appends `target="_blank" rel="noopener noreferrer"` when `new-tab` is set.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'Link destination. Empty href renders the link as a non-interactive span',
      default: '',
    },
    variant: {
      type: 'enum',
      description: 'Visual emphasis. `tertiary` (default) = standard underlined link; `primary` and `secondary` apply heavier styling for prominent inline links',
      default: 'tertiary',
      values: ['primary', 'secondary', 'tertiary'],
    },
    danger: {
      type: 'boolean',
      description: 'Apply destructive-action styling (red palette)',
      default: false,
      reflect: true,
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name (e.g. external-link arrow)',
      default: '',
      attribute: 'icon-end',
    },
    target: {
      type: 'string',
      description: 'HTML `target` attribute. Web-only — use `new-tab` for the common "open in new tab" case',
      default: '',
      webOnly: true,
    },
    rel: {
      type: 'string',
      description: 'HTML `rel` attribute. Web-only — `new-tab` automatically sets `rel="noopener noreferrer"`',
      default: '',
      webOnly: true,
    },
    download: {
      type: 'string',
      description: 'HTML `download` attribute (suggested filename). Web-only — native platforms handle downloads via OS share/save sheets',
      default: '',
      webOnly: true,
    },
    newTab: {
      type: 'boolean',
      description: 'Open the link in a new tab/window. Sets `target="_blank"` + `rel="noopener noreferrer"` and adds an external-link icon. Web-only — native platforms route URLs through the OS, which has no "new tab" concept',
      default: false,
      attribute: 'new-tab',
      webOnly: true,
    },
  },

  events: {},

  a11y: {
    role: 'link',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'a' },
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
