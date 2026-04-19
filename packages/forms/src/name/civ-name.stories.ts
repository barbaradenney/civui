import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-name.js';
import '../date-input/civ-memorable-date.js';

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

export const WithDateOfBirth: Story = {
  name: 'Paired with Date of Birth',
  render: () => html`
    <civ-name legend="Veteran's name" name="veteranName" required></civ-name>
    <civ-memorable-date
      legend="Date of birth"
      name="dateOfBirth"
      required
      hint="For example: January 15 1990"
    ></civ-memorable-date>
  `,
};

export const SpouseName: Story = {
  name: 'Spouse Name (no suffix)',
  render: () => html`
    <civ-name legend="Spouse's name" name="spouseName" required></civ-name>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.showSuffix = false;
  },
};
