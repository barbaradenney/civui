import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '@civui/actions';
import '@civui/feedback';
import '../form/civ-form.js';
import '../form-step/civ-form-step.js';
import '../fieldset/civ-fieldset.js';
import '../conditional/civ-conditional.js';
import '../repeater/civ-repeater.js';
import '../summary/civ-summary.js';
import '../progress/civ-progress.js';
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
        <civ-form-field label="Full name" required>
          <civ-text-input name="name" required autocomplete="name"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Email" required>
          <civ-text-input name="email" type="email" required autocomplete="email"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Phone">
          <civ-text-input name="phone" type="tel" autocomplete="tel"></civ-text-input>
        </civ-form-field>
      </civ-fieldset>

      <civ-form-field label="Message" required>
        <civ-textarea name="message" required></civ-textarea>
      </civ-form-field>

      <civ-button type="submit" label="Submit" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};

export const MultiStepForm: Story = {
  name: 'Multi-Step Form',
  render: () => html`
    <civ-form @civ-submit="${() => alert('Submitted!')}">
      <civ-form-step>
        <div data-step-label="Personal info">
          <civ-name legend="Your name" name="name" required></civ-name>
          <civ-form-fieldset legend="Date of birth" required hint="For example: January 15 1990">
            <civ-memorable-date name="dob" required></civ-memorable-date>
          </civ-form-fieldset>
        </div>

        <div data-step-label="Service history">
          <civ-repeater legend="Service periods" name="service"
            item-label="service period" min="1">
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
      <civ-form-fieldset legend="Are you a veteran?" required>
        <civ-yes-no name="isVeteran" required></civ-yes-no>
      </civ-form-fieldset>

      <civ-conditional when="isVeteran" equals="yes">
        <civ-fieldset legend="Service information">
          <civ-service-history name="service"></civ-service-history>
        </civ-fieldset>
      </civ-conditional>

      <civ-form-fieldset legend="Are you currently married?" required>
        <civ-yes-no name="isMarried" required></civ-yes-no>
      </civ-form-fieldset>

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
          <civ-form-field label="Phone number">
            <civ-text-input name="phone" type="tel"></civ-text-input>
          </civ-form-field>
        </div>

        <div data-step-label="About the person who died">
          <civ-section-intro heading="About the person who died" tone="sensitive">
            <p>We need some information about the Veteran who died to process your claim.</p>
            <p>You can save your progress and come back later at any time.</p>
          </civ-section-intro>

          <civ-relationship
            legend="About the Veteran"
            name="veteran"
            preset="survivor"
            deceased-assumed
            required
          ></civ-relationship>
        </div>
      </civ-form-step>
    </civ-form>
  `,
};
