import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../summary/civ-summary.js';
import '../read-only-field/civ-read-only-field.js';
import '../text-input/civ-text-input.js';
import '../name/civ-name.js';
import '../form-step/civ-form-step.js';
import '../prefill-notice/civ-prefill-notice.js';
import type { CivSummary } from '../summary/civ-summary.js';

const meta: Meta = {
  title: 'Forms/Patterns/Prefill Chapter Flow',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Prefill Chapter Flow Pattern

When a signed-in user enters a form chapter, they see a **review page first** showing all current data for that section. From there they can:

1. **Review** what's already prefilled
2. **Edit** individual fields via edit links (opens form step)
3. **Save and complete** to return to the task list hub

This pattern keeps the task list as the high-level hub and puts the detail inside each chapter.

### Flow
\`\`\`
Task List Hub → Chapter Review Page → Edit Step → Back to Review → Save & Complete → Hub
\`\`\`

### Components Used
- \`civ-task-list\` / \`civ-task\` — hub page with status + preview
- \`civ-summary\` — chapter review page showing all section data
- \`civ-form-step\` — individual edit steps within a chapter
- \`civ-read-only-field\` — reusable data rows in all views
- \`civ-prefill-notice\` — banner on intro/hub page
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ── Step 1: Task List Hub ────────────────────────────────────

export const Step1_TaskListHub: Story = {
  name: '1. Task List Hub',
  parameters: {
    docs: {
      description: {
        story: 'The hub page shows all chapters with status tags and preview data for prefilled sections. Users click a chapter to enter it.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <h1 class="civ-heading-xl civ-mb-2">Apply for disability compensation</h1>
      <p class="civ-text-muted civ-mb-4">VA Form 21-526EZ</p>

      <civ-prefill-notice profile-href="/profile"></civ-prefill-notice>

      <civ-task-list>
        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your information</h3>
          <civ-task
            id="hub-personal"
            label="Personal information"
            href="/profile/settings"
            status="complete"
            locked
          ></civ-task>
          <civ-task
            id="hub-contact"
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
          <civ-task label="Supporting documents" status="cannot-start"></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
          <civ-task label="Review your application" status="cannot-start"></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const personal = canvasElement.querySelector('#hub-personal') as any;
    if (personal) {
      personal.preview = [
        { label: 'Name', value: 'Jane M. Doe' },
        { label: 'Date of birth', value: 'March 15, 1985' },
        { label: 'SSN', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
      ];
    }
    const contact = canvasElement.querySelector('#hub-contact') as any;
    if (contact) {
      contact.preview = [
        { label: 'Phone', value: '(555) 123-4567' },
        { label: 'Email', value: 'jane.doe@example.com' },
        { label: 'Address', value: '123 Main St, Springfield, IL 62701' },
      ];
    }
  },
};

// ── Step 2: Chapter Review Page ──────────────────────────────

export const Step2_ChapterReview: Story = {
  name: '2. Chapter Review Page',
  parameters: {
    docs: {
      description: {
        story: 'When the user clicks into "Contact information," they see this review page first. It shows all current data with edit links. The "Save and complete" button marks this chapter done and returns to the hub.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#/hub"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Contact information</h2>

      <civ-summary id="chapter-review"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Save and complete"></civ-button>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#chapter-review') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: 'Phone number',
          editHref: '#/contact/phone',
          items: [
            { label: 'Mobile phone', value: '(555) 123-4567', source: 'profile' as const },
          ],
        },
        {
          heading: 'Email address',
          editHref: '#/contact/email',
          items: [
            { label: 'Email', value: 'jane.doe@example.com', source: 'profile' as const },
          ],
        },
        {
          heading: 'Mailing address',
          editHref: '#/contact/address',
          items: [
            { label: 'Street', value: '123 Main St' },
            { label: 'City', value: 'Springfield' },
            { label: 'State', value: 'Illinois' },
            { label: 'Zip code', value: '62701' },
          ],
        },
      ];
    }
  },
};

// ── Step 2b: Chapter Review with Locked Data ─────────────────

export const Step2b_LockedChapterReview: Story = {
  name: '2b. Locked Chapter Review',
  parameters: {
    docs: {
      description: {
        story: 'For chapters with locked identity data (name, DOB, SSN), the review shows "From your profile" tags and the edit link goes to the profile settings page instead of a form step.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#/hub"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Personal information</h2>

      <civ-summary id="locked-review"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Save and complete"></civ-button>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#locked-review') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: 'Verified identity',
          editHref: '/profile/settings',
          locked: true,
          items: [
            { label: 'Name', value: 'Jane M. Doe', source: 'profile' as const },
            { label: 'Date of birth', value: 'March 15, 1985', source: 'profile' as const },
            { label: 'Social Security number', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789', source: 'profile' as const },
          ],
        },
      ];
    }
  },
};

// ── Step 2c: Chapter Review with Conflict ────────────────────

export const Step2c_ConflictReview: Story = {
  name: '2c. Conflict in Chapter Review',
  parameters: {
    docs: {
      description: {
        story: 'When the profile has multiple values for a field (e.g., 3 phone numbers), the review page shows an action link to resolve the conflict.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 640px;">
      <civ-link variant="back" label="Back to task list" href="#/hub"></civ-link>

      <h2 class="civ-heading-xl civ-mt-3 civ-mb-4">Contact information</h2>

      <civ-summary id="conflict-review"></civ-summary>

      <div class="civ-mt-6">
        <civ-button label="Save and complete" disabled></civ-button>
        <p class="civ-text-muted civ-text-sm civ-mt-2">Resolve all items before saving.</p>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector('#conflict-review') as CivSummary;
    if (summary) {
      summary.sections = [
        {
          heading: 'Phone number',
          editHref: '#/contact/phone',
          status: 'in-progress' as const,
          items: [
            { label: 'Phone numbers on file', value: '3 found', action: { label: 'Choose one', href: '#/contact/phone' } },
          ],
        },
        {
          heading: 'Email address',
          status: 'complete' as const,
          items: [
            { label: 'Email', value: 'jane.doe@example.com', source: 'profile' as const },
          ],
        },
        {
          heading: 'Mailing address',
          editHref: '#/contact/address',
          status: 'complete' as const,
          items: [
            { label: 'Address', value: '123 Main St, Springfield, IL 62701', source: 'profile' as const },
          ],
        },
      ];
    }
  },
};

// ── Step 3: Edit Step ────────────────────────────────────────

export const Step3_EditStep: Story = {
  name: '3. Edit Step (Form Fields)',
  parameters: {
    docs: {
      description: {
        story: 'When the user clicks "Edit" on a section, they enter a form step to update that data. The form step\'s "Save and continue" returns them to the chapter review page.',
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

// ── Step 4: Completed Chapter ────────────────────────────────

export const Step4_CompletedHub: Story = {
  name: '4. Hub After Chapter Complete',
  parameters: {
    docs: {
      description: {
        story: 'After saving and completing a chapter, the user returns to the hub. The completed chapter shows a green "Complete" tag and the next chapter unlocks.',
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
          <civ-task
            id="done-personal"
            label="Personal information"
            href="/profile/settings"
            status="complete"
            locked
          ></civ-task>
          <civ-task
            id="done-contact"
            label="Contact information"
            href="#/contact"
            status="complete"
          ></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Your claim</h3>
          <civ-task label="Service history" href="#/service" status="not-started"></civ-task>
          <civ-task label="Disabilities" status="cannot-start"></civ-task>
          <civ-task label="Supporting documents" status="cannot-start"></civ-task>
        </civ-task-group>

        <civ-task-group>
          <h3 data-task-group-heading class="civ-heading-md">Review and submit</h3>
          <civ-task label="Review your application" status="cannot-start"></civ-task>
        </civ-task-group>
      </civ-task-list>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const personal = canvasElement.querySelector('#done-personal') as any;
    if (personal) {
      personal.preview = [
        { label: 'Name', value: 'Jane M. Doe' },
        { label: 'Date of birth', value: 'March 15, 1985' },
        { label: 'SSN', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
      ];
    }
    const contact = canvasElement.querySelector('#done-contact') as any;
    if (contact) {
      contact.preview = [
        { label: 'Phone', value: '(555) 987-6543' },
        { label: 'Email', value: 'jane.doe@example.com' },
        { label: 'Address', value: '123 Main St, Springfield, IL 62701' },
      ];
    }
  },
};
