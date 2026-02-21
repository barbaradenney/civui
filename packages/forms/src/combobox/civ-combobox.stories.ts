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
  title: 'Forms/Combobox',
  component: 'civ-combobox',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State';
    el.name = 'state';
    el.placeholder = 'Start typing to filter...';
    el.options = STATES;
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
