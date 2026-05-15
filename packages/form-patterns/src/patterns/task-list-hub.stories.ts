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
        <civ-list-item href="#/eligibility">
          <span class="civ-block civ-font-bold">Check your eligibility</span>
          <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>

      <h3 class="civ-heading-md civ-mb-2 civ-mt-6">Fill out your application</h3>
      <civ-list dividers>
        <civ-list-item href="#/personal">
          <span class="civ-block civ-font-bold">Personal information</span>
          <span class="civ-block civ-text-sm civ-text-muted">Name, date of birth, Social Security number</span>
          <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/contact">
          <span class="civ-block civ-font-bold">Contact information</span>
          <span class="civ-block civ-text-sm civ-text-muted">Address and phone number</span>
          <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item>
          <span class="civ-block civ-font-bold">Service history</span>
          <span class="civ-block civ-text-sm civ-text-muted">Branch, dates, and character of service</span>
          <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item>
          <span class="civ-block civ-font-bold">Disabilities and conditions</span>
          <span class="civ-block civ-text-sm civ-text-muted">List each condition you are claiming</span>
          <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>

      <h3 class="civ-heading-md civ-mb-2 civ-mt-6">Review and submit</h3>
      <civ-list dividers>
        <civ-list-item>
          <span class="civ-block civ-font-bold">Review your application</span>
          <span class="civ-block civ-text-sm civ-text-muted">Complete all sections first</span>
          <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
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
        <civ-list-item href="#/a">
          <span class="civ-block civ-font-bold">not-started</span>
          <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/b">
          <span class="civ-block civ-font-bold">in-progress</span>
          <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/c">
          <span class="civ-block civ-font-bold">complete</span>
          <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item>
          <span class="civ-block civ-font-bold">cannot-start</span>
          <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/e">
          <span class="civ-block civ-font-bold">error</span>
          <civ-badge data-list-item-end label="Has errors" variant="error" badge-style="secondary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/f">
          <span class="civ-block civ-font-bold">review</span>
          <civ-badge data-list-item-end label="Needs review" variant="warning" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
      </civ-list>
    </div>
  `,
};
