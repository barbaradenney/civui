import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-itemized-item',
  description: 'A single label + amount row inside `<civ-itemized-total>`. Display-only. The amount is formatted by the parent so every row in a ledger shares the same currency / locale. Use `value-label` when the row is non-numeric (`Pending`, `Free`, `—`) — those rows are excluded from the parent\'s auto-sum. `intent` controls color independently of sign so negatives can render neutrally by default.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'The line-item label rendered on the left',
      default: '',
    },
    amount: {
      type: 'number',
      description: 'The line-item value. Formatted by the parent `<civ-itemized-total>` using its `currency` and `locale`. Negative values render with a locale-correct minus.',
    },
    valueLabel: {
      type: 'string',
      description: 'Override for non-numeric rows (`Pending`, `Free`, `—`). When set, this string is rendered verbatim and the row is excluded from the parent\'s auto-sum.',
      default: '',
      attribute: 'value-label',
    },
    note: {
      type: 'string',
      description: 'Optional secondary text rendered below the label (e.g. `Annual / 12`).',
      default: '',
    },
    intent: {
      type: 'enum',
      description: 'Color treatment for the amount. `positive` (green), `negative` (red), `neutral` (default). Independent of the sign of `amount` so credits can render neutrally unless the consumer explicitly opts in to a tint.',
      values: ['', 'positive', 'negative', 'neutral'],
      default: '',
      reflect: true,
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', bindings: { text: 'label' } },
        { type: 'label', condition: 'note', bindings: { text: 'note' } },
        { type: 'label', bindings: { text: 'amount' } },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },

  platform: {
    web: {
      controlClasses: ['civ-itemized-row'],
    },
    ios: {
      // SwiftUI: HStack with Text(label) + Spacer + Text(formatted amount)
    },
    android: {
      // Compose: Row { Text(label); Spacer(weight=1f); Text(amount) }
    },
  },
};

export default schema;
