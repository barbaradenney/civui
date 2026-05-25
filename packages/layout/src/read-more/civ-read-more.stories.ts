import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-read-more.js';

const meta: Meta = {
  title: 'Layout/Read More',
  component: 'civ-read-more',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Two-stage content disclosure. A teaser paragraph stays visible at all times;
a \`Read more\` button reveals the rest of the content, which is kept in the
DOM but skipped by screen readers (via the \`hidden\` attribute) until expansion.

Use when the user needs enough context to decide whether to read on — eligibility
fine print, optional definitions, secondary explanations.

Differs from \`civ-disclosure\`, which hides ALL content behind a trigger; pick
disclosure when there is no useful teaser to show.
        `,
      },
    },
  },
  argTypes: {
    expanded: { control: 'boolean' },
    moreLabel: { control: 'text' },
    lessLabel: { control: 'text' },
    icon: { control: 'text' },
    size: { control: 'select', options: ['default', 'sm'] },
    inline: { control: 'boolean' },
    noFadeTrigger: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-read-more>
      <p>
        You may be eligible for a benefit if you meet certain service and
        discharge criteria. Most benefits are available to veterans who
        served on active duty for a minimum length of time and received a
        discharge under honorable conditions. Some benefits also extend to
        members of the Reserves and National Guard who completed a period
        of active service, and to surviving family members of veterans who
        died in service or from a service-connected condition.
      </p>
      <div data-rest>
        <p>
          Specifically, you must have served at least 24 months of active duty
          and been discharged under conditions other than dishonorable. Some
          benefits also require a documented service-connected disability.
        </p>
        <p>
          If you separated before the 24-month requirement due to a
          service-connected disability or a hardship discharge, you may still
          be eligible. Contact a Veterans Service Officer to confirm.
        </p>
      </div>
    </civ-read-more>
  `,
};

export const CustomLabels: Story = {
  name: 'Custom labels',
  render: () => html`
    <civ-read-more more-label="Show full definition" less-label="Hide definition">
      <p>
        A <strong>dependent</strong> is a spouse, child, or parent who relies
        on you for financial support.
      </p>
      <div data-rest>
        <p>
          More specifically: a spouse you are legally married to; an unmarried
          child under 18 (or under 23 if enrolled full-time in school); a
          permanently incapacitated child of any age whose disability began
          before age 18; or a parent whose income falls below the federally
          set threshold.
        </p>
      </div>
    </civ-read-more>
  `,
};

export const WithChevron: Story = {
  name: 'With chevron icon',
  render: () => html`
    <civ-read-more icon="chevron-down">
      <p>
        We use the income information you provide to determine your benefit
        amount and verify eligibility.
      </p>
      <div data-rest>
        <p>
          Specifically, gross monthly income is compared against the income
          limit for your household size. Net worth (assets minus debts,
          excluding your primary residence and one vehicle) is also reviewed
          against the applicable cap.
        </p>
      </div>
    </civ-read-more>
  `,
};

export const ExpandedByDefault: Story = {
  name: 'Expanded by default',
  render: () => html`
    <civ-read-more open>
      <p>
        Today is the last day of open enrollment.
      </p>
      <div data-rest>
        <p>
          Your selections must be submitted by 11:59 PM Eastern. Late
          submissions cannot be accepted; you will need to wait until the
          next enrollment window in November.
        </p>
      </div>
    </civ-read-more>
  `,
};

export const SmallSize: Story = {
  name: 'Small size',
  render: () => html`
    <civ-read-more spacing="sm">
      <p class="civ-text-sm">
        Your application has been received and is in review.
      </p>
      <div data-rest>
        <p class="civ-text-sm">
          The average review time is 3–5 business days. You will receive an
          email with the decision and any next steps.
        </p>
      </div>
    </civ-read-more>
  `,
};

export const Inline: Story = {
  name: 'Inline (last words of the paragraph)',
  render: () => html`
    <p class="civ-m-0">
      <civ-read-more inline>
        We use the income information you provide to determine your benefit
        amount and verify eligibility.
        <span data-rest>
          Specifically, gross monthly income is compared against the income
          limit for your household size; net worth is also reviewed against
          the applicable cap.
        </span>
      </civ-read-more>
    </p>
  `,
};

export const NoFadeTrigger: Story = {
  name: 'No fade trigger (plain button below text)',
  render: () => html`
    <civ-read-more no-fade-trigger>
      <p>
        You may be eligible for a benefit if you meet certain service and
        discharge criteria.
      </p>
      <div data-rest>
        <p>
          Specifically, you must have served at least 24 months of active duty
          and been discharged under conditions other than dishonorable. Some
          benefits also require a documented service-connected disability.
        </p>
      </div>
    </civ-read-more>
  `,
};

export const OnColoredBackground: Story = {
  name: 'On a colored background (override --civ-read-more-bg)',
  render: () => html`
    <div
      class="civ-p-6 civ-rounded"
      style="background-color: var(--civ-color-info-lighter);"
    >
      <civ-read-more style="--civ-read-more-bg: var(--civ-color-info-lighter);">
        <p>
          The fade defaults to white. On a colored card, override
          <code>--civ-read-more-bg</code> with the card's fill so the gradient
          resolves to the surrounding color instead of fading to white.
        </p>
        <div data-rest>
          <p>
            Without the override, the gradient would fade from the page text
            into a white band — visually disconnected from the colored card it
            sits in. With the override matched to the card color, the trigger
            reads as part of the same surface.
          </p>
        </div>
      </civ-read-more>
    </div>
  `,
};

export const NoRestContent: Story = {
  name: 'Graceful with no rest content',
  render: () => html`
    <civ-read-more>
      <p>
        This is the entire message. The "Read more" button still renders but
        clicking it reveals an empty region — useful when you author the rest
        content conditionally and don't yet have something to show.
      </p>
    </civ-read-more>
  `,
};
