import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tabs',
  description: 'ARIA tab pattern. A tablist with associated panels. Children are `<civ-tab>` (selectable headers) and `<civ-tab-panel>` (content regions). Tabs and panels are paired by `value`. Keyboard: roving tabindex, `ArrowLeft`/`ArrowRight` move between tabs, `Home`/`End` jump to first/last; disabled tabs are skipped. Activation is manual (pressing a tab selects it). The safer default per ARIA APG for tabs that may trigger expensive content loads.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible name (`aria-label`) for the `role="tablist"` wrapper. **Strongly recommended** so AT users hear the tablist named',
      default: '',
    },
    value: {
      type: 'string',
      description: 'The currently selected tab\'s `value`. Controlled prop — listen to the `civ-tab-select` event and reflect the new value back to keep tabs in sync',
      default: '',
    },
  },

  events: {
    'civ-change': {
      description: 'Fires when the selected tab changes (via click or keyboard activation)',
      detail: { value: { type: 'string', description: 'The newly selected tab\'s value' } },
    },
  },

  a11y: {
    role: 'tablist',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { ariaLabel: 'label' },
      children: [
        { type: 'container', bindings: { role: 'tablist' }, children: [{ type: 'slot' }] },
        { type: 'container', children: [{ type: 'slot' }] },
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
