import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tab-panel',
  description: 'Content region for a single tab inside `<civ-tabs>`. The parent matches panels to tabs by `value` and toggles visibility based on the selected tab. Carries `role="tabpanel"` on the host and is linked to its tab via `aria-labelledby` (wired up by the parent). The panel itself is focusable (`tabindex="0"`) so keyboard users can scroll panel content with the keyboard after activating a tab.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {},

  events: {},

  a11y: {
    role: 'tabpanel',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { role: 'tabpanel', ariaLabelledBy: 'tabId' },
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
