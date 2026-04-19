import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-task-list.js';
import './civ-task-group.js';
import './civ-task.js';

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
      <civ-task-group heading="Prepare">
        <civ-task
          label="Check your eligibility"
          href="#/eligibility"
          status="complete"
        ></civ-task>
      </civ-task-group>

      <civ-task-group heading="Fill out your application">
        <civ-task
          label="Personal information"
          href="#/personal"
          status="complete"
        ></civ-task>
        <civ-task
          label="Contact information"
          href="#/contact"
          status="in-progress"
          hint="Phone number needed"
        ></civ-task>
        <civ-task
          label="Service history"
          href="#/service"
          status="not-started"
        ></civ-task>
        <civ-task
          label="Disabilities and conditions"
          href="#/disabilities"
          status="not-started"
        ></civ-task>
        <civ-task
          label="Supporting documents"
          href="#/documents"
          status="not-started"
        ></civ-task>
      </civ-task-group>

      <civ-task-group heading="Review and submit">
        <civ-task
          label="Review your application"
          status="cannot-start"
          hint="Complete all sections first"
        ></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const AllStatuses: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group heading="Status examples">
        <civ-task label="Not started task" href="#" status="not-started"></civ-task>
        <civ-task label="In progress task" href="#" status="in-progress" hint="2 of 5 fields complete"></civ-task>
        <civ-task label="Complete task" href="#" status="complete"></civ-task>
        <civ-task label="Cannot start yet" status="cannot-start" hint="Complete previous sections first"></civ-task>
        <civ-task label="Task with error" href="#" status="error" hint="Fix validation errors"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const MultipleGroups: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group heading="About you">
        <civ-task label="Your name" href="#" status="complete"></civ-task>
        <civ-task label="Your date of birth" href="#" status="complete"></civ-task>
        <civ-task label="Your address" href="#" status="complete"></civ-task>
      </civ-task-group>

      <civ-task-group heading="About your service">
        <civ-task label="Service periods" href="#" status="in-progress"></civ-task>
        <civ-task label="Discharge details" href="#" status="not-started"></civ-task>
      </civ-task-group>

      <civ-task-group heading="Evidence">
        <civ-task label="Upload DD214" href="#" status="not-started"></civ-task>
        <civ-task label="Medical records" href="#" status="not-started"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};
