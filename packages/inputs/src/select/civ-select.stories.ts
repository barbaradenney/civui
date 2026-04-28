import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-select.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Select',
  component: 'civ-select',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    emptyLabel: { control: 'text' },
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
    value: '',
    hint: '',
    error: '',
    emptyLabel: '- Select -',
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
      <civ-select
        name="${args.name}"
        empty-label="${args.emptyLabel}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      >
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="FL">Florida</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
        <option value="WA">Washington</option>
      </civ-select>
    </civ-form-field>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-field label="State of residence" hint="Select the state where you currently live">
      <civ-select name="state">
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </civ-select>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-field label="State of residence" error="Select a state to continue" required>
      <civ-select name="state" required>
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </civ-select>
    </civ-form-field>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-field label="State of residence" required>
      <civ-select name="state" required>
        <option value="CA">California</option>
        <option value="NY">New York</option>
      </civ-select>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-field label="State of residence" disabled>
      <civ-select name="state" value="CA" disabled>
        <option value="CA">California</option>
        <option value="NY">New York</option>
      </civ-select>
    </civ-form-field>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-form-field label="Normal">
        <civ-select name="normal">
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="TX">Texas</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="With hint" hint="Select where you currently reside">
        <civ-select name="hint">
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="With error" error="Select a state" required>
        <civ-select name="error" required>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="Required" required>
        <civ-select name="required" required>
          <option value="CA">California</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="Disabled" disabled>
        <civ-select name="disabled" value="NY" disabled>
          <option value="NY">New York</option>
        </civ-select>
      </civ-form-field>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const OptionGroups: Story = {
  render: () => html`
    <civ-form-field label="Department" hint="Select your department">
      <civ-select name="department">
        <optgroup label="Administration">
          <option value="hr">Human Resources</option>
          <option value="finance">Finance</option>
          <option value="legal">Legal</option>
        </optgroup>
        <optgroup label="Technology">
          <option value="eng">Engineering</option>
          <option value="design">Design</option>
          <option value="security">Cybersecurity</option>
        </optgroup>
        <optgroup label="Operations">
          <option value="policy">Policy</option>
          <option value="outreach">Public Outreach</option>
        </optgroup>
      </civ-select>
    </civ-form-field>
  `,
};

export const SlottedOptions: Story = {
  name: 'Declarative <option> slot',
  render: () => html`
    <civ-form-field label="State">
      <civ-select name="state">
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX" selected>Texas</option>
      </civ-select>
    </civ-form-field>
  `,
};

export const SlottedWithOptgroup: Story = {
  name: 'Declarative <optgroup>',
  render: () => html`
    <civ-form-field label="State">
      <civ-select name="state">
        <option value="CA">California</option>
        <optgroup label="Pacific">
          <option value="OR">Oregon</option>
          <option value="WA">Washington</option>
        </optgroup>
        <optgroup label="Mountain">
          <option value="CO">Colorado</option>
          <option value="UT">Utah</option>
        </optgroup>
      </civ-select>
    </civ-form-field>
  `,
};

// ── Width variants ────────────────────────────────────────────

export const WidthVariants: Story = {
  name: 'Width variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-form-field label="2xs width">
        <civ-select width="2xs">
          <option value="1">1</option>
          <option value="2">2</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="xs width">
        <civ-select width="xs">
          <option value="CA">CA</option>
          <option value="NY">NY</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="sm width">
        <civ-select width="sm">
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="md width">
        <civ-select width="md">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="lg width">
        <civ-select width="lg">
          <option value="education">Education benefits</option>
          <option value="housing">Housing assistance</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="xl width">
        <civ-select width="xl">
          <option value="va-dc">Washington DC VA Medical Center</option>
          <option value="va-richmond">Richmond VA Medical Center</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="2xl width">
        <civ-select width="2xl">
          <option value="long">This is a very long option for wide fields</option>
          <option value="another">Another long option to demonstrate the width</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="default (full width)">
        <civ-select>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </civ-select>
      </civ-form-field>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Dense</p>
        <civ-form-field label="State" hint="Select where you reside">
          <civ-select name="dense-state">
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Default</p>
        <civ-form-field label="State" hint="Select where you reside">
          <civ-select name="default-state">
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
        </civ-form-field>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Spacious</p>
        <civ-form-field label="State" hint="Select where you reside">
          <civ-select name="spacious-state">
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
        </civ-form-field>
      </div>
    </div>
  `,
};

export const GovernmentBenefitsForm: Story = {
  name: 'Usage: Benefits Application',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-form-field label="State of residence" required>
        <civ-select name="state" preset="us-state" required></civ-select>
      </civ-form-field>
      <civ-form-field label="Benefit type" hint="Select the benefit you are applying for" required>
        <civ-select name="benefit" required>
          <option value="health">Health care</option>
          <option value="education">Education</option>
          <option value="disability">Disability compensation</option>
          <option value="housing">Housing assistance</option>
        </civ-select>
      </civ-form-field>
    </div>
  `,
};

// ── Presets (built-in data lists) ─────────────────────────────

export const PresetUsState: Story = {
  name: 'Preset: US State',
  render: () => html`
    <civ-form-field label="State" required>
      <civ-select name="state" preset="us-state" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetUsStateWithTerritories: Story = {
  name: 'Preset: US State + Territories',
  render: () => html`
    <civ-form-field label="State or territory" required>
      <civ-select name="state" preset="us-state" preset-variant="territories" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetServiceBranch: Story = {
  name: 'Preset: Service Branch',
  render: () => html`
    <civ-form-field label="Branch of service" required>
      <civ-select name="branch" preset="service-branch" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetServiceBranchAll: Story = {
  name: 'Preset: Service Branch (All Tiers)',
  render: () => html`
    <civ-form-field label="Branch of service" hint="Includes reserve, guard, and historical branches" required>
      <civ-select name="branch" preset="service-branch" preset-variant="all" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetDischargeType: Story = {
  name: 'Preset: Discharge Type',
  render: () => html`
    <civ-form-field label="Type of discharge" required>
      <civ-select name="discharge" preset="discharge-type" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetSuffix: Story = {
  name: 'Preset: Suffix',
  render: () => html`
    <civ-form-field label="Suffix">
      <civ-select name="suffix" preset="suffix"></civ-select>
    </civ-form-field>
  `,
};

export const PresetRelationshipType: Story = {
  name: 'Preset: Relationship',
  render: () => html`
    <civ-form-field label="Relationship to veteran" required>
      <civ-select name="relationship" preset="relationship-type" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetRelationshipVaDependent: Story = {
  name: 'Preset: Relationship (VA Dependent)',
  render: () => html`
    <civ-form-field label="Relationship to veteran" required>
      <civ-select name="relationship" preset="relationship-type" preset-variant="va-dependent" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetMaritalStatus: Story = {
  name: 'Preset: Marital Status',
  render: () => html`
    <civ-form-field label="Marital status" required>
      <civ-select name="maritalStatus" preset="marital-status" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetEthnicity: Story = {
  name: 'Preset: Ethnicity (OMB)',
  render: () => html`
    <civ-form-field label="Ethnicity" required>
      <civ-select name="ethnicity" preset="ethnicity" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetGender: Story = {
  name: 'Preset: Gender',
  render: () => html`
    <civ-form-field label="Gender">
      <civ-select name="gender" preset="gender"></civ-select>
    </civ-form-field>
  `,
};

export const PresetGenderBinary: Story = {
  name: 'Preset: Gender (Binary)',
  render: () => html`
    <civ-form-field label="Sex">
      <civ-select name="sex" preset="gender" preset-variant="binary"></civ-select>
    </civ-form-field>
  `,
};

export const PresetLanguage: Story = {
  name: 'Preset: Language',
  render: () => html`
    <civ-form-field label="Preferred language">
      <civ-select name="language" preset="language"></civ-select>
    </civ-form-field>
  `,
};

// ── All Presets ──────────────────────────────────────────────

export const AllPresets: Story = {
  name: 'All Presets',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2" style="max-width: 480px;">
      <civ-form-field label="US State">
        <civ-select preset="us-state"></civ-select>
      </civ-form-field>
      <civ-form-field label="Branch of service">
        <civ-select preset="service-branch"></civ-select>
      </civ-form-field>
      <civ-form-field label="Discharge type">
        <civ-select preset="discharge-type"></civ-select>
      </civ-form-field>
      <civ-form-field label="Suffix">
        <civ-select preset="suffix"></civ-select>
      </civ-form-field>
      <civ-form-field label="Relationship">
        <civ-select preset="relationship-type"></civ-select>
      </civ-form-field>
      <civ-form-field label="Marital status">
        <civ-select preset="marital-status"></civ-select>
      </civ-form-field>
      <civ-form-field label="Ethnicity">
        <civ-select preset="ethnicity"></civ-select>
      </civ-form-field>
      <civ-form-field label="Gender">
        <civ-select preset="gender"></civ-select>
      </civ-form-field>
      <civ-form-field label="Preferred language">
        <civ-select preset="language"></civ-select>
      </civ-form-field>
    </div>
  `,
};
