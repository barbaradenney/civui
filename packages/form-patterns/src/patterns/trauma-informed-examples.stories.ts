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
import '../conditional/civ-conditional.js';
import '../repeater/civ-repeater.js';
import '../section-intro/civ-section-intro.js';
import '../summary/civ-summary.js';

const meta: Meta = {
  title: 'Forms/Patterns/Trauma-Informed',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SectionIntro: Story = {
  name: 'Section Intro (Sensitive)',
  render: () => html`
    <civ-section-intro heading="About your service-connected trauma" tone="sensitive">
      <p>The next questions ask about events that may be difficult to remember.</p>
      <p>You can skip any question, and your answers are saved as you go.</p>
    </civ-section-intro>
  `,
};

export const FormStepSensitive: Story = {
  name: 'Form Step with Sensitive + Pause',
  render: () => html`
    <civ-form-step sensitive>
      <div data-step-label="About your trauma">
        <civ-section-intro heading="Service-connected trauma" tone="sensitive">
          <p>You can save and come back to this section later.</p>
        </civ-section-intro>
        <civ-form-fieldset legend="Have you experienced military sexual trauma?">
          <civ-yes-no
            name="mst"
            skip-label="Prefer not to answer"
          ></civ-yes-no>
        </civ-form-fieldset>
      </div>
      <div data-step-label="Additional details">
        <civ-form-field label="Is there anything else you'd like us to know?" hint="This is optional">
          <civ-textarea name="additional"></civ-textarea>
        </civ-form-field>
      </div>
    </civ-form-step>
  `,
};

export const SkipAffordanceYesNo: Story = {
  name: 'Skip Affordance (Yes/No)',
  render: () => html`
    <civ-form-fieldset legend="Have you experienced military sexual trauma?">
      <civ-yes-no
        name="mst"
        skip-label="Prefer not to answer"
        skip-value="skip"
      ></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const SkipAffordanceRadio: Story = {
  name: 'Skip Affordance (Radio Group)',
  render: () => html`
    <civ-form-fieldset legend="What is your race?">
      <civ-radio-group
        name="race"
        skip-label="Prefer not to answer"
      >
        <civ-radio label="American Indian or Alaska Native" value="aian"></civ-radio>
        <civ-radio label="Asian" value="asian"></civ-radio>
        <civ-radio label="Black or African American" value="black"></civ-radio>
        <civ-radio label="Native Hawaiian or Pacific Islander" value="nhpi"></civ-radio>
        <civ-radio label="White" value="white"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const DeceasedAssumed: Story = {
  name: 'Deceased Assumed vs Show Deceased',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <p class="civ-font-semibold civ-mb-2">Good: deceased-assumed (skips the question)</p>
        <civ-relationship
          legend="About the person who died"
          name="good"
          preset="survivor"
          deceased-assumed
        ></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Avoid: show-deceased (asks a redundant question)</p>
        <civ-relationship
          legend="About the person who died"
          name="avoid"
          preset="survivor"
          show-deceased
        ></civ-relationship>
      </div>
    </div>
  `,
};

export const SupportResources: Story = {
  name: 'Support Resources',
  render: () => html`
    <civ-form
      support-resources='[{"label":"Veterans Crisis Line","href":"tel:988","description":"Call or text 988, then press 1"},{"label":"Crisis Text Line","href":"sms:838255","description":"Text HOME to 838255"},{"label":"Safe Helpline","href":"tel:18779955247","description":"For survivors of sexual assault"}]'
    >
      <civ-form-field label="Your name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Tell us about your situation">
        <civ-textarea name="details"></civ-textarea>
      </civ-form-field>
    </civ-form>
  `,
};

export const RepeaterFormStepsSensitive: Story = {
  name: 'Repeater Form Steps (Sensitive)',
  render: () => html`
    <civ-repeater
      legend="People who died"
      name="deceased"
      item-label="person"
      mode="form-steps"
      form-steps-sensitive
      form-steps-show-pause
    >
      <div data-step-label="Their name">
        <civ-name legend="Their name" name="name" required></civ-name>
      </div>
      <div data-step-label="Relationship">
        <civ-relationship preset="survivor" deceased-assumed
          show-name="false" name="rel" required
          legend="Your relationship"></civ-relationship>
      </div>
    </civ-repeater>
  `,
};

export const CompleteSurvivorForm: Story = {
  name: 'Complete: Survivor Benefit Form',
  render: () => html`
    <civ-form
      support-resources='[{"label":"Veterans Crisis Line","href":"tel:988"},{"label":"Caregiver Support","href":"tel:18552603274"}]'
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

        <div data-step-label="Your relationship">
          <civ-form-fieldset legend="Were you legally married at the time of their death?" required>
            <civ-yes-no
              name="marriedAtDeath"
              skip-label="Prefer not to answer"
              required
            ></civ-yes-no>
          </civ-form-fieldset>

          <civ-conditional when="marriedAtDeath" equals="yes">
            <civ-marriage-history
              legend="About your marriage"
              name="marriage"
              status-assumed="widowed"
            ></civ-marriage-history>
          </civ-conditional>
        </div>

        <div data-step-label="Review">
          <p class="civ-text-body civ-mb-4">Please review your information before submitting.</p>
        </div>
      </civ-form-step>

      <civ-button type="submit" label="Submit application" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};
