import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tab-nav-item',
  description: 'A single tab-styled link inside `<civ-tab-nav>`. Renders as `<a href>` by default and as a non-interactive `<span aria-disabled="true">` when `disabled` is set. The active item should set `current`. It gets `aria-current="page"` and the selected-tab visual (primary color + bottom-border indicator).',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Visible tab text',
      default: '',
    },
    disabled: {
      type: 'boolean',
      description: 'Disables the tab — non-interactive and dimmed',
      default: false,
      reflect: true,
    },
    href: {
      type: 'string',
      description: 'Destination URL',
      default: '',
    },
    current: {
      type: 'boolean',
      description: 'Mark as the active page. Sets `aria-current="page"` and applies the selected-tab visual style (primary color + bottom-border indicator)',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    // Host carries `role="listitem"` so the parent `civ-tab-nav`'s
    // `<ul role="list">` reads as a list to assistive tech. Set in
    // `connectedCallback` rather than via render so the role survives
    // the parent's `<ul>` markup (a Lit-managed parent re-render
    // can't reach into the host element's attributes).
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
