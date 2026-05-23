import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-accordion.js';
import './civ-accordion-item.js';
import '../card/civ-card.js';
import type { CivAccordion } from './civ-accordion.js';

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

export const ExpandCollapseAll: Story = {
  name: 'Expand all / collapse all',
  parameters: {
    docs: {
      description: {
        story: `
\`<civ-accordion>\` exposes \`expandAll()\` and \`collapseAll()\`
methods for "Show all" / "Hide all" affordances on FAQ pages,
settings panels, and similar dense lists. In \`single\` mode,
\`expandAll()\` opens only the first non-disabled item (the
invariant forbids more). Disabled items are skipped by both
methods — their state stays frozen.
        `,
      },
    },
  },
  render: () => {
    function getAccordion(e: Event): CivAccordion {
      const root = (e.currentTarget as HTMLElement).closest('[data-story]')!;
      return root.querySelector<CivAccordion>('civ-accordion')!;
    }
    return html`
      <div data-story class="civ-flex civ-flex-col civ-gap-3">
        <div class="civ-flex civ-gap-2">
          <button
            type="button"
            class="civ-text-btn civ-text-btn--chip"
            @click="${(e: Event) => getAccordion(e).expandAll()}"
          >Expand all</button>
          <button
            type="button"
            class="civ-text-btn civ-text-btn--chip"
            @click="${(e: Event) => getAccordion(e).collapseAll()}"
          >Collapse all</button>
        </div>
        <civ-accordion>
          <civ-accordion-item label="Eligibility requirements">
            <p>Who qualifies for VA health care benefits.</p>
          </civ-accordion-item>
          <civ-accordion-item label="How to apply">
            <p>Three ways to submit your application.</p>
          </civ-accordion-item>
          <civ-accordion-item label="What you'll need">
            <p>DD-214, Social Security number, and recent tax return.</p>
          </civ-accordion-item>
          <civ-accordion-item label="After you apply">
            <p>What to expect during enrollment review.</p>
          </civ-accordion-item>
        </civ-accordion>
      </div>
    `;
  },
};

export const Variants: Story = {
  name: 'Variants (tertiary / secondary / primary)',
  parameters: {
    docs: {
      description: {
        story: `
Three visual variants in increasing prominence:

- **Tertiary** (default) — bordered group with transparent
  triggers. Quietest, list-like. Use for FAQ pages, help content,
  optional detail.
- **Secondary** — same per-item style as tertiary (transparent
  trigger, gray hover, indented content), but each item is its
  own bordered/rounded box separated by gap rather than sharing
  a single outer border. Use when items should read as discrete
  sections rather than rows of a unified list.
- **Primary** — filled primary-lightest (blue) button with the
  larger padding and bolder type of \`civ-btn--secondary\` (the
  main button family). When open, trigger + content extend the
  colored bg as a single card. Use for hub-page sections or hero
  CTAs.
        `,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <h3 class="civ-heading-sm civ-mb-2">Tertiary (default)</h3>
        <civ-accordion>
          <civ-accordion-item label="Eligibility">
            <p>Quietest variant. Reads as a list of disclosure rows.</p>
          </civ-accordion-item>
          <civ-accordion-item label="How to apply">
            <p>Bordered group, transparent triggers, inter-item dividers.</p>
          </civ-accordion-item>
        </civ-accordion>
      </div>

      <div>
        <h3 class="civ-heading-sm civ-mb-2">Secondary</h3>
        <civ-accordion variant="secondary">
          <civ-accordion-item label="Eligibility">
            <p>Same per-item chrome as tertiary, but each item is its own bordered box.</p>
          </civ-accordion-item>
          <civ-accordion-item label="How to apply">
            <p>Items stack with gap. Use when items should read as discrete sections rather than rows of a unified list.</p>
          </civ-accordion-item>
        </civ-accordion>
      </div>

      <div>
        <h3 class="civ-heading-sm civ-mb-2">Primary</h3>
        <civ-accordion variant="primary">
          <civ-accordion-item label="Eligibility">
            <p>Filled primary-lightest triggers with the chrome of the main button family — larger padding, bolder font.</p>
          </civ-accordion-item>
          <civ-accordion-item label="How to apply">
            <p>Most prominent variant. Use for hub-page sections or hero CTAs.</p>
          </civ-accordion-item>
        </civ-accordion>
      </div>
    </div>
  `,
};

export const KeyboardNavigation: Story = {
  name: 'Keyboard navigation',
  parameters: {
    docs: {
      description: {
        story: `
Follows the ARIA APG accordion pattern. When focus is on an item
header, **↓ / ↑** move to the next / previous header (wrapping at
edges); **Home** and **End** jump to the first / last. Disabled
items are skipped during arrow navigation. Tab moves focus through
the accordion normally; the arrow-key behavior is additive.

Click the first header below, then try the arrow keys.
        `,
      },
    },
  },
  render: () => html`
    <civ-accordion>
      <civ-accordion-item label="One — focus me, then press ↓">
        <p>Pressing the down-arrow moves focus to the next header.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Two — disabled (skipped)" disabled>
        <p>Disabled items are removed from the arrow-key navigation cycle.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Three">
        <p>Arrow keys jumped past the disabled item to land here.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Four — press End from anywhere">
        <p>Home / End jump to the first / last non-disabled item.</p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const ParentDisabled: Story = {
  name: 'Parent-level disabled',
  parameters: {
    docs: {
      description: {
        story: `
Setting \`disabled\` on \`<civ-accordion>\` cascades to every
direct-child item — both visually (dimmed, no pointer events) and
behaviorally (programmatic \`item.open = true\` is rejected, user
clicks are reverted, keyboard navigation skips). Individual items
can still be disabled independently when the parent is enabled.
        `,
      },
    },
  },
  render: () => html`
    <civ-accordion disabled>
      <civ-accordion-item label="Eligibility section">
        <p>This entire accordion is parent-disabled.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Application section">
        <p>None of the items can be expanded.</p>
      </civ-accordion-item>
      <civ-accordion-item label="Review section">
        <p>Useful while content is loading or the form is otherwise gated.</p>
      </civ-accordion-item>
    </civ-accordion>
  `,
};

export const FlushInCardFooter: Story = {
  name: 'Flush variant in a card footer',
  parameters: {
    docs: {
      description: {
        story: `
The \`flush\` variant removes the outer wrapper border so the
accordion nests cleanly inside another bordered container — most
commonly a \`<civ-card>\` footer. Same per-item chrome as tertiary
(transparent triggers, inter-item dividers, indented content)
without the doubled-up outer frame.

**One accordion** — drop a single \`<civ-accordion variant="flush">\`
into the card footer slot. The card's footer top-divider visually
separates the accordion from the body; the accordion's inter-item
dividers separate questions.

**Multiple accordions** — stack several flush accordions in the
same footer to group related sections. Each accordion's last item
has no bottom border so adjacent accordions butt directly; add a
heading or \`<civ-divider>\` between them to read as distinct
groups.
        `,
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <h3 class="civ-heading-sm civ-mb-2">One accordion in a card footer</h3>
        <civ-card>
          <div data-card-header><h3 class="civ-heading-md">Application status</h3></div>
          <p>Your application was received on January 15, 2026 and is currently in review.</p>
          <div data-card-footer>
            <civ-accordion variant="flush">
              <civ-accordion-item label="View timeline">
                <p>Submitted → Review → Decision → Notification. Most applications complete within 7 business days.</p>
              </civ-accordion-item>
              <civ-accordion-item label="What happens next">
                <p>You'll receive a written notice in the mail. If approved, your benefits start the following month.</p>
              </civ-accordion-item>
            </civ-accordion>
          </div>
        </civ-card>
      </div>

      <div>
        <h3 class="civ-heading-sm civ-mb-2">Multiple accordions in a card footer</h3>
        <civ-card>
          <div data-card-header><h3 class="civ-heading-md">Account details</h3></div>
          <p>Below are sections you can expand to view or edit specific details about your account.</p>
          <div data-card-footer>
            <h4 class="civ-heading-sm civ-mb-1">Profile</h4>
            <civ-accordion variant="flush">
              <civ-accordion-item label="Personal information">
                <p>Name, date of birth, and identification on file.</p>
              </civ-accordion-item>
              <civ-accordion-item label="Contact preferences">
                <p>How and when we contact you about your benefits.</p>
              </civ-accordion-item>
            </civ-accordion>

            <h4 class="civ-heading-sm civ-mt-3 civ-mb-1">Security</h4>
            <civ-accordion variant="flush">
              <civ-accordion-item label="Sign-in methods">
                <p>Login.gov, ID.me, and DS Logon options.</p>
              </civ-accordion-item>
              <civ-accordion-item label="Two-factor authentication">
                <p>Add a second factor to protect your account.</p>
              </civ-accordion-item>
            </civ-accordion>
          </div>
        </civ-card>
      </div>
    </div>
  `,
};
