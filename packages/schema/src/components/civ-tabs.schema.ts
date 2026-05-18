import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-tabs',
  description: 'ARIA tab pattern — a tablist with associated panels. Children are `<civ-tab>` (selectable headers) and `<civ-tab-panel>` (content regions). Tabs and panels are paired by `value`. Keyboard: roving tabindex, `ArrowLeft`/`ArrowRight` move between tabs, `Home`/`End` jump to first/last; disabled tabs are skipped. Activation is manual (pressing a tab selects it) — the safer default per ARIA APG for tabs that may trigger expensive content loads.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {},

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
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
