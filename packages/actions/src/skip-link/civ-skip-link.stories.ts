import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-skip-link.js';

const meta: Meta = {
  title: 'Navigation/Skip Link',
  component: 'civ-skip-link',
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div>
      <p class="civ-mb-2 civ-italic">
        Press Tab to focus the skip link — it appears when focused.
      </p>
      <civ-skip-link></civ-skip-link>
      <nav style="padding: 16px; background: #f0f0f0; margin-bottom: 16px;">
        Navigation area (skip link jumps past this)
      </nav>
      <main id="main-content" tabindex="-1" style="padding: 16px; border: 2px solid #005ea2;">
        Main content area
      </main>
    </div>
  `,
};

export const CustomTarget: Story = {
  render: () => html`
    <div>
      <p class="civ-mb-2 civ-italic">
        Press Tab to focus the skip link.
      </p>
      <civ-skip-link href="#form-section">Skip to form</civ-skip-link>
      <nav style="padding: 16px; background: #f0f0f0; margin-bottom: 16px;">
        Navigation area
      </nav>
      <section id="form-section" tabindex="-1" style="padding: 16px; border: 2px solid #005ea2;">
        Form section
      </section>
    </div>
  `,
};

export const CustomLabel: Story = {
  render: () => html`
    <div>
      <p class="civ-mb-2 civ-italic">
        Press Tab to focus — this skip link has custom label text.
      </p>
      <civ-skip-link href="#main-content">Skip navigation</civ-skip-link>
      <nav style="padding: 16px; background: #f0f0f0; margin-bottom: 16px;">
        Navigation area
      </nav>
      <main id="main-content" tabindex="-1" style="padding: 16px; border: 2px solid #005ea2;">
        Main content area
      </main>
    </div>
  `,
};
