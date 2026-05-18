import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-breadcrumb.js';
import './civ-breadcrumb-item.js';

const meta: Meta = {
  title: 'Navigation/Breadcrumb',
  component: 'civ-breadcrumb',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-breadcrumb>
      <civ-breadcrumb-item href="/" label="Home"></civ-breadcrumb-item>
      <civ-breadcrumb-item href="/benefits" label="Benefits"></civ-breadcrumb-item>
      <civ-breadcrumb-item label="Healthcare" current></civ-breadcrumb-item>
    </civ-breadcrumb>
  `,
};

export const TwoLevels: Story = {
  render: () => html`
    <civ-breadcrumb>
      <civ-breadcrumb-item href="/" label="Home"></civ-breadcrumb-item>
      <civ-breadcrumb-item label="Benefits" current></civ-breadcrumb-item>
    </civ-breadcrumb>
  `,
};

export const FourLevels: Story = {
  render: () => html`
    <civ-breadcrumb>
      <civ-breadcrumb-item href="/" label="Home"></civ-breadcrumb-item>
      <civ-breadcrumb-item href="/benefits" label="Benefits"></civ-breadcrumb-item>
      <civ-breadcrumb-item href="/benefits/healthcare" label="Healthcare"></civ-breadcrumb-item>
      <civ-breadcrumb-item label="Apply" current></civ-breadcrumb-item>
    </civ-breadcrumb>
  `,
};

export const CustomLandmarkName: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      Use the <code>label</code> prop to name the landmark when a page has more than one breadcrumb trail.
    </p>
    <civ-breadcrumb label="Section path">
      <civ-breadcrumb-item href="/forms" label="Forms"></civ-breadcrumb-item>
      <civ-breadcrumb-item label="VA Form 10-10EZ" current></civ-breadcrumb-item>
    </civ-breadcrumb>
  `,
};
