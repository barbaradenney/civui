import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-progress-steps.js';

const meta: Meta = {
  title: 'Forms/Progress Steps',
  component: 'civ-progress-steps',
  tags: ['autodocs'],
  argTypes: {
    steps: { control: 'text' },
    current: { control: 'number' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj;

const defaultSteps = '["Personal Info","Address","Review"]';

export const Default: Story = {
  args: {
    steps: defaultSteps,
    current: 0,
  },
  render: (args) => html`
    <civ-progress-steps
      steps="${args.steps}"
      current="${args.current}"
      orientation="${args.orientation ?? 'horizontal'}"
    ></civ-progress-steps>
  `,
};

export const MiddleStep: Story = {
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="1"
    ></civ-progress-steps>
  `,
};

export const LastStep: Story = {
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="2"
    ></civ-progress-steps>
  `,
};

export const Vertical: Story = {
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="1"
      orientation="vertical"
    ></civ-progress-steps>
  `,
};

export const ManySteps: Story = {
  render: () => html`
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Contact Details","Employment","Income","Documents","Review","Submit"]'
      current="3"
    ></civ-progress-steps>
  `,
};
