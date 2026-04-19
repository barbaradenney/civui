import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form-step.js';

const meta: Meta = {
  title: 'Forms/Form Step',
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

export const TwoSteps: Story = {
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

export const WithProgress: Story = {
  render: () => html`
    <civ-form-step show-progress>
      <div data-step-label="Personal info">
        <p>Step 1: Personal information.</p>
      </div>
      <div data-step-label="Employment">
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

export const CustomLabels: Story = {
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
