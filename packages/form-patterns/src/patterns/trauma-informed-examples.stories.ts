import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/inputs';
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
  name: 'Section Intro — tones',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-text-sm civ-mb-2"><code>tone="info"</code> (default)</p>
        <civ-section-intro heading="About your service history" tone="info">
          <p>The next questions ask about your dates and branches of service.</p>
        </civ-section-intro>
      </div>
      <div>
        <p class="civ-text-sm civ-mb-2"><code>tone="sensitive"</code></p>
        <civ-section-intro heading="About your service-connected trauma" tone="sensitive">
          <p>The next questions ask about events that may be difficult to remember.</p>
          <p>You can skip any question, and your answers are saved as you go.</p>
        </civ-section-intro>
      </div>
      <div>
        <p class="civ-text-sm civ-mb-2"><code>tone="neutral"</code></p>
        <civ-section-intro heading="Optional supporting documents" tone="neutral">
          <p>If you have any of the following documents available, you can upload them now.</p>
        </civ-section-intro>
      </div>
    </div>
  `,
};

export const FormStepSensitive: Story = {
  name: 'Form Step — sensitive vs default',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default — no pause affordance, no announcement</p>
        <civ-form-step>
          <div data-step-label="Service dates">
            <civ-memorable-date legend="When did you start active duty?" name="startDate"></civ-memorable-date>
          </div>
        </civ-form-step>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">
          <code>sensitive</code> — adds a "Save and come back later" link below the controls
          and a polite SR announcement on step entry
        </p>
        <civ-form-step sensitive>
          <div data-step-label="About your trauma">
            <civ-section-intro heading="Service-connected trauma" tone="sensitive">
              <p>You can save and come back to this section later.</p>
            </civ-section-intro>
            <civ-yes-no legend="Have you experienced military sexual trauma?" name="mst" skip-label="Prefer not to answer"></civ-yes-no>
          </div>
        </civ-form-step>
      </div>
    </div>
  `,
};

export const SkipAffordance: Story = {
  name: 'Skip Affordance (Yes/No + Radio Group)',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <p class="civ-font-semibold civ-mb-2"><code>&lt;civ-yes-no&gt;</code> with <code>skip-label</code></p>
        <civ-yes-no legend="Have you experienced military sexual trauma?" name="mst" skip-label="Prefer not to answer" skip-value="skip"></civ-yes-no>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2"><code>&lt;civ-radio-group&gt;</code> with <code>skip-label</code></p>
        <civ-radio-group legend="What is your race?" name="race" skip-label="Prefer not to answer">
          <civ-radio label="American Indian or Alaska Native" value="aian"></civ-radio>
          <civ-radio label="Asian" value="asian"></civ-radio>
          <civ-radio label="Black or African American" value="black"></civ-radio>
          <civ-radio label="Native Hawaiian or Pacific Islander" value="nhpi"></civ-radio>
          <civ-radio label="White" value="white"></civ-radio>
        </civ-radio-group>
      </div>
    </div>
  `,
};

export const DeceasedAssumed: Story = {
  name: 'Deceased Assumed vs Show Deceased',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div class="civ-border civ-border-s-4 civ-border-success civ-bg-success-lighter civ-p-4 civ-rounded">
        <p class="civ-font-semibold civ-mb-1 civ-text-success-darkest">✓ Good — deceased-assumed</p>
        <p class="civ-text-sm civ-mb-4">
          The form is a survivor benefit claim, so the context already
          establishes that the Veteran died. Skip "Is this person deceased?"
          and ask for the date directly.
        </p>
        <civ-relationship
          legend="About the Veteran who died"
          name="good"
          preset="survivor"
          deceased-assumed
          .showName=${false}
          value='{"relationship":"spouse","marriageDate":"2015-06-12"}'
        ></civ-relationship>
      </div>
      <div class="civ-border civ-border-s-4 civ-border-error civ-bg-error-lighter civ-p-4 civ-rounded">
        <p class="civ-font-semibold civ-mb-1 civ-text-error-dark">✗ Avoid — show-deceased</p>
        <p class="civ-text-sm civ-mb-4">
          Making a grieving family member confirm "Yes, this person is
          deceased" before they can enter the date is insensitive and
          repeats information the form already knows.
        </p>
        <civ-relationship
          legend="About the Veteran who died"
          name="avoid"
          preset="survivor"
          show-deceased
          .showName=${false}
          value='{"relationship":"spouse","marriageDate":"2015-06-12"}'
        ></civ-relationship>
      </div>
    </div>
  `,
};

export const SupportResources: Story = {
  render: () => html`
    <civ-form
      support-resources='[{"label":"Veterans Crisis Line","href":"tel:988","description":"Call or text 988, then press 1"},{"label":"Crisis Text Line","href":"sms:838255","description":"Text HOME to 838255"},{"label":"Safe Helpline","href":"tel:18779955247","description":"For survivors of sexual assault"}]'
    >
      <civ-text-input label="Your name" name="name" required></civ-text-input>
      <civ-textarea label="Tell us about your situation" name="details"></civ-textarea>
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
        <civ-relationship
          legend="Your relationship"
          preset="survivor"
          deceased-assumed
          .showName=${false}
          name="rel"
          required
        ></civ-relationship>
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
            preset="survivor"
            deceased-assumed
            required
          ></civ-relationship>
        </div>

        <div data-step-label="Your relationship">
          <civ-yes-no legend="Were you legally married at the time of their death?" required name="marriedAtDeath" skip-label="Prefer not to answer"></civ-yes-no>

          <civ-conditional when="marriedAtDeath" equals="yes">
            <civ-partnership-history
              legend="About your marriage"
              name="marriage"
              status-assumed="widowed"
            ></civ-partnership-history>
          </civ-conditional>
        </div>

        <div data-step-label="Review">
          <civ-summary></civ-summary>
        </div>
      </civ-form-step>

      <civ-button type="submit" label="Submit application" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};
