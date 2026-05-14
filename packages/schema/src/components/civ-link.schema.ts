import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-link',
  description: 'Anchor-based link with four visual variants (primary / secondary / tertiary / back). Renders a real `<a>` on web (native focus ring applied automatically); native platforms map to a styled tappable Text. Set `type` to `phone` / `email` / `download` for device-action shortcuts that auto-build the href, leading icon, and display text. Automatically appends `target="_blank" rel="noopener noreferrer"` when `new-tab` is set.',
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
      description: 'Visual emphasis. `primary` = bold underlined link with trailing caret (most prominent); `secondary` (default) = plain underlined link; `back` = back-navigation link with leading left chevron. For a navigation affordance that should look like a button, use `<civ-button href="…">` instead — that renders an `<a>` with button chrome plus an underline',
      default: 'secondary',
      values: ['primary', 'secondary', 'back'],
    },
    type: {
      type: 'enum',
      description: 'Device-action type — auto-builds the href, leading icon, and default display text. `phone` → `tel:` with phone icon; `email` → `mailto:` with mail icon and optional subject; `download` → passthrough href with download icon and optional filename / file-size suffix',
      values: ['phone', 'email', 'download'],
    },
    number: {
      type: 'string',
      description: 'Phone number when `type="phone"`. Stripped of non-digit characters before being used in `tel:`. Formatted as `(NNN) NNN-NNNN` for the display text when 10 digits',
      default: '',
    },
    address: {
      type: 'string',
      description: 'Email address when `type="email"`. Used both as the `mailto:` target and as the default display text',
      default: '',
    },
    subject: {
      type: 'string',
      description: 'Pre-filled email subject when `type="email"`. URL-encoded into the mailto: query string',
      default: '',
    },
    filename: {
      type: 'string',
      description: 'Suggested download filename when `type="download"`. Falls back as the value of the underlying `download` attribute and as the default display text',
      default: '',
    },
    fileSize: {
      type: 'string',
      description: 'Human-readable file size suffix when `type="download"` (e.g. "1.2 MB"). Rendered as small parenthetical text after the link label',
      default: '',
      attribute: 'file-size',
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
