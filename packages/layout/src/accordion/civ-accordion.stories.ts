import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-accordion.js';
import './civ-accordion-item.js';
import '../card/civ-card.js';

const meta: Meta = {
  title: 'Layout/Accordion',
  component: 'civ-accordion',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A grouped stack of full-width expandable rows. Children are
\`<civ-accordion-item>\`. Each item composes the same visual language as
\`<civ-disclosure>\` (chevron caret, 90° rotation on open) but spans the
row with a larger tap target.

Multiple items can be open at once by default. Pass \`single\` on the
parent to enforce one-open-at-a-time — when the user opens an item,
the parent collapses any other open siblings.

Built on native \`<details>\`/\`<summary>\` so it works without
JavaScript and is announced as a disclosure widget by every screen
reader.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-accordion>
      <civ-accordion-item label="Who is eligible?">
        <p>
          Veterans who served on active duty for at least 24 continuous
          months, or the full period for which they were called or
          ordered to active duty, may be eligible for VA health care.
        </p>
      </civ-accordion-item>
      <civ-accordion-item label="What documents do I need?">
        <p>Bring the following when you apply:</p>
        <ul>
          <li>DD-214 (separation papers)</li>
          <li>Social Security number</li>
          <li>Most recent tax return</li>
          <li>Insurance card, if you have one</li>
        </ul>
      </civ-accordion-item>
      <civ-accordion-item label="How long does enrollment take?">
        <p>
          Most applications are processed within 7 business days. You'll
          receive a written notice of your enrollment decision in the mail.
        </p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const WithOpenItem: Story = {
  name: 'With one item open',
  render: () => html`
    <civ-accordion>
      <civ-accordion-item label="First question">
        <p>This item starts closed.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Second question" open>
        <p>
          This item starts open. Use the <code>open</code> attribute on
          the item you want expanded on first load. Use sparingly — most
          accordion items should default to closed so the page stays
          scannable.
        </p>
      </civ-accordion-item>
      <civ-accordion-item label="Third question">
        <p>This item starts closed.</p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const SingleOpen: Story = {
  name: 'Single-open mode',
  render: () => html`
    <civ-accordion single>
      <civ-accordion-item label="What is the application deadline?" open>
        <p>
          Initial enrollment must be received within 30 days of your
          discharge or release from active duty.
        </p>
      </civ-accordion-item>
      <civ-accordion-item label="Can I apply online?">
        <p>
          Yes. Online applications are available through VA.gov. You'll
          need to sign in with a Login.gov, ID.me, or DS Logon account.
        </p>
      </civ-accordion-item>
      <civ-accordion-item label="What happens after I apply?">
        <p>
          You'll receive a written notice of your enrollment decision.
          Once enrolled, you can schedule appointments and order
          prescriptions.
        </p>
      </civ-accordion-item>
    </civ-accordion>
    <p class="civ-mt-3 civ-text-sm">
      With <code>single</code>, opening one item closes any other open siblings.
    </p>
  `,
};

export const WithDisabledItem: Story = {
  name: 'With a disabled item',
  render: () => html`
    <civ-accordion>
      <civ-accordion-item label="Available section">
        <p>This section can be expanded.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Not yet available" disabled>
        <p>You should not see this — the item is disabled.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Available section">
        <p>This section can be expanded too.</p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const WithHeadingLevel: Story = {
  name: 'With semantic heading level',
  parameters: {
    docs: {
      description: {
        story: `
For FAQ pages where screen-reader users navigate by heading, pass
\`heading-level\` (1–6) to wrap each label in an \`<h1>\`–\`<h6>\`.
The visual treatment is unchanged — the heading element only
affects assistive-tech rotor navigation.
        `,
      },
    },
  },
  render: () => html`
    <h2 class="civ-heading-lg civ-mb-3">Frequently asked questions</h2>
    <civ-accordion>
      <civ-accordion-item heading-level="3" label="Who is eligible?">
        <p>See the eligibility section above for details.</p>
      </civ-accordion-item>
      <civ-accordion-item heading-level="3" label="How do I apply?">
        <p>You can apply online or in person at any VA medical center.</p>
      </civ-accordion-item>
      <civ-accordion-item heading-level="3" label="What documents do I need?">
        <p>Your DD-214 and a government-issued photo ID.</p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const LongContent: Story = {
  name: 'With rich content',
  render: () => html`
    <civ-accordion>
      <civ-accordion-item label="Privacy policy summary" open>
        <p>
          The Department of Veterans Affairs collects information from you
          to determine your eligibility for VA benefits and services.
        </p>
        <h3 class="civ-heading-sm civ-mt-3">How we use your information</h3>
        <ul>
          <li>Verify your eligibility for benefits</li>
          <li>Process your claims and payments</li>
          <li>Provide medical care and services</li>
          <li>Communicate with you about your benefits</li>
        </ul>
        <h3 class="civ-heading-sm civ-mt-3">When we share your information</h3>
        <p>
          We share your information only with authorized federal partners,
          and only when required to deliver your benefits or comply with
          the law.
        </p>
      </civ-accordion-item>
      <civ-accordion-item label="Terms of service summary">
        <p>
          By using VA.gov, you agree to the terms of service. The terms
          cover acceptable use, your rights, and our obligations.
        </p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const WithinCard: Story = {
  name: 'Nested inside a card',
  render: () => html`
    <civ-card>
      <div data-card-header>
        <h3 class="civ-heading-md">Help and resources</h3>
      </div>
      <civ-accordion>
        <civ-accordion-item label="Call us">
          <p>Call <strong>1-800-827-1000</strong>, Monday through Friday, 8 a.m. to 9 p.m. Eastern.</p>
        </civ-accordion-item>
        <civ-accordion-item label="Chat with us online">
          <p>Visit VA.gov and look for the chat icon in the bottom-right corner.</p>
        </civ-accordion-item>
        <civ-accordion-item label="Find your local office">
          <p>Use the VA facility locator to find the office nearest you.</p>
        </civ-accordion-item>
      </civ-accordion>
    </civ-card>
  `,
};
