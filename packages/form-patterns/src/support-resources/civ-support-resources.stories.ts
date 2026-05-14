import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-support-resources.js';
import '@civui/actions/link';

const meta: Meta = {
  title: 'Forms/Form/Support Resources',
  component: 'civ-support-resources',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A structured container for support and crisis contact information. Renders as an `<aside>` landmark with a heading and slotted action links. Use at the bottom of sensitive forms.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-support-resources heading="If you need support">
      <civ-link type="phone" number="988" label="Veterans Crisis Line (call or text 988, press 1)"></civ-link>
      <civ-link type="phone" number="18774243838" label="National Homeless Veterans Hotline"></civ-link>
    </civ-support-resources>
  `,
};

export const CrisisTone: Story = {
  name: 'Crisis tone',
  parameters: {
    docs: {
      description: {
        story: 'Use `tone="crisis"` for urgent situations — renders with an error-colored left border to draw immediate attention.',
      },
    },
  },
  render: () => html`
    <civ-support-resources heading="Need immediate help?" tone="crisis">
      <civ-link type="phone" number="911" label="Emergency services: 911"></civ-link>
      <civ-link type="phone" number="988" label="Suicide & Crisis Lifeline: 988"></civ-link>
    </civ-support-resources>
  `,
};

export const MultipleContactTypes: Story = {
  name: 'Multiple contact types',
  render: () => html`
    <civ-support-resources heading="Contact us">
      <civ-link type="phone" number="18008271000" label="VA Benefits Helpline"></civ-link>
      <civ-link type="phone" number="18554886368" label="Health Benefits Hotline"></civ-link>
      <civ-link type="email" address="benefits@va.gov" label="Email VA benefits support"></civ-link>
    </civ-support-resources>
  `,
};

export const WithCustomContent: Story = {
  name: 'With custom content',
  parameters: {
    docs: {
      description: {
        story: 'The slot accepts any content — not just action links. Use paragraphs, lists, or custom HTML.',
      },
    },
  },
  render: () => html`
    <civ-support-resources heading="Housing assistance">
      <p>If you are experiencing homelessness or at risk of losing your housing:</p>
      <civ-link type="phone" number="18774243838" label="National Call Center for Homeless Veterans"></civ-link>
      <p class="civ-mt-2 civ-text-sm">Available 24/7. Counselors can connect you with local housing resources, shelters, and VA programs.</p>
    </civ-support-resources>
  `,
};
