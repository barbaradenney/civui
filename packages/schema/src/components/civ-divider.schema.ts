import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-divider',
  description: 'Horizontal section divider. Two variants. `default` (subtle base-lighter line) and `primary` (slightly stronger emphasis). Use between sections; for list rows prefer the `dividers` prop on `civ-list`.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    rhythm: {
      type: 'enum',
      description: 'Vertical margin (top + bottom) around the divider line. `default` = 16px; `sm` = 8px. Named `rhythm` (not `spacing`) because the value controls margin between the divider and its siblings, not internal padding. Per density-convention.md "Three things `spacing=sm` MUST NOT mean."',
      default: 'default',
      values: ['default', 'sm'],
    },
    spacing: {
      type: 'enum',
      description: '**Deprecated** — use `rhythm` instead. Same allowed values, same effect. Will be removed in a future release; setting it to a non-default value emits a one-time dev-mode console warning.',
      default: 'default',
      values: ['default', 'sm'],
    },
    emphasis: {
      type: 'enum',
      description: 'Visual emphasis. `default` is the standard subtle line; `primary` is slightly heavier for major section breaks',
      default: 'default',
      values: ['default', 'primary'],
    },
  },

  events: {},

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'hr' },
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
