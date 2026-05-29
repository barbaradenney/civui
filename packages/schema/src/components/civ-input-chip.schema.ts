import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-input-chip',
  description: 'Display chip representing user-entered content with an always-present remove handle. Use for recipient lists on email composers, tags on a post, applied-filter readouts, typed keywords in a search bar. Distinct from civ-filter-chip because the chip represents data the user has already put in, not a toggleable option from a known list.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Visible chip text (the entered token)',
      default: '',
    },
    value: {
      type: 'string',
      description: 'Identifier passed in the `civ-remove` event detail so consumers can correlate removals',
      default: '',
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — visually muted; the remove handle is inert',
      default: false,
      reflect: true,
    },
    spacing: {
      type: 'enum',
      description: 'Padding density. `default` (24px, WCAG 2.5.8 AA target) is the common case. `sm` also clamps to the 24px floor for ultra-dense rows. `lg` (44px, WCAG 2.5.5 AAA Enhanced target) is for AAA-conscious surfaces or fingertip-heavy mobile placements',
      default: 'default',
      values: ['default', 'sm', 'lg'],
    },
  },

  events: {
    'civ-remove': {
      description: 'Fires when the user clicks the × button. Suppressed when `disabled` is set',
      detail: {
        value: { type: 'string', description: 'The chip\'s `value` attribute' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event fired on interaction',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action that triggered the event' },
      },
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {},
  },

  renderOrder: [
    {
      type: 'label',
      bindings: { text: 'label' },
      children: [{ type: 'button', bindings: { action: 'remove' } }],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
