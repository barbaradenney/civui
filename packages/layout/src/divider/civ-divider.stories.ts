import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-divider.js';

const meta: Meta = {
  title: 'Layout/Divider',
  component: 'civ-divider',
  tags: ['autodocs'],
  argTypes: {
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
    variant: {
      control: 'select',
      options: ['default', 'primary'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <p>Content above the divider</p>
    <civ-divider></civ-divider>
    <p>Content below the divider</p>
  `,
};

export const Small: Story = {
  name: 'Small Spacing',
  render: () => html`
    <p>Tighter spacing</p>
    <civ-divider spacing="sm"></civ-divider>
    <p>Between items</p>
  `,
};

export const Primary: Story = {
  render: () => html`
    <p>Content above</p>
    <civ-divider variant="primary"></civ-divider>
    <p>Content below</p>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <p>Content above</p>
        <civ-divider></civ-divider>
        <p>Content below</p>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Primary</p>
        <p>Content above</p>
        <civ-divider variant="primary"></civ-divider>
        <p>Content below</p>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Small spacing</p>
        <p>Content above</p>
        <civ-divider spacing="sm"></civ-divider>
        <p>Content below</p>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Primary + Small spacing</p>
        <p>Content above</p>
        <civ-divider variant="primary" spacing="sm"></civ-divider>
        <p>Content below</p>
      </div>
    </div>
  `,
};

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <p>Section one content</p>
        <civ-divider></civ-divider>
        <p>Section two content</p>
        <civ-divider></civ-divider>
        <p>Section three content</p>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <p>Section one content</p>
        <civ-divider></civ-divider>
        <p>Section two content</p>
        <civ-divider></civ-divider>
        <p>Section three content</p>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <p>Section one content</p>
        <civ-divider></civ-divider>
        <p>Section two content</p>
        <civ-divider></civ-divider>
        <p>Section three content</p>
      </div>
    </div>
  `,
};

export const BenefitsSummary: Story = {
  render: () => html`
    <div class="civ-max-w-lg">
      <h3>Disability compensation</h3>
      <p>Monthly amount: $1,234.56</p>
      <p>Combined rating: 70%</p>
      <civ-divider></civ-divider>
      <h3>Education benefits</h3>
      <p>Post-9/11 GI Bill</p>
      <p>Remaining entitlement: 24 months</p>
      <civ-divider></civ-divider>
      <h3>Health care</h3>
      <p>Enrolled: Priority Group 1</p>
      <p>Next appointment: January 15, 2026</p>
    </div>
  `,
};

export const FormSections: Story = {
  render: () => html`
    <div class="civ-max-w-lg">
      <h3>Personal information</h3>
      <p>Name: John Doe</p>
      <p>Date of birth: January 1, 1985</p>
      <civ-divider spacing="sm"></civ-divider>
      <h3>Contact information</h3>
      <p>Email: john.doe@example.com</p>
      <p>Phone: (555) 123-4567</p>
      <civ-divider spacing="sm"></civ-divider>
      <h3>Mailing address</h3>
      <p>123 Main Street</p>
      <p>Springfield, VA 22150</p>
    </div>
  `,
};
