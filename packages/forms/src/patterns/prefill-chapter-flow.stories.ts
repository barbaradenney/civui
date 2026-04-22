import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../summary/civ-summary.js';
import '../read-only-field/civ-read-only-field.js';
import '../text-input/civ-text-input.js';
import '../name/civ-name.js';
import '../form-step/civ-form-step.js';
import '../prefill-notice/civ-prefill-notice.js';
import '@civui/navigation';
import '@civui/ui/link';
import '@civui/ui/button';
import '@civui/ui/tag';
import '@civui/ui/divider';
import type { CivSummary } from '../summary/civ-summary.js';

const meta: Meta = {
  title: 'Forms/Patterns/Prefill Chapter Flow',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Prefill Chapter Flow

When a signed-in user clicks into a form chapter that has prefilled data,
the **first page** is a review of that chapter's current data. From there:

1. **Review** — see what's prefilled, edit if needed
2. **Continue** — if the chapter has more steps, go to them
3. **Save and complete** — if all data is done, return to the hub

The task list hub stays simple — just labels, hints, and status tags.
The prefilled data lives inside the chapter, not on the hub.

### Flow
\`\`\`
Task List Hub → Chapter Prefill Review → (Edit Steps if needed) → Save & Complete → Hub
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ── Step 1: Task List Hub ────────────────────────────────────

export const Step1_Hub: Story = {
  name: '1. Task List Hub',
  parameters: {
    docs: {
      description: {
        story: 'The hub shows chapters with status. Prefilled chapters show a hint. No data preview on the hub — that lives inside the chapter.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <h1 class="civ-heading-xl civ-mb-2">Apply for disability compensation</h1>
      <p class="civ-text-muted civ-mb-4">VA Form 21-526EZ</p>

      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your information</h3>
          <civ-task label="Personal information" hint="Name, date of birth, Social Security number" href="#/personal" status="review" prefilled></civ-task>
          <civ-task label="Contact information" hint="Phone, email, and mailing address" status="cannot-start" prefilled></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your claim</h3>
          <civ-task label="Service history" hint="Branch, dates, and character of service" status="cannot-start"></civ-task>
          <civ-task label="Disabilities" hint="Conditions you are claiming" status="cannot-start"></civ-task>
          <civ-task label="Supporting documents" hint="DD214 and medical records" status="cannot-start"></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
          <civ-task label="Review your application" status="cannot-start"></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
};

// ── Step 2a: Locked chapter (all data from profile, nothing to edit) ─

export const Step2a_LockedChapter: Story = {
  name: '2a. Chapter: Locked Profile Data',
  parameters: {
    docs: {
      description: {
        story: 'Clicking "Personal information" enters the chapter. The first page shows prefilled identity data with "From your profile" tags. Since this data is locked, the edit link goes to profile settings. The button says "Save and complete" because there are no more steps.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Personal information</h2>

      <civ-prefill-notice></civ-prefill-notice>

      <civ-summary id="locked-chapter"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Save and complete"></civ-button>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#locked-chapter') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: 'Verified identity',
          editHref: '/profile/settings',
          locked: true,
          items: [
            { label: 'Name', value: 'Jane M. Doe' },
            { label: 'Date of birth', value: 'March 15, 1985' },
            { label: 'Social Security number', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
          ],
        },
      ];
    }
  },
};

// ── Step 2b: Prefilled chapter with more steps to complete ───

export const Step2b_PrefillWithMoreSteps: Story = {
  name: '2b. Chapter: Prefilled Data + More Steps',
  parameters: {
    docs: {
      description: {
        story: 'Clicking "Contact information" shows prefilled contact data. The button says "Continue" because there are additional fields in this chapter that still need to be filled out (e.g., preferred contact method).',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Contact information</h2>

      <civ-prefill-notice></civ-prefill-notice>

      <civ-summary id="prefill-chapter"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Continue"></civ-button>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#prefill-chapter') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: '',
          items: [
            { label: 'Mobile phone', value: '(555) 123-4567', editHref: '#/contact/phone' },
            { label: 'Email', value: 'jane.doe@example.com', editHref: '#/contact/email' },
            { label: 'Street', value: '123 Main St', editHref: '#/contact/address' },
            { label: 'City, state, zip', value: 'Springfield, IL 62701' },
          ],
        },
      ];
    }
  },
};

// ── Step 2c: Prefilled chapter with conflict ─────────────────

export const Step2c_ConflictChapter: Story = {
  name: '2c. Chapter: Conflict Resolution',
  parameters: {
    docs: {
      description: {
        story: 'When the profile has multiple values for a field (3 phone numbers), the review shows an action link to resolve it. The "Continue" button may be disabled until the conflict is resolved.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Contact information</h2>

      <civ-summary id="conflict-chapter"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Continue" disabled></civ-button>
        <p class="civ-text-muted civ-text-sm civ-mt-2">Please resolve all items before continuing.</p>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#conflict-chapter') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: '',
          items: [
            { label: 'Phone numbers on file', value: '3 found', action: { label: 'Choose one', href: '#/contact/phone' } },
            { label: 'Email', value: 'jane.doe@example.com', editHref: '#/contact/email' },
          ],
        },
      ];
    }
  },
};

// ── Step 3: Edit step within chapter ─────────────────────────

export const Step3_EditStep: Story = {
  name: '3. Edit Step (Within Chapter)',
  parameters: {
    docs: {
      description: {
        story: 'Clicking "Edit" on a section opens the form fields for that data. "Save and continue" returns to the chapter review page with updated values.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to contact information" href="#/contact"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Edit phone number</h2>

      <p class="civ-text-muted civ-mb-4">Any changes you make here will also update your VA.gov profile.</p>

      <civ-text-input
        label="Mobile phone number"
        name="phone"
        value="(555) 123-4567"
        mask="phone-us"
        required
      ></civ-text-input>

      <div class="civ-mt-6 civ-flex civ-gap-2">
        <civ-button label="Save and continue"></civ-button>
        <civ-button variant="tertiary" label="Cancel"></civ-button>
      </div>
    </div>
  `,
};

// ── Step 4: Chapter complete ─────────────────────────────────

export const Step4_ChapterComplete: Story = {
  name: '4. Chapter Complete (All Data Reviewed)',
  parameters: {
    docs: {
      description: {
        story: 'After reviewing all prefilled data and completing any remaining steps, the chapter review shows all sections as complete. "Save and complete" returns to the hub.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Contact information</h2>

      <civ-summary id="complete-chapter"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Save and complete"></civ-button>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#complete-chapter') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: '',
          items: [
            { label: 'Mobile phone', value: '(555) 987-6543', editHref: '#/contact/phone' },
            { label: 'Email', value: 'jane.doe@example.com', editHref: '#/contact/email' },
            { label: 'Street', value: '123 Main St', editHref: '#/contact/address' },
            { label: 'City, state, zip', value: 'Springfield, IL 62701' },
          ],
        },
      ];
    }
  },
};

// ── Step 5: Back on hub ──────────────────────────────────────

export const Step5_HubAfterComplete: Story = {
  name: '5. Hub After Chapter Complete',
  parameters: {
    docs: {
      description: {
        story: 'After saving and completing the contact info chapter, the hub shows it as "Complete" and the next chapter unlocks.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <h1 class="civ-heading-xl civ-mb-2">Apply for disability compensation</h1>
      <p class="civ-text-muted civ-mb-4">VA Form 21-526EZ</p>

      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your information</h3>
          <civ-task label="Personal information" hint="Name, date of birth, Social Security number" href="#/personal" status="complete"></civ-task>
          <civ-task label="Contact information" hint="Phone, email, and mailing address" href="#/contact" status="complete"></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your claim</h3>
          <civ-task label="Service history" hint="Branch, dates, and character of service" href="#/service" status="not-started"></civ-task>
          <civ-task label="Disabilities" hint="Conditions you are claiming" status="cannot-start"></civ-task>
          <civ-task label="Supporting documents" hint="DD214 and medical records" status="cannot-start"></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
          <civ-task label="Review your application" status="cannot-start"></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
};
