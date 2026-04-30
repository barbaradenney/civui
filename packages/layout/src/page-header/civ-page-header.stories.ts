import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-page-header.js';
import '../tag/civ-tag.js';
import '@civui/feedback/badge';

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

export const WithStatusBadge: Story = {
  name: 'With Status Badge',
  render: () => html`
    <civ-page-header>
      <h1 data-heading class="civ-heading-xl">
        Disability compensation claim
        <civ-badge label="Decision made" variant="success"></civ-badge>
      </h1>
      <span data-subheading>Claim ID: 12345678</span>
    </civ-page-header>
  `,
};

export const AllSlotCombinations: Story = {
  name: 'All Slot Combinations',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Heading only</p>
        <civ-page-header>
          <h1 data-heading class="civ-heading-xl">Personal information</h1>
        </civ-page-header>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Eyebrow + Heading</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
        </civ-page-header>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Heading + Subheading</p>
        <civ-page-header>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Eyebrow + Heading + Subheading</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Stacked Tag + Eyebrow + Heading + Inline Badge + Subheading</p>
        <civ-page-header>
          <civ-tag data-tag label="Claim #12345678" variant="gray"></civ-tag>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-badge label="Decision made" variant="success"></civ-badge>
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
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-badge label="In progress" variant="info"></civ-badge>
          </h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-badge label="In progress" variant="info"></civ-badge>
          </h1>
          <span data-subheading>VA Form 21-526EZ</span>
        </civ-page-header>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-page-header>
          <span data-eyebrow>Benefits</span>
          <h1 data-heading class="civ-heading-xl">
            Disability compensation
            <civ-badge label="In progress" variant="info"></civ-badge>
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
      <civ-badge data-tag label="Active" variant="success"></civ-badge>
      <span data-eyebrow>Claims and appeals</span>
      <h1 data-heading class="civ-heading-xl">
        Disability compensation claim
        <civ-badge label="Decision made" variant="success"></civ-badge>
      </h1>
      <span data-subheading>Claim ID: 12345678 — Filed March 10, 2026</span>
    </civ-page-header>
  `,
};
