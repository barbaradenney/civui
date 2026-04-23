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
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
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
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
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
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Primary (high emphasis)</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
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
        <p style="margin: 0 0 8px; font-weight: 600;">Secondary (low emphasis)</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
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
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Not started" variant="blue"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Not started" variant="blue"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
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
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
        <span>Disability compensation — approved</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <civ-tag label="In progress" variant="teal"></civ-tag>
        <span>Travel reimbursement — evidence gathering</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <civ-tag label="Action needed" variant="red"></civ-tag>
        <span>Education benefits — missing documents</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <civ-tag label="Not started" variant="gray"></civ-tag>
        <span>Housing assistance — draft saved</span>
      </div>
    </div>
  `,
};

export const Compact: Story = {
  name: 'Compact',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <p style="font-weight: 600; margin-bottom: 8px;">Default</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <civ-tag label="Active" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p style="font-weight: 600; margin-bottom: 8px;">Compact (sm)</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <civ-tag label="Active" variant="blue" tag-style="primary" spacing="sm"></civ-tag>
          <civ-tag label="In progress" variant="teal" spacing="sm"></civ-tag>
          <civ-tag label="Complete" variant="green" tag-style="primary" spacing="sm"></civ-tag>
        </div>
      </div>
    </div>
  `,
};
