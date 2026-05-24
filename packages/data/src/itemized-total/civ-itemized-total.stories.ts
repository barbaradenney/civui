import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-itemized-total.js';
import './civ-itemized-item.js';
import '@civui/layout/card';

const meta: Meta = {
  title: 'Data/Itemized Total',
  component: 'civ-itemized-total',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Display-only ledger surface: a list of \`<civ-itemized-item>\` rows
followed by a single total row. Common for benefit calculations, tax
breakdowns, filing-fee schedules, and household-income totals.

The total auto-sums children's \`amount\` values; pass \`total-amount\`
to override with a server-calculated figure (the safer default for
financial work).

\`currency\` and \`locale\` are passed to every row's
\`Intl.NumberFormat\` so the whole ledger shares one format.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <civ-itemized-total>
        <civ-itemized-item label="Base disability rate (70%)" amount="1663.06"></civ-itemized-item>
        <civ-itemized-item label="Spouse dependent" amount="185.00"></civ-itemized-item>
        <civ-itemized-item label="Child under 18" amount="133.00"></civ-itemized-item>
        <civ-itemized-item
          label="Clothing allowance"
          amount="93.41"
          note="Annual / 12"
        ></civ-itemized-item>
      </civ-itemized-total>
    </div>
  `,
};

export const WithHeading: Story = {
  name: 'With heading',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-itemized-total heading="Monthly disability compensation" total-label="Total monthly amount">
        <civ-itemized-item label="Base rate (70%)" amount="1663.06"></civ-itemized-item>
        <civ-itemized-item label="Spouse dependent" amount="185.00"></civ-itemized-item>
        <civ-itemized-item label="Child under 18" amount="133.00"></civ-itemized-item>
      </civ-itemized-total>
    </div>
  `,
};

export const WithServerTotal: Story = {
  name: 'With server-calculated total',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-itemized-total
        heading="Filing fees"
        total-label="Total due"
        total-amount="425.00"
      >
        <civ-itemized-item label="Application fee" amount="350.00"></civ-itemized-item>
        <civ-itemized-item label="Biometric services" amount="85.00"></civ-itemized-item>
        <civ-itemized-item
          label="Discount applied"
          amount="-10.00"
          note="Veteran benefit"
        ></civ-itemized-item>
      </civ-itemized-total>
    </div>
  `,
};

export const TaxRefund: Story = {
  name: 'Tax refund — negative line + positive total',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-itemized-total heading="Federal tax refund" total-label="Refund amount" total-intent="positive">
        <civ-itemized-item label="Federal income tax withheld" amount="5400.00"></civ-itemized-item>
        <civ-itemized-item label="Earned income credit" amount="2100.00"></civ-itemized-item>
        <civ-itemized-item label="Excess Social Security tax" amount="250.00"></civ-itemized-item>
        <civ-itemized-item
          label="Total tax owed"
          amount="-4200.00"
          intent="negative"
          note="From line 24"
        ></civ-itemized-item>
      </civ-itemized-total>
    </div>
  `,
};

export const WithPendingRow: Story = {
  name: 'With pending (non-numeric) row',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-itemized-total heading="Service charges">
        <civ-itemized-item label="Application fee" amount="350.00"></civ-itemized-item>
        <civ-itemized-item label="Biometric services" amount="85.00"></civ-itemized-item>
        <civ-itemized-item
          label="Expedited review"
          value-label="Pending"
          note="Confirmed after submission"
        ></civ-itemized-item>
      </civ-itemized-total>
    </div>
  `,
};

export const InsideCard: Story = {
  name: 'Composed inside a card',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-card>
        <h3 slot="data-card-header" style="margin: 0;">Estimated monthly benefit</h3>
        <civ-itemized-total total-label="Total monthly amount" total-intent="positive">
          <civ-itemized-item label="Base rate (70%)" amount="1663.06"></civ-itemized-item>
          <civ-itemized-item label="Spouse dependent" amount="185.00"></civ-itemized-item>
          <civ-itemized-item label="Child under 18" amount="133.00"></civ-itemized-item>
          <civ-itemized-item
            label="Clothing allowance"
            amount="93.41"
            note="Annual / 12"
          ></civ-itemized-item>
        </civ-itemized-total>
      </civ-card>
    </div>
  `,
};

export const NonUsdCurrency: Story = {
  name: 'Non-USD currency (EUR)',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-itemized-total currency="EUR" locale="de-DE" heading="Monatliche Leistung">
        <civ-itemized-item label="Grundrente" amount="1500.00"></civ-itemized-item>
        <civ-itemized-item label="Ehepartnerzuschlag" amount="180.00"></civ-itemized-item>
      </civ-itemized-total>
    </div>
  `,
};
