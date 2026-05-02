import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/action-sheet/action-sheet.twig';
// @ts-ignore
import buttonTemplate from '../../../drupal/civui/components/button/button.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Overlays/Action Sheet/Drupal SDC',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const actions = [
      buttonTemplate({ label: 'Edit', variant: 'secondary' }),
      buttonTemplate({ label: 'Delete', variant: 'secondary', danger: true }),
      buttonTemplate({ label: 'Cancel', variant: 'tertiary' }),
    ].join('');
    return render({ open: true, default: actions });
  },
};
