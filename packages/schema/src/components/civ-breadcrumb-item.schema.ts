import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-breadcrumb-item',
  description: 'A single link in a `<civ-breadcrumb>` trail. Renders as `<a href>` for navigable steps and as a non-link `<span aria-current="page">` when `current` is set or `href` is omitted (the convention for the final crumb. The page the user is on). Item label may be set via the `label` prop or as initial child text.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'Destination URL. Omit on the last item, or set `current`, to render as a non-link `<span aria-current="page">`',
      default: '',
    },
    current: {
      type: 'boolean',
      description: 'Mark as the current page. Forces non-link rendering with `aria-current="page"` regardless of `href`',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
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
