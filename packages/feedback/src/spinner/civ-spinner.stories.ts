import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-spinner.js';

const meta: Meta = {
  title: 'Feedback/Spinner',
  component: 'civ-spinner',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    delay: { control: 'number' },
    minDuration: { control: 'number', name: 'min-duration' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Indeterminate loading indicator for short waits (200ms–~1s) where the shape of incoming content is unknown. For longer waits with a known content shape, use `civ-skeleton`. Built-in `delay` and `min-duration` protect against the flash-then-disappear flicker on fast responses.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/** Default — md size, default "Loading…" label, 200ms delay. */
export const Default: Story = {
  render: () => html`<civ-spinner delay="0"></civ-spinner>`,
};

/** All three sizes side-by-side. */
export const Sizes: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-items-center">
      <civ-spinner delay="0" size="sm"></civ-spinner>
      <civ-spinner delay="0" size="md"></civ-spinner>
      <civ-spinner delay="0" size="lg"></civ-spinner>
    </div>
  `,
};

/** Inherits text color from the parent — works on any background. */
export const InheritsColor: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-items-center">
      <span class="civ-text-primary">
        <civ-spinner delay="0"></civ-spinner>
      </span>
      <span class="civ-text-error">
        <civ-spinner delay="0"></civ-spinner>
      </span>
      <span class="civ-text-success">
        <civ-spinner delay="0"></civ-spinner>
      </span>
    </div>
  `,
};

/** Use an action-specific present-participle verb so screen-reader users hear what's happening. */
export const CustomLabel: Story = {
  render: () => html`
    <civ-spinner delay="0" label="Saving your application…"></civ-spinner>
  `,
};

/**
 * Flash protection demo — the spinner waits 1 second before rendering.
 * If the surrounding work finished sooner, nothing would ever appear.
 */
export const DelayedAppearance: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">The spinner below has a 1-second delay before it paints.</p>
    <civ-spinner delay="1000"></civ-spinner>
  `,
};
