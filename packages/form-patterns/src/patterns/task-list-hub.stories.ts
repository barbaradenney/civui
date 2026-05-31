import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/layout/list';
import '@civui/feedback/badge';

const meta: Meta = {
  title: 'Forms/Patterns/Task List Hub',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Task List Hub

The hub page for multi-chapter government forms. Composed from \`<civ-list>\` +
\`<civ-list-item>\` + \`<civ-badge>\`. There is no dedicated task-list component —
the "task list" is a usage pattern.

Setting \`href\` on a list item makes the whole row a clickable anchor; omit
\`href\` for locked rows. The status badge uses the \`data-list-item-end\`
attribute and \`with-icon\` to auto-render the variant's semantic icon.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const VADisabilityApplication: Story = {
  name: 'VA disability application',
  render: () => html`
    <div class="civ-max-w-2xl">
      <h1 class="civ-m-0 civ-mb-2 civ-text-2xl civ-font-bold">Apply for disability compensation</h1>
      <p class="civ-m-0 civ-mb-6">VA Form 21-526EZ</p>

      <h3 class="civ-heading-md civ-mb-2">Prepare</h3>
      <civ-list dividers>
        <civ-list-item href="#/eligibility" heading="Check your eligibility">
          <civ-badge data-list-item-end label="Complete" intent="success" emphasis="primary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>

      <h3 class="civ-heading-md civ-mb-2 civ-mt-6">Fill out your application</h3>
      <civ-list dividers>
        <civ-list-item href="#/personal" heading="Personal information" description="Name, date of birth, Social Security number">
          <civ-badge data-list-item-end label="Complete" intent="success" emphasis="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/contact" heading="Contact information" description="Address and phone number">
          <civ-badge data-list-item-end label="In progress" intent="info" emphasis="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item heading="Service history" description="Branch, dates, and character of service">
          <civ-badge data-list-item-end label="Cannot start yet" intent="neutral" emphasis="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item heading="Disabilities and conditions" description="List each condition you are claiming">
          <civ-badge data-list-item-end label="Cannot start yet" intent="neutral" emphasis="secondary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>

      <h3 class="civ-heading-md civ-mb-2 civ-mt-6">Review and submit</h3>
      <civ-list dividers>
        <civ-list-item heading="Review your application" description="Complete all sections first">
          <civ-badge data-list-item-end label="Cannot start yet" intent="neutral" emphasis="secondary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>
    </div>
  `,
};

export const AllStatuses: Story = {
  name: 'All status badges',
  render: () => html`
    <div class="civ-max-w-2xl">
      <h3 class="civ-heading-md civ-mb-2">Status reference</h3>
      <civ-list dividers>
        <civ-list-item href="#/a" heading="not-started">
          <civ-badge data-list-item-end label="Not started" intent="info" emphasis="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/b" heading="in-progress">
          <civ-badge data-list-item-end label="In progress" intent="info" emphasis="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/c" heading="complete">
          <civ-badge data-list-item-end label="Complete" intent="success" emphasis="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item heading="cannot-start">
          <civ-badge data-list-item-end label="Cannot start yet" intent="neutral" emphasis="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/e" heading="error">
          <civ-badge data-list-item-end label="Has errors" intent="error" emphasis="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/f" heading="review">
          <civ-badge data-list-item-end label="Needs review" intent="warning" emphasis="primary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>
    </div>
  `,
};
