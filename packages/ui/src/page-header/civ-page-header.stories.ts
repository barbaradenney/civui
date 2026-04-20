import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-page-header.js';
import '../tag/civ-tag.js';

const meta: Meta = {
  title: 'UI/Page Header',
  component: 'civ-page-header',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-page-header>
      <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
    </civ-page-header>
  `,
};

export const WithEyebrow: Story = {
  name: 'With Eyebrow',
  render: () => html`
    <civ-page-header>
      <span data-eyebrow>Benefits</span>
      <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
    </civ-page-header>
  `,
};

export const WithSubheading: Story = {
  name: 'With Subheading',
  render: () => html`
    <civ-page-header>
      <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
      <span data-subheading>VA Form 21-526EZ</span>
    </civ-page-header>
  `,
};

export const FullHeader: Story = {
  name: 'Full Header (Eyebrow + Tag + Subheading)',
  render: () => html`
    <civ-page-header>
      <span data-eyebrow>Benefits</span>
      <h1 data-heading class="civ-heading-xl">
        Apply for disability compensation
        <civ-tag label="In progress" variant="teal"></civ-tag>
      </h1>
      <span data-subheading>VA Form 21-526EZ</span>
    </civ-page-header>
  `,
};

export const WithStatusTag: Story = {
  name: 'With Status Tag',
  render: () => html`
    <civ-page-header>
      <h1 data-heading class="civ-heading-xl">
        Disability compensation claim
        <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
      </h1>
      <span data-subheading>Claim ID: 12345678</span>
    </civ-page-header>
  `,
};

export const WithStackedTag: Story = {
  name: 'With Stacked Tag',
  render: () => html`
    <civ-page-header>
      <civ-tag data-tag label="Active" variant="green" tag-style="primary"></civ-tag>
      <span data-eyebrow>Benefits</span>
      <h1 data-heading class="civ-heading-xl">
        Apply for disability compensation
      </h1>
      <span data-subheading>VA Form 21-526EZ</span>
    </civ-page-header>
  `,
};

export const StackedAndInlineTag: Story = {
  name: 'Stacked Tag + Inline Tag',
  render: () => html`
    <civ-page-header>
      <civ-tag data-tag label="Claim #12345678" variant="gray"></civ-tag>
      <span data-eyebrow>Benefits</span>
      <h1 data-heading class="civ-heading-xl">
        Disability compensation
        <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
      </h1>
      <span data-subheading>VA Form 21-526EZ</span>
    </civ-page-header>
  `,
};

export const FormPageHeader: Story = {
  name: 'Form Page Example',
  render: () => html`
    <civ-page-header>
      <span data-eyebrow>Chapter 1 of 5</span>
      <h1 data-heading class="civ-heading-xl">Personal information</h1>
      <span data-subheading>Step 1 of 3</span>
    </civ-page-header>
  `,
};
