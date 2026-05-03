import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-link-card.js';
import '@civui/layout/tag';
import '@civui/feedback/badge';

const meta: Meta = {
  title: 'Navigation/Link Card',
  component: 'civ-link-card',
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
    heading: { control: 'text' },
    description: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'critical', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    href: '#',
    heading: 'Disability compensation',
    description: 'File a claim for a service-connected disability.',
  },
  render: (args) => html`
    <civ-link-card
      href="${args.href}"
      heading="${args.heading}"
      description="${args.description}"
    ></civ-link-card>
  `,
};

export const Primary: Story = {
  render: () => html`
    <civ-link-card
      href="#/benefits"
      heading="Apply for benefits"
      description="Start a new application for VA benefits."
    ></civ-link-card>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <civ-link-card
      href="#/details"
      heading="View your claim details"
      description="Check the status of your open claims and appeals."
      variant="secondary"
    ></civ-link-card>
  `,
};

export const Tertiary: Story = {
  render: () => html`
    <civ-link-card
      href="#/history"
      heading="Payment history"
      description="View your past benefit payments and details."
      variant="tertiary"
    ></civ-link-card>
  `,
};

export const Critical: Story = {
  render: () => html`
    <civ-link-card
      href="#/action-needed"
      heading="Action needed"
      description="Your claim requires additional documents before it can be processed."
      variant="critical"
    ></civ-link-card>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-link-card
        href="#/benefits"
        heading="Apply for benefits"
        description="Start a new application for VA benefits."
      ></civ-link-card>
      <civ-link-card
        href="#/details"
        heading="View your claim details"
        description="Check the status of your open claims and appeals."
        variant="secondary"
      ></civ-link-card>
      <civ-link-card
        href="#/history"
        heading="Payment history"
        description="View your past benefit payments and details."
        variant="tertiary"
      ></civ-link-card>
      <civ-link-card
        href="#/action"
        heading="Action needed on your claim"
        description="Upload required documents to continue processing your claim."
        variant="critical"
      ></civ-link-card>
      <civ-link-card
        href="#/cancel"
        heading="Cancel your application"
        description="This action cannot be undone."
        variant="danger"
      ></civ-link-card>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-flex-col civ-gap-3 civ-max-w-lg">
          <civ-link-card
            href="#/disability"
            heading="Disability compensation"
            description="File a claim for a service-connected condition."
          ></civ-link-card>
          <civ-link-card
            href="#/healthcare"
            heading="Health care"
            description="Apply for VA health care benefits."
            variant="secondary"
          ></civ-link-card>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-flex-col civ-gap-3 civ-max-w-lg">
          <civ-link-card
            href="#/disability"
            heading="Disability compensation"
            description="File a claim for a service-connected condition."
          ></civ-link-card>
          <civ-link-card
            href="#/healthcare"
            heading="Health care"
            description="Apply for VA health care benefits."
            variant="secondary"
          ></civ-link-card>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-flex-col civ-gap-3 civ-max-w-lg">
          <civ-link-card
            href="#/disability"
            heading="Disability compensation"
            description="File a claim for a service-connected condition."
          ></civ-link-card>
          <civ-link-card
            href="#/healthcare"
            heading="Health care"
            description="Apply for VA health care benefits."
            variant="secondary"
          ></civ-link-card>
        </div>
      </div>
    </div>
  `,
};

export const BenefitsHub: Story = {
  name: 'Benefits Hub',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3 civ-max-w-lg">
      <civ-link-card
        href="#/disability"
        heading="Disability compensation"
        description="File a claim for a new or worsening service-connected condition."
      ></civ-link-card>
      <civ-link-card
        href="#/healthcare"
        heading="Health care"
        description="Apply for VA health care benefits and manage your appointments."
      ></civ-link-card>
      <civ-link-card
        href="#/education"
        heading="Education benefits"
        description="Apply for GI Bill and other education and training programs."
      ></civ-link-card>
      <civ-link-card
        href="#/housing"
        heading="Housing assistance"
        description="Get a VA-backed home loan or find housing support."
      ></civ-link-card>
    </div>
  `,
};

export const DashboardGrid: Story = {
  name: 'Dashboard Grid',
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));" class="civ-gap-4">
      <civ-link-card
        href="#/claims"
        heading="Check claim status"
        description="Track the progress of your open claims and appeals."
      ></civ-link-card>
      <civ-link-card
        href="#/appointments"
        heading="Appointments"
        description="Schedule and manage your VA health appointments."
      ></civ-link-card>
      <civ-link-card
        href="#/payments"
        heading="Payment history"
        description="View your VA benefit payment history and details."
      ></civ-link-card>
      <civ-link-card
        href="#/letters"
        heading="Download letters"
        description="Get copies of your VA benefit letters and documents."
      ></civ-link-card>
    </div>
  `,
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-link-card
        href="#/benefits"
        heading="Disability compensation"
        description="File a claim for a service-connected disability."
        icon-start="check-circle"
      ></civ-link-card>
      <civ-link-card
        href="#/education"
        heading="Education benefits"
        description="Apply for GI Bill and other education programs."
        icon-start="document"
      ></civ-link-card>
      <civ-link-card
        href="#/details"
        heading="View full details"
        description="See your complete application history."
        icon-end="chevron-right"
        variant="secondary"
      ></civ-link-card>
      <civ-link-card
        href="#/download"
        heading="Download documents"
        description="Get copies of your VA letters."
        icon-start="download"
        icon-end="chevron-right"
        variant="tertiary"
      ></civ-link-card>
    </div>
  `,
};

export const ColorsPrimary: Story = {
  name: 'Colors (Primary)',
  render: () => html`
    <div class="civ-grid civ-gap-4" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
      <civ-link-card href="#" heading="Blue" color="blue" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Teal" color="teal" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Green" color="green" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Red" color="red" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Yellow" color="yellow" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Orange" color="orange" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Purple" color="purple" variant="primary"></civ-link-card>
      <civ-link-card href="#" heading="Gray" color="gray" variant="primary"></civ-link-card>
    </div>
  `,
};

export const ColorsTint: Story = {
  name: 'Colors (Tint)',
  render: () => html`
    <div class="civ-grid civ-gap-4" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
      <civ-link-card href="#" heading="Blue" description="Light tint" color="blue" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Teal" description="Light tint" color="teal" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Green" description="Light tint" color="green" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Red" description="Light tint" color="red" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Yellow" description="Light tint" color="yellow" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Orange" description="Light tint" color="orange" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Purple" description="Light tint" color="purple" variant="secondary"></civ-link-card>
      <civ-link-card href="#" heading="Gray" description="Light tint" color="gray" variant="secondary"></civ-link-card>
    </div>
  `,
};

export const Compact: Story = {
  name: 'Compact',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6 civ-max-w-lg">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default</p>
        <civ-link-card
          href="#/benefits"
          heading="Apply for benefits"
          description="Start a new application for VA benefits."
        ></civ-link-card>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <civ-link-card
          href="#/benefits"
          heading="Apply for benefits"
          description="Start a new application for VA benefits."
          spacing="sm"
        ></civ-link-card>
      </div>
    </div>
  `,
};

export const WithSlots: Story = {
  name: 'With Slots (top + end)',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-2xl">
      <div>
        <p class="civ-font-semibold civ-mb-2">Top slot</p>
        <civ-link-card
          href="#/benefits"
          heading="Disability compensation"
          description="File a claim for a service-connected disability."
          variant="tertiary"
        >
          <civ-tag label="New" variant="blue"></civ-tag>
        </civ-link-card>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">End slot (data-civ-link-card-end)</p>
        <civ-link-card
          href="#/benefits"
          heading="Disability compensation"
          description="File a claim for a service-connected disability."
          variant="tertiary"
        >
          <civ-badge data-civ-link-card-end label="In progress" variant="warning"></civ-badge>
        </civ-link-card>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Both slots</p>
        <civ-link-card
          href="#/benefits"
          heading="Disability compensation"
          description="File a claim for a service-connected disability."
          variant="tertiary"
        >
          <civ-tag label="Updated" variant="purple"></civ-tag>
          <civ-badge data-civ-link-card-end label="In progress" variant="warning"></civ-badge>
        </civ-link-card>
      </div>
    </div>
  `,
};

export const WithEyebrow: Story = {
  name: 'With Eyebrow',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-2xl">
      <div>
        <p class="civ-font-semibold civ-mb-2">Eyebrow text</p>
        <civ-link-card
          href="#/benefits/disability"
          eyebrow="Benefits"
          heading="Disability compensation"
          description="File a claim for a service-connected disability."
          variant="tertiary"
        ></civ-link-card>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Eyebrow + badge slot</p>
        <civ-link-card
          href="#/claims/123"
          eyebrow="Claim"
          heading="Claim #VA-2026-0847"
          description="Filed January 15, 2026"
          variant="tertiary"
        >
          <civ-badge label="In Progress" variant="warning"></civ-badge>
        </civ-link-card>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Eyebrow on primary variant</p>
        <civ-link-card
          href="#/healthcare"
          eyebrow="Healthcare"
          heading="Schedule an appointment"
          description="Book a visit with your primary care provider."
        ></civ-link-card>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Eyebrow on critical variant</p>
        <civ-link-card
          href="#/action"
          eyebrow="Action required"
          heading="Upload missing documents"
          description="Your claim requires additional evidence before it can be processed."
          variant="critical"
        ></civ-link-card>
      </div>
    </div>
  `,
};
