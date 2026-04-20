import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-yes-no.js';

const meta: Meta = {
  title: 'Forms/Inputs/Yes No',
  component: 'civ-yes-no',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'select', options: ['', 'yes', 'no'] },
    hint: { control: 'text' },
    error: { control: 'text' },
    yesLabel: { control: 'text' },
    noLabel: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Are you a U.S. citizen?',
    name: 'citizen',
  },
  render: (args) => html`
    <civ-yes-no
      legend="${args.legend}"
      name="${args.name}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-yes-no>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-yes-no
      legend="Have you filed taxes this year?"
      name="taxes"
      hint="This refers to federal income taxes for the current calendar year"
    ></civ-yes-no>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-yes-no
      legend="Are you a U.S. citizen?"
      name="citizen"
      error="Please select an answer to continue"
      required
    ></civ-yes-no>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-yes-no
      legend="Do you have a valid passport?"
      name="passport"
      required
    ></civ-yes-no>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-yes-no
      legend="Are you a U.S. citizen?"
      name="citizen"
      value="yes"
      disabled
    ></civ-yes-no>
  `,
};

export const Preselected: Story = {
  render: () => html`
    <civ-yes-no
      legend="Have you served in the military?"
      name="military"
      value="no"
    ></civ-yes-no>
  `,
};

export const CustomLabels: Story = {
  render: () => html`
    <civ-yes-no
      legend="Do you agree to the terms of service?"
      name="terms"
      yes-label="I agree"
      no-label="I decline"
    ></civ-yes-no>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const values = Array.from(fd.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        alert('Submitted: ' + values);
      }}
    >
      <civ-yes-no
        legend="Are you a U.S. citizen?"
        name="citizen"
        required
        hint="Select yes if you are a citizen by birth or naturalization"
      ></civ-yes-no>
      <civ-yes-no
        legend="Have you filed taxes this year?"
        name="taxes"
      ></civ-yes-no>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <button type="submit" class="civ-btn civ-btn--primary">Submit</button>
        <button type="reset" class="civ-btn civ-btn--secondary">Reset</button>
      </div>
    </form>
  `,
};
