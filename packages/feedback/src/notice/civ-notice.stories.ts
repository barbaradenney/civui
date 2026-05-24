import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-notice.js';
import '../callout/civ-callout.js';

const meta: Meta = {
  title: 'Feedback/Notice',
  component: 'civ-notice',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Icon-prefixed emphasis text for highlighting a specific passage inside
longer content — legal, safety, or financial consequences a reader
could miss in flowing prose. Based on GOV.UK's
[warning text](https://design-system.service.gov.uk/components/warning-text/)
pattern, generalized with semantic intents (info / warning / error /
success / neutral).

Use \`civ-notice\` for emphasis on a passage the user is already reading.
Use \`<civ-alert>\` for a notification you hand the user (with dismiss +
ARIA live region). Use \`<civ-callout>\` for a panel with rich body
content and inline links.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        header="You must register"
        body="You can be fined up to $5,000 if you do not register before the deadline."
      ></civ-notice>
    </div>
  `,
};

export const BodyOnly: Story = {
  name: 'Body only — GOV.UK warning-text equivalent',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="warning"
        body="You can be fined up to $5,000 if you do not register."
      ></civ-notice>
    </div>
  `,
};

export const Info: Story = {
  name: 'Info intent',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="info"
        header="Document upload required"
        body="You will need a recent utility bill or bank statement to verify your address."
      ></civ-notice>
    </div>
  `,
};

export const Warning: Story = {
  name: 'Warning intent',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="warning"
        header="Submission is final"
        body="Once you submit, you cannot edit your answers. Review them carefully."
      ></civ-notice>
    </div>
  `,
};

export const ErrorIntent: Story = {
  name: 'Error intent',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="error"
        header="Application not received"
        body="We do not have a record of your application. Please contact support to confirm before the deadline."
      ></civ-notice>
    </div>
  `,
};

export const Success: Story = {
  name: 'Success intent',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="success"
        header="Eligible for expedited review"
        body="Based on your service-connected disability rating, your claim qualifies for the priority review queue."
      ></civ-notice>
    </div>
  `,
};

export const Neutral: Story = {
  name: 'Neutral intent',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="neutral"
        header="About this form"
        body="This form takes most veterans about 25 minutes to complete. You can save and return at any point."
      ></civ-notice>
    </div>
  `,
};

export const Compact: Story = {
  name: 'Compact (spacing=sm)',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="info"
        spacing="sm"
        body="This step is optional. You can skip it and return later."
      ></civ-notice>
    </div>
  `,
};

export const WithScreenReaderPrefix: Story = {
  name: 'With screen-reader prefix',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="warning"
        sr-prefix="Warning:"
        header="Identity verification required"
        body="You must complete identity verification with Login.gov before continuing."
      ></civ-notice>
    </div>
  `,
};

export const InsideCallout: Story = {
  name: 'Composed inside a callout',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-callout variant="warning">
        <p style="margin: 0 0 0.75rem; font-weight: bold;">Before you continue</p>
        <p style="margin: 0 0 1rem;">
          Make sure your identity documents are scanned and ready before
          beginning the verification step. The session times out after
          15 minutes of inactivity.
        </p>
        <civ-notice
          intent="warning"
          spacing="sm"
          body="If your session times out, you will need to start over from the beginning."
        ></civ-notice>
      </civ-callout>
    </div>
  `,
};

export const Secondary: Story = {
  name: 'Secondary weight (passive emphasis)',
  parameters: {
    docs: {
      description: {
        story: `\`civ-notice\` defaults to \`notice-style="primary"\` —
filled icons for heavier visual presence. Set
\`notice-style="secondary"\` for a more passive callout where the
placement competes with surrounding chrome and a softer cue reads
better. The icon switches to its outlined glyph counterpart per
intent (\`info-fill\` → \`info\`, etc.); padding, header weight, and
body styling stay identical.`,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3" style="max-width: 560px;">
      <civ-notice
        intent="info"
        notice-style="secondary"
        body="Info — quieter affordance for ambient information."
      ></civ-notice>
      <civ-notice
        intent="warning"
        notice-style="secondary"
        body="Warning — softer cue when nested in a colored panel."
      ></civ-notice>
      <civ-notice
        intent="error"
        notice-style="secondary"
        body="Error — less visually loud than the primary default."
      ></civ-notice>
      <civ-notice
        intent="success"
        notice-style="secondary"
        body="Success — same shape, lighter weight."
      ></civ-notice>
    </div>
  `,
};

// ── Custom icons (notice as a general icon-prefixed emphasis tool) ──
// The five built-in intents map to status icons (info / warning /
// error / check-circle), but `icon` accepts ANY name from the CivUI
// icon library — these stories show common non-status uses so
// consumers see notice as more than a status indicator.

export const CustomIconCalendar: Story = {
  name: 'Custom icon — appointment reminder',
  parameters: {
    docs: {
      description: {
        story: `Override \`icon\` with any glyph from the CivUI icon
library when the notice is communicating something beyond the five
built-in intents. Here a calendar icon flags an upcoming appointment.
Pair with \`intent="neutral"\` so the icon color reads as informational
rather than status.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="neutral"
        icon="calendar"
        header="Your appointment is scheduled"
        body="Tuesday, February 4, 2026 at 9:00 AM. Bring photo ID and your appointment confirmation."
      ></civ-notice>
    </div>
  `,
};

export const CustomIconMail: Story = {
  name: 'Custom icon — confirmation by mail',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="info"
        icon="mail"
        header="Confirmation mailed"
        body="A paper confirmation was sent to the address on file. Allow 7–10 business days for delivery."
      ></civ-notice>
    </div>
  `,
};

export const CustomIconDocument: Story = {
  name: 'Custom icon — required document',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="warning"
        icon="upload"
        header="Document required to continue"
        body="Upload a recent utility bill or bank statement to verify your address before submitting."
      ></civ-notice>
    </div>
  `,
};

export const CustomIconPhone: Story = {
  name: 'Custom icon — contact instruction',
  render: () => html`
    <div style="max-width: 560px;">
      <civ-notice
        intent="neutral"
        icon="phone"
        header="Need help completing this form?"
        body="Call 1-800-827-1000, Monday through Friday, 8:00 AM to 9:00 PM Eastern Time."
      ></civ-notice>
    </div>
  `,
};

export const CustomIconSecondaryWeight: Story = {
  name: 'Custom icon + secondary weight',
  parameters: {
    docs: {
      description: {
        story: `\`notice-style="secondary"\` only picks the default
glyph for the intent — when \`icon\` is overridden the consumer's
glyph is used regardless. The secondary weight is still useful with
custom icons because the visual difference comes from CSS (icon size,
spacing) rather than the glyph variant.`,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3" style="max-width: 560px;">
      <civ-notice
        intent="neutral"
        notice-style="secondary"
        icon="calendar"
        body="Renewal due February 28, 2026."
      ></civ-notice>
      <civ-notice
        intent="info"
        notice-style="secondary"
        icon="mail"
        body="Your benefit letter was mailed on January 18."
      ></civ-notice>
    </div>
  `,
};
