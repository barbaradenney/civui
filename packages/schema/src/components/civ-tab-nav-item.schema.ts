import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tab-nav-item',
  description: 'A single tab-styled link inside `<civ-tab-nav>`. Renders as `<a href>` by default and as a non-interactive `<span aria-disabled="true">` when `disabled` is set. The active item should set `current` — it gets `aria-current="page"` and the selected-tab visual (primary color + bottom-border indicator).',
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
      description: 'Mark as the active page. Sets `aria-current="page"` and applies the selected-tab visual style (primary color + bottom-border indicator)',
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
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
