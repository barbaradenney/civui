import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-task-list.js';
import './civ-task-group.js';
import './civ-task.js';
import '@civui/ui/tag';
import '@civui/ui/link';

const meta: Meta = {
  title: 'Navigation/Task List',
  component: 'civ-task-list',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
        <civ-task label="Personal information" href="#/personal" status="complete"></civ-task>
        <civ-task label="Contact information" href="#/contact" status="in-progress"></civ-task>
        <civ-task label="Service history" status="not-started"></civ-task>
        <civ-task label="Supporting documents" status="cannot-start"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
        <civ-task label="Review your application" status="cannot-start"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const AllStatuses: Story = {
  name: 'All Statuses',
  render: () => html`
    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Status examples</h3>
        <civ-task label="Not started" href="#" status="not-started"></civ-task>
        <civ-task label="In progress" hint="2 of 5 fields complete" href="#" status="in-progress"></civ-task>
        <civ-task label="Complete" href="#" status="complete"></civ-task>
        <civ-task label="Cannot start yet" hint="Complete previous sections first" status="cannot-start"></civ-task>
        <civ-task label="Has errors" hint="Fix validation errors to continue" href="#" status="error"></civ-task>
        <civ-task label="Needs review" hint="Phone, email, and mailing address" href="#" status="review" prefilled></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const SequentialUnlocking: Story = {
  name: 'Sequential Unlocking',
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
        <civ-task label="Discharge details" hint="Complete service periods first" status="cannot-start"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Evidence</h3>
        <civ-task label="Upload DD214" hint="Complete service history first" status="cannot-start"></civ-task>
        <civ-task label="Medical records" hint="Complete service history first" status="cannot-start"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

export const AllComplete: Story = {
  name: 'All Sections Complete',
  render: () => html`
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

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 48px;">
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">In progress (mixed statuses)</h3>
        <civ-task-list>
          <civ-task-group>
            <h3 data-task-group-heading class="civ-heading-md">Tasks</h3>
            <civ-task label="Complete task" href="#" status="complete"></civ-task>
            <civ-task label="In progress task" href="#" status="in-progress"></civ-task>
            <civ-task label="Locked task" status="cannot-start"></civ-task>
          </civ-task-group>
        </civ-task-list>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">With errors</h3>
        <civ-task-list>
          <civ-task-group>
            <h3 data-task-group-heading class="civ-heading-md">Tasks</h3>
            <civ-task label="Complete task" href="#" status="complete"></civ-task>
            <civ-task label="Task with error" hint="Fix errors" href="#" status="error"></civ-task>
            <civ-task label="Blocked" status="cannot-start"></civ-task>
          </civ-task-group>
        </civ-task-list>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">All complete</h3>
        <civ-task-list>
          <civ-task-group>
            <h3 data-task-group-heading class="civ-heading-md">Tasks</h3>
            <civ-task label="Task A" href="#" status="complete"></civ-task>
            <civ-task label="Task B" href="#" status="complete"></civ-task>
            <civ-task label="Task C" href="#" status="complete"></civ-task>
          </civ-task-group>
        </civ-task-list>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-task-list>
          <civ-task-group>
            <h3 data-task-group-heading class="civ-heading-md">Application</h3>
            <civ-task label="Personal info" href="#" status="complete"></civ-task>
            <civ-task label="Contact info" href="#" status="in-progress"></civ-task>
            <civ-task label="Review" status="cannot-start"></civ-task>
          </civ-task-group>
        </civ-task-list>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-task-list>
          <civ-task-group>
            <h3 data-task-group-heading class="civ-heading-md">Application</h3>
            <civ-task label="Personal info" href="#" status="complete"></civ-task>
            <civ-task label="Contact info" href="#" status="in-progress"></civ-task>
            <civ-task label="Review" status="cannot-start"></civ-task>
          </civ-task-group>
        </civ-task-list>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-task-list>
          <civ-task-group>
            <h3 data-task-group-heading class="civ-heading-md">Application</h3>
            <civ-task label="Personal info" href="#" status="complete"></civ-task>
            <civ-task label="Contact info" href="#" status="in-progress"></civ-task>
            <civ-task label="Review" status="cannot-start"></civ-task>
          </civ-task-group>
        </civ-task-list>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentDisabilityApplication: Story = {
  name: 'Usage: VA Disability Application Hub',
  render: () => html`
    <h1 style="margin: 0 0 8px; font-size: 1.75rem; font-weight: bold;">Apply for disability compensation</h1>
    <p style="margin: 0 0 24px; color: #565c65;">VA Form 21-526EZ</p>

    <civ-task-list>
      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Prepare</h3>
        <civ-task label="Check your eligibility" href="#/eligibility" status="complete"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Fill out your application</h3>
        <civ-task label="Personal information" hint="Name, date of birth, Social Security number" href="#/personal" status="complete"></civ-task>
        <civ-task label="Contact information" hint="Address and phone number" href="#/contact" status="in-progress"></civ-task>
        <civ-task label="Service history" hint="Branch, dates, and character of service" status="cannot-start"></civ-task>
        <civ-task label="Disabilities and conditions" hint="List each condition you are claiming" status="cannot-start"></civ-task>
        <civ-task label="Supporting documents" hint="Upload DD214 and medical records" status="cannot-start"></civ-task>
      </civ-task-group>

      <civ-task-group>
        <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
        <civ-task label="Review your application" hint="Complete all sections before reviewing" status="cannot-start"></civ-task>
      </civ-task-group>
    </civ-task-list>
  `,
};

// ── Prefill Scenario ─────────────────────────────────────────

export const PrefillHub: Story = {
  name: 'Prefill: Hub with Prefilled Chapters',
  render: () => html`
    <div style="max-width: 640px;">
      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your information</h3>
          <civ-task label="Personal information" hint="Name, date of birth, Social Security number" href="#/personal" status="review" prefilled></civ-task>
          <civ-task label="Contact information" hint="Phone, email, and mailing address" status="cannot-start" prefilled></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your claim</h3>
          <civ-task label="Service history" href="#/service" status="not-started"></civ-task>
          <civ-task label="Disabilities" status="cannot-start"></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
          <civ-task label="Review your application" status="cannot-start"></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
};
