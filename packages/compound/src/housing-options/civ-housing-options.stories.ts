import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-housing-options.js';
import '@civui/core';
import '@civui/form-patterns';
import '@civui/actions/action-link';

const meta: Meta = {
  title: 'Forms/Compound/Housing Options',
  component: 'civ-housing-options',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Compound component for collecting mailing addresses from people who may not have
permanent housing. Provides a checkbox to indicate no permanent address, then offers
mail delivery options: USPS General Delivery, an alternate address, or alternative
contact methods.

**Language principles:** Never use "homeless" in labels. Use "permanent address" or
"living situation." Explain why we ask. Provide alternatives.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-housing-options
      size="lg"
      legend="Your mailing address"
      name="housing"
      required
    ></civ-housing-options>
  `,
};

export const WithSupportResources: Story = {
  name: 'With support resources',
  parameters: {
    docs: {
      description: {
        story: 'Pair with civ-support-resources for crisis/housing assistance links below the form.',
      },
    },
  },
  render: () => html`
    <civ-housing-options
      size="lg"
      legend="Your mailing address"
      name="housing"
      required
    ></civ-housing-options>

    <civ-support-resources heading="Housing assistance" class="civ-mt-6">
      <civ-action-link type="phone" number="18774243838" label="National Call Center for Homeless Veterans"></civ-action-link>
      <civ-action-link type="phone" number="988" label="Veterans Crisis Line (call or text 988, press 1)"></civ-action-link>
      <p class="civ-mt-1 civ-text-sm">Available 24/7. Counselors can connect you with local housing resources.</p>
    </civ-support-resources>
  `,
};

export const CustomOptions: Story = {
  name: 'Custom mail options',
  parameters: {
    docs: {
      description: {
        story: 'Override the default mail delivery options with custom ones via the `mail-options` prop. Each option specifies what to render when selected: `address` (shows civ-address), `contact` (city/state/contact fields), or `none` (consumer handles).',
      },
    },
  },
  render: () => html`
    <civ-housing-options
      size="lg"
      legend="Your mailing address"
      name="housing"
      required
      mail-options='[
        {"value":"po-box","label":"PO Box","description":"I have a PO Box at a post office","renders":"address","addressLegend":"PO Box address"},
        {"value":"shelter","label":"Shelter or transitional housing","description":"I receive mail at a shelter","renders":"address","addressLegend":"Shelter address"},
        {"value":"alternate","label":"Someone else can receive mail for me","description":"A friend, family, or organization","renders":"address"},
        {"value":"no-mail","label":"I cannot receive mail at this time","renders":"contact"}
      ]'
    ></civ-housing-options>
  `,
};

export const CustomLabels: Story = {
  name: 'Custom labels and intro',
  parameters: {
    docs: {
      description: {
        story: 'Override the intro heading, intro text, checkbox label, and options legend via props.',
      },
    },
  },
  render: () => html`
    <civ-housing-options
      size="lg"
      legend="Where should we send documents?"
      name="housing"
      required
      intro-heading="We need a way to reach you"
      intro-text="Your application requires us to mail you a verification letter. Please provide an address or let us know how to contact you."
      checkbox-label="I do not have a mailing address"
      options-legend="What works best for you?"
    ></civ-housing-options>
  `,
};

export const CustomCallout: Story = {
  name: 'Custom callout slot',
  parameters: {
    docs: {
      description: {
        story: 'Replace the default General Delivery callout with custom content via the `data-housing-callout` slot.',
      },
    },
  },
  render: () => html`
    <civ-housing-options
      size="lg"
      legend="Your mailing address"
      name="housing"
      required
    >
      <div data-housing-callout class="civ-callout civ-callout--success">
        <p class="civ-font-bold civ-mb-1">Local VA office can help</p>
        <p class="civ-m-0">Visit your nearest VA office to set up mail delivery assistance. They can provide a mailing address for your benefits correspondence.</p>
      </div>
    </civ-housing-options>
  `,
};
