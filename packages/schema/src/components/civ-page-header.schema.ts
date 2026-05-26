import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-page-header',
  description: 'Top-of-page composition: leading icon, slotted heading + description, optional trailing icon (e.g. status badge). Distinct from `civ-section-intro` which is for mid-page sections with semantic tone.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    rhythm: {
      type: 'enum',
      description: 'Bottom margin to the content below the header. `default` = 24px; `sm` = 12px. Named `rhythm` (not `spacing`) because the value controls margin between the header and the next sibling, not internal padding. Per density-convention.md "Three things `spacing=sm` MUST NOT mean."',
      default: 'default',
      values: ['default', 'sm'],
    },
    spacing: {
      type: 'enum',
      description: '**Deprecated** — use `rhythm` instead. Same allowed values, same effect. Will be removed in a future release; setting it to a non-default value emits a one-time dev-mode console warning.',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name (e.g. category icon)',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name',
      default: '',
      attribute: 'icon-end',
    },
  },

  events: {},

  a11y: {
    role: 'banner',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'icon', condition: 'iconStart', bindings: { name: 'iconStart' } },
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'icon', condition: 'iconEnd', bindings: { name: 'iconEnd' } },
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
