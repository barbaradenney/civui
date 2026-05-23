import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-on-this-page',
  description: 'In-page navigation ("table of contents") — a vertical list of anchor links pointing at section headings in the current page. `IntersectionObserver` tracks which heading is currently in the viewport and flips the matching item\'s `active` flag so the highlight follows the reader\'s scroll position. Two usage modes: auto-detect headings via `selector` within `scopeSelector` (default), or slot explicit `<civ-on-this-page-item>` children for manual control.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Used in TWO places: (a) rendered as the visible heading above the list, and (b) set as `aria-label` on the `<nav>` landmark so screen-reader landmark navigation can identify the rail. Passing an empty string suppresses the visible heading but the landmark still gets a default `aria-label="On this page"` so it can be distinguished from other navs on the page',
      default: 'On this page',
    },
    selector: {
      type: 'string',
      description: 'CSS selector for the headings to track when auto-detecting. Only used when no explicit `<civ-on-this-page-item>` children are slotted',
      default: 'h2[id], h3[id]',
      webOnly: true,
    },
    scopeSelector: {
      type: 'string',
      description: 'CSS selector for the ancestor that contains the headings. The first match wins. Only used when auto-detecting',
      default: 'main, article, body',
      attribute: 'scope-selector',
      webOnly: true,
    },
  },

  events: {},

  a11y: {
    role: 'navigation',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'nav', ariaLabel: 'label' },
      children: [
        { type: 'label', bindings: { text: 'label' } },
        {
          type: 'container',
          bindings: { tag: 'ul' },
          children: [{ type: 'slot' }],
        },
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
