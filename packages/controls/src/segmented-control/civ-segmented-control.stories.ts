import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-segment.js';
import './civ-segmented-control.js';

const meta: Meta = {
  title: 'Forms/Inputs/Segmented Control',
  component: 'civ-segmented-control',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'View mode',
    name: 'view',
    value: 'list',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-segmented-control
      legend="${args.legend}"
      name="${args.name}"
      value="${args.value}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
    </civ-segmented-control>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-segmented-control legend="Display format" name="format" value="list" hint="Choose how search results are displayed">
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
      <civ-segment label="Table" value="table"></civ-segment>
    </civ-segmented-control>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-segmented-control legend="Display format" name="format" error="Select a display format" required>
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
    </civ-segmented-control>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-segmented-control legend="Report period" name="period" required>
      <civ-segment label="Monthly" value="monthly"></civ-segment>
      <civ-segment label="Quarterly" value="quarterly"></civ-segment>
      <civ-segment label="Annual" value="annual"></civ-segment>
    </civ-segmented-control>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-segmented-control legend="Display format" name="format" value="list" disabled>
      <civ-segment label="List" value="list"></civ-segment>
      <civ-segment label="Grid" value="grid"></civ-segment>
      <civ-segment label="Table" value="table"></civ-segment>
    </civ-segmented-control>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <civ-segmented-control legend="Normal" name="normal" value="a">
        <civ-segment label="Option A" value="a"></civ-segment>
        <civ-segment label="Option B" value="b"></civ-segment>
      </civ-segmented-control>
      <civ-segmented-control legend="With hint" name="hint" value="a" hint="Choose one option">
        <civ-segment label="Option A" value="a"></civ-segment>
        <civ-segment label="Option B" value="b"></civ-segment>
      </civ-segmented-control>
      <civ-segmented-control legend="With error" name="error" error="Select an option" required>
        <civ-segment label="Option A" value="a"></civ-segment>
        <civ-segment label="Option B" value="b"></civ-segment>
      </civ-segmented-control>
      <civ-segmented-control legend="Disabled" name="disabled" value="a" disabled>
        <civ-segment label="Option A" value="a"></civ-segment>
        <civ-segment label="Option B" value="b"></civ-segment>
      </civ-segmented-control>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-segmented-control legend="View mode" name="dense-view" value="list">
          <civ-segment label="List" value="list"></civ-segment>
          <civ-segment label="Grid" value="grid"></civ-segment>
          <civ-segment label="Table" value="table"></civ-segment>
        </civ-segmented-control>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-segmented-control legend="View mode" name="default-view" value="list">
          <civ-segment label="List" value="list"></civ-segment>
          <civ-segment label="Grid" value="grid"></civ-segment>
          <civ-segment label="Table" value="table"></civ-segment>
        </civ-segmented-control>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-segmented-control legend="View mode" name="spacious-view" value="list">
          <civ-segment label="List" value="list"></civ-segment>
          <civ-segment label="Grid" value="grid"></civ-segment>
          <civ-segment label="Table" value="table"></civ-segment>
        </civ-segmented-control>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const FiveOptions: Story = {
  render: () => html`
    <civ-segmented-control legend="Priority level" name="priority" value="medium">
      <civ-segment label="Critical" value="critical"></civ-segment>
      <civ-segment label="High" value="high"></civ-segment>
      <civ-segment label="Medium" value="medium"></civ-segment>
      <civ-segment label="Low" value="low"></civ-segment>
      <civ-segment label="None" value="none"></civ-segment>
    </civ-segmented-control>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentReportFilter: Story = {
  name: 'Usage: Report Time Range',
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        alert('Filter: ' + JSON.stringify(Object.fromEntries(fd)));
      }}
    >
      <civ-segmented-control legend="Report time range" name="range" value="quarter" required>
        <civ-segment label="Month" value="month"></civ-segment>
        <civ-segment label="Quarter" value="quarter"></civ-segment>
        <civ-segment label="Year" value="year"></civ-segment>
        <civ-segment label="All time" value="all"></civ-segment>
      </civ-segmented-control>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Generate report</button>
      </div>
    </form>
  `,
};
