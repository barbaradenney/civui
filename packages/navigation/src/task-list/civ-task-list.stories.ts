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

// ── Prefill Scenarios ────────────────────────────────────────

export const PrefillHub: Story = {
  name: 'Prefill: Hub with Preview Data',
  render: () => html`
    <div style="max-width: 640px;">
      <p class="civ-text-muted civ-mb-4">We\u2019ve prefilled some of your information from your profile.</p>
      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your information</h3>
          <civ-task
            id="task-personal"
            label="Personal information"
            href="/profile/settings"
            status="complete"
            locked
          ></civ-task>
          <civ-task
            id="task-contact"
            label="Contact information"
            href="#/contact"
            status="in-progress"
            prefilled
          ></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your claim</h3>
          <civ-task label="Service history" href="#/service" status="not-started"></civ-task>
          <civ-task label="Disabilities" status="cannot-start"></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const personal = canvasElement.querySelector('#task-personal') as any;
    if (personal) {
      personal.preview = [
        { label: 'Name', value: 'Jane M. Doe' },
        { label: 'Date of birth', value: 'March 15, 1985' },
        { label: 'SSN', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
      ];
    }
    const contact = canvasElement.querySelector('#task-contact') as any;
    if (contact) {
      contact.preview = [
        { label: 'Phone', value: '(555) 123-4567' },
        { label: 'Email', value: 'jane@example.com' },
      ];
    }
  },
};

export const PrefillConflict: Story = {
  name: 'Prefill: Conflict in Preview',
  render: () => html`
    <div style="max-width: 640px;">
      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Contact information</h3>
          <civ-task
            id="task-phone"
            label="Phone number"
            href="#/contact/phone"
            status="in-progress"
          ></civ-task>
          <civ-task
            id="task-email"
            label="Email address"
            href="#/contact/email"
            status="complete"
          ></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const phone = canvasElement.querySelector('#task-phone') as any;
    if (phone) {
      phone.preview = [
        { label: 'Phone numbers on file', value: '3 found', action: { label: 'Choose one', href: '#/contact/phone' } },
      ];
    }
    const email = canvasElement.querySelector('#task-email') as any;
    if (email) {
      email.preview = [
        { label: 'Email', value: 'jane@example.com', source: 'profile' },
      ];
    }
  },
};
