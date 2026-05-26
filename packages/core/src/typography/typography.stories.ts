import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/layout/divider';

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const PrimaryHeadings: Story = {
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
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-text-caption civ-mb-1">Primary headings (bold) — fluid sizes scale with viewport</p>
        <h1 class="civ-heading-xl">Heading XL (2xl token, bold)</h1>
        <h2 class="civ-heading-lg">Heading LG (xl token, bold)</h2>
        <h3 class="civ-heading-md">Heading MD (lg token, bold)</h3>
        <h4 class="civ-heading-sm">Heading SM (base token, bold)</h4>
      </div>
      <civ-divider></civ-divider>
      <div>
        <p class="civ-text-caption civ-mb-1">Secondary headings (regular)</p>
        <h1 class="civ-heading-xl-secondary">Heading XL Secondary (2xl token, regular)</h1>
        <h2 class="civ-heading-lg-secondary">Heading LG Secondary (xl token, regular)</h2>
        <h3 class="civ-heading-md-secondary">Heading MD Secondary (lg token, regular)</h3>
        <h4 class="civ-heading-sm-secondary">Heading SM Secondary (base token, regular)</h4>
      </div>
      <civ-divider></civ-divider>
      <div>
        <p class="civ-text-caption civ-mb-1">Body text</p>
        <p class="civ-text-body">Body (base token, darkest)</p>
        <p class="civ-text-muted">Muted (base token, lighter)</p>
        <p class="civ-text-caption">Caption (sm token, dark)</p>
        <p class="civ-text-small">Small (xs token, dark)</p>
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

export const LeadingTrim: Story = {
  name: 'Leading Trim',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <p class="civ-text-caption">
        Every <code>civ-heading-*</code>, <code>civ-text-body</code>,
        <code>civ-text-muted</code>, <code>civ-text-caption</code>, and
        <code>civ-text-small</code> class has its line-box half-leading
        trimmed via <code>text-box-trim: both</code>. The visible glyph
        sits flush with the container's padding edge — no floating gap
        above the heading or below the last paragraph. Consumers can
        opt arbitrary elements in with <code>class="civ-text-trim"</code>.
      </p>

      <div class="civ-flex civ-flex-col civ-gap-3 sm:civ-flex-row">
        <div
          class="civ-flex-1 civ-p-4"
          style="border: 1px dashed var(--civ-color-base-light);"
        >
          <p class="civ-text-caption civ-mb-2">Heading + body in a padded container</p>
          <h3 class="civ-heading-md">Mailing address</h3>
          <p class="civ-text-body">
            Where should we send correspondence about your application?
            We'll only use this address for official VA communications.
          </p>
        </div>

        <div
          class="civ-flex-1 civ-p-4"
          style="border: 1px dashed var(--civ-color-base-light);"
        >
          <p class="civ-text-caption civ-mb-2">Body-only paragraph</p>
          <p class="civ-text-body">
            Application status updates are sent to the email address
            on file. You can change your preferred contact method any
            time in your account settings.
          </p>
        </div>
      </div>
    </div>
  `,
};

export const DensityScale: Story = {
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
