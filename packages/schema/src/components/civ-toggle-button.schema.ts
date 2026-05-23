import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-toggle-button',
  description: 'Text button with two persistent labels and an `aria-pressed` state. Click flips `pressed` and swaps the visible label. Used for show/hide toggles where each state has a clear name — password reveal (Show / Hide), mute / unmute, expand / collapse on a custom surface. Padding stays stable across the toggle (variant class held constant; only label + `aria-pressed` flip). For fire-and-forget actions with transient feedback use `civ-confirm-button`; for native disclosure (open/closed `<details>` sections) use `civ-disclosure`; for read-more expansion of prose use `civ-read-more`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Unpressed label ("Show", "Mute", "Expand")',
      default: '',
    },
    pressedLabel: {
      type: 'string',
      description: 'Pressed label ("Hide", "Unmute", "Collapse"). Required — the swap label gives the toggle its meaning. There is no fallback because the two labels are intent-specific',
      default: '',
      attribute: 'pressed-label',
    },
    pressed: {
      type: 'boolean',
      description: 'Reflected boolean state. Two-way bindable; consumers can set this externally to drive the rendered label and ARIA state without going through a click',
      default: false,
      reflect: true,
    },
    variant: {
      type: 'enum',
      description: 'Picks the text-btn modifier. `chip` (default) is the prominent gray pill — the common case (helper rows, standalone toggles, password reveal). `inline` is the transparent text-link style for surfaces where the toggle should read as quiet',
      default: 'chip',
      values: ['chip', 'inline'],
    },
    iconStart: {
      type: 'string',
      description: 'Optional leading icon name from the CivUI icon library (e.g. `chevron-down` for an accordion expand-all toggle, `visibility` for a password reveal). Rendered with `aria-hidden="true"` so the label remains the accessible name',
      default: '',
      attribute: 'icon-start',
    },
  },

  events: {
    'civ-toggle': {
      description: 'Fires after the click flips the state. detail.pressed is the NEW state (the value the consumer should react to)',
      detail: {
        pressed: { type: 'boolean', description: 'The state of the button AFTER the click' },
      },
    },
  },

  a11y: {
    role: 'button',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-pressed': 'true | false',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'slot', bindings: { name: 'default' } },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
