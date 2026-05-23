import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-side-nav-heading',
  description: 'A non-interactive section header that labels a group of `<civ-side-nav-item>` siblings inside `<civ-side-nav>`. Modeled on the VA Design System\'s side-nav section headers — small uppercase muted text that groups related links by topic. Use when a sidebar has multiple distinct categories that themselves aren\'t navigation targets, or when the disclosure parent\'s chevron is misleading because the children are always visible. The host carries `role="presentation"` so screen readers don\'t announce it as a list item inside the surrounding `<ul>`.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Visible header text. Required.',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Optional integer 1–6. When set, wraps the label in an `<h1>`–`<h6>` for screen-reader rotor navigation. Visual treatment stays the same across levels — heading-level only affects assistive-tech navigation, not the rendered font size or weight. Values outside 1–6 trigger a dev-mode warning and fall back to a plain `<span>`. Web-only; native platforms expose section semantics through their own header conventions.',
      attribute: 'heading-level',
      webOnly: true,
    },
  },

  events: {},

  a11y: {
    role: 'presentation',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'span' },
      children: [{ type: 'label', bindings: { text: 'label' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
