import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-form-step.js';
import '@civui/compound';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Form/Form Step',
  component: 'civ-form-step',
  tags: ['autodocs'],
  argTypes: {
    progress: { control: 'select', options: ['minimal', 'steps', 'bar'] },
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

export const WithProgressBar: Story = {
  name: 'With Progress Bar',
  render: () => html`
    <civ-form-step progress="bar">
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

export const WithSegmentedSteps: Story = {
  name: 'With Segmented Steps',
  render: () => html`
    <civ-form-step progress="steps">
      <div data-step-label="Eligibility">
        <p>Answer the following questions to determine eligibility.</p>
      </div>
      <div data-step-label="Personal Info">
        <p>Enter your personal details.</p>
      </div>
      <div data-step-label="Documents">
        <p>Upload supporting documents.</p>
      </div>
      <div data-step-label="Review">
        <p>Review and submit your application.</p>
      </div>
    </civ-form-step>
  `,
};

export const WithStepsTertiary: Story = {
  name: 'With Steps (Tertiary Header)',
  render: () => html`
    <civ-form-step progress="steps" header-size="tertiary">
      <div data-step-label="Eligibility">
        <p>Answer the following questions to determine eligibility.</p>
      </div>
      <div data-step-label="Personal Info">
        <p>Enter your personal details.</p>
      </div>
      <div data-step-label="Documents">
        <p>Upload supporting documents.</p>
      </div>
      <div data-step-label="Review">
        <p>Review and submit your application.</p>
      </div>
    </civ-form-step>
  `,
};

export const WithProgressBarTertiary: Story = {
  name: 'With Progress Bar (Tertiary Header)',
  render: () => html`
    <civ-form-step progress="bar" header-size="tertiary">
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
  name: 'With Validation Error',
  parameters: {
    docs: {
      description: {
        story:
          'Each step validates its required fields before advancing. Click "Continue" without filling the required input to see the per-field error and the form-step error summary at the top.',
      },
    },
  },
  render: () => html`
    <civ-form-step>
      <div data-step-label="Personal information">
        <civ-text-input
          label="Full name"
          name="name"
          required
          required-message="Enter your full name"
        ></civ-text-input>
        <civ-text-input
          label="Email address"
          name="email"
          type="email"
          required
          required-message="Enter a valid email address"
        ></civ-text-input>
      </div>
      <div data-step-label="Review">
        <p>Review your information before submitting.</p>
      </div>
    </civ-form-step>
  `,
};

export const CustomButtonLabels: Story = {
  name: 'Custom Button Labels',
  render: () => html`
    <civ-form-step
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

export const TwoSteps: Story = {
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

export const NavDisabled: Story = {
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

export const AllProgressModes: Story = {
  name: 'All Progress Modes',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-12">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Minimal (default)</h3>
        <civ-form-step>
          <div data-step-label="Step 1"><p>Content for step 1.</p></div>
          <div data-step-label="Step 2"><p>Content for step 2.</p></div>
          <div data-step-label="Step 3"><p>Content for step 3.</p></div>
        </civ-form-step>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Step Circles</h3>
        <civ-form-step progress="steps">
          <div data-step-label="Step 1"><p>Content for step 1.</p></div>
          <div data-step-label="Step 2"><p>Content for step 2.</p></div>
          <div data-step-label="Step 3"><p>Content for step 3.</p></div>
        </civ-form-step>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Progress Bar</h3>
        <civ-form-step progress="bar">
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
    <civ-form-step complete-label="Review your answers" header-size="primary">
      <div data-step-label="Personal information">
        <civ-name legend="Your name" name="name" required size="lg"></civ-name>
        <civ-memorable-date legend="Date of birth" required hint="For example: January 15 1990" size="lg" name="dob"></civ-memorable-date>
        <civ-text-input label="Social Security number" name="ssn" hint="We need this to verify your identity" required mask="ssn" validate="ssn" type="tel"></civ-text-input>
      </div>
      <div data-step-label="Contact information">
        <civ-address legend="Mailing address" name="address" required size="lg"></civ-address>
        <civ-text-input label="Home phone number" name="homePhone" type="tel" mask="phone-us" validate="phone"></civ-text-input>
        <civ-text-input label="Email address" name="email" required type="email" validate="email"></civ-text-input>
      </div>
      <div data-step-label="Certification">
        <civ-signature
          legend="Statement of truth"
          name="signature"
          statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
          required
          size="xl"
          card
        ></civ-signature>
      </div>
    </civ-form-step>
  `,
};

export const HeaderPrimary: Story = {
  name: 'Header — Primary',
  parameters: {
    docs: {
      description: {
        story: 'Large heading with divider lines. Use as the main multi-step form page heading.',
      },
    },
  },
  render: () => html`
    <civ-form-step header-size="primary" step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-text-input label="Full name" name="name" required></civ-text-input>
      </div>
      <div data-step-label="Contact information">
        <civ-text-input label="Email address" name="email" required type="email"></civ-text-input>
      </div>
      <div data-step-label="Review">
        <p>Review your information before submitting.</p>
      </div>
    </civ-form-step>
  `,
};

export const HeaderSecondary: Story = {
  name: 'Header — Secondary',
  parameters: {
    docs: {
      description: {
        story: 'Medium heading without dividers. Use for inline form sections.',
      },
    },
  },
  render: () => html`
    <civ-form-step header-size="secondary" step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-text-input label="Full name" name="name" required></civ-text-input>
      </div>
      <div data-step-label="Contact information">
        <civ-text-input label="Email address" name="email" required type="email"></civ-text-input>
      </div>
    </civ-form-step>
  `,
};

export const HeaderTertiary: Story = {
  name: 'Header — Tertiary',
  parameters: {
    docs: {
      description: {
        story: 'Compact heading that pairs with progress-steps or progress-percent bars.',
      },
    },
  },
  render: () => html`
    <civ-form-step header-size="tertiary" step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-text-input label="Full name" name="name" required></civ-text-input>
      </div>
      <div data-step-label="Contact information">
        <civ-text-input label="Email address" name="email" required type="email"></civ-text-input>
      </div>
    </civ-form-step>
  `,
};

export const AsyncValidation: Story = {
  name: 'Async Validation',
  parameters: {
    docs: {
      description: {
        story:
          'Set `beforeContinue` to an async function that validates server-side before advancing. The continue button shows a loading spinner while the promise is pending. Return `false` to block navigation.',
      },
    },
  },
  render: () => {
    const setup = (e: Event) => {
      const el = (e.target as HTMLElement).closest('civ-form-step') as any;
      if (!el || el._asyncSetup) return;
      el._asyncSetup = true;
      el.beforeContinue = async (_step: Element, index: number) => {
        await new Promise(r => setTimeout(r, 1500));
        if (index === 0 && Math.random() > 0.5) {
          return false;
        }
        return true;
      };
    };
    return html`
      <civ-form-step
        header-size="primary"
        step-title="Personal information"
        @civ-step-change="${setup}"
      >
        <div data-step-label="Personal information">
          <p class="civ-mb-4 civ-text-sm" style="color: var(--civ-color-base-dark)">Click Continue to trigger a simulated server validation (1.5s delay, 50% chance of failing on step 1).</p>
          <civ-text-input label="Full name" name="name" required></civ-text-input>
        </div>
        <div data-step-label="Contact information">
          <civ-text-input label="Email address" name="email" required type="email"></civ-text-input>
        </div>
        <div data-step-label="Review">
          <p>All validations passed. Review and submit.</p>
        </div>
      </civ-form-step>
    `;
  },
};
