import type { Meta, StoryObj } from '@storybook/web-components';
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
    <civ-form-field
      label="${args.label}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-combobox
        name="${args.name}"
        placeholder="${args.placeholder}"
        .options="${STATES}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-combobox>
    </civ-form-field>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-field label="State of residence" hint="Type to search or use arrow keys to browse">
      <civ-combobox name="state" .options="${STATES}"></civ-combobox>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-field label="State of residence" error="Select a valid state" required>
      <civ-combobox name="state" .options="${STATES}" required></civ-combobox>
    </civ-form-field>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-field label="State of residence" required>
      <civ-combobox name="state" .options="${STATES}" required></civ-combobox>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-field label="State of residence" disabled>
      <civ-combobox name="state" value="CA" .options="${STATES}" disabled></civ-combobox>
    </civ-form-field>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-form-field label="Normal">
        <civ-combobox name="normal" .options="${STATES}"></civ-combobox>
      </civ-form-field>
      <civ-form-field label="With hint" hint="Type to search">
        <civ-combobox name="hint" .options="${STATES}"></civ-combobox>
      </civ-form-field>
      <civ-form-field label="With error" error="Select a state" required>
        <civ-combobox name="error" .options="${STATES}" required></civ-combobox>
      </civ-form-field>
      <civ-form-field label="Required" required>
        <civ-combobox name="required" .options="${STATES}" required></civ-combobox>
      </civ-form-field>
      <civ-form-field label="Disabled" disabled>
        <civ-combobox name="disabled" value="TX" .options="${STATES}" disabled></civ-combobox>
      </civ-form-field>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Dense</p>
        <civ-form-field label="State" hint="Type to search">
          <civ-combobox name="dense-state" .options="${STATES}"></civ-combobox>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Default</p>
        <civ-form-field label="State" hint="Type to search">
          <civ-combobox name="default-state" .options="${STATES}"></civ-combobox>
        </civ-form-field>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Spacious</p>
        <civ-form-field label="State" hint="Type to search">
          <civ-combobox name="spacious-state" .options="${STATES}"></civ-combobox>
        </civ-form-field>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const OptionGroups: Story = {
  render: () => html`
    <civ-form-field label="Office location" hint="Search offices...">
      <civ-combobox name="office" placeholder="Search offices..." .options="${OFFICES}"></civ-combobox>
    </civ-form-field>
  `,
};

export const GovernmentOfficeSearch: Story = {
  name: 'Usage: Office Location Search',
  render: () => html`
    <civ-form-field label="Nearest field office" hint="Search by city or office name" required>
      <civ-combobox name="office" placeholder="Type a city or office name..." .options="${OFFICES}" required></civ-combobox>
    </civ-form-field>
  `,
};

export const WidthVariants: Story = {
  name: 'Width variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-form-field label="xs width">
        <civ-combobox width="xs" .options="${STATES}"></civ-combobox>
      </civ-form-field>
      <civ-form-field label="sm width">
        <civ-combobox width="sm" .options="${STATES}"></civ-combobox>
      </civ-form-field>
      <civ-form-field label="md width">
        <civ-combobox width="md" .options="${STATES}"></civ-combobox>
      </civ-form-field>
      <civ-form-field label="lg width">
        <civ-combobox width="lg" .options="${STATES}"></civ-combobox>
      </civ-form-field>
      <civ-form-field label="default (full width)">
        <civ-combobox .options="${STATES}"></civ-combobox>
      </civ-form-field>
    </div>
  `,
};

export const ChevronToggle: Story = {
  name: 'Chevron toggle',
  render: () => html`
    <civ-form-field label="State">
      <civ-combobox name="state" .options="${STATES}"></civ-combobox>
    </civ-form-field>
  `,
};

// ── Async loadOptions ─────────────────────────────────────────
// These use imperative construction because loadOptions is a function property.

export const AsyncLoading: Story = {
  name: 'Async: remote loadOptions',
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'Federal agency';
    wrapper.hint = 'Type to search across federal agencies';

    const el = document.createElement('civ-combobox') as any;
    el.name = 'agency';
    el.placeholder = 'Type an agency name...';
    el.loadOptions = async (q: string) => {
      await new Promise((r) => setTimeout(r, 400));
      return AGENCIES.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
    };

    wrapper.innerHTML = '';
    wrapper.appendChild(el);
    return wrapper;
  },
};

export const AsyncWithMinQuery: Story = {
  name: 'Async: with min-query-length',
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'Federal agency';

    const el = document.createElement('civ-combobox') as any;
    el.name = 'agency';
    el.setAttribute('min-query-length', '3');
    el.placeholder = 'Type at least 3 characters...';
    el.loadOptions = async (q: string) => {
      await new Promise((r) => setTimeout(r, 250));
      return AGENCIES.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
    };

    wrapper.innerHTML = '';
    wrapper.appendChild(el);
    return wrapper;
  },
};

export const AsyncError: Story = {
  name: 'Async: error state',
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'Federal agency';

    const el = document.createElement('civ-combobox') as any;
    el.name = 'agency';
    el.loadOptions = async () => {
      await new Promise((r) => setTimeout(r, 400));
      throw new Error('Network unavailable');
    };

    wrapper.innerHTML = '';
    wrapper.appendChild(el);
    return wrapper;
  },
};

// ── Country Preset ──────────────────────────────────────────────

export const Country: Story = {
  name: 'Preset: Country',
  render: () => html`
    <civ-form-field label="Country" required>
      <civ-country name="country" required></civ-country>
    </civ-form-field>
  `,
};

export const CountryOfBirth: Story = {
  name: 'Preset: Country of Birth',
  render: () => html`
    <civ-form-field label="Country of birth" required>
      <civ-country name="birthCountry" label="Country of birth" required></civ-country>
    </civ-form-field>
  `,
};
