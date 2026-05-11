import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
    <civ-select label="${args.label}" name="${args.name}" hint="${args.hint}" error="${args.error}" empty-label="${args.emptyLabel}" ?required="${args.required}" ?disabled="${args.disabled}">
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
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-select label="State of residence" name="state" hint="Select the state where you currently live">
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </civ-select>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-select label="State of residence" name="state" error="Select a state to continue" required>
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </civ-select>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-select label="State of residence" name="state" required>
        <option value="CA">California</option>
        <option value="NY">New York</option>
      </civ-select>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-select label="State of residence" name="state" value="CA" disabled>
        <option value="CA">California</option>
        <option value="NY">New York</option>
      </civ-select>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-select label="Normal" name="normal">
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="TX">Texas</option>
        </civ-select>
      <civ-select label="With hint" name="hint" hint="Select where you currently reside">
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      <civ-select label="With error" name="error" error="Select a state" required>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      <civ-select label="Required" name="required" required>
          <option value="CA">California</option>
        </civ-select>
      <civ-select label="Disabled" name="disabled" value="NY" disabled>
          <option value="NY">New York</option>
        </civ-select>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const OptionGroups: Story = {
  render: () => html`
    <civ-select label="Department" name="department" hint="Select your department">
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
  `,
};

export const SlottedOptions: Story = {
  name: 'Slotted <option> children (declarative)',
  render: () => html`
    <civ-select label="State" name="state">
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX" selected>Texas</option>
      </civ-select>
  `,
};

export const SlottedWithOptgroup: Story = {
  name: 'Declarative <optgroup>',
  render: () => html`
    <civ-select label="State" name="state">
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
  `,
};

// ── Width variants ────────────────────────────────────────────

export const WidthVariants: Story = {
  name: 'Width variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-select label="2xs width" width="2xs">
          <option value="1">1</option>
          <option value="2">2</option>
        </civ-select>
      <civ-select label="xs width" width="xs">
          <option value="CA">CA</option>
          <option value="NY">NY</option>
        </civ-select>
      <civ-select label="sm width" width="sm">
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      <civ-select label="md width" width="md">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </civ-select>
      <civ-select label="lg width" width="lg">
          <option value="education">Education benefits</option>
          <option value="housing">Housing assistance</option>
        </civ-select>
      <civ-select label="xl width" width="xl">
          <option value="va-dc">Washington DC VA Medical Center</option>
          <option value="va-richmond">Richmond VA Medical Center</option>
        </civ-select>
      <civ-select label="2xl width" width="2xl">
          <option value="long">This is a very long option for wide fields</option>
          <option value="another">Another long option to demonstrate the width</option>
        </civ-select>
      <civ-select label="default (full width)">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </civ-select>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Dense</p>
        <civ-select label="State" name="dense-state" hint="Select where you reside">
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
      </div>
      <div>
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Default</p>
        <civ-select label="State" name="default-state" hint="Select where you reside">
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-text-sm civ-font-semibold civ-mb-2">Spacious</p>
        <civ-select label="State" name="spacious-state" hint="Select where you reside">
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
      </div>
    </div>
  `,
};

export const GovernmentBenefitsForm: Story = {
  name: 'Usage: Benefits Application',
  render: () => html`
    <div style="max-width: 480px;">
      <civ-select label="State of residence" name="state" required preset="us-state"></civ-select>
      <civ-select label="Benefit type" name="benefit" hint="Select the benefit you are applying for" required>
          <option value="health">Health care</option>
          <option value="education">Education</option>
          <option value="disability">Disability compensation</option>
          <option value="housing">Housing assistance</option>
        </civ-select>
    </div>
  `,
};

// ── Presets (built-in data lists) ─────────────────────────────

export const PresetUsState: Story = {
  name: 'Preset: US State',
  render: () => html`
    <civ-select label="State" name="state" required preset="us-state"></civ-select>
  `,
};

export const PresetUsStateWithTerritories: Story = {
  name: 'Preset: US State + Territories',
  render: () => html`
    <civ-select label="State or territory" name="state" required preset="us-state" preset-variant="territories"></civ-select>
  `,
};

export const PresetServiceBranch: Story = {
  name: 'Preset: Service Branch',
  render: () => html`
    <civ-select label="Branch of service" name="branch" required preset="service-branch"></civ-select>
  `,
};

export const PresetServiceBranchAll: Story = {
  name: 'Preset: Service Branch (All Tiers)',
  render: () => html`
    <civ-select label="Branch of service" name="branch" hint="Includes reserve, guard, and historical branches" required preset="service-branch" preset-variant="all"></civ-select>
  `,
};

export const PresetDischargeType: Story = {
  name: 'Preset: Discharge Type',
  render: () => html`
    <civ-select label="Type of discharge" name="discharge" required preset="discharge-type"></civ-select>
  `,
};

export const PresetSuffix: Story = {
  name: 'Preset: Suffix',
  render: () => html`
    <civ-select label="Suffix" name="suffix" preset="suffix"></civ-select>
  `,
};

export const PresetRelationshipType: Story = {
  name: 'Preset: Relationship',
  render: () => html`
    <civ-select label="Relationship to veteran" name="relationship" required preset="relationship-type"></civ-select>
  `,
};

export const PresetRelationshipDependent: Story = {
  name: 'Preset: Relationship (Dependent)',
  render: () => html`
    <civ-select label="Relationship to veteran" name="relationship" required preset="relationship-type" preset-variant="dependent"></civ-select>
  `,
};

export const PresetMaritalStatus: Story = {
  name: 'Preset: Marital Status',
  render: () => html`
    <civ-select label="Marital status" name="maritalStatus" required preset="marital-status"></civ-select>
  `,
};

export const PresetEthnicity: Story = {
  name: 'Preset: Ethnicity (OMB)',
  render: () => html`
    <civ-select label="Ethnicity" name="ethnicity" required preset="ethnicity"></civ-select>
  `,
};

export const PresetGender: Story = {
  name: 'Preset: Gender',
  render: () => html`
    <civ-select label="Gender" name="gender" preset="gender"></civ-select>
  `,
};

export const PresetGenderBinary: Story = {
  name: 'Preset: Gender (Binary)',
  render: () => html`
    <civ-select label="Sex" name="sex" preset="gender" preset-variant="binary"></civ-select>
  `,
};

export const PresetLanguage: Story = {
  name: 'Preset: Language',
  render: () => html`
    <civ-select label="Preferred language" name="language" preset="language"></civ-select>
  `,
};

export const PresetHousingStatus: Story = {
  name: 'Preset: Housing Status',
  render: () => html`
    <civ-select label="Housing status" name="housing" required preset="housing-status"></civ-select>
  `,
};

export const PresetEducationLevel: Story = {
  name: 'Preset: Education Level',
  render: () => html`
    <civ-select label="Highest education level" name="education" required preset="education-level"></civ-select>
  `,
};

export const PresetEmploymentStatus: Story = {
  name: 'Preset: Employment Status',
  render: () => html`
    <civ-select label="Employment status" name="employment" required preset="employment-status"></civ-select>
  `,
};

export const PresetIncomeSource: Story = {
  name: 'Preset: Income Source',
  render: () => html`
    <civ-select label="Primary source of income" name="incomeSource" preset="income-source"></civ-select>
  `,
};

export const PresetVeteranStatus: Story = {
  name: 'Preset: Veteran Status',
  render: () => html`
    <civ-select label="Veteran status" name="veteranStatus" required preset="veteran-status"></civ-select>
  `,
};

export const PresetDisabilityType: Story = {
  name: 'Preset: Disability Type',
  render: () => html`
    <civ-select label="Type of disability" name="disabilityType" preset="disability-type"></civ-select>
  `,
};

export const PresetCitizenshipStatus: Story = {
  name: 'Preset: Citizenship Status',
  render: () => html`
    <civ-select label="Citizenship status" name="citizenshipStatus" required preset="citizenship-status"></civ-select>
  `,
};

export const PresetPayFrequency: Story = {
  name: 'Preset: Pay Frequency',
  render: () => html`
    <civ-select label="How often are you paid?" name="payFrequency" required preset="pay-frequency"></civ-select>
  `,
};

export const PresetContactPreference: Story = {
  name: 'Preset: Contact Preference',
  render: () => html`
    <civ-select label="Preferred contact method" name="contactPreference" preset="contact-preference"></civ-select>
  `,
};

// ── All Presets ──────────────────────────────────────────────

export const AllPresets: Story = {
  name: 'All Presets',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2" style="max-width: 480px;">
      <civ-select label="US State" preset="us-state"></civ-select>
      <civ-select label="Branch of service" preset="service-branch"></civ-select>
      <civ-select label="Discharge type" preset="discharge-type"></civ-select>
      <civ-select label="Suffix" preset="suffix"></civ-select>
      <civ-select label="Relationship" preset="relationship-type"></civ-select>
      <civ-select label="Marital status" preset="marital-status"></civ-select>
      <civ-select label="Ethnicity" preset="ethnicity"></civ-select>
      <civ-select label="Gender" preset="gender"></civ-select>
      <civ-select label="Preferred language" preset="language"></civ-select>
      <civ-select label="Housing status" preset="housing-status"></civ-select>
      <civ-select label="Education level" preset="education-level"></civ-select>
      <civ-select label="Employment status" preset="employment-status"></civ-select>
      <civ-select label="Income source" preset="income-source"></civ-select>
      <civ-select label="Veteran status" preset="veteran-status"></civ-select>
      <civ-select label="Disability type" preset="disability-type"></civ-select>
      <civ-select label="Citizenship status" preset="citizenship-status"></civ-select>
      <civ-select label="Pay frequency" preset="pay-frequency"></civ-select>
      <civ-select label="Contact preference" preset="contact-preference"></civ-select>
    </div>
  `,
};
