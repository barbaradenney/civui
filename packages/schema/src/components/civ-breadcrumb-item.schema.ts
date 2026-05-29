import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-breadcrumb-item',
  description: 'A single link in a `<civ-breadcrumb>` trail. Renders as `<a href>` for navigable steps and as a non-link `<span aria-current="page">` when `current` is set or `href` is omitted (the convention for the final crumb. The page the user is on). Item label may be set via the `label` prop or as initial child text.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Visible breadcrumb text',
      default: '',
    },
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

  events: {
    'civ-analytics': {
      description: 'Analytics tracking event fired on interaction',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action that triggered the event' },
      },
    },
  },

  a11y: {
    // Host carries `role="listitem"` so the parent `civ-breadcrumb`'s
    // `<ol role="list">` reads as a list to assistive tech. Set in
    // `connectedCallback` rather than via render so the role survives
    // the parent's `<ol>` markup.
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
