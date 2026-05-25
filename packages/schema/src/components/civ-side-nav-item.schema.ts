import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-side-nav-item',
  description: 'One row inside `<civ-side-nav>`. Renders in one of two modes chosen automatically by the presence of nested children. **Leaf** (no nested `<civ-side-nav-item>` children): renders as `<a href>`, or `<span aria-disabled="true">` when `disabled`. The current page sets `current` — that row gets `aria-current="page"` and a leading-edge primary-color accent rail. **Parent / section** (has nested children): renders as a `<button aria-expanded>` disclosure with a leading chevron caret that rotates 90° on open. Click anywhere on the row toggles. Parents are disclosure-only — `href` on a parent with children is ignored. Auto-expand: on first paint, any parent containing a descendant with `current` is automatically expanded so the active page is visible.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'Destination URL. Ignored when the item has nested children — parents are disclosure-only.',
      default: '',
    },
    current: {
      type: 'boolean',
      description: 'Mark as the active page. Sets `aria-current="page"` on leaf rows and applies the active visual style (leading-edge accent rail). Also drives auto-expand of ancestor parents on first paint.',
      default: false,
      reflect: true,
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — strips the href on leaf rows, renders as a non-interactive `<span>` with `aria-disabled="true"`, and applies disabled styling. On parent rows, disables the disclosure trigger.',
      default: false,
      reflect: true,
    },
    open: {
      type: 'boolean',
      description: 'Whether the disclosure panel is expanded. Only meaningful on parents with nested children. Auto-set to `true` on first paint if any descendant has `current` and `open` was not explicitly authored.',
      default: false,
      reflect: true,
    },
  },

  events: {
    'civ-toggle': {
      description: 'Fires when a parent row\'s expand state changes (user click or programmatic). Non-bubbling and non-composed (mirrors civ-disclosure / civ-accordion-item) so the event stays scoped to the consumer\'s listener.',
      detail: {
        open: { type: 'boolean', description: 'Whether the panel is now open' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking on link activation (leaf rows) or expand-state change (parent rows)',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`click` or `change`)' },
        details: { type: 'object', description: 'For change events: `{ open: boolean }`. For click events: undefined.' },
      },
    },
  },

  a11y: {
    // Host carries `role="listitem"` so the parent `civ-side-nav`'s
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
    {
      type: 'container',
      bindings: { tag: 'ul' },
      children: [{ type: 'slot' }],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
