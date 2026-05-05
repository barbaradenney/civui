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

export const WithoutGeneralDelivery: Story = {
  name: 'Without General Delivery',
  parameters: {
    docs: {
      description: {
        story: 'Set `show-general-delivery="false"` to hide the USPS General Delivery option if not applicable.',
      },
    },
  },
  render: () => html`
    <civ-housing-options
      size="lg"
      legend="Your mailing address"
      name="housing"
      required
      show-general-delivery="false"
    ></civ-housing-options>
  `,
};
