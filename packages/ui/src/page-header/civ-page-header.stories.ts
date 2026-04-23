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

export const AllSlotCombinations: Story = {
  name: 'All Slot Combinations',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Heading only</p>
        <civ-page-header>
          <h1 data-heading class="civ-heading-xl">Personal information</h1>
        </civ-page-header>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Eyebrow + Heading</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
        </civ-page-header>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Heading + Subheading</p>
        <civ-page-header>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Eyebrow + Heading + Subheading</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Stacked Tag + Eyebrow + Heading + Inline Tag + Subheading</p>
        <civ-page-header>
          <civ-tag data-tag label="Claim #12345678" variant="gray"></civ-tag>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
          </h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
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
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-tag label="In progress" variant="teal"></civ-tag>
          </h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-tag label="In progress" variant="teal"></civ-tag>
          </h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-tag label="In progress" variant="teal"></civ-tag>
          </h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
    </div>
  `,
};

export const FormPageHeader: Story = {
  name: 'Form Page',
  render: () => html`
    <civ-page-header>
      <span data-eyebrow>Chapter 1 of 5</span>
      <h1 data-heading class="civ-heading-xl">Personal information</h1>
      <span data-subheading>Step 1 of 3</span>
    </civ-page-header>
  `,
};

export const ClaimDetailHeader: Story = {
  name: 'Claim Detail',
  render: () => html`
    <civ-page-header>
      <civ-tag data-tag label="Active" variant="green" tag-style="primary"></civ-tag>
      <span data-eyebrow>Claims and appeals</span>
      <h1 data-heading class="civ-heading-xl">
        Disability compensation claim
        <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
      </h1>
      <span data-subheading>Claim ID: 12345678 — Filed March 10, 2026</span>
    </civ-page-header>
  `,
};

export const Compact: Story = {
  name: 'Compact',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <p style="font-weight: 600; margin-bottom: 8px;">Default</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p style="font-weight: 600; margin-bottom: 8px;">Compact (sm)</p>
        <civ-page-header spacing="sm">
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
    </div>
  `,
};
