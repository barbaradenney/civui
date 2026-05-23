import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-side-nav-item',
  description: 'A single link inside `<civ-side-nav>`. Renders as `<a href>` by default and as a non-interactive `<span aria-disabled="true">` when `disabled` is set. The current page should set `current` — that item gets `aria-current="page"` plus a leading-edge primary-color accent rail. Nested `<civ-side-nav-item>` children render as an indented sub-list under the parent.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'Destination URL',
      default: '',
    },
    current: {
      type: 'boolean',
      description: 'Mark as the active page. Sets `aria-current="page"` and applies the active visual style (leading-edge accent rail)',
      default: false,
      reflect: true,
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — strips the href, renders as a non-interactive `<span>` with `aria-disabled="true"`, and applies disabled styling',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    role: 'link',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'a' },
      children: [{ type: 'label', bindings: { text: 'label' } }],
    },
    {
      type: 'container',
      bindings: { tag: 'ul' },
      children: [{ type: 'slot' }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
