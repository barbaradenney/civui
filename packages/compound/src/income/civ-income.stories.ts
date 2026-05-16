import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-income.js';

const meta: Meta = {
  title: 'Compound/Income',
  component: 'civ-income',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Compound field for dollar amount + pay frequency. Pairs \`civ-currency\`
(dollar input with mask + validation) with \`civ-select\` (frequency)
inside a single fieldset.

Use for any means-tested benefit application where income, expense, or
support payment is reported with a frequency component.

Value shape: \`{ amount: string, frequency: IncomeFrequency }\`. The
sub-fields are also exposed as separate form values
(\`{name}.amount\` and \`{name}.frequency\`) for native form submission.
        `,
      },
    },
  },
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-income legend="Wages from employment" name="wages"></civ-income>
  `,
};

export const Required: Story = {
  name: 'Required (means-tested benefit)',
  render: () => html`
    <civ-income
      legend="Gross household income"
      name="household_income"
      hint="Include all wages, self-employment, retirement, and other regular income before taxes."
      required
    ></civ-income>
  `,
};

export const RestrictedFrequencies: Story = {
  name: 'Restricted frequency list',
  render: () => html`
    <civ-income
      legend="Mortgage payment"
      name="mortgage"
      .frequencies="${['monthly', 'biweekly']}"
      hint="Most mortgages are paid monthly; some borrowers pay biweekly."
    ></civ-income>
  `,
};

export const Prefilled: Story = {
  name: 'Prefilled value',
  render: () => html`
    <civ-income
      legend="Wages"
      name="wages"
      value='{"amount":"3250.00","frequency":"biweekly"}'
    ></civ-income>
  `,
};

export const WithErrors: Story = {
  name: 'With sub-field errors',
  render: () => html`
    <civ-income
      legend="Monthly rent payment"
      name="rent"
      amount-error="Enter an amount greater than $0"
      frequency-error="Pick a frequency"
    ></civ-income>
  `,
};

export const FormExample: Story = {
  name: 'In a real form — household income',
  render: () => html`
    <civ-page-header>
      <h2 slot="heading">Household income</h2>
    </civ-page-header>
    <civ-income
      legend="Wages from employment"
      name="wages"
      hint="Pay before taxes and deductions"
      required
    ></civ-income>
    <civ-income
      legend="Self-employment income"
      name="self_employment"
      hint="Net income (after business expenses)"
    ></civ-income>
    <civ-income
      legend="Social Security or other retirement income"
      name="retirement"
    ></civ-income>
  `,
};
