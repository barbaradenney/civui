import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form-step.js';
import '@civui/compound';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Patterns/Form Step',
  component: 'civ-form-step',
  tags: ['autodocs'],
  argTypes: {
    showProgress: { control: 'boolean' },
    backLabel: { control: 'text' },
    continueLabel: { control: 'text' },
    completeLabel: { control: 'text' },
    navDisabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  render: () => html`
    <civ-form-step>
      <div data-step-label="Personal information">
        <p>Step 1: Enter your personal information. This section collects your name, date of birth, and identification details.</p>
      </div>
      <div data-step-label="Contact information">
        <p>Step 2: Enter your contact details. Provide your mailing address, phone number, and email.</p>
      </div>
      <div data-step-label="Review">
        <p>Step 3: Review your information and submit. Please verify all details are correct before continuing.</p>
      </div>
    </civ-form-step>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'With Progress Bar',
  render: () => html`
    <civ-form-step show-progress>
      <div data-step-label="Personal information">
        <p>Step 1: Personal information.</p>
      </div>
      <div data-step-label="Employment history">
        <p>Step 2: Employment history.</p>
      </div>
      <div data-step-label="Education">
        <p>Step 3: Education background.</p>
      </div>
      <div data-step-label="Review">
        <p>Step 4: Review and submit.</p>
      </div>
    </civ-form-step>
  `,
};

export const WithError: Story = {
  name: 'Custom Button Labels',
  render: () => html`
    <civ-form-step
      back-label="Previous section"
      continue-label="Next section"
      complete-label="Submit application"
    >
      <div data-step-label="Part A">
        <p>Part A: Applicant information.</p>
      </div>
      <div data-step-label="Part B">
        <p>Part B: Supporting documents.</p>
      </div>
      <div data-step-label="Part C">
        <p>Part C: Certification and signature.</p>
      </div>
    </civ-form-step>
  `,
};

export const Required: Story = {
  name: 'Two Steps',
  render: () => html`
    <civ-form-step>
      <div data-step-label="Eligibility">
        <p>Answer the following questions to determine your eligibility for benefits.</p>
      </div>
      <div data-step-label="Confirmation">
        <p>Based on your answers, you may be eligible. Review and confirm your responses.</p>
      </div>
    </civ-form-step>
  `,
};

export const Disabled: Story = {
  name: 'Navigation Disabled',
  render: () => html`
    <civ-form-step nav-disabled>
      <div data-step-label="Step 1">
        <p>Navigation buttons are hidden until form validation passes.</p>
      </div>
      <div data-step-label="Step 2">
        <p>This step would show after validation.</p>
      </div>
    </civ-form-step>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-12">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Without progress bar</h3>
        <civ-form-step>
          <div data-step-label="Step 1"><p>Content for step 1.</p></div>
          <div data-step-label="Step 2"><p>Content for step 2.</p></div>
        </civ-form-step>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With progress bar</h3>
        <civ-form-step show-progress>
          <div data-step-label="Step 1"><p>Content for step 1.</p></div>
          <div data-step-label="Step 2"><p>Content for step 2.</p></div>
          <div data-step-label="Step 3"><p>Content for step 3.</p></div>
        </civ-form-step>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-form-step>
          <div data-step-label="Personal info"><p>Dense layout content.</p></div>
          <div data-step-label="Review"><p>Dense review.</p></div>
        </civ-form-step>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-step>
          <div data-step-label="Personal info"><p>Default layout content.</p></div>
          <div data-step-label="Review"><p>Default review.</p></div>
        </civ-form-step>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-step>
          <div data-step-label="Personal info"><p>Spacious layout content.</p></div>
          <div data-step-label="Review"><p>Spacious review.</p></div>
        </civ-form-step>
      </div>
    </div>
  `,
};

// ── Trauma-informed: sensitive step + pause/resume ────────────

export const Sensitive: Story = {
  name: 'Sensitive step (trauma-informed)',
  render: () => html`
    <civ-form-step sensitive>
      <div data-step-label="Your service history">
        <h3 class="civ-heading-md">About your service-connected trauma</h3>
        <p>These questions may be hard to answer. Your answers are saved as you go — you can pause and come back any time.</p>
        <civ-textarea label="Briefly describe the event" name="event" hint="You can come back and add detail later"></civ-textarea>
      </div>
    </civ-form-step>
  `,
};

export const WithPauseAndResume: Story = {
  name: 'With pause / save-for-later',
  render: () => html`
    <civ-form-step
      show-pause
      @civ-step-pause="${(e: CustomEvent) => alert('Paused at step: ' + e.detail.label)}"
    >
      <div data-step-label="Medical history">
        <h3 class="civ-heading-md">Medical history</h3>
        <civ-textarea label="Any conditions we should know about?" name="conditions"></civ-textarea>
      </div>
      <div data-step-label="Current medications">
        <h3 class="civ-heading-md">Current medications</h3>
        <civ-textarea label="List any medications you take" name="meds"></civ-textarea>
      </div>
    </civ-form-step>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentBenefitApplication: Story = {
  name: 'Usage: Benefit Application Flow',
  render: () => html`
    <civ-form-step complete-label="Review your answers" show-progress>
      <div data-step-label="Personal information">
        <h3 class="civ-heading-md">Personal information</h3>
        <civ-name legend="Your name" name="name" required></civ-name>
        <civ-memorable-date label="Date of birth" name="dob" required hint="For example: January 15 1990"></civ-memorable-date>
        <civ-text-input label="Social Security number" name="ssn" required mask="ssn" validate="ssn" type="tel" hint="We need this to verify your identity"></civ-text-input>
      </div>
      <div data-step-label="Contact information">
        <h3 class="civ-heading-md">Contact information</h3>
        <civ-address legend="Mailing address" name="address" required></civ-address>
        <civ-text-input label="Home phone number" name="homePhone" type="tel" mask="phone-us" validate="phone"></civ-text-input>
        <civ-text-input label="Email address" name="email" type="email" required validate="email"></civ-text-input>
      </div>
      <div data-step-label="Certification">
        <h3 class="civ-heading-md">Certification</h3>
        <civ-signature
          legend="Statement of truth"
          name="signature"
          statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
          required
        ></civ-signature>
      </div>
    </civ-form-step>
  `,
};
