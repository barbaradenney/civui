import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-conditional.js';
import '../select/civ-select.js';
import '../text-input/civ-text-input.js';
import '../textarea/civ-textarea.js';
import '../yes-no/civ-yes-no.js';
import '../checkbox/civ-checkbox.js';
import '../form/civ-form.js';

const meta: Meta = {
  title: 'Forms/Conditional',
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
      <civ-select
        label="What is your employment status?"
        name="employment"
        options='[{"label":"Select one","value":""},{"label":"Employed","value":"employed"},{"label":"Self-employed","value":"self-employed"},{"label":"Unemployed","value":"unemployed"}]'
      ></civ-select>

      <civ-conditional when="employment" equals="employed">
        <civ-text-input
          label="Employer name"
          name="employer"
          hint="Enter the name of your current employer"
        ></civ-text-input>
      </civ-conditional>

      <civ-conditional when="employment" equals="self-employed">
        <civ-text-input
          label="Business name"
          name="business"
          hint="Enter the name of your business"
        ></civ-text-input>
      </civ-conditional>
    </div>
  `,
};

export const NotEquals: Story = {
  render: () => html`
    <div>
      <civ-select
        label="Do you need assistance?"
        name="assistance"
        options='[{"label":"Select one","value":""},{"label":"Yes","value":"yes"},{"label":"No","value":"no"}]'
      ></civ-select>

      <civ-conditional when="assistance" not-equals="no">
        <civ-text-input
          label="Describe the assistance you need"
          name="assistance-details"
        ></civ-text-input>
      </civ-conditional>
    </div>
  `,
};

export const MultipleConditions: Story = {
  render: () => html`
    <div>
      <civ-yes-no
        legend="Are you a veteran?"
        name="veteran"
      ></civ-yes-no>

      <civ-conditional when="veteran" equals="yes">
        <civ-text-input
          label="Branch of service"
          name="branch"
          hint="For example: Army, Navy, Air Force"
        ></civ-text-input>

        <civ-select
          label="Discharge type"
          name="discharge"
          options='[{"label":"Select one","value":""},{"label":"Honorable","value":"honorable"},{"label":"General","value":"general"},{"label":"Other","value":"other"}]'
        ></civ-select>

        <civ-conditional when="discharge" equals="other">
          <civ-text-input
            label="Please describe your discharge type"
            name="discharge-other"
          ></civ-text-input>
        </civ-conditional>
      </civ-conditional>
    </div>
  `,
};

export const WithForm: Story = {
  render: () => html`
    <civ-form form-label="Veteran benefits application">
      <civ-text-input label="Full name" name="fullName" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required></civ-text-input>

      <civ-yes-no
        legend="Are you a veteran?"
        name="isVeteran"
      ></civ-yes-no>

      <civ-conditional when="isVeteran" equals="yes">
        <civ-text-input
          label="Branch of service"
          name="branch"
          required
          hint="For example: Army, Navy, Air Force, Marine Corps, Coast Guard"
        ></civ-text-input>

        <civ-text-input
          label="Years of service"
          name="yearsOfService"
          hint="For example: 4"
          width="sm"
        ></civ-text-input>

        <civ-yes-no
          legend="Do you have a service-connected disability?"
          name="hasDisability"
        ></civ-yes-no>

        <civ-conditional when="hasDisability" equals="yes">
          <civ-select
            label="Disability rating"
            name="disabilityRating"
            required
            options='[{"label":"Select one","value":""},{"label":"10%","value":"10"},{"label":"20%","value":"20"},{"label":"30%","value":"30"},{"label":"40%","value":"40"},{"label":"50%","value":"50"},{"label":"60%","value":"60"},{"label":"70%","value":"70"},{"label":"80%","value":"80"},{"label":"90%","value":"90"},{"label":"100%","value":"100"}]'
          ></civ-select>
          <civ-textarea
            label="Describe your service-connected condition"
            name="disabilityDescription"
            hint="Provide a brief description of your condition"
          ></civ-textarea>
        </civ-conditional>
      </civ-conditional>

      <civ-conditional when="isVeteran" equals="no">
        <civ-yes-no
          legend="Are you a dependent of a veteran?"
          name="isDependent"
        ></civ-yes-no>

        <civ-conditional when="isDependent" equals="yes">
          <civ-text-input
            label="Veteran's full name"
            name="veteranName"
            required
          ></civ-text-input>
          <civ-select
            label="Your relationship to the veteran"
            name="relationship"
            required
            options='[{"label":"Select one","value":""},{"label":"Spouse","value":"spouse"},{"label":"Child","value":"child"},{"label":"Parent","value":"parent"}]'
          ></civ-select>
        </civ-conditional>
      </civ-conditional>

      <button
        type="submit"
        class="civ-inline-block civ-mt-4 civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit application
      </button>
    </civ-form>
  `,
};
