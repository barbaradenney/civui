import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-segment.js';
import './civ-segmented-control.js';
import '@civui/actions';

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
    <civ-form-fieldset
      legend="${args.legend}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-segmented-control
        name="${args.name}"
        value="${args.value}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      >
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    </civ-form-fieldset>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-fieldset legend="Display format" hint="Choose how search results are displayed">
      <civ-segmented-control name="format" value="list">
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    </civ-form-fieldset>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-fieldset legend="Display format" error="Select a display format" required>
      <civ-segmented-control name="format" required>
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
      </civ-segmented-control>
    </civ-form-fieldset>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-fieldset legend="Report period" required>
      <civ-segmented-control name="period" required>
        <civ-segment label="Monthly" value="monthly"></civ-segment>
        <civ-segment label="Quarterly" value="quarterly"></civ-segment>
        <civ-segment label="Annual" value="annual"></civ-segment>
      </civ-segmented-control>
    </civ-form-fieldset>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-fieldset legend="Display format" disabled>
      <civ-segmented-control name="format" value="list" disabled>
        <civ-segment label="List" value="list"></civ-segment>
        <civ-segment label="Grid" value="grid"></civ-segment>
        <civ-segment label="Table" value="table"></civ-segment>
      </civ-segmented-control>
    </civ-form-fieldset>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-form-fieldset legend="Normal">
        <civ-segmented-control name="normal" value="a">
          <civ-segment label="Option A" value="a"></civ-segment>
          <civ-segment label="Option B" value="b"></civ-segment>
        </civ-segmented-control>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With hint" hint="Choose one option">
        <civ-segmented-control name="hint" value="a">
          <civ-segment label="Option A" value="a"></civ-segment>
          <civ-segment label="Option B" value="b"></civ-segment>
        </civ-segmented-control>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With error" error="Select an option" required>
        <civ-segmented-control name="error" required>
          <civ-segment label="Option A" value="a"></civ-segment>
          <civ-segment label="Option B" value="b"></civ-segment>
        </civ-segmented-control>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Disabled" disabled>
        <civ-segmented-control name="disabled" value="a" disabled>
          <civ-segment label="Option A" value="a"></civ-segment>
          <civ-segment label="Option B" value="b"></civ-segment>
        </civ-segmented-control>
      </civ-form-fieldset>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-form-fieldset legend="View mode">
          <civ-segmented-control name="dense-view" value="list">
            <civ-segment label="List" value="list"></civ-segment>
            <civ-segment label="Grid" value="grid"></civ-segment>
            <civ-segment label="Table" value="table"></civ-segment>
          </civ-segmented-control>
        </civ-form-fieldset>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-fieldset legend="View mode">
          <civ-segmented-control name="default-view" value="list">
            <civ-segment label="List" value="list"></civ-segment>
            <civ-segment label="Grid" value="grid"></civ-segment>
            <civ-segment label="Table" value="table"></civ-segment>
          </civ-segmented-control>
        </civ-form-fieldset>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-fieldset legend="View mode">
          <civ-segmented-control name="spacious-view" value="list">
            <civ-segment label="List" value="list"></civ-segment>
            <civ-segment label="Grid" value="grid"></civ-segment>
            <civ-segment label="Table" value="table"></civ-segment>
          </civ-segmented-control>
        </civ-form-fieldset>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const FiveOptions: Story = {
  render: () => html`
    <civ-form-fieldset legend="Priority level">
      <civ-segmented-control name="priority" value="medium">
        <civ-segment label="Critical" value="critical"></civ-segment>
        <civ-segment label="High" value="high"></civ-segment>
        <civ-segment label="Medium" value="medium"></civ-segment>
        <civ-segment label="Low" value="low"></civ-segment>
        <civ-segment label="None" value="none"></civ-segment>
      </civ-segmented-control>
    </civ-form-fieldset>
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
      <civ-form-fieldset legend="Report time range" required>
        <civ-segmented-control name="range" value="quarter" required>
          <civ-segment label="Month" value="month"></civ-segment>
          <civ-segment label="Quarter" value="quarter"></civ-segment>
          <civ-segment label="Year" value="year"></civ-segment>
          <civ-segment label="All time" value="all"></civ-segment>
        </civ-segmented-control>
      </civ-form-fieldset>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <civ-button type="submit">Generate report</civ-button>
      </div>
    </form>
  `,
};
