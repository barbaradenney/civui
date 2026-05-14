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
      options: ['primary', 'secondary', 'tertiary', 'back'],
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
    variant: 'tertiary',
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
    <civ-link href="#" variant="secondary">Download your benefit letter</civ-link>
  `,
};

export const Tertiary: Story = {
  render: () => html`
    <civ-link href="#" variant="tertiary">Learn more</civ-link>
  `,
};

export const Back: Story = {
  render: () => html`
    <civ-link href="#/hub" variant="back" label="Back to task list"></civ-link>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Standard</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">Primary link</civ-link>
          <civ-link href="#" variant="secondary">Secondary link</civ-link>
          <civ-link href="#" variant="tertiary">Tertiary link</civ-link>
          <civ-link href="#" variant="back" label="Back"></civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Danger</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary" danger>Primary danger</civ-link>
          <civ-link href="#" variant="secondary" danger>Secondary danger</civ-link>
          <civ-link href="#" variant="tertiary" danger>Tertiary danger</civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary" disabled>Primary disabled</civ-link>
          <civ-link href="#" variant="secondary" disabled>Secondary disabled</civ-link>
          <civ-link href="#" variant="tertiary" disabled>Tertiary disabled</civ-link>
        </div>
      </div>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
      <civ-link href="#" variant="primary" danger>Delete account</civ-link>
      <civ-link href="#" variant="secondary" danger>Remove item</civ-link>
      <civ-link href="#" variant="tertiary" danger>Cancel request</civ-link>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
      <civ-link href="#" variant="primary" disabled>Disabled primary</civ-link>
      <civ-link href="#" variant="secondary" disabled>Disabled secondary</civ-link>
      <civ-link href="#" variant="tertiary" disabled>Disabled tertiary</civ-link>
    </div>
  `,
};

export const WithCustomIcons: Story = {
  name: 'With Custom Icons',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link href="#" icon-start="download">Download your form</civ-link>
      <civ-link href="#" icon-end="external-link">Visit VA.gov</civ-link>
      <civ-link href="#" icon-start="print" icon-end="external-link">Print and mail</civ-link>
      <civ-link href="#" variant="secondary" icon-end="arrow-right">Continue to next step</civ-link>
      <civ-link href="#" variant="back" icon-start="home">Back to homepage</civ-link>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
    </div>
  `,
};

export const InContext: Story = {
  name: 'In Context',
  render: () => html`
    <p>
      You can <civ-link href="#">view your claim status</civ-link> online.
      If you need help, <civ-link href="#" variant="secondary">contact us</civ-link>.
    </p>
  `,
};

export const BenefitsNavigation: Story = {
  name: 'Benefits Navigation',
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
  name: 'Back Navigation Demo',
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

// ── Button-styled link comparison ─────────────────────────────
// Both <civ-link variant="primary"> and <civ-button href> render an
// `<a>` element wearing primary-button chrome. The button-with-href
// path adds an underline by default so the link affordance stays
// visible — useful when the link sits next to a real button and a
// reader needs to tell them apart at a glance.

export const ButtonStyledLinkComparison: Story = {
  name: 'Button-Styled: Link vs Button[href]',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-text-sm civ-font-semibold">
          civ-link with button-shaped variants
        </p>
        <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
          <civ-link href="/start" variant="primary" label="Start application"></civ-link>
          <civ-link href="/details" variant="secondary" label="View details"></civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-text-sm civ-font-semibold">
          civ-button with href (renders as &lt;a&gt; with underline)
        </p>
        <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
          <civ-button href="/start" variant="primary">Start application</civ-button>
          <civ-button href="/details" variant="secondary">View details</civ-button>
        </div>
      </div>
      <p class="civ-m-0 civ-text-sm">
        Both produce a real <code>&lt;a&gt;</code>. Pick <code>civ-link</code> when
        the affordance is primarily a link that happens to wear button chrome;
        pick <code>civ-button href</code> when it sits alongside real buttons
        and the underline helps a reader distinguish navigation from in-page
        action.
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
  name: 'Phone International',
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
  name: 'Government Contact Section',
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
