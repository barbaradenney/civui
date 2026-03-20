import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-select.js';

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
  component: 'civ-select',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
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
  args: {
    label: 'State',
    name: 'state',
    value: '',
    hint: '',
    error: '',
    emptyLabel: '- Select -',
    required: false,
    disabled: false,
  },
  render: (args) => {
    const el = document.createElement('civ-select') as any;
    el.label = args.label;
    el.name = args.name;
    el.value = args.value;
    el.hint = args.hint;
    el.error = args.error;
    el.emptyLabel = args.emptyLabel;
    el.options = STATES;
    el.required = args.required;
    el.disabled = args.disabled;
    return el;
  },
};

export const WithHint: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.hint = 'Select your state of residence';
    el.options = STATES;
    return el;
  },
};

export const WithError: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
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
    const el = document.createElement('civ-select') as any;
    el.label = 'State';
    el.name = 'state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Disabled: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
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
    const el = document.createElement('civ-select') as any;
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

export const OptionGroups: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'Department';
    el.name = 'department';
    el.hint = 'Select your department';
    el.options = [
      { value: 'hr', label: 'Human Resources', group: 'Administration' },
      { value: 'finance', label: 'Finance', group: 'Administration' },
      { value: 'legal', label: 'Legal', group: 'Administration' },
      { value: 'eng', label: 'Engineering', group: 'Technology' },
      { value: 'design', label: 'Design', group: 'Technology' },
      { value: 'security', label: 'Cybersecurity', group: 'Technology' },
      { value: 'policy', label: 'Policy', group: 'Operations' },
      { value: 'outreach', label: 'Public Outreach', group: 'Operations' },
      { value: 'compliance', label: 'Compliance', group: 'Operations' },
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
      <civ-select label="State" name="state" required></civ-select>
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
        const select = document.querySelector('civ-select');
        if (select) select.options = ${JSON.stringify(STATES)};
      });
    </script>
  `,
};
