import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getIconNames } from './icon-library.js';
import './civ-icon.js';

const meta: Meta = {
  title: 'Core/Icon',
  component: 'civ-icon',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: getIconNames(),
    },
    label: { control: 'text' },
    size: {
      control: 'select',
      options: ['', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: 'check',
    label: '',
    size: '',
  },
  render: (args) => html`
    <civ-icon
      name="${args.name}"
      label="${args.label}"
      size="${args.size}"
    ></civ-icon>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <civ-icon name="check" label="Approved"></civ-icon>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div class="civ-flex civ-items-center civ-gap-4">
      <civ-icon name="check-circle" size="sm"></civ-icon>
      <civ-icon name="check-circle" size="md"></civ-icon>
      <civ-icon name="check-circle" size="lg"></civ-icon>
      <civ-icon name="check-circle" size="xl"></civ-icon>
      <civ-icon name="check-circle" size="2xl"></civ-icon>
    </div>
  `,
};

export const InheritColor: Story = {
  render: () => html`
    <div class="civ-flex civ-items-center civ-gap-4">
      <span class="civ-text-primary"><civ-icon name="info" size="lg"></civ-icon> Information</span>
      <span class="civ-text-success"><civ-icon name="check-circle" size="lg"></civ-icon> Success</span>
      <span class="civ-text-error"><civ-icon name="error" size="lg"></civ-icon> Error</span>
      <span class="civ-text-warning"><civ-icon name="warning" size="lg"></civ-icon> Warning</span>
    </div>
  `,
};

export const Navigation: Story = {
  render: () => html`
    <div class="civ-flex civ-items-center civ-gap-4" style="font-size: 1.5em">
      <civ-icon name="chevron-left" label="Previous"></civ-icon>
      <civ-icon name="chevron-up" label="Up"></civ-icon>
      <civ-icon name="chevron-down" label="Down"></civ-icon>
      <civ-icon name="chevron-right" label="Next"></civ-icon>
      <civ-icon name="arrow-left"></civ-icon>
      <civ-icon name="arrow-up"></civ-icon>
      <civ-icon name="arrow-down"></civ-icon>
      <civ-icon name="arrow-right"></civ-icon>
      <civ-icon name="external-link"></civ-icon>
      <civ-icon name="arrow-back"></civ-icon>
    </div>
  `,
};

export const Actions: Story = {
  render: () => html`
    <div class="civ-flex civ-items-center civ-gap-4" style="font-size: 1.5em">
      <civ-icon name="close"></civ-icon>
      <civ-icon name="plus"></civ-icon>
      <civ-icon name="minus"></civ-icon>
      <civ-icon name="menu"></civ-icon>
      <civ-icon name="more-vertical"></civ-icon>
      <civ-icon name="more-horizontal"></civ-icon>
      <civ-icon name="search"></civ-icon>
      <civ-icon name="edit"></civ-icon>
      <civ-icon name="copy"></civ-icon>
      <civ-icon name="trash"></civ-icon>
    </div>
  `,
};

export const Status: Story = {
  render: () => html`
    <div class="civ-flex civ-items-center civ-gap-4" style="font-size: 1.5em">
      <span class="civ-text-success"><civ-icon name="check"></civ-icon></span>
      <span class="civ-text-success"><civ-icon name="check-circle"></civ-icon></span>
      <span class="civ-text-error"><civ-icon name="error"></civ-icon></span>
      <span class="civ-text-warning"><civ-icon name="warning"></civ-icon></span>
      <span class="civ-text-primary"><civ-icon name="info"></civ-icon></span>
      <span class="civ-text-primary"><civ-icon name="help"></civ-icon></span>
    </div>
  `,
};

export const AllIcons: Story = {
  render: () => {
    const names = getIconNames();
    return html`
      <div class="civ-grid" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; font-size: 1.25em">
        ${names.map(
          (name) => html`
            <div class="civ-flex civ-flex-col civ-items-center civ-gap-1 civ-p-2 civ-border civ-rounded">
              <civ-icon name="${name}" size="xl"></civ-icon>
              <span style="font-size: 0.65em; color: var(--civ-color-base-500, #666)">${name}</span>
            </div>
          `,
        )}
      </div>
    `;
  },
};

export const InlineWithText: Story = {
  render: () => html`
    <p style="font-size: 1em">
      Click <civ-icon name="settings"></civ-icon> to open settings,
      or <civ-icon name="help"></civ-icon> for help.
    </p>
    <p style="font-size: 1.5em">
      <civ-icon name="check-circle"></civ-icon> Your form has been submitted.
    </p>
    <p style="font-size: 0.875em">
      <civ-icon name="info"></civ-icon> For more information, visit the
      <a href="#">help page <civ-icon name="external-link"></civ-icon></a>.
    </p>
  `,
};
