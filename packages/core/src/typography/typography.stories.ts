import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/ui/divider';

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const PrimaryHeadings: Story = {
  name: 'Primary Headings',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <h1 class="civ-heading-xl">Heading XL — Apply for disability compensation</h1>
      <h2 class="civ-heading-lg">Heading LG — Personal information</h2>
      <h3 class="civ-heading-md">Heading MD — Mailing address</h3>
      <h4 class="civ-heading-sm">Heading SM — Additional details</h4>
    </div>
  `,
};

export const SecondaryHeadings: Story = {
  name: 'Secondary Headings',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <h1 class="civ-heading-xl-secondary">Heading XL Secondary — We'll guide you through each step</h1>
      <h2 class="civ-heading-lg-secondary">Heading LG Secondary — Tell us about your time in service</h2>
      <h3 class="civ-heading-md-secondary">Heading MD Secondary — You can update this later</h3>
      <h4 class="civ-heading-sm-secondary">Heading SM Secondary — Optional information</h4>
    </div>
  `,
};

export const PrimaryAndSecondaryPaired: Story = {
  name: 'Primary + Secondary Paired',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h1 class="civ-heading-xl">Step 1: Personal information</h1>
        <h2 class="civ-heading-lg-secondary">We'll use this to verify your identity</h2>
      </div>
      <div>
        <h2 class="civ-heading-lg">Service history</h2>
        <h3 class="civ-heading-md-secondary">Include all periods of active duty</h3>
      </div>
      <div>
        <h3 class="civ-heading-md">Mailing address</h3>
        <h4 class="civ-heading-sm-secondary">Where should we send correspondence?</h4>
      </div>
    </div>
  `,
};

export const BodyText: Story = {
  name: 'Body Text',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <p class="civ-text-body">Body — Your application has been submitted successfully. You will receive a confirmation number by email.</p>
      <p class="civ-text-muted">Muted — You will receive a confirmation email within 24 hours.</p>
      <p class="civ-text-caption">Caption — Last updated: April 24, 2026</p>
      <p class="civ-text-small">Small — OMB Control No. 2900-0747 | Estimated burden: 25 minutes</p>
    </div>
  `,
};

export const AllStyles: Story = {
  name: 'All Styles',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-text-caption civ-mb-1">Primary headings (bold)</p>
        <h1 class="civ-heading-xl">Heading XL (24px bold)</h1>
        <h2 class="civ-heading-lg">Heading LG (20px bold)</h2>
        <h3 class="civ-heading-md">Heading MD (18px bold)</h3>
        <h4 class="civ-heading-sm">Heading SM (16px bold)</h4>
      </div>
      <civ-divider></civ-divider>
      <div>
        <p class="civ-text-caption civ-mb-1">Secondary headings (regular)</p>
        <h1 class="civ-heading-xl-secondary">Heading XL Secondary (24px regular)</h1>
        <h2 class="civ-heading-lg-secondary">Heading LG Secondary (20px regular)</h2>
        <h3 class="civ-heading-md-secondary">Heading MD Secondary (18px regular)</h3>
        <h4 class="civ-heading-sm-secondary">Heading SM Secondary (16px regular)</h4>
      </div>
      <civ-divider></civ-divider>
      <div>
        <p class="civ-text-caption civ-mb-1">Body text</p>
        <p class="civ-text-body">Body (16px, darkest)</p>
        <p class="civ-text-muted">Muted (16px, lighter)</p>
        <p class="civ-text-caption">Caption (14px, dark)</p>
        <p class="civ-text-small">Small (12px, dark)</p>
      </div>
    </div>
  `,
};

export const GovFormExample: Story = {
  name: 'Usage: Government Form',
  render: () => html`
    <div class="civ-max-w-2xl">
      <h1 class="civ-heading-xl">Apply for VA health care</h1>
      <h2 class="civ-heading-lg-secondary">VA Form 10-10EZ</h2>

      <p class="civ-text-body civ-mb-6">
        Use this form to apply for VA health care. You can apply online, by phone, by mail,
        or in person at your nearest VA medical center.
      </p>

      <h2 class="civ-heading-lg">Step 1 of 4: Veteran information</h2>
      <h3 class="civ-heading-md-secondary">We'll use this information to verify your identity and eligibility</h3>

      <p class="civ-text-body civ-mb-4">
        Please provide your legal name as it appears on your government-issued ID.
      </p>

      <p class="civ-text-caption civ-mb-6">
        All fields marked with (*) are required.
      </p>

      <civ-divider></civ-divider>

      <p class="civ-text-small civ-mt-4">
        Respondent burden: 25 minutes | OMB Control No. 2900-0091 | Expiration date: 02/28/2027
      </p>
      <p class="civ-text-small">
        Privacy Act statement: VA collects this information under authority of 38 U.S.C. Sections 1705 and 1710.
      </p>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div data-civ-scale="dense">
        <p class="civ-text-caption civ-mb-2">Dense</p>
        <h2 class="civ-heading-lg">Personal information</h2>
        <h3 class="civ-heading-md-secondary">Required for identity verification</h3>
        <p class="civ-text-body">Please provide your full legal name and date of birth.</p>
        <p class="civ-text-caption">All fields are required unless marked optional.</p>
      </div>
      <civ-divider></civ-divider>
      <div>
        <p class="civ-text-caption civ-mb-2">Default</p>
        <h2 class="civ-heading-lg">Personal information</h2>
        <h3 class="civ-heading-md-secondary">Required for identity verification</h3>
        <p class="civ-text-body">Please provide your full legal name and date of birth.</p>
        <p class="civ-text-caption">All fields are required unless marked optional.</p>
      </div>
      <civ-divider></civ-divider>
      <div data-civ-scale="spacious">
        <p class="civ-text-caption civ-mb-2">Spacious</p>
        <h2 class="civ-heading-lg">Personal information</h2>
        <h3 class="civ-heading-md-secondary">Required for identity verification</h3>
        <p class="civ-text-body">Please provide your full legal name and date of birth.</p>
        <p class="civ-text-caption">All fields are required unless marked optional.</p>
      </div>
    </div>
  `,
};
