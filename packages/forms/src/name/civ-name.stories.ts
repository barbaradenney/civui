import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-name.js';

const meta: Meta = {
  title: 'Forms/Name',
  component: 'civ-name',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showMiddle: { control: 'boolean' },
    showSuffix: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { legend: 'Your name', name: 'veteranName' },
  render: (args) => html`<civ-name legend="${args.legend}" name="${args.name}" ?required="${args.required}" ?disabled="${args.disabled}"></civ-name>`,
};

export const Required: Story = {
  render: () => html`<civ-name legend="Veteran's name" name="vet" required></civ-name>`,
};

export const WithErrors: Story = {
  render: () => html`<civ-name legend="Your name" first-error="Enter a first name" last-error="Enter a last name"></civ-name>`,
};

export const WithoutMiddle: Story = {
  render: () => html`<civ-name legend="Your name" name="n"></civ-name>`,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.showMiddle = false;
  },
};

export const WithoutSuffix: Story = {
  render: () => html`<civ-name legend="Your name" name="n"></civ-name>`,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.showSuffix = false;
  },
};

export const Disabled: Story = {
  render: () => html`<civ-name legend="Your name" disabled></civ-name>`,
};

export const Prefilled: Story = {
  render: () => html`<civ-name legend="Your name" name="n"></civ-name>`,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.nameValue = { first: 'Jane', middle: 'A', last: 'Doe', suffix: 'Jr.' };
  },
};
