import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-popover',
  description: 'Low-level popover primitive: a slotted trigger anchored to a floating panel. Handles trigger ARIA wiring (`aria-haspopup`, `aria-expanded`, `aria-controls`), click-outside / Escape / Tab close with focus return, viewport-aware position with auto-flip, and the mobile bottom-sheet pattern (≤480px). Ships no semantics. Consumers declare the panel\'s `panelRole` and provide their own keyboard model. Composed by `civ-menu`, `civ-column-visibility`, and `civ-button-group`\'s overflow.',
  category: 'overlay',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    open: {
      type: 'boolean',
      description: 'Controlled open state. When omitted the popover manages its own state. Reflects to the host attribute',
      default: false,
      reflect: true,
    },
    label: {
      type: 'string',
      description: 'Accessible name applied to the panel (`aria-label`). Strongly recommended. Without one, screen readers see an unnamed popup',
      default: '',
    },
    align: {
      type: 'enum',
      description: 'Horizontal alignment of the panel relative to the trigger. `end` (default) anchors the panel\'s end edge to the trigger\'s end; `start` anchors to the start. Auto-flips when the chosen edge would clip the viewport',
      default: 'end',
      values: ['start', 'end'],
    },
    panelRole: {
      type: 'string',
      description: 'ARIA role applied to the panel. Defaults to `dialog`. Set to `menu`, `group`, `listbox`, etc. to match the panel\'s semantics. Used by `civ-menu` (menu), `civ-column-visibility` (group), and `civ-button-group` overflow (menu)',
      default: 'dialog',
      attribute: 'panel-role',
    },
    triggerHaspopup: {
      type: 'string',
      description: 'Value for `aria-haspopup` on the trigger. Defaults to `true`. Set to `menu` for a single-select menu, `dialog` / `listbox` to match the panel role',
      default: 'true',
      attribute: 'trigger-haspopup',
    },
    noTabClose: {
      type: 'boolean',
      description: 'Disable closing on Tab. Default false (Tab closes. Matches the menu pattern). Set true when the panel contains naturally-tabbable items (checkboxes, form controls) so the user can Tab between them without dismissing',
      default: false,
      attribute: 'no-tab-close',
    },
    noClickOutsideClose: {
      type: 'boolean',
      description: 'Disable click-outside close. Default false. Set true when the panel anchors a long-lived disclosure that should only close via explicit affordance',
      default: false,
      attribute: 'no-click-outside-close',
    },
    noEscapeClose: {
      type: 'boolean',
      description: 'Disable Escape close. Default false. Rare. Usually only when Escape is bound to a panel-internal action',
      default: false,
      attribute: 'no-escape-close',
    },
  },

  events: {
    'civ-open': {
      description: 'Fires when the popover opens (via trigger click, keyboard, or programmatic `open = true`)',
      detail: {},
    },
    'civ-close': {
      description: 'Fires when the popover closes (via Escape, Tab, click outside, or programmatic `open = false`)',
      detail: {},
    },
    'civ-popover-trigger-arrow': {
      description: 'Fires when ArrowDown or ArrowUp is pressed on the trigger. Composers (e.g. `civ-menu`) listen for this to pre-focus the first or last item once the panel renders',
      detail: {
        direction: { type: 'string', description: '`"down"` for ArrowDown, `"up"` for ArrowUp' },
      },
    },
  },

  a11y: {
    // The HOST carries no role — it's a transparent wrapper. The
    // PANEL (`.civ-popover__panel`) carries the role consumers choose
    // via the `panelRole` prop (defaults to `dialog`, can be `menu` /
    // `listbox` / `group` etc. per placement). Native implementers
    // should apply `panelRole` to whatever surface holds the slotted
    // panel content, not to the host container.
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-haspopup': 'true',
      'aria-expanded': 'open',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'slot', bindings: { name: 'data-civ-popover-trigger' } },
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
