import type { Meta, StoryObj } from '@storybook/web-components';
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
        <civ-form-field label="Briefly describe the event" hint="You can come back and add detail later">
          <civ-textarea name="event"></civ-textarea>
        </civ-form-field>
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
        <civ-form-field label="Any conditions we should know about?">
          <civ-textarea name="conditions"></civ-textarea>
        </civ-form-field>
      </div>
      <div data-step-label="Current medications">
        <h3 class="civ-heading-md">Current medications</h3>
        <civ-form-field label="List any medications you take">
          <civ-textarea name="meds"></civ-textarea>
        </civ-form-field>
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
        <civ-form-fieldset legend="Date of birth" required hint="For example: January 15 1990" size="lg">
          <civ-memorable-date name="dob" required></civ-memorable-date>
        </civ-form-fieldset>
        <civ-form-field label="Social Security number" required hint="We need this to verify your identity">
          <civ-text-input name="ssn" required mask="ssn" validate="ssn" type="tel"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Contact information">
        <civ-address legend="Mailing address" name="address" required size="lg"></civ-address>
        <civ-form-field label="Home phone number">
          <civ-text-input name="homePhone" type="tel" mask="phone-us" validate="phone"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Email address" required>
          <civ-text-input name="email" type="email" required validate="email"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Certification">
        <civ-signature
          legend="Statement of truth"
          name="signature"
          statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
          required
          size="lg"
        ></civ-signature>
      </div>
    </civ-form-step>
  `,
};

export const PrimaryDefault: Story = {
  name: 'Primary — Default spacing',
  parameters: {
    docs: {
      description: {
        story: 'Large heading with border lines and generous padding. Use as the main form wizard page heading.',
      },
    },
  },
  render: () => html`
    <civ-form-step header-size="primary" step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-form-field label="Full name" required>
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Contact information">
        <civ-form-field label="Email address" required>
          <civ-text-input name="email" type="email"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Review">
        <p>Review your information before submitting.</p>
      </div>
    </civ-form-step>
  `,
};

export const PrimaryCompact: Story = {
  name: 'Primary — Compact spacing',
  parameters: {
    docs: {
      description: {
        story: 'Large heading without border lines and tight padding. Use for embedded sub-wizards or tight layouts.',
      },
    },
  },
  render: () => html`
    <civ-form-step header-size="primary" header-spacing="compact" step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-form-field label="Full name" required>
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Contact information">
        <civ-form-field label="Email address" required>
          <civ-text-input name="email" type="email"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Review">
        <p>Review your information before submitting.</p>
      </div>
    </civ-form-step>
  `,
};

export const SecondaryDefault: Story = {
  name: 'Secondary — Default spacing',
  parameters: {
    docs: {
      description: {
        story: 'Standard heading with border lines and moderate padding. The default style for multi-step sections.',
      },
    },
  },
  render: () => html`
    <civ-form-step step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-form-field label="Full name" required>
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Contact information">
        <civ-form-field label="Email address" required>
          <civ-text-input name="email" type="email"></civ-text-input>
        </civ-form-field>
      </div>
    </civ-form-step>
  `,
};

export const SecondaryCompact: Story = {
  name: 'Secondary — Compact spacing',
  parameters: {
    docs: {
      description: {
        story: 'Compact heading without border lines and minimal padding. Use for mobile or tight layouts.',
      },
    },
  },
  render: () => html`
    <civ-form-step header-spacing="compact" step-title="Personal information">
      <div data-step-label="Personal information">
        <civ-form-field label="Full name" required>
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Contact information">
        <civ-form-field label="Email address" required>
          <civ-text-input name="email" type="email"></civ-text-input>
        </civ-form-field>
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
          <civ-form-field label="Full name" required>
            <civ-text-input name="name"></civ-text-input>
          </civ-form-field>
        </div>
        <div data-step-label="Contact information">
          <civ-form-field label="Email address" required>
            <civ-text-input name="email" type="email"></civ-text-input>
          </civ-form-field>
        </div>
        <div data-step-label="Review">
          <p>All validations passed. Review and submit.</p>
        </div>
      </civ-form-step>
    `;
  },
};
