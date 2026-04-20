import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-segment.js';
import './civ-segmented-control.js';

const meta: Meta = {
  title: 'Forms/Inputs/Segmented Control',
  component: 'civ-segmented-control',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'View mode',
    name: 'view',
    value: 'list',
  },
  render: (args) => html`
    <civ-segmented-control
      legend="${args.legend}"
      name="${args.name}"
      value="${args.value}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
    </civ-segmented-control>
  `,
};

export const WithPreselection: Story = {
  render: () => html`
    <civ-segmented-control legend="View mode" name="view" value="grid">
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
    </civ-segmented-control>
  `,
};

export const ThreeOptions: Story = {
  render: () => html`
    <civ-segmented-control legend="Time range" name="range" value="week">
      <civ-segment label="Day" value="day"></civ-segment>
      <civ-segment label="Week" value="week"></civ-segment>
      <civ-segment label="Month" value="month"></civ-segment>
    </civ-segmented-control>
  `,
};

export const FiveOptions: Story = {
  render: () => html`
    <civ-segmented-control legend="Priority" name="priority" value="medium">
      <civ-segment label="Critical" value="critical"></civ-segment>
      <civ-segment label="High" value="high"></civ-segment>
      <civ-segment label="Medium" value="medium"></civ-segment>
      <civ-segment label="Low" value="low"></civ-segment>
      <civ-segment label="None" value="none"></civ-segment>
    </civ-segmented-control>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-segmented-control legend="View mode" name="view" value="list" hint="Choose how items are displayed">
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
      <civ-segment label="Table" value="table"></civ-segment>
    </civ-segmented-control>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-segmented-control legend="View mode" name="view" error="Please select a view mode" required>
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
    </civ-segmented-control>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-segmented-control legend="View mode" name="view" value="list" disabled>
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
      <civ-segment label="Table" value="table"></civ-segment>
    </civ-segmented-control>
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
      <civ-segmented-control legend="View mode" name="view" value="list" required>
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
      </div>
    </form>
  `,
};
