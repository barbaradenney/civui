import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-metric-group.js';
import '../metric-tile/civ-metric-tile.js';

const meta: Meta = {
  title: 'Data/Metric Group',
  component: 'civ-metric-group',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Responsive grid wrapper for \`<civ-metric-tile>\` children. Stacks to
a single column on mobile, two columns on tablet, and up to \`columns\`
columns on desktop. \`columns\` accepts 2–6.

A pure layout primitive — no headings or chrome. Wrap in a
\`<section>\` with your own heading if the group needs a label.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const tiles = html`
  <civ-metric-tile label="Applications" value="1,234"></civ-metric-tile>
  <civ-metric-tile label="Pending" value="248"></civ-metric-tile>
  <civ-metric-tile label="Approved" value="47"></civ-metric-tile>
  <civ-metric-tile label="Denied" value="12"></civ-metric-tile>
`;

export const Default: Story = {
  name: 'Default (4 columns)',
  render: () => html`<civ-metric-group>${tiles}</civ-metric-group>`,
};

export const ThreeColumns: Story = {
  name: 'Three columns',
  render: () => html`
    <civ-metric-group columns="3">
      <civ-metric-tile label="Applications" value="1,234"></civ-metric-tile>
      <civ-metric-tile label="Pending review" value="248"></civ-metric-tile>
      <civ-metric-tile label="Approved" value="47"></civ-metric-tile>
    </civ-metric-group>
  `,
};

export const TwoColumns: Story = {
  name: 'Two columns',
  render: () => html`
    <civ-metric-group columns="2">
      <civ-metric-tile label="Applications" value="1,234"></civ-metric-tile>
      <civ-metric-tile label="Approved" value="47"></civ-metric-tile>
    </civ-metric-group>
  `,
};

export const WithDeltas: Story = {
  name: 'With deltas and descriptions',
  render: () => html`
    <civ-metric-group columns="4">
      <civ-metric-tile
        label="Applications"
        value="1,234"
        delta="+12%"
        trend="up"
        intent="positive"
        description="vs. last 30 days"
      ></civ-metric-tile>
      <civ-metric-tile
        label="Pending review"
        value="248"
        delta="-8"
        trend="down"
        intent="positive"
        description="vs. last week"
      ></civ-metric-tile>
      <civ-metric-tile
        label="Approved"
        value="47"
        delta="+5"
        trend="up"
        intent="positive"
        description="this week"
      ></civ-metric-tile>
      <civ-metric-tile
        label="Avg. processing"
        value="3.2"
        unit="days"
        delta="0.4"
        trend="up"
        intent="negative"
        description="vs. last quarter"
      ></civ-metric-tile>
    </civ-metric-group>
  `,
};
