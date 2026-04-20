import type { Meta, StoryObj } from '@storybook/web-components';
import './civ-combobox.js';

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' },
];

const meta: Meta = {
  title: 'Forms/Inputs/Combobox',
  component: 'civ-combobox',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    noResultsText: { control: 'text' },
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
    placeholder: 'Start typing to filter...',
    hint: '',
    error: '',
    value: '',
    noResultsText: 'No results found',
    required: false,
    disabled: false,
  },
  render: (args) => {
    const el = document.createElement('civ-combobox') as any;
    el.label = args.label;
    el.name = args.name;
    el.placeholder = args.placeholder;
    el.hint = args.hint;
    el.error = args.error;
    el.value = args.value;
    el.noResultsText = args.noResultsText;
    el.options = STATES;
    el.required = args.required;
    el.disabled = args.disabled;
    return el;
  },
};

export const WithHint: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State';
    el.name = 'state';
    el.hint = 'Type to search or use arrow keys';
    el.options = STATES;
    return el;
  },
};

export const WithError: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
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
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State';
    el.name = 'state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Disabled: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State';
    el.name = 'state';
    el.disabled = true;
    el.value = 'CA';
    el.options = STATES;
    return el;
  },
};

export const Preselected: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.value = 'CA';
    el.options = STATES;
    return el;
  },
};

export const OptionGroups: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'Office location';
    el.name = 'office';
    el.placeholder = 'Search offices...';
    el.options = [
      { value: 'dc-hq', label: 'DC Headquarters', group: 'East Coast' },
      { value: 'dc-annex', label: 'DC Annex Building', group: 'East Coast' },
      { value: 'ny-field', label: 'New York Field Office', group: 'East Coast' },
      { value: 'boston', label: 'Boston Regional', group: 'East Coast' },
      { value: 'sf-field', label: 'San Francisco Field Office', group: 'West Coast' },
      { value: 'la-field', label: 'Los Angeles Field Office', group: 'West Coast' },
      { value: 'seattle', label: 'Seattle Regional', group: 'West Coast' },
      { value: 'chicago', label: 'Chicago Regional', group: 'Midwest' },
      { value: 'denver', label: 'Denver Field Office', group: 'Midwest' },
    ];
    return el;
  },
};
