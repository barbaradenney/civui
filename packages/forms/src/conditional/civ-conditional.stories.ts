import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-conditional.js';
import '../select/civ-select.js';
import '../text-input/civ-text-input.js';
import '../yes-no/civ-yes-no.js';

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
