import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-alert.js';
import '../badge/civ-badge.js';
import '../notice/civ-notice.js';

const meta: Meta = {
  title: 'Feedback/Alert',
  component: 'civ-alert',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success', 'neutral'],
    },
    emphasis: {
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
    emphasis: 'secondary',
    heading: 'Informational status',
    label: 'This is an informational alert to provide general context about the page or process.',
  },
  render: (args) => html`
    <civ-alert
      intent="${args.variant}"
      emphasis="${args.emphasis}"
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
    <civ-alert intent="info" heading="Information">
      Your application is being processed. You will receive a decision within 30 days.
    </civ-alert>
  `,
};

export const Warning: Story = {
  render: () => html`
    <civ-alert intent="warning" heading="Warning">
      Your session will expire in 5 minutes. Save your progress to avoid losing data.
    </civ-alert>
  `,
};

export const Error: Story = {
  render: () => html`
    <civ-alert intent="error" heading="There is a problem">
      We could not save your information. Check your internet connection and try again.
    </civ-alert>
  `,
};

export const Success: Story = {
  render: () => html`
    <civ-alert intent="success" heading="Application submitted">
      Your application was submitted successfully. Your confirmation number is APP-2026-04-19-0042.
    </civ-alert>
  `,
};

export const Neutral: Story = {
  parameters: {
    docs: {
      description: {
        story: `Use \`intent="neutral"\` for non-status announcements that
shouldn't carry a semantic color — new feature notices, "heads up"
context, or housekeeping reminders that aren't informational, warning,
error, or success. Renders with the base-darker palette so the alert
reads as content emphasis rather than a status signal. The CSS
literal \`civ-alert--neutral\` is referenced here so Tailwind's
content scanner emits the class.`,
      },
    },
  },
  render: () => html`
    <civ-alert intent="neutral" heading="New: Save and continue later">
      You can now save your application at any step and return to it
      later from your account dashboard. Drafts are kept for 60 days.
    </civ-alert>
  `,
};

// ── All Variants ──────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert intent="info" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert intent="warning" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert intent="error" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert intent="success" heading="Success">
        Your form has been submitted.
      </civ-alert>
      <civ-alert intent="neutral" heading="Heads up">
        Drafts older than 60 days are removed automatically.
      </civ-alert>
    </div>
  `,
};

// ── Style Variants ────────────────────────────────────────────

export const PrimaryStyle: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert intent="info" emphasis="primary" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert intent="warning" emphasis="primary" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert intent="error" emphasis="primary" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert intent="success" emphasis="primary" heading="Success">
        Your form has been submitted.
      </civ-alert>
      <civ-alert intent="neutral" emphasis="primary" heading="Heads up">
        Drafts older than 60 days are removed automatically.
      </civ-alert>
    </div>
  `,
};

export const TertiaryStyle: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert intent="info" emphasis="tertiary" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert intent="warning" emphasis="tertiary" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert intent="error" emphasis="tertiary" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert intent="success" emphasis="tertiary" heading="Success">
        Your form has been submitted.
      </civ-alert>
      <civ-alert intent="neutral" emphasis="tertiary" heading="Heads up">
        Drafts older than 60 days are removed automatically.
      </civ-alert>
    </div>
  `,
};

export const Slim: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2">
      <civ-alert slim>Informational: Your profile was updated.</civ-alert>
      <civ-alert intent="warning" slim>Warning: Some fields are incomplete.</civ-alert>
      <civ-alert intent="error" slim>Error: File upload failed.</civ-alert>
      <civ-alert intent="success" slim>Success: Changes saved.</civ-alert>
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
        <civ-alert intent="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-alert intent="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-alert intent="info" heading="Information">
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
      <civ-alert intent="error" heading="There is a problem with your application">
        <p class="civ-m-0 civ-mb-2">Fix the following before continuing:</p>
        <ul>
          <li><a href="#name">Enter your full name</a></li>
          <li><a href="#email">Enter a valid email address</a></li>
          <li><a href="#ssn">Enter a valid Social Security number</a></li>
        </ul>
      </civ-alert>

      <civ-alert intent="success" heading="Application submitted">
        We received your application on April 19, 2026. Your confirmation number is APP-2026-04-19-0042.
        We will review your application and notify you of our decision within 30 days.
      </civ-alert>

      <civ-alert intent="warning" heading="Your session is about to expire">
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
        <civ-alert intent="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <civ-alert intent="info" heading="Information" spacing="sm">
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
      <civ-alert intent="warning" heading="Action needed before submission" dismissible>
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
      <civ-alert intent="warning" heading="Before you submit">
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
        story: `A status badge sits above the heading via the
\`data-civ-alert-prefix\` slot, so the visual reading order is
*current state → title → explanation*. Mark the badge with the
\`data-civ-alert-prefix\` attribute to route it into the prefix slot.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 560px;">
      <civ-alert intent="info" heading="Application status">
        <civ-badge
          data-civ-alert-prefix
          label="In review"
          intent="info"
          emphasis="primary"
          with-icon
        ></civ-badge>
        <p class="civ-m-0">
          A reviewer was assigned to your application on January 18, 2026.
          You'll receive a written notice once a decision is made — usually within 7 business days.
        </p>
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
      <civ-alert intent="info" emphasis="tertiary" heading="Your benefits enrollment">
        <ul class="civ-list-none civ-p-0 civ-m-0 civ-flex civ-flex-col civ-gap-2">
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="Complete" intent="success" with-icon></civ-badge>
            <span>Personal information</span>
          </li>
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="Complete" intent="success" with-icon></civ-badge>
            <span>Direct deposit setup</span>
          </li>
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="In progress" intent="info" with-icon></civ-badge>
            <span>Document upload</span>
          </li>
          <li class="civ-flex civ-items-center civ-gap-3">
            <civ-badge label="Pending" intent="warning" with-icon></civ-badge>
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
        story: `Real placements mix multiple primitives in one alert. The
status badge uses the \`data-civ-alert-prefix\` slot so it sits above
the heading as a category cue; the body content combines a paragraph
of context and a trailing \`civ-notice\` for the emphasis the user
must not miss.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert intent="error" heading="Action required" dismissible>
        <civ-badge
          data-civ-alert-prefix
          label="Verification expired"
          intent="error"
          emphasis="primary"
          with-icon
        ></civ-badge>
        <div class="civ-flex civ-flex-col civ-gap-3">
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

// ── Collapsible (accordion) mode ─────────────────────────────
// `civ-alert--collapsible` literal here so Tailwind's content
// scanner emits the class CSS — see lint:purged-variants.

export const Collapsible: Story = {
  name: 'Collapsible (accordion) alert',
  parameters: {
    docs: {
      description: {
        story: `When set, the heading becomes a clickable toggle and the body
collapses behind a chevron. Built on the native \`<details>\`/\`<summary>\`
primitive so keyboard navigation and screen-reader announcements come
for free. Combines with \`dismissible\`. Without a \`heading\` the prop
is a dev-mode no-op — the heading is the toggle.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert
        intent="info"
        heading="Why we ask for your Social Security number"
        collapsible
      >
        We use your Social Security number to verify your identity, prevent
        fraud, and match your application to existing records on file.
        Federal law authorizes this collection under 38 U.S.C. § 5101.
        You can decline, but doing so may delay or prevent processing
        of your claim.
      </civ-alert>
    </div>
  `,
};

export const CollapsibleOpen: Story = {
  name: 'Collapsible — initially open',
  parameters: {
    docs: {
      description: {
        story: `Add \`open\` to render expanded on first paint. Useful when
the consumer wants the details visible by default but still wants
the user to be able to collapse them.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert
        intent="warning"
        heading="Action needed before your benefits start"
        collapsible
        open
      >
        Your direct deposit information is incomplete. Visit the Banking
        section to add a routing number and account number — payments
        cannot be issued until both are on file. Your first payment will
        be released within 5 business days of completion.
      </civ-alert>
    </div>
  `,
};

export const CollapsibleDismissible: Story = {
  name: 'Collapsible + dismissible',
  parameters: {
    docs: {
      description: {
        story: `The two affordances coexist — chevron + close button both
sit in the heading row. Clicking the close button dismisses the alert
without toggling the disclosure (the click handler stops propagation
so the click doesn't bubble into the summary).`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-alert
        intent="info"
        heading="New: Save and continue later"
        collapsible
        dismissible
      >
        You can now save your application at any step and return to it
        later from your account dashboard. Your draft is saved automatically
        every 30 seconds. Drafts expire after 60 days of inactivity.
      </civ-alert>
    </div>
  `,
};

// ── Full-width site banner mode ──────────────────────────────
// `civ-alert--full-width` literal here so Tailwind's content
// scanner emits the class CSS — see lint:purged-variants.

export const FullWidthBanner: Story = {
  name: 'Full-width site banner',
  parameters: {
    docs: {
      description: {
        story: `For persistent site-wide notices placed at the top of every
page. The role auto-switches from \`alert\`/\`status\` (live region) to
\`region\` (landmark) and \`aria-label\` is auto-derived from the
heading — so the banner appears in the screen-reader rotor as a named
landmark without re-announcing on every navigation. Inner content
centers to \`--civ-site-max-width\` so the banner spans the viewport
edge-to-edge while the text stays readable.`,
      },
    },
  },
  render: () => html`
    <civ-alert full-width emphasis="primary" intent="warning" heading="System maintenance scheduled">
      We will perform planned maintenance from 11:00 PM Friday to 6:00 AM
      Saturday Eastern Time. Online applications and account dashboard will
      be unavailable during this window.
    </civ-alert>
  `,
};

export const FullWidthBannerDismissible: Story = {
  name: 'Full-width site banner — dismissible',
  parameters: {
    docs: {
      description: {
        story: `Combine \`full-width\` with \`dismissible\` for site-wide
notices the user can clear once they've read them. The close button
sits at the right edge of the centered content max-width.`,
      },
    },
  },
  render: () => html`
    <civ-alert full-width emphasis="primary" intent="info" heading="Form update available" dismissible>
      We've simplified the dependent claim form. You'll see fewer questions
      this year, and we'll pre-fill any answers we already have on file.
    </civ-alert>
  `,
};
