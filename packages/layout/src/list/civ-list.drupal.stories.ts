import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import listTemplate from '../../../drupal/civui/components/list/list.twig';
// @ts-ignore
import listItemTemplate from '../../../drupal/civui/components/list-item/list-item.twig';
// @ts-ignore
import badgeTemplate from '../../../drupal/civui/components/badge/badge.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Layout/List/Drupal SDC',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'List',
  render: () => {
    const items = [
      listItemTemplate({ heading: 'Claim #1234', description: 'Submitted January 15, 2026' }),
      listItemTemplate({ heading: 'Claim #5678', description: 'Submitted March 3, 2026' }),
      listItemTemplate({ heading: 'Claim #9012', description: 'Submitted April 20, 2026' }),
    ].join('');
    return render(listTemplate, { dividers: true, default: items });
  },
};

export const ListItem: Story = {
  name: 'List Item',
  render: () => {
    const badge = badgeTemplate({ label: 'Pending', variant: 'info' });
    return render(listItemTemplate, {
      heading: 'Claim #1234',
      description: 'Submitted January 15, 2026',
      end: badge,
    });
  },
};
