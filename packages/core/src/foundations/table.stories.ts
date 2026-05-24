import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';

const meta: Meta = {
  title: 'Foundations/Table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Static styled `<table>` primitive. CSS classes only — there is no `civ-table` custom element. ' +
          'For sortable / selectable / paginated tables, use `civ-data-grid` instead. ' +
          'See the [Table docs page](/civui/docs/components/data/table) for the full reference.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <table class="civ-table">
      <caption>2026 monthly benefit amounts</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" class="civ-table__num">Monthly amount</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Single veteran, no dependents</td><td class="civ-table__num">$2,500</td></tr>
        <tr><td>Veteran with spouse</td><td class="civ-table__num">$2,750</td></tr>
        <tr><td>Veteran with spouse and one child</td><td class="civ-table__num">$2,900</td></tr>
        <tr><td>Each additional dependent</td><td class="civ-table__num">$150</td></tr>
      </tbody>
    </table>
  `,
};

export const Bordered: Story = {
  render: () => html`
    <table class="civ-table civ-table--bordered">
      <caption>Application processing times by region</caption>
      <thead>
        <tr>
          <th scope="col">Region</th>
          <th scope="col">Standard claim</th>
          <th scope="col">Priority claim</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Northeast</td><td>90 days</td><td>30 days</td></tr>
        <tr><td>Southeast</td><td>120 days</td><td>45 days</td></tr>
        <tr><td>Midwest</td><td>100 days</td><td>40 days</td></tr>
        <tr><td>West</td><td>110 days</td><td>35 days</td></tr>
      </tbody>
    </table>
  `,
};

export const Striped: Story = {
  render: () => html`
    <table class="civ-table civ-table--striped">
      <caption>Required documents by application type</caption>
      <thead>
        <tr>
          <th scope="col">Document</th>
          <th scope="col">Disability</th>
          <th scope="col">Pension</th>
          <th scope="col">Education</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>DD-214</td><td>Required</td><td>Required</td><td>Required</td></tr>
        <tr><td>Medical records</td><td>Required</td><td>Optional</td><td>—</td></tr>
        <tr><td>Income statement</td><td>—</td><td>Required</td><td>—</td></tr>
        <tr><td>School enrollment</td><td>—</td><td>—</td><td>Required</td></tr>
      </tbody>
    </table>
  `,
};

export const WithTotal: Story = {
  name: 'With totals (tfoot)',
  render: () => html`
    <table class="civ-table">
      <caption>Q4 2025 itemized expenses</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" class="civ-table__num">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Office supplies</td><td class="civ-table__num">$1,250.00</td></tr>
        <tr><td>Travel</td><td class="civ-table__num">$3,400.00</td></tr>
        <tr><td>Training</td><td class="civ-table__num">$2,100.00</td></tr>
        <tr><td>Equipment</td><td class="civ-table__num">$8,750.00</td></tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          <td class="civ-table__num">$15,500.00</td>
        </tr>
      </tfoot>
    </table>
  `,
};

export const Compact: Story = {
  render: () => html`
    <table class="civ-table civ-table--compact civ-table--striped">
      <caption>State abbreviations</caption>
      <thead>
        <tr>
          <th scope="col">Code</th>
          <th scope="col">State</th>
          <th scope="col">Code</th>
          <th scope="col">State</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>AL</td><td>Alabama</td><td>MT</td><td>Montana</td></tr>
        <tr><td>AK</td><td>Alaska</td><td>NE</td><td>Nebraska</td></tr>
        <tr><td>AZ</td><td>Arizona</td><td>NV</td><td>Nevada</td></tr>
        <tr><td>AR</td><td>Arkansas</td><td>NH</td><td>New Hampshire</td></tr>
        <tr><td>CA</td><td>California</td><td>NJ</td><td>New Jersey</td></tr>
      </tbody>
    </table>
  `,
};

export const RowHeaders: Story = {
  name: 'Row headers (scope="row")',
  render: () => html`
    <table class="civ-table civ-table--bordered">
      <caption>Plan comparison</caption>
      <thead>
        <tr>
          <th scope="col">Feature</th>
          <th scope="col">Basic</th>
          <th scope="col">Standard</th>
          <th scope="col">Premium</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Monthly visits</th>
          <td>4</td><td>10</td><td>Unlimited</td>
        </tr>
        <tr>
          <th scope="row">Specialist referrals</th>
          <td>—</td><td>Included</td><td>Included</td>
        </tr>
        <tr>
          <th scope="row">Prescription coverage</th>
          <td>Generic only</td><td>Generic + brand</td><td>All medications</td>
        </tr>
      </tbody>
    </table>
  `,
};

export const Responsive: Story = {
  name: 'Responsive scroll wrapper',
  render: () => html`
    <!-- The .civ-table-wrap figure provides horizontal scroll when the
         table overflows its container. role=region + tabindex=0 +
         aria-labelledby make the scroll container keyboard-reachable
         and named to AT (WCAG 2.1 SC 1.4.10 Reflow exemption). -->
    <figure class="civ-table-wrap" role="region" aria-labelledby="schedule-caption" tabindex="0">
      <table class="civ-table civ-table--bordered" style="min-width: 720px;">
        <caption id="schedule-caption">
          Application processing schedule by quarter and region
        </caption>
        <thead>
          <tr>
            <th scope="col">Region</th>
            <th scope="col">Q1</th>
            <th scope="col">Q2</th>
            <th scope="col">Q3</th>
            <th scope="col">Q4</th>
            <th scope="col" class="civ-table__num">Annual avg</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Northeast</td><td>92 days</td><td>88 days</td><td>95 days</td><td>90 days</td><td class="civ-table__num">91</td></tr>
          <tr><td>Southeast</td><td>120 days</td><td>115 days</td><td>125 days</td><td>118 days</td><td class="civ-table__num">120</td></tr>
          <tr><td>Midwest</td><td>100 days</td><td>98 days</td><td>105 days</td><td>102 days</td><td class="civ-table__num">101</td></tr>
          <tr><td>Southwest</td><td>108 days</td><td>105 days</td><td>112 days</td><td>110 days</td><td class="civ-table__num">109</td></tr>
          <tr><td>West</td><td>110 days</td><td>108 days</td><td>115 days</td><td>112 days</td><td class="civ-table__num">111</td></tr>
        </tbody>
      </table>
    </figure>
  `,
};

export const BorderedStriped: Story = {
  name: 'Bordered + striped',
  render: () => html`
    <table class="civ-table civ-table--bordered civ-table--striped">
      <caption>2026 income limits by household size</caption>
      <thead>
        <tr>
          <th scope="col">Household size</th>
          <th scope="col" class="civ-table__num">100% of poverty</th>
          <th scope="col" class="civ-table__num">150% of poverty</th>
          <th scope="col" class="civ-table__num">200% of poverty</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1 person</td><td class="civ-table__num">$15,060</td><td class="civ-table__num">$22,590</td><td class="civ-table__num">$30,120</td></tr>
        <tr><td>2 people</td><td class="civ-table__num">$20,440</td><td class="civ-table__num">$30,660</td><td class="civ-table__num">$40,880</td></tr>
        <tr><td>3 people</td><td class="civ-table__num">$25,820</td><td class="civ-table__num">$38,730</td><td class="civ-table__num">$51,640</td></tr>
        <tr><td>4 people</td><td class="civ-table__num">$31,200</td><td class="civ-table__num">$46,800</td><td class="civ-table__num">$62,400</td></tr>
        <tr><td>Each additional person</td><td class="civ-table__num">+$5,380</td><td class="civ-table__num">+$8,070</td><td class="civ-table__num">+$10,760</td></tr>
      </tbody>
    </table>
  `,
};
