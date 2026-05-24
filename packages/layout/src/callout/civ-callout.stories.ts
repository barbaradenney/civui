import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-callout.js';
import '../notice/civ-notice.js';
import '@civui/feedback';

const meta: Meta = {
  title: 'Layout/Callout',
  component: 'civ-callout',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'warning', 'error', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Note</p>
      <p class="civ-m-0">You must complete this section before continuing to the next step.</p>
    </civ-callout>
  `,
};

export const Info: Story = {
  args: { variant: 'info' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Information</p>
      <p class="civ-m-0">Processing times are currently 3–5 business days.</p>
    </civ-callout>
  `,
};

export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Important</p>
      <p class="civ-m-0">Your session will expire in 15 minutes. Save your progress.</p>
    </civ-callout>
  `,
};

export const Error: Story = {
  name: 'Error',
  args: { variant: 'error' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Action needed</p>
      <p class="civ-m-0">Your application is missing required documents.</p>
    </civ-callout>
  `,
};

export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Complete</p>
      <p class="civ-m-0">Your information has been verified successfully.</p>
    </civ-callout>
  `,
};

export const AllVariants: Story = {
  parameters: {
    // Showcase renders every variant simultaneously — the toolbar
    // `variant` control would be misleading here.
    controls: { exclude: ['variant'] },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4" style="max-width: 600px;">
      <civ-callout>
        <p class="civ-m-0 civ-font-bold civ-mb-1">Default (neutral)</p>
        <p class="civ-m-0">The base accent border is a neutral gray — use when no semantic variant applies.</p>
      </civ-callout>
      <civ-callout variant="info">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Info</p>
        <p class="civ-m-0">Neutral informational message.</p>
      </civ-callout>
      <civ-callout variant="warning">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Warning</p>
        <p class="civ-m-0">Heads-up; user attention recommended.</p>
      </civ-callout>
      <civ-callout variant="error">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Error</p>
        <p class="civ-m-0">Action required to proceed.</p>
      </civ-callout>
      <civ-callout variant="success">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Success</p>
        <p class="civ-m-0">Action completed.</p>
      </civ-callout>
    </div>
  `,
};

export const RichContent: Story = {
  name: 'Rich content (list)',
  args: { variant: 'info' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Before you start</p>
      <p>To finish this section, have the following ready:</p>
      <ul>
        <li>Your Social Security number</li>
        <li>Your most recent W-2</li>
        <li>Bank routing and account numbers</li>
      </ul>
    </civ-callout>
  `,
};

export const AsLandmark: Story = {
  name: 'As an ARIA landmark',
  args: { variant: 'warning' },
  parameters: {
    docs: {
      description: {
        story:
          'The host imposes no role of its own. Set `role` and `aria-labelledby` on `<civ-callout>` directly so the labelled bounding box and the visual chrome (border + padding) coincide. Avoid wrapping the callout in an outer `<div role="region">` — the labelled region would then exclude the callout chrome.',
      },
    },
  },
  render: (args) => html`
    <civ-callout variant="${args.variant}" role="region" aria-labelledby="region-heading">
      <p id="region-heading" class="civ-m-0 civ-font-bold civ-mb-1">Important notice</p>
      <p class="civ-m-0">This region is announced as a landmark to assistive tech.</p>
    </civ-callout>
  `,
};

export const ComposedWithNotice: Story = {
  name: 'Composed with civ-notice',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story: `Callout uses a detached render root — children live
directly as light-DOM descendants. Any markup works inside, including
\`civ-notice\` for icon-prefixed emphasis on a passage that needs to
stand out from the surrounding prose. Useful when the panel body
introduces a topic and the notice flags the must-not-miss consequence.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 600px;">
      <civ-callout variant="info">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Before you continue</p>
        <p>
          The next section asks for your bank routing and account numbers
          so we can deposit benefit payments directly.
        </p>
        <civ-notice
          intent="warning"
          spacing="sm"
          body="Double-check the numbers — a mistyped account causes a 30-day delay before payment can be reissued."
        ></civ-notice>
      </civ-callout>
    </div>
  `,
};

export const ComposedWithMultipleNotices: Story = {
  name: 'Composed with multiple civ-notice (layered consequences)',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story: `Stack multiple \`civ-notice\` rows inside a callout when
several consequences need their own emphasis. Each row carries its own
icon + bold body so the consequences read independently. Pair this
with a short intro paragraph at the top so the callout's heading
still names the topic.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 600px;">
      <civ-callout variant="warning">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Before you submit</p>
        <p>Review these conditions carefully — they apply to every applicant:</p>
        <div class="civ-flex civ-flex-col civ-gap-2 civ-mt-2">
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
      </civ-callout>
    </div>
  `,
};

export const ComposedWithBadge: Story = {
  name: 'Composed with civ-badge — status summary',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story: `Lead a callout with a status badge to answer "what's the
state?" at a glance, then follow with explanatory copy. The badge sits
on its own line above the body text so it reads as a label for the
explanation that follows.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 600px;">
      <civ-callout variant="info">
        <div class="civ-mb-2">
          <civ-badge label="In review" variant="info" badge-style="primary" with-icon></civ-badge>
        </div>
        <p class="civ-m-0 civ-font-bold civ-mb-1">Application status</p>
        <p class="civ-m-0">
          A reviewer was assigned to your application on January 18, 2026.
          You'll receive a written notice once a decision is made — usually within 7 business days.
        </p>
      </civ-callout>
    </div>
  `,
};

export const ComposedWithBadgeList: Story = {
  name: 'Composed with multiple civ-badge — multi-step status',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story: `For multi-step or multi-document status summaries, lay out
a short list of badges inside the callout. Each badge labels one
sub-item and uses the variant that matches its real state — colorblind
users get the meaning from the icon + label, not just the color.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 600px;">
      <civ-callout variant="info">
        <p class="civ-m-0 civ-font-bold civ-mb-2">Your benefits enrollment</p>
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
      </civ-callout>
    </div>
  `,
};

export const ComposedRichBody: Story = {
  name: 'Composed with badge + notice + descriptive copy',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story: `Real placements often mix multiple primitives in one
callout. This example pairs a leading status badge (the answer), a
paragraph of context (the explanation), and a trailing \`civ-notice\`
(the emphasis the user must not miss). Compared with the same pattern
inside \`civ-alert\`, the callout version sits inline within a page
rather than as a top-of-page notification — no dismiss button, no
live region.`,
      },
    },
  },
  render: () => html`
    <div style="max-width: 600px;">
      <civ-callout variant="error">
        <div class="civ-mb-2">
          <civ-badge label="Verification expired" variant="error" badge-style="primary" with-icon></civ-badge>
        </div>
        <p class="civ-m-0 civ-font-bold civ-mb-1">Action required</p>
        <p>
          Your identity verification with Login.gov expired on January 15, 2026.
          Until you re-verify, you cannot submit new claims or view sensitive documents.
        </p>
        <civ-notice
          intent="error"
          spacing="sm"
          body="You have 30 days to re-verify before your account is locked."
        ></civ-notice>
      </civ-callout>
    </div>
  `,
};
