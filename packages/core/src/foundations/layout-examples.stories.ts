import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/actions';

const meta: Meta = {
  title: 'Foundations/Layout Examples',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const FormStack: Story = {
  name: 'Vertical Form Stack',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-text-input label="First name" name="first"></civ-text-input>
      <civ-text-input label="Last name" name="last"></civ-text-input>
      <civ-text-input label="Email" name="email" type="email"></civ-text-input>
    </div>
  `,
};

export const LabelValueInline: Story = {
  name: 'Label + Value Inline',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2 civ-max-w-lg">
      <div class="civ-flex civ-items-baseline civ-justify-between">
        <span class="civ-font-semibold">Full name</span>
        <span>Jane Smith</span>
      </div>
      <div class="civ-flex civ-items-baseline civ-justify-between">
        <span class="civ-font-semibold">Email</span>
        <span>jane.smith@example.com</span>
      </div>
      <div class="civ-flex civ-items-baseline civ-justify-between">
        <span class="civ-font-semibold">Phone</span>
        <span>(555) 123-4567</span>
      </div>
    </div>
  `,
};

export const IconText: Story = {
  name: 'Icon + Text',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <div class="civ-flex civ-items-center civ-gap-2">
        <civ-icon name="check-circle"></civ-icon>
        <span>Application submitted</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-2">
        <civ-icon name="info"></civ-icon>
        <span>Processing takes 5-7 business days</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-2">
        <civ-icon name="warning"></civ-icon>
        <span>Some documents are missing</span>
      </div>
    </div>
  `,
};

export const CardGrid: Story = {
  name: 'Card Grid',
  render: () => html`
    <div class="civ-grid civ-gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
      <civ-link-card href="/benefits" heading="Benefits" description="View your benefits"></civ-link-card>
      <civ-link-card href="/claims" heading="Claims" description="Track your claims"></civ-link-card>
      <civ-link-card href="/profile" heading="Profile" description="Update your info"></civ-link-card>
    </div>
  `,
};

export const ActionBar: Story = {
  name: 'Action Bar',
  render: () => html`
    <!-- civ-button-row stacks the cluster on mobile (each button picks up
         the full-width-on-mobile rule); civ-justify-end keeps the row
         right-aligned at desktop widths. Primary is last here because
         form actions typically put the affirmative action at the
         visually-strongest position (right-most on desktop). -->
    <div class="civ-button-row civ-justify-end">
      <civ-button variant="secondary" label="Save draft"></civ-button>
      <civ-button label="Continue"></civ-button>
    </div>
  `,
};

export const ListItem: Story = {
  name: 'List Item',
  render: () => html`
    <ul class="civ-list-none civ-p-0 civ-space-y-1" style="max-width: 480px;">
      <li class="civ-list-item civ-list-item--success">
        <div class="civ-list-item__content">
          <span class="civ-flex civ-items-center civ-gap-2">
            <civ-icon name="check-circle" class="civ-text-success"></civ-icon>
            <span class="civ-font-semibold">tax-return.pdf</span>
            <span class="civ-ms-2">(1.2 MB)</span>
          </span>
        </div>
        <span class="civ-list-item__actions">
          <civ-action-button variant="tertiary" danger label="Remove"></civ-action-button>
        </span>
      </li>
      <li class="civ-list-item civ-list-item--error">
        <div class="civ-list-item__content">
          <span class="civ-flex civ-items-center civ-gap-2">
            <civ-icon name="error" class="civ-text-error"></civ-icon>
            <span class="civ-font-semibold">w2-2025.pdf</span>
            <span class="civ-ms-2">(4.8 MB)</span>
          </span>
          <span class="civ-text-sm civ-text-error">File exceeds 3 MB limit</span>
        </div>
        <span class="civ-list-item__actions">
          <civ-action-button variant="tertiary" label="Retry"></civ-action-button>
          <civ-action-button variant="tertiary" danger label="Remove"></civ-action-button>
        </span>
      </li>
      <li class="civ-list-item">
        <div class="civ-list-item__content">
          <span class="civ-font-semibold">dd214.pdf</span>
          <span class="civ-ms-2">(800 KB)</span>
        </div>
        <span class="civ-list-item__actions">
          <civ-action-button variant="tertiary" label="Edit"></civ-action-button>
          <civ-action-button variant="tertiary" danger label="Remove"></civ-action-button>
        </span>
      </li>
    </ul>
  `,
};

export const HorizontalRadioGroup: Story = {
  name: 'Horizontal Radio Group',
  render: () => html`
    <civ-radio-group legend="Preferred language" orientation="horizontal">
      <civ-radio label="English" value="en"></civ-radio>
      <civ-radio label="Spanish" value="es"></civ-radio>
    </civ-radio-group>
  `,
};
