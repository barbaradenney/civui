import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-back-to-top.js';

const meta: Meta = {
  title: 'Navigation/Back To Top',
  component: 'civ-back-to-top',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const longContent = html`
  ${Array.from({ length: 40 }).map(
    (_, i) => html`
      <p>
        Paragraph ${i + 1}. Scroll down past the threshold (400 px by
        default) and the floating chip appears in the bottom-right
        corner. Click it to smooth-scroll back to the top.
      </p>
    `
  )}
`;

export const Default: Story = {
  render: () => html`
    <h1 class="civ-mt-0">Long page</h1>
    ${longContent}
    <civ-back-to-top></civ-back-to-top>
  `,
};

export const CustomLabel: Story = {
  render: () => html`
    <h1 class="civ-mt-0">Long page</h1>
    ${longContent}
    <civ-back-to-top label="Return to top"></civ-back-to-top>
  `,
};

export const CustomThreshold: Story = {
  render: () => html`
    <h1 class="civ-mt-0">Trigger after 100 px</h1>
    <p class="civ-italic">
      Lower <code>threshold</code> for shorter pages where 400 px would
      mean the button never appears.
    </p>
    ${longContent}
    <civ-back-to-top threshold="100"></civ-back-to-top>
  `,
};

export const ChipPreview: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the chip in isolation by pinning `threshold="-1"`. The sentinel lands above the viewport top so the IntersectionObserver reports it out-of-view immediately — the chip flips visible on load without needing to scroll. Useful for inspecting the chip styling in Storybook.',
      },
    },
  },
  render: () => html`
    <p class="civ-italic civ-mb-3">
      <code>threshold="-1"</code> positions the sentinel above the viewport
      so the observer always reports it out-of-view — the chip flips
      visible right away.
    </p>
    <div style="height: 200px;"></div>
    <civ-back-to-top label="Back to top" threshold="-1"></civ-back-to-top>
  `,
};
