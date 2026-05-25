import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-callout.js';
// Sibling imports register `civ-notice` and `civ-badge` for the
// composition stories below.
import '../notice/civ-notice.js';
import '../badge/civ-badge.js';

const meta: Meta = {
  title: 'Feedback/Callout',
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
    <civ-callout intent="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Note</p>
      <p class="civ-m-0">You must complete this section before continuing to the next step.</p>
    </civ-callout>
  `,
};

export const Info: Story = {
  args: { variant: 'info' },
  render: (args) => html`
    <civ-callout intent="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Information</p>
      <p class="civ-m-0">Processing times are currently 3–5 business days.</p>
    </civ-callout>
  `,
};

export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => html`
    <civ-callout intent="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Important</p>
      <p class="civ-m-0">Your session will expire in 15 minutes. Save your progress.</p>
    </civ-callout>
  `,
};

export const Error: Story = {
  name: 'Error',
  args: { variant: 'error' },
  render: (args) => html`
    <civ-callout intent="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Action needed</p>
      <p class="civ-m-0">Your application is missing required documents.</p>
    </civ-callout>
  `,
};

export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => html`
    <civ-callout intent="${args.variant}">
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
      <civ-callout intent="info">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Info</p>
        <p class="civ-m-0">Neutral informational message.</p>
      </civ-callout>
      <civ-callout intent="warning">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Warning</p>
        <p class="civ-m-0">Heads-up; user attention recommended.</p>
      </civ-callout>
      <civ-callout intent="error">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Error</p>
        <p class="civ-m-0">Action required to proceed.</p>
      </civ-callout>
      <civ-callout intent="success">
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
    <civ-callout intent="${args.variant}">
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
    <civ-callout intent="${args.variant}" role="region" aria-labelledby="region-heading">
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
      <civ-callout intent="info">
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
      <civ-callout intent="warning">
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
      <civ-callout intent="info">
        <div class="civ-mb-2">
          <civ-badge label="In review" intent="info" emphasis="primary" with-icon></civ-badge>
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
      <civ-callout intent="info">
        <p class="civ-m-0 civ-font-bold civ-mb-2">Your benefits enrollment</p>
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
      <civ-callout intent="error">
        <div class="civ-mb-2">
          <civ-badge label="Verification expired" intent="error" emphasis="primary" with-icon></civ-badge>
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

export const Secondary: Story = {
  name: 'Secondary weight (thinner rail)',
  parameters: {
    controls: { exclude: ['variant'] },
    docs: {
      description: {
        story: `\`callout-style="secondary"\` drops the accent rail from
5px to 3px for a quieter affordance. Use when a callout sits next to a
primary callout or near body content that shouldn't be visually
overpowered. Padding and variant colors stay identical so the two
weights read as the same family.`,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 600px;">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Side-by-side — primary above, secondary below</p>
        <div class="civ-flex civ-flex-col civ-gap-3">
          <civ-callout intent="warning">
            <p class="civ-m-0 civ-font-bold civ-mb-1">Primary (5px rail)</p>
            <p class="civ-m-0">Your session will expire in 15 minutes — the rail commands attention.</p>
          </civ-callout>
          <civ-callout intent="warning" emphasis="secondary">
            <p class="civ-m-0 civ-font-bold civ-mb-1">Secondary (3px rail)</p>
            <p class="civ-m-0">Same variant + same content; thinner rail recedes for a quieter tone.</p>
          </civ-callout>
        </div>
      </div>

      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">All variants at secondary weight</p>
        <div class="civ-flex civ-flex-col civ-gap-3">
          <civ-callout emphasis="secondary">
            <p class="civ-m-0">Default — neutral accent, subtle.</p>
          </civ-callout>
          <civ-callout intent="info" emphasis="secondary">
            <p class="civ-m-0">Info — quieter routine guidance.</p>
          </civ-callout>
          <civ-callout intent="warning" emphasis="secondary">
            <p class="civ-m-0">Warning — softer heads-up.</p>
          </civ-callout>
          <civ-callout intent="error" emphasis="secondary">
            <p class="civ-m-0">Error — toned-down problem callout.</p>
          </civ-callout>
          <civ-callout intent="success" emphasis="secondary">
            <p class="civ-m-0">Success — gentle confirmation.</p>
          </civ-callout>
        </div>
      </div>
    </div>
  `,
};

export const Compact: Story = {
  name: 'Compact (spacing="sm")',
  parameters: {
    docs: {
      description: {
        story: `\`spacing="sm"\` shrinks the inner padding from 12px / 16px
to 8px / 12px (one step on the spacing ladder) for placements inside
dense surfaces — data-grid empty states, compact reference tables,
sidebar notes. Per the density-convention Contract A: pure shrink,
no chrome dropped, no layout change. The rail width, intent colors,
and content layout are identical.`,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 600px;">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default vs sm — same intent, side-by-side</p>
        <div class="civ-flex civ-flex-col civ-gap-3">
          <civ-callout intent="info">
            <p class="civ-m-0 civ-font-bold civ-mb-1">Default padding (12 / 16)</p>
            <p class="civ-m-0">Established callout spacing. Use in normal page flow.</p>
          </civ-callout>
          <civ-callout intent="info" spacing="sm">
            <p class="civ-m-0 civ-font-bold civ-mb-1">Compact padding (8 / 12)</p>
            <p class="civ-m-0">One step denser. Use inside dense admin surfaces.</p>
          </civ-callout>
        </div>
      </div>

      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">All variants at sm</p>
        <div class="civ-flex civ-flex-col civ-gap-2">
          <civ-callout spacing="sm">
            <p class="civ-m-0">Default — neutral accent.</p>
          </civ-callout>
          <civ-callout intent="info" spacing="sm">
            <p class="civ-m-0">Info — routine guidance.</p>
          </civ-callout>
          <civ-callout intent="warning" spacing="sm">
            <p class="civ-m-0">Warning — heads-up.</p>
          </civ-callout>
          <civ-callout intent="error" spacing="sm">
            <p class="civ-m-0">Error — problem callout.</p>
          </civ-callout>
          <civ-callout intent="success" spacing="sm">
            <p class="civ-m-0">Success — confirmation.</p>
          </civ-callout>
        </div>
      </div>
    </div>
  `,
};
