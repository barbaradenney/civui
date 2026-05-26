import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-on-this-page-item',
  description: 'A single anchor link inside `<civ-on-this-page>`. Renders as `<a href="#fragment">`. The parent `<civ-on-this-page>` flips `active` on the item whose target heading is currently in the viewport via `IntersectionObserver` — consumers don\'t set `active` themselves. Item label may be set via the `label` prop or as initial child text.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Visible TOC link text. Falls back to initial child text content if unset',
      default: '',
    },
    href: {
      type: 'string',
      description: 'Fragment URL (e.g. `#installation`). The parent reads this to locate the corresponding heading element',
      default: '',
    },
    current: {
      type: 'boolean',
      description: 'Set by the parent when this item\'s target heading is the closest one currently in the viewport. Reflects to `aria-current="location"` and a visual indicator',
      default: false,
      reflect: true,
    },
  },

  events: {},

  a11y: {
    // Host carries `role="listitem"` so the parent `civ-on-this-page`'s
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
