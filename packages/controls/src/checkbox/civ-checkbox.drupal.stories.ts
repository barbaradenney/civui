import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import checkboxTemplate from '../../../drupal/civui/components/checkbox/checkbox.twig';
// @ts-ignore
import checkboxGroupTemplate from '../../../drupal/civui/components/checkbox-group/checkbox-group.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Controls/Checkbox/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(checkboxTemplate, {
    label: 'I agree to the terms and conditions',
    name: 'agree',
    required: true,
  }),
};

export const CheckboxGroup: Story = {
  name: 'Checkbox Group',
  render: () => {
    const children = [
      checkboxTemplate({ label: 'Healthcare', name: 'benefits', value: 'healthcare' }),
      checkboxTemplate({ label: 'Education', name: 'benefits', value: 'education' }),
      checkboxTemplate({ label: 'Housing', name: 'benefits', value: 'housing' }),
    ].join('');
    return render(checkboxGroupTemplate, { default: children });
  },
};
