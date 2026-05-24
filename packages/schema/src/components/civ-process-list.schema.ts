import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-process-list',
  description: 'Numbered vertical list of upcoming process steps — "here\'s what to expect." Used on intro pages before a multi-step form, on benefit-application landing pages, or anywhere the user needs a clear preview of the path they\'re about to walk. Renders as `<ol role="list">` so screen readers announce sequence and count; each `<civ-process-list-item>` renders its own auto-incremented numbered marker via CSS counters plus a connecting line. For the in-flight "where am I now" pattern, use `civ-progress-steps` instead.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {},

  events: {},

  a11y: {
    role: 'list',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
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
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
