import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-metric-tile.js';
import '../metric-group/civ-metric-group.js';

const meta: Meta = {
  title: 'Data/Metric Tile',
  component: 'civ-metric-tile',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Display-only dashboard tile for a single key figure. The value is the
dominant element with a small caption label above; an optional delta
indicator and description sit below.

\`trend\` controls the arrow direction (\`up\` / \`down\` / \`flat\`) and
\`intent\` controls the color (\`positive\` / \`negative\` / \`neutral\`).
The two are independent on purpose — "up" doesn't always mean "good",
so the consumer encodes both axes when displaying a delta.

Compose with \`<civ-metric-group>\` for responsive multi-tile layouts.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="max-width: 280px;">
      <civ-metric-tile label="Applications" value="1,234"></civ-metric-tile>
    </div>
  `,
};

export const WithUnit: Story = {
  name: 'With unit',
  render: () => html`
    <div style="max-width: 280px;">
      <civ-metric-tile label="Avg. response time" value="230" unit="ms"></civ-metric-tile>
    </div>
  `,
};

export const WithPositiveTrend: Story = {
  name: 'With positive trend',
  render: () => html`
    <div style="max-width: 280px;">
      <civ-metric-tile
        label="Active users"
        value="1,234"
        delta="+12%"
        trend="up"
        intent="positive"
        description="vs. last 30 days"
      ></civ-metric-tile>
    </div>
  `,
};

export const WithNegativeTrend: Story = {
  name: 'With negative trend',
  render: () => html`
    <div style="max-width: 280px;">
      <civ-metric-tile
        label="Errors"
        value="47"
        delta="+8%"
        trend="up"
        intent="negative"
        description="vs. last 30 days"
      ></civ-metric-tile>
    </div>
  `,
};

export const WithFlatTrend: Story = {
  name: 'With flat trend',
  render: () => html`
    <div style="max-width: 280px;">
      <civ-metric-tile
        label="System uptime"
        value="99.9"
        unit="%"
        delta="0%"
        trend="flat"
        intent="neutral"
        description="vs. last 30 days"
      ></civ-metric-tile>
    </div>
  `,
};

export const WithIcon: Story = {
  name: 'With icon',
  render: () => html`
    <div style="max-width: 280px;">
      <civ-metric-tile
        icon="check-circle"
        label="Approved this week"
        value="47"
        delta="+5"
        trend="up"
        intent="positive"
      ></civ-metric-tile>
    </div>
  `,
};

export const InGroup: Story = {
  name: 'In a metric group',
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
