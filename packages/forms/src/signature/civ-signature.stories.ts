import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-signature.js';

const meta: Meta = {
  title: 'Forms/Signature',
  component: 'civ-signature',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    statement: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { legend: 'Statement of truth', name: 'sig' },
  render: (args) => html`<civ-signature legend="${args.legend}" name="${args.name}" ?required="${args.required}" ?disabled="${args.disabled}"></civ-signature>`,
};

export const Required: Story = {
  render: () => html`<civ-signature legend="Statement of truth" name="sig" statement="I certify that the information I have provided is true and correct." required></civ-signature>`,
};

export const WithStatement: Story = {
  render: () => html`<civ-signature legend="Statement of truth" name="sig" statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief." required></civ-signature>`,
};

export const WithErrors: Story = {
  render: () => html`<civ-signature legend="Statement of truth" name-error="Enter your full name to sign" certify-error="You must certify before submitting" required></civ-signature>`,
};

export const Disabled: Story = {
  render: () => html`<civ-signature legend="Statement of truth" disabled></civ-signature>`,
};
