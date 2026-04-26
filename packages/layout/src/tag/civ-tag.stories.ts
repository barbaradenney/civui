import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-tag.js';

const meta: Meta = {
  title: 'UI/Tag',
  component: 'civ-tag',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'],
    },
    tagStyle: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: 'In progress', variant: 'teal', tagStyle: 'secondary' },
  render: (args) => html`<civ-tag label="${args.label}" variant="${args.variant}" tag-style="${args.tagStyle || 'secondary'}"></civ-tag>`,
};

export const Primary: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-flex-wrap civ-items-center">
      <civ-tag label="Not started" variant="blue" tag-style="primary"></civ-tag>
      <civ-tag label="In progress" variant="teal" tag-style="primary"></civ-tag>
      <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
      <civ-tag label="Warning" variant="yellow" tag-style="primary"></civ-tag>
      <civ-tag label="Urgent" variant="orange" tag-style="primary"></civ-tag>
      <civ-tag label="Denied" variant="red" tag-style="primary"></civ-tag>
      <civ-tag label="Special" variant="purple" tag-style="primary"></civ-tag>
      <civ-tag label="Closed" variant="gray" tag-style="primary"></civ-tag>
    </div>
  `,
};

export const Secondary: Story = {
  name: 'Secondary',
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-flex-wrap civ-items-center">
      <civ-tag label="Not started" variant="blue"></civ-tag>
      <civ-tag label="In progress" variant="teal"></civ-tag>
      <civ-tag label="Complete" variant="green"></civ-tag>
      <civ-tag label="Warning" variant="yellow"></civ-tag>
      <civ-tag label="Urgent" variant="orange"></civ-tag>
      <civ-tag label="Error" variant="red"></civ-tag>
      <civ-tag label="Special" variant="purple"></civ-tag>
      <civ-tag label="Default" variant="gray"></civ-tag>
    </div>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Primary (high emphasis)</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Approved" variant="green" tag-style="primary"></civ-tag>
          <civ-tag label="Denied" variant="red" tag-style="primary"></civ-tag>
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="In progress" variant="teal" tag-style="primary"></civ-tag>
          <civ-tag label="Warning" variant="yellow" tag-style="primary"></civ-tag>
          <civ-tag label="Urgent" variant="orange" tag-style="primary"></civ-tag>
          <civ-tag label="Special" variant="purple" tag-style="primary"></civ-tag>
          <civ-tag label="Closed" variant="gray" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Secondary (low emphasis)</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Submitted" variant="green"></civ-tag>
          <civ-tag label="Needs review" variant="red"></civ-tag>
          <civ-tag label="Not started" variant="blue"></civ-tag>
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <civ-tag label="Pending" variant="yellow"></civ-tag>
          <civ-tag label="Due soon" variant="orange"></civ-tag>
          <civ-tag label="New" variant="purple"></civ-tag>
          <civ-tag label="Draft" variant="gray"></civ-tag>
        </div>
      </div>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Not started" variant="blue"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Not started" variant="blue"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Not started" variant="blue"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
    </div>
  `,
};

export const ClaimStatuses: Story = {
  name: 'Claim Statuses',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <div class="civ-flex civ-items-center civ-gap-3">
        <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
        <span>Disability compensation — approved</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-3">
        <civ-tag label="In progress" variant="teal"></civ-tag>
        <span>Travel reimbursement — evidence gathering</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-3">
        <civ-tag label="Action needed" variant="red"></civ-tag>
        <span>Education benefits — missing documents</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-3">
        <civ-tag label="Not started" variant="gray"></civ-tag>
        <span>Housing assistance — draft saved</span>
      </div>
    </div>
  `,
};

export const Compact: Story = {
  name: 'Compact',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Active" variant="blue" tag-style="primary" spacing="sm"></civ-tag>
          <civ-tag label="In progress" variant="teal" spacing="sm"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary" spacing="sm"></civ-tag>
        </div>
      </div>
    </div>
  `,
};
