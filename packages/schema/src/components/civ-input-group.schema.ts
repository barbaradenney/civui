import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-input-group',
  description: 'Layout container that joins a form input and one or more action buttons into a single flush visual control. Works with any CivUI input (`civ-text-input`, `civ-select`, `civ-combobox`) and `civ-action-button` / `civ-button` children on either side. The container removes inner border-radius so the children render seamlessly connected. Slot-only: zero props on the host — pass the child controls in source order (leading children first, trailing children last).',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {},

  events: {},

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div' },
      children: [
        { type: 'slot' },
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
