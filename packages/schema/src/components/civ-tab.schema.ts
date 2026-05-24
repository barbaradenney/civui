import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tab',
  description: 'A single tab header inside `<civ-tabs>`. The parent `<civ-tabs>` controls selection, roving tabindex, and `aria-controls` wiring. Set `value` to match the corresponding `<civ-tab-panel>` and let the parent do the rest. Renders a `<button role="tab">`; the button is the focusable element and the host is structural.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    selected: {
      type: 'boolean',
      description: 'Set by the parent `<civ-tabs>` to reflect the current selection. Don\'t set this directly. Set `value` on `<civ-tabs>` instead. Reflected so CSS can style `[selected]`',
      default: false,
      reflect: true,
    },
  },

  events: {
    'civ-tab-select': {
      description: 'Fires when this tab is activated. The parent `<civ-tabs>` listens for this and updates its own `value`',
      detail: { value: { type: 'string', description: 'This tab\'s `value`' } },
    },
  },

  a11y: {
    role: 'tab',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'button',
      bindings: { role: 'tab', ariaSelected: 'selected' },
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
