import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import progressStepsTemplate from '../../../drupal/civui/components/progress-steps/progress-steps.twig';
// @ts-ignore
import progressBarTemplate from '../../../drupal/civui/components/progress-bar/progress-bar.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Progress Steps/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Progress Steps',
  render: () => render(progressStepsTemplate, {
    current: 1,
  }),
};

export const ProgressBar: Story = {
  name: 'Progress Bar',
  render: () => render(progressBarTemplate, {
    value: 40,
    label: 'Progress',
    status: '2 of 5',
  }),
};
