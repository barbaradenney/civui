import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-task-list.js';
import './civ-task-group.js';
import './civ-task.js';
import '@civui/ui/tag';
import '@civui/ui/link';
import '@civui/ui/page-header';
import '@civui/forms';

const meta: Meta = {
  title: 'Navigation/Task List',
  component: 'civ-task-list',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Prepare</h3>
        <civ-task label="Check your eligibility" href="#/eligibility" status="complete"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
        <civ-task label="Personal information" href="#/personal" status="complete"></civ-task>
        <civ-task label="Contact information" hint="Phone number needed" href="#/contact" status="in-progress"></civ-task>
        <civ-task label="Service history" hint="Branch, dates, and character of service" status="not-started"></civ-task>
        <civ-task label="Disabilities and conditions" status="cannot-start"></civ-task>
        <civ-task label="Supporting documents" status="cannot-start"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
        <civ-task label="Review your application" hint="Complete all sections first" status="cannot-start"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Status examples</h3>
        <civ-task label="Active task" href="#" status="not-started"></civ-task>
        <civ-task label="In progress task" hint="2 of 5 fields complete" href="#" status="in-progress"></civ-task>
        <civ-task label="Complete task" href="#" status="complete"></civ-task>
        <civ-task label="Locked task" hint="Complete previous sections first" status="cannot-start"></civ-task>
        <civ-task label="Task with error" hint="Fix validation errors" href="#" status="error"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const MultipleGroups: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">About you</h3>
        <civ-task label="Your name" href="#" status="complete"></civ-task>
        <civ-task label="Your date of birth" href="#" status="complete"></civ-task>
        <civ-task label="Your address" href="#" status="complete"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">About your service</h3>
        <civ-task label="Service periods" href="#" status="in-progress"></civ-task>
        <civ-task label="Discharge details" status="cannot-start"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Evidence</h3>
        <civ-task label="Upload DD214" status="cannot-start"></civ-task>
        <civ-task label="Medical records" status="cannot-start"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const DisabilityCompensation: Story = {
  name: 'VA Form 21-526EZ Hub',
  render: () => html`
    <civ-page-header>
      <h1 data-heading class="civ-heading-xl">Apply for disability compensation</h1>
      <span data-subheading>VA Form 21-526EZ</span>
    </civ-page-header>

    <civ-progress-bar
      value="40"
      label="Application progress"
      status="2 of 5 sections complete"
    ></civ-progress-bar>

    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Prepare</h3>
        <civ-task label="Check your eligibility" href="#/eligibility" status="complete"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
        <civ-task label="Personal information" hint="Name, date of birth, Social Security number" href="#/personal" status="complete"></civ-task>
        <civ-task label="Contact information" hint="Address and phone number needed" href="#/contact" status="in-progress"></civ-task>
        <civ-task label="Service history" hint="Branch, dates, and character of service" status="cannot-start"></civ-task>
        <civ-task label="Disabilities and conditions" hint="List each condition you're claiming" status="cannot-start"></civ-task>
        <civ-task label="Supporting documents" hint="Upload DD214 and medical records" status="cannot-start"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
        <civ-task label="Review your application" hint="Complete all sections before reviewing" status="cannot-start"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const AllComplete: Story = {
  name: 'All Sections Complete',
  render: () => html`
    <civ-page-header>
      <h1 data-heading class="civ-heading-xl">Apply for education benefits</h1>
      <span data-subheading>VA Form 22-1990</span>
    </civ-page-header>

    <civ-progress-bar value="100" status="All sections complete"></civ-progress-bar>

    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Application</h3>
        <civ-task label="Personal information" href="#/personal" status="complete"></civ-task>
        <civ-task label="Education history" href="#/education" status="complete"></civ-task>
        <civ-task label="Employment history" href="#/employment" status="complete"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Submit</h3>
        <civ-task label="Review and submit" href="#/review" status="not-started"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};
