import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-tag.js';

const meta: Meta = {
  title: 'Layout/Tag',
  component: 'civ-tag',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['blue', 'orange', 'purple', 'gray'],
    },
    tagStyle: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tag is for **categorization** — topics, taxonomies, filter chips, metadata. For status indicators ("Approved", "Pending") or counts, use `civ-badge` instead.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: 'Healthcare', variant: 'blue', tagStyle: 'secondary' },
  render: (args) => html`<civ-tag label="${args.label}" variant="${args.variant}" tag-style="${args.tagStyle || 'secondary'}"></civ-tag>`,
};

export const Primary: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-flex-wrap civ-items-center">
      <civ-tag label="Healthcare" variant="blue" tag-style="primary"></civ-tag>
      <civ-tag label="Education" variant="orange" tag-style="primary"></civ-tag>
      <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
      <civ-tag label="Archived" variant="gray" tag-style="primary"></civ-tag>
    </div>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-flex-wrap civ-items-center">
      <civ-tag label="Healthcare" variant="blue"></civ-tag>
      <civ-tag label="Education" variant="orange"></civ-tag>
      <civ-tag label="Disability" variant="purple"></civ-tag>
      <civ-tag label="Archived" variant="gray"></civ-tag>
    </div>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Primary (high emphasis)</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Education" variant="orange" tag-style="primary"></civ-tag>
          <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
          <civ-tag label="Archived" variant="gray" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Secondary (low emphasis)</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue"></civ-tag>
          <civ-tag label="Education" variant="orange"></civ-tag>
          <civ-tag label="Disability" variant="purple"></civ-tag>
          <civ-tag label="Archived" variant="gray"></civ-tag>
        </div>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Leading icon reinforces category meaning beyond color alone — useful for accessibility and quick scanning. The icon inherits the tag color via `currentColor`.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-gap-2 civ-flex-wrap civ-items-center">
      <civ-tag label="Personal" variant="blue" icon-start="person"></civ-tag>
      <civ-tag label="Important" variant="purple" icon-start="star" tag-style="primary"></civ-tag>
      <civ-tag label="Mailed" variant="orange" icon-start="mail"></civ-tag>
      <civ-tag label="Locked" variant="gray" icon-start="lock" tag-style="primary"></civ-tag>
    </div>
  `,
};

export const FilterChips: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <p class="civ-m-0 civ-font-semibold">Filter results by category</p>
      <div class="civ-flex civ-gap-2 civ-flex-wrap">
        <civ-tag label="Healthcare" variant="blue"></civ-tag>
        <civ-tag label="Education" variant="orange"></civ-tag>
        <civ-tag label="Housing" variant="purple"></civ-tag>
        <civ-tag label="Employment" variant="gray"></civ-tag>
      </div>
    </div>
  `,
};

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Education" variant="orange"></civ-tag>
          <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Education" variant="orange"></civ-tag>
          <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Education" variant="orange"></civ-tag>
          <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
        </div>
      </div>
    </div>
  `,
};

export const Compact: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue" tag-style="primary"></civ-tag>
          <civ-tag label="Education" variant="orange"></civ-tag>
          <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
        </div>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <div class="civ-flex civ-gap-2 civ-flex-wrap">
          <civ-tag label="Healthcare" variant="blue" tag-style="primary" spacing="sm"></civ-tag>
          <civ-tag label="Education" variant="orange" spacing="sm"></civ-tag>
          <civ-tag label="Disability" variant="purple" tag-style="primary" spacing="sm"></civ-tag>
        </div>
      </div>
    </div>
  `,
};
