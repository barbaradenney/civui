import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-conditional.js';
import '@civui/inputs';
import '@civui/inputs';
import '@civui/actions';
import '../form/civ-form.js';

const meta: Meta = {
  title: 'Forms/Form/Conditional',
  component: 'civ-conditional',
  tags: ['autodocs'],
  argTypes: {
    when: { control: 'text' },
    equals: { control: 'text' },
    'not-equals': { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div>
      <civ-select label="What is your employment status?" name="employment" options='[{"label":"Select one","value":""},{"label":"Employed","value":"employed"},{"label":"Self-employed","value":"self-employed"},{"label":"Unemployed","value":"unemployed"}]'></civ-select>

      <civ-conditional when="employment" equals="employed">
        <civ-text-input label="Employer name" name="employer" hint="Enter the name of your current employer"></civ-text-input>
      </civ-conditional>

      <civ-conditional when="employment" equals="self-employed">
        <civ-text-input label="Business name" name="business" hint="Enter the name of your business"></civ-text-input>
      </civ-conditional>
    </div>
  `,
};

export const NotEquals: Story = {
  render: () => html`
    <div>
      <civ-select label="Do you need assistance?" name="assistance" options='[{"label":"Select one","value":""},{"label":"Yes","value":"yes"},{"label":"No","value":"no"}]'></civ-select>

      <civ-conditional when="assistance" not-equals="no">
        <civ-text-input label="Describe the assistance you need" name="assistance-details"></civ-text-input>
      </civ-conditional>
    </div>
  `,
};

export const MultipleConditions: Story = {
  render: () => html`
    <div>
      <civ-yes-no legend="Are you a veteran?" name="veteran"></civ-yes-no>

      <civ-conditional when="veteran" equals="yes">
        <civ-text-input label="Branch of service" name="branch" hint="For example: Army, Navy, Air Force"></civ-text-input>

        <civ-select label="Discharge type" name="discharge" options='[{"label":"Select one","value":""},{"label":"Honorable","value":"honorable"},{"label":"General","value":"general"},{"label":"Other","value":"other"}]'></civ-select>

        <civ-conditional when="discharge" equals="other">
          <civ-text-input label="Please describe your discharge type" name="discharge-other"></civ-text-input>
        </civ-conditional>
      </civ-conditional>
    </div>
  `,
};

export const WithForm: Story = {
  render: () => html`
    <civ-form form-label="Veteran benefits application">
      <civ-text-input label="Full name" name="fullName" required></civ-text-input>
      <civ-text-input label="Email address" name="email" required type="email"></civ-text-input>

      <civ-yes-no legend="Are you a veteran?" name="isVeteran" required></civ-yes-no>

      <civ-conditional when="isVeteran" equals="yes">
        <civ-text-input label="Branch of service" name="branch" hint="For example: Army, Navy, Air Force, Marine Corps, Coast Guard" required></civ-text-input>

        <civ-text-input label="Years of service" name="yearsOfService" hint="For example: 4" width="sm"></civ-text-input>

        <civ-yes-no legend="Do you have a service-connected disability?" name="hasDisability"></civ-yes-no>

        <civ-conditional when="hasDisability" equals="yes">
          <civ-select label="Disability rating" name="disabilityRating" required options='[{"label":"Select one","value":""},{"label":"10%","value":"10"},{"label":"20%","value":"20"},{"label":"30%","value":"30"},{"label":"40%","value":"40"},{"label":"50%","value":"50"},{"label":"60%","value":"60"},{"label":"70%","value":"70"},{"label":"80%","value":"80"},{"label":"90%","value":"90"},{"label":"100%","value":"100"}]'></civ-select>
          <civ-textarea label="Describe your service-connected condition" name="disabilityDescription" hint="Provide a brief description of your condition"></civ-textarea>
        </civ-conditional>
      </civ-conditional>

      <civ-conditional when="isVeteran" equals="no">
        <civ-yes-no legend="Are you a dependent of a veteran?" name="isDependent"></civ-yes-no>

        <civ-conditional when="isDependent" equals="yes">
          <civ-text-input label="Veteran's full name" name="veteranName" required></civ-text-input>
          <civ-select label="Your relationship to the veteran" name="relationship" required options='[{"label":"Select one","value":""},{"label":"Spouse","value":"spouse"},{"label":"Child","value":"child"},{"label":"Parent","value":"parent"}]'></civ-select>
        </civ-conditional>
      </civ-conditional>

      <civ-button type="submit" class="civ-mt-4">Submit application</civ-button>
    </civ-form>
  `,
};

export const CheckboxConditional: Story = {
  name: 'Checkbox conditional',
  parameters: {
    docs: {
      description: {
        story: 'Show content when a single checkbox is checked. Use `equals="true"` to match the checked state.',
      },
    },
  },
  render: () => html`
    <civ-checkbox name="agree" label="I have a mailing address outside the United States"></civ-checkbox>
    <civ-conditional when="agree" equals="true">
      <civ-select label="Country" name="country" required preset="countries"></civ-select>
    </civ-conditional>
  `,
};

export const CheckboxGroupConditional: Story = {
  name: 'Checkbox group conditional',
  parameters: {
    docs: {
      description: {
        story: 'Show content when a specific option in a checkbox group is selected. The conditional matches against the `values` array from the group event.',
      },
    },
  },
  render: () => html`
    <civ-checkbox-group legend="Which benefits are you applying for?" hint="Select all that apply" name="benefits">
      <civ-checkbox label="Healthcare" value="health"></civ-checkbox>
      <civ-checkbox label="Dental" value="dental"></civ-checkbox>
      <civ-checkbox label="Vision" value="vision"></civ-checkbox>
      <civ-checkbox label="Prescription drugs" value="rx"></civ-checkbox>
    </civ-checkbox-group>
    <civ-conditional when="benefits" equals="rx">
      <civ-text-input label="Preferred pharmacy" name="pharmacy" required></civ-text-input>
    </civ-conditional>
  `,
};

export const RadioConditional: Story = {
  name: 'Radio conditional',
  parameters: {
    docs: {
      description: {
        story: 'Show content based on a radio group selection. Works the same as select — matches the `value` string.',
      },
    },
  },
  render: () => html`
    <civ-radio-group legend="How would you like to be contacted?" name="contactMethod">
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="Mail" value="mail"></civ-radio>
    </civ-radio-group>
    <civ-conditional when="contactMethod" equals="phone">
      <civ-text-input label="Phone number" name="phone" required type="tel" mask="phone-us"></civ-text-input>
    </civ-conditional>
    <civ-conditional when="contactMethod" equals="mail">
      <civ-text-input label="Mailing address" name="mailAddress" required></civ-text-input>
    </civ-conditional>
  `,
};

export const ToggleConditional: Story = {
  name: 'Toggle conditional',
  parameters: {
    docs: {
      description: {
        story: 'Show content when a toggle is switched on. Uses the same `equals="true"` pattern as checkboxes.',
      },
    },
  },
  render: () => html`
    <civ-toggle name="notifications" label="Enable email notifications"></civ-toggle>
    <civ-conditional when="notifications" equals="true">
      <civ-text-input label="Notification email" name="notifEmail" hint="We will send updates to this address" required type="email"></civ-text-input>
    </civ-conditional>
  `,
};
