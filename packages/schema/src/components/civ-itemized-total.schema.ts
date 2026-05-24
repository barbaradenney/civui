import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-itemized-total',
  description: 'Display-only ledger surface: a list of `<civ-itemized-item>` rows followed by a single total row. Auto-sums the children\'s `amount` values; pass `total-amount` to override with a server-calculated figure (the safer default for financial work). `currency` and `locale` are passed to each row\'s `Intl.NumberFormat` so every line in the ledger shares the same format. Container is flat per the design rule that only interactive elements get rounded corners — compose inside `<civ-card>` when a surface is needed.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    heading: {
      type: 'string',
      description: 'Optional heading rendered above the rows',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Heading level (2–6) when `heading` is set. Defaults to 3.',
      default: 3,
      attribute: 'heading-level',
      webOnly: true,
    },
    totalLabel: {
      type: 'string',
      description: 'Label for the total row. Defaults to `Total`.',
      default: 'Total',
      attribute: 'total-label',
    },
    totalAmount: {
      type: 'number',
      description: 'Override for the total. When omitted, the component sums every child `amount` (skipping rows with a `value-label`). Pass this when the total comes from the server to avoid client-side float drift.',
      attribute: 'total-amount',
    },
    currency: {
      type: 'string',
      description: 'ISO 4217 currency code passed to `Intl.NumberFormat` (e.g. `USD`, `EUR`).',
      default: 'USD',
    },
    locale: {
      type: 'string',
      description: 'BCP 47 locale for `Intl.NumberFormat`. Defaults to the browser locale.',
      default: '',
    },
    totalIntent: {
      type: 'enum',
      description: 'Color treatment for the total row only. `positive` (green), `negative` (red), `neutral` (default). Independent of any per-row `intent`.',
      values: ['', 'positive', 'negative', 'neutral'],
      default: '',
      attribute: 'total-intent',
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
        { type: 'label', condition: 'heading', bindings: { text: 'heading' } },
        { type: 'slot' },
        { type: 'label', bindings: { text: 'totalLabel' } },
        { type: 'label', bindings: { text: 'totalAmount' } },
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
      controlClasses: ['civ-itemized-total'],
    },
    ios: {
      // SwiftUI: VStack of label/amount HStack rows with a Divider and a bold total HStack
    },
    android: {
      // Compose: Column of Row pairs with a HorizontalDivider before the total Row
    },
  },
};

export default schema;
