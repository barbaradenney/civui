import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-data-field',
  description: 'Read-only label + value display row. Renders a self-contained `<dl>` that can be used standalone or composed inside `civ-summary`. Optional inline edit link or download link for the value. Stacks vertically on mobile.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'When set, the value is rendered as a download link (web only. Native platforms render the value as plain text)',
      default: '',
      webOnly: true,
    },
    values: {
      type: 'array',
      description: 'Multi-value display. Renders each entry on its own line. JS property only (no HTML attribute reflection)',
      webOnly: true,
    },
    editHref: {
      type: 'string',
      description: 'Edit link destination. When set, renders an inline tertiary link beside the value',
      default: '',
      attribute: 'edit-href',
    },
    editLabel: {
      type: 'string',
      description: 'Edit link text. Defaults to the i18n string "Edit"',
      default: '',
      attribute: 'edit-label',
    },
    spacing: {
      type: 'enum',
      description: 'Vertical padding. `default` is comfortable; `sm` is compact for dense summary lists',
      default: 'default',
      values: ['default', 'sm'],
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'dl' },
      children: [
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', bindings: { text: 'value' } },
        { type: 'label', condition: 'editHref', bindings: { text: 'editLabel' } },
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
