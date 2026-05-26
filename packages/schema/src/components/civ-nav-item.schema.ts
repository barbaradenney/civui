import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-nav-item',
  description: 'A single link inside `<civ-nav>`. Renders as `<a href>` by default and as a non-interactive `<span aria-disabled="true">` when `disabled` is set. The active item should set `current`. It gets `aria-current="page"` plus a persistent underline so the active page reads as such even without keyboard focus.',
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
      description: 'Mark as the active page. Sets `aria-current="page"` and applies the active visual style (underline + primary color)',
      default: false,
      reflect: true,
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — renders as a non-interactive `<span aria-disabled="true">` instead of `<a href>`',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    // Host carries `role="listitem"` so the parent `civ-nav`'s
    // `<ul role="list">` reads as a list to assistive tech. Set in
    // `connectedCallback` rather than via render so the role survives
    // the parent's `<ul>` markup.
    role: 'listitem',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'a' },
      children: [{ type: 'label', bindings: { text: 'label' } }],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
