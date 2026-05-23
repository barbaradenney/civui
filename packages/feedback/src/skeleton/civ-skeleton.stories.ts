import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-skeleton.js';

const meta: Meta = {
  title: 'Feedback/Skeleton',
  component: 'civ-skeleton',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'heading', 'block', 'circle'] },
    width: { control: 'text' },
    lines: { control: 'number' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Decorative content-shape placeholder for waits longer than ~1s where the incoming content\'s shape is known. The parent region carries `aria-busy="true"` while skeletons are visible; the skeletons themselves are `aria-hidden` and never announced. Compose multiple primitives in the consumer\'s layout to mirror the real page — there is no page-orchestrator component.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/** Default — single text line at full width. */
export const Default: Story = {
  render: () => html`<civ-skeleton></civ-skeleton>`,
};

/** Each variant in isolation. */
export const Variants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4" style="width: 320px;">
      <civ-skeleton variant="heading" width="60%"></civ-skeleton>
      <civ-skeleton variant="text"></civ-skeleton>
      <civ-skeleton variant="block"></civ-skeleton>
      <civ-skeleton variant="circle"></civ-skeleton>
    </div>
  `,
};

/** Multi-line text placeholder — last line narrows to 70% to mimic ragged-right. */
export const MultilineText: Story = {
  render: () => html`
    <div style="width: 320px;">
      <civ-skeleton lines="4"></civ-skeleton>
    </div>
  `,
};

/** Composed card placeholder — heading + body lines + media block. */
export const ComposedCard: Story = {
  render: () => html`
    <div
      aria-busy="true"
      class="civ-flex civ-flex-col civ-gap-3 civ-p-4 civ-border civ-rounded"
      style="width: 320px;"
    >
      <civ-skeleton variant="block"></civ-skeleton>
      <civ-skeleton variant="heading" width="70%"></civ-skeleton>
      <civ-skeleton variant="text" lines="3"></civ-skeleton>
    </div>
  `,
};

/** Composed list-row placeholder — avatar + two lines of meta. */
export const ComposedListRow: Story = {
  render: () => html`
    <div aria-busy="true" class="civ-flex civ-flex-col civ-gap-3" style="width: 320px;">
      ${[1, 2, 3].map(
        () => html`
          <div class="civ-flex civ-gap-3 civ-items-center">
            <civ-skeleton variant="circle" width="3rem"></civ-skeleton>
            <div class="civ-flex civ-flex-col civ-gap-2 civ-flex-1">
              <civ-skeleton variant="text" width="50%"></civ-skeleton>
              <civ-skeleton variant="text" width="80%"></civ-skeleton>
            </div>
          </div>
        `,
      )}
    </div>
  `,
};
