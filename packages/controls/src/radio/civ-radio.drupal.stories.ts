import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import radioTemplate from '../../../drupal/civui/components/radio/radio.twig';
// @ts-ignore
import radioGroupTemplate from '../../../drupal/civui/components/radio-group/radio-group.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Controls/Radio/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(radioTemplate, {
    label: 'Option A',
    name: 'choice',
    value: 'a',
  }),
};

export const RadioGroup: Story = {
  name: 'Radio Group',
  render: () => {
    const children = [
      radioTemplate({ label: 'Email', name: 'contact', value: 'email' }),
      radioTemplate({ label: 'Phone', name: 'contact', value: 'phone' }),
      radioTemplate({ label: 'Mail', name: 'contact', value: 'mail' }),
    ].join('');
    return render(radioGroupTemplate, { default: children });
  },
};
