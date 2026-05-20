import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/section-intro/section-intro.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Section Intro/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    heading: 'Personal information',
    heading_level: 3,
    default: '<p>We need some basic information to process your application.</p>',
  }),
};

export const WithMultipleParagraphs: Story = {
  render: () => render({
    heading: 'Military service',
    heading_level: 3,
    default: '<p>Tell us about your military service history.</p><p>If you served in multiple branches, enter the most recent first.</p>',
  }),
};

export const HeadingLevelTwo: Story = {
  name: 'Heading Level 2',
  render: () => render({
    heading: 'Application for benefits',
    heading_level: 2,
    default: '<p>Complete each section below to apply for VA benefits.</p>',
  }),
};
