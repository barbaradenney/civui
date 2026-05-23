import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-side-nav.js';
import './civ-side-nav-item.js';

const meta: Meta = {
  title: 'Navigation/Side Nav',
  component: 'civ-side-nav',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const wrapStyle = 'max-width: 280px; padding: 1rem; background: var(--civ-color-surface); border-inline-end: 1px solid var(--civ-color-border);';

export const Default: Story = {
  render: () => html`
    <div style="${wrapStyle}">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/introduction" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item href="/installation" label="Installation"></civ-side-nav-item>
        <civ-side-nav-item href="/components" label="Components" current></civ-side-nav-item>
        <civ-side-nav-item href="/tokens" label="Design tokens"></civ-side-nav-item>
        <civ-side-nav-item href="/accessibility" label="Accessibility"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const Nested: Story = {
  render: () => html`
    <div style="${wrapStyle}">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/introduction" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item href="/components" label="Components">
          <civ-side-nav-item href="/components/button" label="Button"></civ-side-nav-item>
          <civ-side-nav-item href="/components/text-input" label="Text input" current></civ-side-nav-item>
          <civ-side-nav-item href="/components/select" label="Select"></civ-side-nav-item>
          <civ-side-nav-item href="/components/checkbox" label="Checkbox"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/tokens" label="Design tokens">
          <civ-side-nav-item href="/tokens/color" label="Color"></civ-side-nav-item>
          <civ-side-nav-item href="/tokens/spacing" label="Spacing"></civ-side-nav-item>
          <civ-side-nav-item href="/tokens/typography" label="Typography"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/accessibility" label="Accessibility"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const WithDisabled: Story = {
  render: () => html`
    <div style="${wrapStyle}">
      <civ-side-nav label="Application sections">
        <civ-side-nav-item href="/start" label="Get started" current></civ-side-nav-item>
        <civ-side-nav-item href="/personal" label="Personal information"></civ-side-nav-item>
        <civ-side-nav-item href="/income" label="Income"></civ-side-nav-item>
        <civ-side-nav-item href="/review" label="Review" disabled></civ-side-nav-item>
        <civ-side-nav-item href="/submit" label="Submit" disabled></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const DocumentationLayout: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Typical documentation page composition — side rail on the left,
      content + on-this-page rail on the right.
    </p>
    <div style="display: grid; grid-template-columns: 240px 1fr; gap: 2rem; align-items: start;">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/intro" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item href="/components" label="Components">
          <civ-side-nav-item href="/button" label="Button" current></civ-side-nav-item>
          <civ-side-nav-item href="/input" label="Text input"></civ-side-nav-item>
          <civ-side-nav-item href="/select" label="Select"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/tokens" label="Design tokens"></civ-side-nav-item>
      </civ-side-nav>
      <article>
        <h1 class="civ-mt-0">Button</h1>
        <p>The Button component is the primary action affordance in CivUI…</p>
      </article>
    </div>
  `,
};
