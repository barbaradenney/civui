import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '../summary/civ-summary.js';
import '../read-only-field/civ-read-only-field.js';
import '@civui/inputs';
import '@civui/compound';
import '../form-step/civ-form-step.js';
import '@civui/feedback';
import '@civui/navigation';
import '@civui/actions/link';
import '@civui/actions/button';
import '@civui/layout/tag';
import '@civui/layout/divider';
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
    <div class="civ-max-w-2xl">
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
    <div class="civ-max-w-2xl">
      <civ-link variant="back" label="Back to task list" href="#"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Personal information</h2>

      <civ-alert variant="info" alert-style="secondary" heading="We've prefilled some of your information" label="We pulled this information from your account. If any of this is wrong, you can correct it here."></civ-alert>

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
    <div class="civ-max-w-2xl">
      <civ-link variant="back" label="Back to task list" href="#"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Contact information</h2>

      <civ-alert variant="info" alert-style="secondary" heading="We've prefilled some of your information" label="We pulled this information from your account. If any of this is wrong, you can correct it here."></civ-alert>

      <civ-summary id="prefill-chapter"></civ-summary>

      <p class="civ-mt-4">If this information is accurate, press continue to fill out the rest of the form.</p>

      <div class="civ-mt-4">
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
            { label: 'Mailing address', value: ['123 Main St', 'Springfield, IL 62701'], editHref: '#/contact/address' },
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
    <div class="civ-max-w-2xl">
      <civ-link variant="back" label="Back to contact information" href="#/contact"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Edit phone number</h2>

      <p class="civ-text-muted civ-mb-4">Any changes you make here will also update your VA.gov profile.</p>

      <civ-form-field label="Mobile phone number" required>
        <civ-text-input
          name="phone"
          value="(555) 123-4567"
          mask="phone-us"
          required
        ></civ-text-input>
      </civ-form-field>

      <div class="civ-mt-6">
        <civ-button label="Update and continue"></civ-button>
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
    <div class="civ-max-w-2xl">
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
            { label: 'Mailing address', value: ['123 Main St', 'Springfield, IL 62701'], editHref: '#/contact/address' },
            { label: 'Preferred contact method', value: 'Email', editHref: '#/contact/preference' },
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
    <div class="civ-max-w-2xl">
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
