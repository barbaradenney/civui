import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-skeleton.js';

const meta: Meta = {
  title: 'Feedback/Skeleton',
  component: 'civ-skeleton',
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: ['text', 'heading', 'block', 'circle'] },
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

// Every story wraps the skeleton(s) in `aria-busy="true"` because
// that's the contract — the parent region carries the busy state.
// Consumers who forget the wrapper get a dev-warn at runtime.

/** Default — single text line at full width. */
export const Default: Story = {
  render: () => html`
    <div aria-busy="true" style="width: 320px;">
      <civ-skeleton></civ-skeleton>
    </div>
  `,
};

/** Each variant in isolation. */
export const Variants: Story = {
  render: () => html`
    <div aria-busy="true" class="civ-flex civ-flex-col civ-gap-4" style="width: 320px;">
      <civ-skeleton shape="heading" width="60%"></civ-skeleton>
      <civ-skeleton shape="text"></civ-skeleton>
      <civ-skeleton shape="block"></civ-skeleton>
      <civ-skeleton shape="circle"></civ-skeleton>
    </div>
  `,
};

/** Multi-line text placeholder — last line narrows to 70% to mimic ragged-right. */
export const MultilineText: Story = {
  render: () => html`
    <div aria-busy="true" style="width: 320px;">
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
      <civ-skeleton shape="block"></civ-skeleton>
      <civ-skeleton shape="heading" width="70%"></civ-skeleton>
      <civ-skeleton shape="text" lines="3"></civ-skeleton>
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
            <civ-skeleton shape="circle" width="3rem"></civ-skeleton>
            <div class="civ-flex civ-flex-col civ-gap-2 civ-flex-1">
              <civ-skeleton shape="text" width="50%"></civ-skeleton>
              <civ-skeleton shape="text" width="80%"></civ-skeleton>
            </div>
          </div>
        `,
      )}
    </div>
  `,
};
