import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-link.js';
import '../button/civ-button.js';
import '@civui/storybook-utils/demo-frame';
import '@civui/storybook-utils/demo-frame.css';

const meta: Meta = {
  title: 'Navigation/Link',
  component: 'civ-link',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    href: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'back'],
    },
    type: {
      control: 'select',
      options: [undefined, 'phone', 'email', 'download'],
    },
    number: { control: 'text' },
    address: { control: 'text' },
    subject: { control: 'text' },
    filename: { control: 'text' },
    fileSize: { control: 'text' },
    danger: { control: 'boolean' },
    disabled: { control: 'boolean' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Learn more about VA benefits',
    href: '#',
    variant: 'secondary',
    disabled: false,
  },
  render: (args) => html`
    <civ-link
      label="${args.label}"
      href="${args.href}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
    ></civ-link>
  `,
};

export const Primary: Story = {
  render: () => html`
    <civ-link href="#" variant="primary">View your claim status</civ-link>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <civ-link href="#" variant="secondary">Learn more</civ-link>
  `,
};

export const Back: Story = {
  render: () => html`
    <civ-link href="#/hub" variant="back" label="Back to task list"></civ-link>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Standard</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">Primary link</civ-link>
          <civ-link href="#" variant="secondary">Secondary link</civ-link>
          <civ-link href="#" variant="back" label="Back"></civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Danger</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary" danger>Primary danger</civ-link>
          <civ-link href="#" variant="secondary" danger>Secondary danger</civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary" disabled>Primary disabled</civ-link>
          <civ-link href="#" variant="secondary" disabled>Secondary disabled</civ-link>
        </div>
      </div>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
      <civ-link href="#" variant="primary" danger>Remove item</civ-link>
      <civ-link href="#" variant="secondary" danger>Cancel request</civ-link>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
      <civ-link href="#" variant="primary" disabled>Disabled primary</civ-link>
      <civ-link href="#" variant="secondary" disabled>Disabled secondary</civ-link>
    </div>
  `,
};

export const WithCustomIcons: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link href="#" icon-start="download">Download your form</civ-link>
      <civ-link href="#" icon-end="external-link">Visit VA.gov</civ-link>
      <civ-link href="#" icon-start="print" icon-end="external-link">Print and mail</civ-link>
      <civ-link href="#" variant="primary" icon-end="arrow-right">Continue to next step</civ-link>
      <civ-link href="#" variant="back" icon-start="home">Back to homepage</civ-link>
    </div>
  `,
};

export const External: Story = {
  name: 'External (opens in new tab)',
  parameters: {
    docs: {
      description: {
        story:
          'Set `new-tab` for an external link. It auto-applies `target="_blank"`, `rel="noopener noreferrer"`, a trailing `external-link` icon, and visually-hidden "(opens in new tab)" text for screen readers — so you don\'t hand-compose those (do NOT just add `icon-end="external-link"`, which gives the glyph without the target / rel / SR affordance). Pairs with any `variant`.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link href="https://www.va.gov" new-tab>VA.gov</civ-link>
      <civ-link href="https://www.benefits.va.gov" new-tab variant="primary">Explore your benefits</civ-link>
      <civ-link href="https://www.federalregister.gov" new-tab variant="secondary">Read the federal rule</civ-link>
    </div>
  `,
};

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Learn more</civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Learn more</civ-link>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Learn more</civ-link>
        </div>
      </div>
    </div>
  `,
};

export const InContext: Story = {
  render: () => html`
    <p>
      You can <civ-link href="#">view your claim status</civ-link> online.
      If you need help, <civ-link href="#" variant="secondary">contact us</civ-link>.
    </p>
  `,
};

export const BenefitsNavigation: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link href="#/hub" variant="back" label="Back to VA benefits hub"></civ-link>
      <div class="civ-mt-4">
        <p class="civ-m-0 civ-mb-2">Related links:</p>
        <div class="civ-flex civ-flex-col civ-gap-2">
          <civ-link href="#/disability" variant="primary">Disability compensation</civ-link>
          <civ-link href="#/healthcare" variant="primary">Health care benefits</civ-link>
          <civ-link href="#/education" variant="primary">Education benefits</civ-link>
        </div>
      </div>
    </div>
  `,
};

// ── Back-link Demo ────────────────────────────────────────────
// The `back` variant only really makes sense in a two-page context —
// start on a detail page, click Back, land on the previous page.
// Wrapped in <civ-demo-frame> so the navigation actually happens.

export const BackNavigationDemo: Story = {
  render: () => html`
    <civ-demo-frame initial-path="/claims/12345">
      <civ-demo-page path="/claims">
        <h2 class="civ-heading-md">Your claims</h2>
        <ul>
          <li><civ-link href="/claims/12345" variant="primary">Claim #12345 — Disability</civ-link></li>
          <li><civ-link href="/claims/67890" variant="primary">Claim #67890 — Healthcare</civ-link></li>
        </ul>
      </civ-demo-page>

      <civ-demo-page path="/claims/12345">
        <civ-link href="/claims" variant="back" label="Back to your claims"></civ-link>
        <h2 class="civ-heading-md civ-mt-2">Claim #12345 — Disability compensation</h2>
        <p>Filed January 15, 2026. Status: In Progress.</p>
        <p>Click "Back to your claims" above to return to the list.</p>
      </civ-demo-page>

      <civ-demo-page path="/claims/67890">
        <civ-link href="/claims" variant="back" label="Back to your claims"></civ-link>
        <h2 class="civ-heading-md civ-mt-2">Claim #67890 — Health care</h2>
        <p>Filed February 3, 2026. Status: Decision made.</p>
      </civ-demo-page>
    </civ-demo-frame>
  `,
};

// ── Link vs Button[href] comparison ───────────────────────────
// On web, `civ-link` renders an underlined text affordance (with a
// trailing chevron on `--primary`, leading on `--back`). It does
// NOT wear button chrome. `civ-button href` renders an `<a>` with
// full button chrome plus an underline so the link affordance is
// visually distinguishable from a real <button> sibling. Pick
// civ-link when the row reads as a link; civ-button[href] when
// the row reads as a button that happens to navigate.

export const ButtonStyledLinkComparison: Story = {
  name: 'Link vs Button[href]',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-text-sm civ-font-semibold">
          civ-link — underlined text with trailing chevron (primary) or back chevron (back)
        </p>
        <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
          <civ-link href="/start" variant="primary" label="Start application"></civ-link>
          <civ-link href="/details" variant="secondary" label="View details"></civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-text-sm civ-font-semibold">
          civ-button with href — button chrome with an underline so the link affordance is visible
        </p>
        <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
          <civ-button href="/start" emphasis="primary">Start application</civ-button>
          <civ-button href="/details" emphasis="secondary">View details</civ-button>
        </div>
      </div>
      <p class="civ-m-0 civ-text-sm">
        Both produce a real <code>&lt;a&gt;</code>. Pick <code>civ-link</code> when
        the affordance reads as a link (inline prose, in-row navigation, "Learn
        more"). Pick <code>civ-button href</code> when the affordance sits
        alongside real buttons in a CTA cluster and the visual weight should
        match — the underline keeps the link affordance distinguishable from
        adjacent <code>&lt;button&gt;</code> siblings.
      </p>
    </div>
  `,
};

// ── Device-action types (folded from the former civ-action-link) ──
// The `type` prop turns a civ-link into a device-action shortcut.
// `phone` builds a `tel:` href + phone icon; `email` builds a
// `mailto:` href + mail icon + optional subject; `download` passes
// the `href` through and adds a download icon + optional file-size
// suffix. All three are orthogonal to `variant` — a download link
// can wear the primary button chrome if needed.

export const Phone: Story = {
  render: () => html`
    <civ-link type="phone" number="8005551234"></civ-link>
  `,
};

export const PhoneWithLabel: Story = {
  name: 'Phone with Label',
  render: () => html`
    <civ-link type="phone" number="8005551234" label="Call the VA help desk"></civ-link>
  `,
};

export const PhoneInternational: Story = {
  render: () => html`
    <civ-link type="phone" number="+44 20 7946 0958"></civ-link>
  `,
};

export const Email: Story = {
  render: () => html`
    <civ-link type="email" address="help@va.gov"></civ-link>
  `,
};

export const EmailWithLabel: Story = {
  name: 'Email with Label',
  render: () => html`
    <civ-link type="email" address="support@va.gov" label="Contact VA support"></civ-link>
  `,
};

export const EmailWithSubject: Story = {
  name: 'Email with Subject',
  render: () => html`
    <civ-link type="email" address="benefits@va.gov" subject="Question about my claim"></civ-link>
  `,
};

export const Download: Story = {
  render: () => html`
    <civ-link type="download" href="/forms/10-10EZ.pdf" filename="10-10EZ.pdf"></civ-link>
  `,
};

export const DownloadWithSize: Story = {
  name: 'Download with File Size',
  render: () => html`
    <civ-link type="download" href="/forms/21-526EZ.pdf" filename="21-526EZ.pdf" file-size="2.4 MB" label="VA Form 21-526EZ"></civ-link>
  `,
};

export const TypeDisabled: Story = {
  name: 'Device-Action Types — Disabled',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2">
      <civ-link type="phone" number="8005551234" disabled></civ-link>
      <civ-link type="email" address="help@va.gov" disabled></civ-link>
      <civ-link type="download" href="/file.pdf" filename="file.pdf" disabled></civ-link>
    </div>
  `,
};

export const AllDeviceActionTypes: Story = {
  name: 'All Device-Action Types',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link type="phone" number="8005271000" label="VA benefits hotline"></civ-link>
      <civ-link type="phone" number="8008271000"></civ-link>
      <civ-link type="phone" number="711" label="TTY: 711"></civ-link>
      <civ-link type="email" address="help@va.gov"></civ-link>
      <civ-link type="email" address="benefits@va.gov" subject="Claim status" label="Email about your claim"></civ-link>
      <civ-link type="download" href="/forms/10-10EZ.pdf" filename="10-10EZ.pdf" file-size="1.2 MB"></civ-link>
    </div>
  `,
};

export const GovernmentContactSection: Story = {
  render: () => html`
    <div style="max-width: 400px;">
      <h3 class="civ-mb-3 civ-font-semibold">Need help?</h3>
      <div class="civ-flex civ-flex-col civ-gap-2">
        <civ-link type="phone" number="8008271000" label="Call us"></civ-link>
        <civ-link type="phone" number="711" label="TTY: 711"></civ-link>
        <civ-link type="email" address="help@va.gov" label="Email us"></civ-link>
        <civ-link type="download" href="/guides/applying-for-benefits.pdf" filename="applying-for-benefits.pdf" file-size="850 KB" label="Download the application guide"></civ-link>
      </div>
    </div>
  `,
};
