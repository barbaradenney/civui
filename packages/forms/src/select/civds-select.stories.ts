import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-select.js';

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'FL', label: 'Florida' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' },
];

const meta: Meta = {
  title: 'Forms/Select',
  component: 'civds-select',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    emptyLabel: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const el = document.createElement('civds-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.options = STATES;
    return el;
  },
};

export const WithHint: Story = {
  render: () => {
    const el = document.createElement('civds-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.hint = 'Select your state of residence';
    el.options = STATES;
    return el;
  },
};

export const WithError: Story = {
  render: () => {
    const el = document.createElement('civds-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.error = 'Please select a state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Required: Story = {
  render: () => {
    const el = document.createElement('civds-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Disabled: Story = {
  render: () => {
    const el = document.createElement('civds-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.disabled = true;
    el.value = 'CA';
    el.options = STATES;
    return el;
  },
};

export const WithDisabledOptions: Story = {
  render: () => {
    const el = document.createElement('civds-select') as any;
    el.label = 'Priority';
    el.name = 'priority';
    el.options = [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical (admin only)', disabled: true },
    ];
    return el;
  },
};

export const InNativeForm: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civds-select label="State" name="state" required></civds-select>
      <button
        type="submit"
        style="margin-top: 16px; padding: 8px 24px; background: #005ea2; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Submit
      </button>
    </form>
    <script>
      // Set options after render
      requestAnimationFrame(() => {
        const select = document.querySelector('civds-select');
        if (select) select.options = ${JSON.stringify(STATES)};
      });
    </script>
  `,
};
