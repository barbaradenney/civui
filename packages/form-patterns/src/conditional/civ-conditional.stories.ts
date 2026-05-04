import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-conditional.js';
import '@civui/inputs';
import '@civui/controls';
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
      <civ-form-field label="What is your employment status?">
        <civ-select
          name="employment"
          options='[{"label":"Select one","value":""},{"label":"Employed","value":"employed"},{"label":"Self-employed","value":"self-employed"},{"label":"Unemployed","value":"unemployed"}]'
        ></civ-select>
      </civ-form-field>

      <civ-conditional when="employment" equals="employed">
        <civ-form-field label="Employer name" hint="Enter the name of your current employer">
          <civ-text-input name="employer"></civ-text-input>
        </civ-form-field>
      </civ-conditional>

      <civ-conditional when="employment" equals="self-employed">
        <civ-form-field label="Business name" hint="Enter the name of your business">
          <civ-text-input name="business"></civ-text-input>
        </civ-form-field>
      </civ-conditional>
    </div>
  `,
};

export const NotEquals: Story = {
  render: () => html`
    <div>
      <civ-form-field label="Do you need assistance?">
        <civ-select
          name="assistance"
          options='[{"label":"Select one","value":""},{"label":"Yes","value":"yes"},{"label":"No","value":"no"}]'
        ></civ-select>
      </civ-form-field>

      <civ-conditional when="assistance" not-equals="no">
        <civ-form-field label="Describe the assistance you need">
          <civ-text-input name="assistance-details"></civ-text-input>
        </civ-form-field>
      </civ-conditional>
    </div>
  `,
};

export const MultipleConditions: Story = {
  render: () => html`
    <div>
      <civ-form-fieldset legend="Are you a veteran?">
        <civ-yes-no name="veteran"></civ-yes-no>
      </civ-form-fieldset>

      <civ-conditional when="veteran" equals="yes">
        <civ-form-field label="Branch of service" hint="For example: Army, Navy, Air Force">
          <civ-text-input name="branch"></civ-text-input>
        </civ-form-field>

        <civ-form-field label="Discharge type">
          <civ-select
            name="discharge"
            options='[{"label":"Select one","value":""},{"label":"Honorable","value":"honorable"},{"label":"General","value":"general"},{"label":"Other","value":"other"}]'
          ></civ-select>
        </civ-form-field>

        <civ-conditional when="discharge" equals="other">
          <civ-form-field label="Please describe your discharge type">
            <civ-text-input name="discharge-other"></civ-text-input>
          </civ-form-field>
        </civ-conditional>
      </civ-conditional>
    </div>
  `,
};

export const WithForm: Story = {
  render: () => html`
    <civ-form form-label="Veteran benefits application">
      <civ-form-field label="Full name" required>
        <civ-text-input name="fullName" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required>
        <civ-text-input name="email" type="email" required></civ-text-input>
      </civ-form-field>

      <civ-form-fieldset legend="Are you a veteran?">
        <civ-yes-no name="isVeteran"></civ-yes-no>
      </civ-form-fieldset>

      <civ-conditional when="isVeteran" equals="yes">
        <civ-form-field label="Branch of service" required hint="For example: Army, Navy, Air Force, Marine Corps, Coast Guard">
          <civ-text-input name="branch" required></civ-text-input>
        </civ-form-field>

        <civ-form-field label="Years of service" hint="For example: 4">
          <civ-text-input name="yearsOfService" width="sm"></civ-text-input>
        </civ-form-field>

        <civ-form-fieldset legend="Do you have a service-connected disability?">
          <civ-yes-no name="hasDisability"></civ-yes-no>
        </civ-form-fieldset>

        <civ-conditional when="hasDisability" equals="yes">
          <civ-form-field label="Disability rating" required>
            <civ-select
              name="disabilityRating"
              required
              options='[{"label":"Select one","value":""},{"label":"10%","value":"10"},{"label":"20%","value":"20"},{"label":"30%","value":"30"},{"label":"40%","value":"40"},{"label":"50%","value":"50"},{"label":"60%","value":"60"},{"label":"70%","value":"70"},{"label":"80%","value":"80"},{"label":"90%","value":"90"},{"label":"100%","value":"100"}]'
            ></civ-select>
          </civ-form-field>
          <civ-form-field label="Describe your service-connected condition" hint="Provide a brief description of your condition">
            <civ-textarea name="disabilityDescription"></civ-textarea>
          </civ-form-field>
        </civ-conditional>
      </civ-conditional>

      <civ-conditional when="isVeteran" equals="no">
        <civ-form-fieldset legend="Are you a dependent of a veteran?">
          <civ-yes-no name="isDependent"></civ-yes-no>
        </civ-form-fieldset>

        <civ-conditional when="isDependent" equals="yes">
          <civ-form-field label="Veteran's full name" required>
            <civ-text-input name="veteranName" required></civ-text-input>
          </civ-form-field>
          <civ-form-field label="Your relationship to the veteran" required>
            <civ-select
              name="relationship"
              required
              options='[{"label":"Select one","value":""},{"label":"Spouse","value":"spouse"},{"label":"Child","value":"child"},{"label":"Parent","value":"parent"}]'
            ></civ-select>
          </civ-form-field>
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
      <civ-form-field label="Country" required>
        <civ-select name="country" preset="countries"></civ-select>
      </civ-form-field>
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
    <civ-form-fieldset legend="Which benefits are you applying for?" hint="Select all that apply">
      <civ-checkbox-group name="benefits">
        <civ-checkbox label="Healthcare" value="health"></civ-checkbox>
        <civ-checkbox label="Dental" value="dental"></civ-checkbox>
        <civ-checkbox label="Vision" value="vision"></civ-checkbox>
        <civ-checkbox label="Prescription drugs" value="rx"></civ-checkbox>
      </civ-checkbox-group>
    </civ-form-fieldset>
    <civ-conditional when="benefits" equals="rx">
      <civ-form-field label="Preferred pharmacy" required>
        <civ-text-input name="pharmacy"></civ-text-input>
      </civ-form-field>
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
    <civ-form-fieldset legend="How would you like to be contacted?">
      <civ-radio-group name="contactMethod">
        <civ-radio label="Email" value="email"></civ-radio>
        <civ-radio label="Phone" value="phone"></civ-radio>
        <civ-radio label="Mail" value="mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
    <civ-conditional when="contactMethod" equals="phone">
      <civ-form-field label="Phone number" required>
        <civ-text-input name="phone" type="tel" mask="phone-us"></civ-text-input>
      </civ-form-field>
    </civ-conditional>
    <civ-conditional when="contactMethod" equals="mail">
      <civ-form-field label="Mailing address" required>
        <civ-text-input name="mailAddress"></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="Notification email" required hint="We will send updates to this address">
        <civ-text-input name="notifEmail" type="email"></civ-text-input>
      </civ-form-field>
    </civ-conditional>
  `,
};
