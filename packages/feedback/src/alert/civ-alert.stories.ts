import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-alert.js';
import '../badge/civ-badge.js';
import '@civui/layout/notice';

const meta: Meta = {
  title: 'Feedback/Alert',
  component: 'civ-alert',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
    },
    alertStyle: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      name: 'alert-style',
    },
    label: { control: 'text' },
    heading: { control: 'text' },
    headingLevel: {
      control: 'select',
      options: [2, 3, 4, 5, 6],
    },
    dismissible: { control: 'boolean' },
    slim: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    variant: 'info',
    alertStyle: 'secondary',
    heading: 'Informational status',
    label: 'This is an informational alert to provide general context about the page or process.',
  },
  render: (args) => html`
    <civ-alert
      variant="${args.variant}"
      alert-style="${args.alertStyle}"
      heading="${args.heading}"
      label="${args.label}"
      ?dismissible="${args.dismissible}"
      ?slim="${args.slim}"
    ></civ-alert>
  `,
};

// ── Individual Variants ───────────────────────────────────────

export const Info: Story = {
  render: () => html`
    <civ-alert variant="info" heading="Information">
      Your application is being processed. You will receive a decision within 30 days.
    </civ-alert>
  `,
};

export const Warning: Story = {
  render: () => html`
    <civ-alert variant="warning" heading="Warning">
      Your session will expire in 5 minutes. Save your progress to avoid losing data.
    </civ-alert>
  `,
};

export const Error: Story = {
  render: () => html`
    <civ-alert variant="error" heading="There is a problem">
      We could not save your information. Check your internet connection and try again.
    </civ-alert>
  `,
};

export const Success: Story = {
  render: () => html`
    <civ-alert variant="success" heading="Application submitted">
      Your application was submitted successfully. Your confirmation number is APP-2026-04-19-0042.
    </civ-alert>
  `,
};

// ── All Variants ──────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert variant="info" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

// ── Style Variants ────────────────────────────────────────────

export const PrimaryStyle: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert variant="info" alert-style="primary" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" alert-style="primary" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" alert-style="primary" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" alert-style="primary" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

export const TertiaryStyle: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert variant="info" alert-style="tertiary" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" alert-style="tertiary" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" alert-style="tertiary" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" alert-style="tertiary" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

export const Slim: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2">
      <civ-alert slim>Informational: Your profile was updated.</civ-alert>
      <civ-alert variant="warning" slim>Warning: Some fields are incomplete.</civ-alert>
      <civ-alert variant="error" slim>Error: File upload failed.</civ-alert>
      <civ-alert variant="success" slim>Success: Changes saved.</civ-alert>
    </div>
  `,
};

export const Dismissible: Story = {
  render: () => html`
    <civ-alert heading="Optional notice" dismissible>
      This alert can be dismissed by clicking the close button.
    </civ-alert>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentFormValidation: Story = {
  name: 'Usage: Form Validation Feedback',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-alert variant="error" heading="There is a problem with your application">
        <ul class="civ-mt-2 civ-mb-0 civ-ps-5">
          <li><a href="#name" style="color: inherit;">Enter your full name</a></li>
          <li><a href="#email" style="color: inherit;">Enter a valid email address</a></li>
          <li><a href="#ssn" style="color: inherit;">Enter a valid Social Security number</a></li>
        </ul>
      </civ-alert>

      <civ-alert variant="success" heading="Application submitted">
        We received your application on April 19, 2026. Your confirmation number is APP-2026-04-19-0042.
        We will review your application and notify you of our decision within 30 days.
      </civ-alert>

      <civ-alert variant="warning" heading="Your session is about to expire">
        For your security, we will sign you out in 5 minutes due to inactivity.
        Select "Continue session" to keep working.
      </civ-alert>
    </div>
  `,
};

// ── Compact ──────────────────────────────────────────────────

export const Compact: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <civ-alert variant="info" heading="Information" spacing="sm">
          Your application is being reviewed.
        </civ-alert>
      </div>
    </div>
  `,
};

export const ComposedWithNotice: Story = {
  name: 'Composed with civ-notice',
  parameters: {
    docs: {
      description: {
        story: `Civ-alert accepts rich children when \`label\` is unset. The
example below composes a \`civ-notice\` inside the alert body so the
banner chrome (background, ARIA live region, dismiss button) is paired
with the icon-prefixed emphasis text from notice. Useful when an
alert needs to draw attention to a specific consequence inside its
body.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 560px;">
      <civ-alert variant="warning" heading="Action needed before submission" dismissible>
        <civ-notice
          intent="warning"
          spacing="sm"
          body="You must complete identity verification before you can submit this application."
        ></civ-notice>
      </civ-alert>
    </div>
  `,
};

export const ComposedWithMultipleNotices: Story = {
  name: 'Composed with multiple civ-notice (layered consequences)',
  parameters: {
    docs: {
      description: {
        story: `When a single alert needs to list several consequences,
stack multiple \`civ-notice\` rows inside its body. Each row carries
its own icon + bold emphasis so the consequences read independently.
Common in pre-submission confirmation banners on government forms.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert variant="warning" heading="Before you submit">
        <div class="civ-flex civ-flex-col civ-gap-3">
          <civ-notice
            intent="warning"
            spacing="sm"
            body="Once submitted, you cannot edit your answers."
          ></civ-notice>
          <civ-notice
            intent="warning"
            spacing="sm"
            body="A non-refundable processing fee of $35.00 will be charged on submission."
          ></civ-notice>
          <civ-notice
            intent="warning"
            spacing="sm"
            body="Knowingly providing false information is punishable by fine or imprisonment."
          ></civ-notice>
        </div>
      </civ-alert>
    </div>
  `,
};

export const ComposedWithBadge: Story = {
  name: 'Composed with civ-badge — status summary',
  parameters: {
    docs: {
      description: {
        story: `Use a status badge inside an alert to surface the current
state at a glance, paired with descriptive copy below. The badge sits
on its own line above the body text so it reads as a label for the
explanation that follows. The alert's heading carries the question
("What's the status?"); the badge answers it.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 560px;">
      <civ-alert variant="info" heading="Application status">
        <div class="civ-flex civ-flex-col civ-gap-2">
          <div>
            <civ-badge label="In review" variant="info" badge-style="primary" with-icon></civ-badge>
          </div>
          <p class="civ-m-0">
            A reviewer was assigned to your application on January 18, 2026.
            You'll receive a written notice once a decision is made — usually within 7 business days.
          </p>
        </div>
      </civ-alert>
    </div>
  `,
};

export const ComposedWithBadgeList: Story = {
  name: 'Composed with multiple civ-badge — multi-step status',
  parameters: {
    docs: {
      description: {
        story: `For multi-step or multi-document status summaries, lay out a
short list of badges inside the alert body. Each badge labels one
sub-item and uses the variant that matches its real state — colorblind
users get the meaning from the icon + label, not just the color. Useful
on landing pages, dashboards, and "what's left" reminders.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert variant="info" heading="Your benefits enrollment">
        <ul class="civ-list-none civ-p-0 civ-m-0 civ-flex civ-flex-col civ-gap-2">
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="Complete" variant="success" with-icon></civ-badge>
            <span>Personal information</span>
          </li>
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="Complete" variant="success" with-icon></civ-badge>
            <span>Direct deposit setup</span>
          </li>
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="In progress" variant="info" with-icon></civ-badge>
            <span>Document upload</span>
          </li>
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="Pending" variant="warning" with-icon></civ-badge>
            <span>Identity verification</span>
          </li>
        </ul>
      </civ-alert>
    </div>
  `,
};

export const ComposedRichBody: Story = {
  name: 'Composed with badge + notice + descriptive copy',
  parameters: {
    docs: {
      description: {
        story: `Real placements mix multiple primitives in one alert body.
This example pairs a leading status badge (the answer), a paragraph
of context (the explanation), and a trailing \`civ-notice\` (the
emphasis the user must not miss). All three live as siblings inside
the alert; the alert provides the surrounding chrome and live region.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert variant="error" heading="Action required" dismissible>
        <div class="civ-flex civ-flex-col civ-gap-3">
          <div>
            <civ-badge label="Verification expired" variant="error" badge-style="primary" with-icon></civ-badge>
          </div>
          <p class="civ-m-0">
            Your identity verification with Login.gov expired on January 15, 2026.
            Until you re-verify, you cannot submit new claims or view sensitive documents.
          </p>
          <civ-notice
            intent="error"
            spacing="sm"
            body="You have 30 days to re-verify before your account is locked."
          ></civ-notice>
        </div>
      </civ-alert>
    </div>
  `,
};
