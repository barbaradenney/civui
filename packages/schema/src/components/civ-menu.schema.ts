import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-menu',
  description: 'Anchored on-page menu for row actions and overflow menus. Composes a slotted trigger with a popup panel of `civ-menu-item` children. Renders as a popover on desktop (≥481px) and as a bottom sheet on mobile (≤480px). Follows the WAI-ARIA Menu Button keyboard pattern: Enter/Space/ArrowDown on trigger opens and focuses the first item; ArrowUp/ArrowDown move between items; Home/End jump to ends; Escape closes and returns focus to the trigger.',
  category: 'overlay',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    open: {
      type: 'boolean',
      description: 'Controlled open state. When omitted the menu manages its own state. Reflects to the host attribute',
      default: false,
      reflect: true,
    },
    label: {
      type: 'string',
      description: 'Accessible name for the menu (`aria-label` on the `role="menu"` container). Strongly recommended. Without one, screen reader users see an unnamed menu',
      default: '',
    },
    align: {
      type: 'enum',
      description: 'Horizontal alignment of the panel relative to the trigger. `end` (default) right-aligns; `start` left-aligns. Auto-flips with RTL via logical properties',
      values: ['start', 'end'],
      default: 'end',
    },
  },

  events: {
    'civ-open': {
      description: 'Fires when the menu opens (via trigger click, Enter/Space, ArrowDown/ArrowUp, or programmatic open)',
      detail: {},
    },
    'civ-close': {
      description: 'Fires when the menu closes (via Escape, Tab, click outside, item activation, or programmatic close)',
      detail: {},
    },
    'civ-select': {
      description: 'Fires when a menu item is activated',
      detail: {
        value: { type: 'string', description: 'The activated item\'s `value` prop (omitted if not set)' },
        index: { type: 'number', description: 'Zero-based index of the activated item among enabled items' },
      },
    },
  },

  a11y: {
    role: 'menu',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-haspopup': 'menu',
      'aria-expanded': 'false',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'slot', bindings: { name: 'data-civ-menu-trigger' } },
        { type: 'container', condition: 'open', children: [{ type: 'slot', bindings: { name: 'default' } }] },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
