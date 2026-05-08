import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-partnership-history.js';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Forms/Compound/Partnership History',
  component: 'civ-partnership-history',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="marriage"
    ></civ-partnership-history>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="marriage"
      required
    ></civ-partnership-history>
  `,
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="marriage"
      required
      spouse-error="Enter your spouse's name"
      marriage-date-error="Enter the date of marriage"
      status-error="Select the marriage status"
    ></civ-partnership-history>
  `,
};

export const Inclusive: Story = {
  name: 'Inclusive (any partnership type)',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      show-marriage-type
    ></civ-partnership-history>
  `,
};

export const TypeMarriage: Story = {
  name: 'Type: Legal marriage',
  render: () => html`
    <civ-partnership-history
      legend="About this marriage"
      size="lg"
      name="partnership"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: '', spouseMiddle: '', spouseLast: '', spouseSuffix: '',
        marriageType: 'legal',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const TypeCivilUnion: Story = {
  name: 'Type: Civil union / domestic partnership',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: '', spouseMiddle: '', spouseLast: '', spouseSuffix: '',
        marriageType: 'civil-union',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const TypeCohabitation: Story = {
  name: 'Type: Cohabitation / common-law',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: '', spouseMiddle: '', spouseLast: '', spouseSuffix: '',
        marriageType: 'common-law',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const TypeOther: Story = {
  name: 'Type: Other long-term partnership',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: '', spouseMiddle: '', spouseLast: '', spouseSuffix: '',
        marriageType: 'other',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const StatusEnded: Story = {
  name: 'Status: Ended (shows end-date field)',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: 'Alex', spouseMiddle: '', spouseLast: 'Rivera', spouseSuffix: '',
        marriageType: 'common-law',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '2010-06-01', cohabitationState: 'CA',
        marriageTypeDescription: '',
        status: 'ended', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const StatusAssumed: Story = {
  name: 'Status assumed (current spouse context)',
  render: () => html`
    <civ-partnership-history
      legend="About your current spouse"
      size="lg"
      name="partnership"
      status-assumed="current"
    ></civ-partnership-history>
  `,
};

export const StepWho: Story = {
  name: 'Step: Who',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      step="who"
      show-marriage-type
    ></civ-partnership-history>
  `,
};

export const StepDetails: Story = {
  name: 'Step: Details',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      step="details"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: 'Alex', spouseMiddle: '', spouseLast: 'Rivera', spouseSuffix: '',
        marriageType: 'legal',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const StepStatus: Story = {
  name: 'Step: Status',
  render: () => html`
    <civ-partnership-history
      size="lg"
      name="partnership"
      step="status"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: 'Alex', spouseMiddle: '', spouseLast: 'Rivera', spouseSuffix: '',
        marriageType: 'legal',
        marriageDate: '2015-06-12', marriageCity: 'Chicago', marriageState: 'IL',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const MultiStepFlow: Story = {
  name: 'Multi-step flow (3 pages)',
  render: () => html`
    <p class="civ-mb-4">Same component on three separate pages, each showing one section.</p>

    <h3 class="civ-text-lg civ-font-bold civ-mt-6 civ-mb-2">Page 1 of 3</h3>
    <civ-partnership-history
      size="lg"
      name="partnership"
      step="who"
      show-marriage-type
    ></civ-partnership-history>

    <h3 class="civ-text-lg civ-font-bold civ-mt-8 civ-mb-2">Page 2 of 3</h3>
    <civ-partnership-history
      size="lg"
      name="partnership"
      step="details"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: 'Alex', spouseMiddle: '', spouseLast: 'Rivera', spouseSuffix: '',
        marriageType: 'legal',
        marriageDate: '', marriageCity: '', marriageState: '',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>

    <h3 class="civ-text-lg civ-font-bold civ-mt-8 civ-mb-2">Page 3 of 3</h3>
    <civ-partnership-history
      size="lg"
      name="partnership"
      step="status"
      show-marriage-type
      .marriageValue=${{
        spouseFirst: 'Alex', spouseMiddle: '', spouseLast: 'Rivera', spouseSuffix: '',
        marriageType: 'legal',
        marriageDate: '2015-06-12', marriageCity: 'Chicago', marriageState: 'IL',
        jurisdiction: '', cohabitationStartDate: '', cohabitationState: '',
        marriageTypeDescription: '',
        status: '', endDate: '',
      }}
    ></civ-partnership-history>
  `,
};

export const InRepeater: Story = {
  name: 'Usage: In Repeater',
  render: () => html`
    <civ-repeater
      legend="Partnership history"
      size="lg"
      name="partnerships"
      item-label="partnership"
      min="0"
      max="10"
    >
      <civ-partnership-history name="entry" show-marriage-type></civ-partnership-history>
    </civ-repeater>
  `,
};
