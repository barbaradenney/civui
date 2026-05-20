import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-combobox.js';
import '../country/civ-country.js';

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' },
];

const OFFICES = [
  { value: 'dc-hq', label: 'DC Headquarters', group: 'East Coast' },
  { value: 'dc-annex', label: 'DC Annex Building', group: 'East Coast' },
  { value: 'ny-field', label: 'New York Field Office', group: 'East Coast' },
  { value: 'boston', label: 'Boston Regional', group: 'East Coast' },
  { value: 'sf-field', label: 'San Francisco Field Office', group: 'West Coast' },
  { value: 'la-field', label: 'Los Angeles Field Office', group: 'West Coast' },
  { value: 'seattle', label: 'Seattle Regional', group: 'West Coast' },
  { value: 'chicago', label: 'Chicago Regional', group: 'Midwest' },
  { value: 'denver', label: 'Denver Field Office', group: 'Midwest' },
];

const AGENCIES = [
  { value: 'va', label: 'Department of Veterans Affairs' },
  { value: 'ssa', label: 'Social Security Administration' },
  { value: 'irs', label: 'Internal Revenue Service' },
  { value: 'usps', label: 'United States Postal Service' },
  { value: 'sba', label: 'Small Business Administration' },
  { value: 'epa', label: 'Environmental Protection Agency' },
  { value: 'doe', label: 'Department of Energy' },
  { value: 'dot', label: 'Department of Transportation' },
  { value: 'usda', label: 'Department of Agriculture' },
];

const meta: Meta = {
  title: 'Forms/Inputs/Combobox',
  component: 'civ-combobox',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'State of residence',
    name: 'state',
    placeholder: 'Start typing to filter...',
    hint: '',
    error: '',
    value: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-combobox label="${args.label}" name="${args.name}" hint="${args.hint}" error="${args.error}" placeholder="${args.placeholder}" .options="${STATES}" ?required="${args.required}" ?disabled="${args.disabled}"></civ-combobox>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-combobox label="State of residence" name="state" hint="Type to search or use arrow keys to browse" .options="${STATES}"></civ-combobox>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-combobox label="State of residence" name="state" error="Select a valid state" required .options="${STATES}"></civ-combobox>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-combobox label="State of residence" name="state" required .options="${STATES}"></civ-combobox>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-combobox label="State of residence" name="state" value="CA" .options="${STATES}" disabled></civ-combobox>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-combobox label="Normal" name="normal" .options="${STATES}"></civ-combobox>
      <civ-combobox label="With hint" name="hint" hint="Type to search" .options="${STATES}"></civ-combobox>
      <civ-combobox label="With error" name="error" error="Select a state" required .options="${STATES}"></civ-combobox>
      <civ-combobox label="Required" name="required" required .options="${STATES}"></civ-combobox>
      <civ-combobox label="Disabled" name="disabled" value="TX" .options="${STATES}" disabled></civ-combobox>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Dense</p>
        <civ-combobox label="State" name="dense-state" hint="Type to search" .options="${STATES}"></civ-combobox>
      </div>
      <div>
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Default</p>
        <civ-combobox label="State" name="default-state" hint="Type to search" .options="${STATES}"></civ-combobox>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Spacious</p>
        <civ-combobox label="State" name="spacious-state" hint="Type to search" .options="${STATES}"></civ-combobox>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const OptionGroups: Story = {
  render: () => html`
    <civ-combobox label="Office location" name="office" hint="Search offices..." placeholder="Search offices..." .options="${OFFICES}"></civ-combobox>
  `,
};

export const GovernmentOfficeSearch: Story = {
  name: 'Usage: Office Location Search',
  render: () => html`
    <civ-combobox label="Nearest field office" name="office" hint="Search by city or office name" required placeholder="Type a city or office name..." .options="${OFFICES}"></civ-combobox>
  `,
};

export const WidthVariants: Story = {
  name: 'Width variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-combobox label="xs width" width="xs" .options="${STATES}"></civ-combobox>
      <civ-combobox label="sm width" width="sm" .options="${STATES}"></civ-combobox>
      <civ-combobox label="md width" width="md" .options="${STATES}"></civ-combobox>
      <civ-combobox label="lg width" width="lg" .options="${STATES}"></civ-combobox>
      <civ-combobox label="default (full width)" .options="${STATES}"></civ-combobox>
    </div>
  `,
};

export const ChevronToggle: Story = {
  name: 'Chevron toggle',
  render: () => html`
    <civ-combobox label="State" name="state" .options="${STATES}"></civ-combobox>
  `,
};

// ── Async loadOptions ─────────────────────────────────────────
// These use imperative construction because loadOptions is a function property.

export const AsyncLoading: Story = {
  name: 'Async: remote loadOptions',
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'Federal agency';
    el.hint = 'Type to search across federal agencies';
    el.name = 'agency';
    el.placeholder = 'Type an agency name...';
    el.loadOptions = async (q: string) => {
      await new Promise((r) => setTimeout(r, 400));
      return AGENCIES.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
    };
    return el;
  },
};

export const AsyncWithMinQuery: Story = {
  name: 'Async: with min-query-length',
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'Federal agency';
    el.name = 'agency';
    el.setAttribute('min-query-length', '3');
    el.placeholder = 'Type at least 3 characters...';
    el.loadOptions = async (q: string) => {
      await new Promise((r) => setTimeout(r, 250));
      return AGENCIES.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
    };
    return el;
  },
};

export const AsyncError: Story = {
  name: 'Async: error state',
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'Federal agency';
    el.name = 'agency';
    el.loadOptions = async () => {
      await new Promise((r) => setTimeout(r, 400));
      throw new Error('Network unavailable');
    };
    return el;
  },
};

// ── Country Preset ──────────────────────────────────────────────

export const Country: Story = {
  name: 'Preset: Country',
  render: () => html`
    <civ-country label="Country" name="country" required></civ-country>
  `,
};

export const CountryOfBirth: Story = {
  name: 'Preset: Country of Birth',
  render: () => html`
    <civ-country label="Country of birth" name="birthCountry" required></civ-country>
  `,
};
