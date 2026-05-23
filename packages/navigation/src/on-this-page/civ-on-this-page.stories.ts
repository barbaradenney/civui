import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-on-this-page.js';
import './civ-on-this-page-item.js';

const meta: Meta = {
  title: 'Navigation/On This Page',
  component: 'civ-on-this-page',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const railStyle = 'max-width: 240px; padding: 1rem; background: var(--civ-color-surface); border-inline-start: 1px solid var(--civ-color-border);';

export const Default: Story = {
  render: () => html`
    <div style="${railStyle}">
      <civ-on-this-page label="On this page">
        <civ-on-this-page-item href="#installation" label="Installation"></civ-on-this-page-item>
        <civ-on-this-page-item href="#usage" label="Usage" active></civ-on-this-page-item>
        <civ-on-this-page-item href="#props" label="Props"></civ-on-this-page-item>
        <civ-on-this-page-item href="#events" label="Events"></civ-on-this-page-item>
        <civ-on-this-page-item href="#accessibility" label="Accessibility"></civ-on-this-page-item>
      </civ-on-this-page>
    </div>
  `,
};

export const AutoDetectFromHeadings: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Auto-detect mode — leave the default slot empty and the rail scans
      <code>h2[id], h3[id]</code> inside <code>main, article, body</code>
      and builds the list itself.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 240px; gap: 2rem; align-items: start;">
      <article style="max-width: 640px;">
        <h1 class="civ-mt-0">Component documentation</h1>
        <h2 id="installation">Installation</h2>
        <p>Install via <code>npm install @civui/navigation</code>.</p>
        <h2 id="usage">Usage</h2>
        <p>Import the component and use it in your template.</p>
        <h3 id="usage-basic">Basic example</h3>
        <p>A bare-minimum example.</p>
        <h3 id="usage-advanced">Advanced example</h3>
        <p>Combining with other components.</p>
        <h2 id="api">API</h2>
        <p>Reference documentation for props and events.</p>
      </article>
      <div style="${railStyle}">
        <civ-on-this-page label="On this page" scope-selector="article"></civ-on-this-page>
      </div>
    </div>
  `,
};

export const ManualMode: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Manual mode — slot explicit items when you want to control labels
      or skip certain headings.
    </p>
    <div style="${railStyle}">
      <civ-on-this-page label="Sections">
        <civ-on-this-page-item href="#overview" label="Overview"></civ-on-this-page-item>
        <civ-on-this-page-item href="#examples" label="Code examples" active></civ-on-this-page-item>
        <civ-on-this-page-item href="#related" label="Related components"></civ-on-this-page-item>
      </civ-on-this-page>
    </div>
  `,
};

export const NoHeadingLabel: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Skip the visible heading by passing <code>label=""</code> — the
      rail still gets an <code>aria-label</code> for the landmark, but
      no on-page text.
    </p>
    <div style="${railStyle}">
      <civ-on-this-page label="">
        <civ-on-this-page-item href="#a" label="Step 1"></civ-on-this-page-item>
        <civ-on-this-page-item href="#b" label="Step 2" active></civ-on-this-page-item>
        <civ-on-this-page-item href="#c" label="Step 3"></civ-on-this-page-item>
      </civ-on-this-page>
    </div>
  `,
};
