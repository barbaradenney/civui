import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/ui';
import '@civui/feedback';
import '../form/civ-form.js';
import '../form-step/civ-form-step.js';
import '../fieldset/civ-fieldset.js';
import '../conditional/civ-conditional.js';
import '../repeater/civ-repeater.js';
import '../summary/civ-summary.js';
import '../progress-steps/civ-progress-steps.js';
import '../section-intro/civ-section-intro.js';

const meta: Meta = {
  title: 'Forms/Patterns/Overview Examples',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SimpleForm: Story = {
  name: 'Simple Single-Page Form',
  render: () => html`
    <civ-form @civ-submit="${(e: CustomEvent) => alert('Submitted: ' + JSON.stringify(e.detail.formData))}">
      <civ-fieldset legend="Contact information">
        <civ-text-input label="Full name" name="name" required autocomplete="name"></civ-text-input>
        <civ-text-input label="Email" name="email" type="email" required autocomplete="email"></civ-text-input>
        <civ-text-input label="Phone" name="phone" type="tel" autocomplete="tel"></civ-text-input>
      </civ-fieldset>

      <civ-textarea label="Message" name="message" required></civ-textarea>

      <civ-button type="submit" label="Submit" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};

export const MultiStepForm: Story = {
  name: 'Multi-Step Form',
  render: () => html`
    <civ-form @civ-submit="${(e: CustomEvent) => alert('Submitted!')}">
      <civ-form-step>
        <div data-step-label="Personal info">
          <civ-name legend="Your name" name="name" required></civ-name>
          <civ-memorable-date legend="Date of birth" name="dob" required hint="For example: January 15 1990"></civ-memorable-date>
        </div>

        <div data-step-label="Service history">
          <civ-repeater legend="Service periods" name="service"
            item-label="service period" mode="detail" min="1">
            <civ-service-history name="period"></civ-service-history>
          </civ-repeater>
        </div>

        <div data-step-label="Review">
          <p class="civ-text-body civ-mb-4">Please review your information before submitting.</p>
        </div>
      </civ-form-step>

      <civ-button type="submit" label="Submit application" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};

export const ConditionalFields: Story = {
  name: 'Form with Conditional Fields',
  render: () => html`
    <civ-form>
      <civ-yes-no legend="Are you a veteran?" name="isVeteran" required></civ-yes-no>

      <civ-conditional when="isVeteran" equals="yes">
        <civ-fieldset legend="Service information">
          <civ-service-history name="service"></civ-service-history>
        </civ-fieldset>
      </civ-conditional>

      <civ-yes-no legend="Are you currently married?" name="isMarried" required></civ-yes-no>

      <civ-conditional when="isMarried" equals="yes">
        <civ-relationship
          legend="About your spouse"
          name="spouse"
          preset="general"
        ></civ-relationship>
      </civ-conditional>

      <civ-button type="submit" label="Continue" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};

export const TraumaInformedForm: Story = {
  name: 'Trauma-Informed Form',
  render: () => html`
    <civ-form
      support-resources='[{"label":"Veterans Crisis Line","href":"tel:988"},{"label":"Crisis Text Line","href":"sms:838255"}]'
    >
      <civ-form-step>
        <div data-step-label="Your information">
          <civ-name legend="Your name" name="claimant" required></civ-name>
          <civ-text-input label="Phone number" name="phone" type="tel"></civ-text-input>
        </div>

        <div data-step-label="About the person who died">
          <civ-section-intro heading="About the person who died" tone="sensitive">
            <p>We need some information about the Veteran who died to process your claim.</p>
            <p>You can save your progress and come back later at any time.</p>
          </civ-section-intro>

          <civ-relationship
            legend="About the Veteran"
            name="veteran"
            preset="va-survivor"
            deceased-assumed
            required
          ></civ-relationship>
        </div>
      </civ-form-step>
    </civ-form>
  `,
};
