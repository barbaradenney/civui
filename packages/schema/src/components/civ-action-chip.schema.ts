import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-action-chip',
  description: 'Fire-and-forget rounded chip button. Same outlined pill chrome as civ-filter-chip but no toggle state and no check icon — clicking it dispatches `civ-click` and the chip stays unchanged. Use for suggestion chips ("Last 30 days"), quick filters that immediately re-fetch, and secondary CTAs needing less prominence than civ-button.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Visible chip text',
      default: '',
    },
    value: {
      type: 'string',
      description: 'Identifier passed in the `civ-click` event detail so consumers can correlate clicks',
      default: '',
    },
    disabled: {
      type: 'boolean',
      description: 'Disabled state — the button is inert and dispatches no event',
      default: false,
      reflect: true,
    },
    spacing: {
      type: 'enum',
      description: 'Padding density. `default` (24px, WCAG 2.5.8 AA target) is the common case. `sm` also clamps to the 24px floor for ultra-dense rows. `lg` (44px, WCAG 2.5.5 AAA Enhanced target) is for AAA-conscious surfaces or fingertip-heavy mobile placements',
      default: 'default',
      values: ['default', 'sm', 'lg'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name (rendered before the label)',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name (rendered after the label and count)',
      default: '',
      attribute: 'icon-end',
    },
    count: {
      type: 'number',
      description: 'Optional count rendered as " (N)" after the label. `null` hides it',
    },
  },

  events: {
    'civ-click': {
      description: 'Fires when the user clicks the chip. Suppressed when `disabled` is set',
      detail: {
        value: { type: 'string', description: 'The chip\'s `value` attribute' },
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
      type: 'button',
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', condition: 'count', bindings: { text: 'count' } },
        { type: 'label', condition: 'iconEnd', bindings: { text: 'iconEnd' } },
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
