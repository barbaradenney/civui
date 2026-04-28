import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-select.js';
import '@civui/actions';

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'FL', label: 'Florida' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' },
];

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
  render: (args) => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = args.label;
    wrapper.hint = args.hint;
    wrapper.error = args.error;
    wrapper.required = args.required;
    wrapper.disabled = args.disabled;

    const el = document.createElement('civ-select') as any;
    el.name = args.name;
    el.value = args.value;
    el.emptyLabel = args.emptyLabel;
    el.options = STATES;
    el.required = args.required;
    el.disabled = args.disabled;

    wrapper.appendChild(el);
    return wrapper;
  },
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'State of residence';
    wrapper.hint = 'Select the state where you currently live';

    const el = document.createElement('civ-select') as any;
    el.name = 'state';
    el.options = STATES;

    wrapper.appendChild(el);
    return wrapper;
  },
};

export const WithError: Story = {
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'State of residence';
    wrapper.error = 'Select a state to continue';
    wrapper.required = true;

    const el = document.createElement('civ-select') as any;
    el.name = 'state';
    el.required = true;
    el.options = STATES;

    wrapper.appendChild(el);
    return wrapper;
  },
};

export const Required: Story = {
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'State of residence';
    wrapper.required = true;

    const el = document.createElement('civ-select') as any;
    el.name = 'state';
    el.required = true;
    el.options = STATES;

    wrapper.appendChild(el);
    return wrapper;
  },
};

export const Disabled: Story = {
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'State of residence';
    wrapper.disabled = true;

    const el = document.createElement('civ-select') as any;
    el.name = 'state';
    el.disabled = true;
    el.value = 'CA';
    el.options = STATES;

    wrapper.appendChild(el);
    return wrapper;
  },
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '24px';

    const configs = [
      { label: 'Normal', name: 'normal' },
      { label: 'With hint', name: 'hint', hint: 'Select where you currently reside' },
      { label: 'With error', name: 'error', error: 'Select a state', required: true },
      { label: 'Required', name: 'required', required: true },
      { label: 'Disabled', name: 'disabled', disabled: true, value: 'NY' },
    ];

    configs.forEach((cfg) => {
      const wrapper = document.createElement('civ-form-field') as any;
      wrapper.label = cfg.label;
      if (cfg.hint) wrapper.hint = cfg.hint;
      if (cfg.error) wrapper.error = cfg.error;
      if (cfg.required) wrapper.required = true;
      if (cfg.disabled) wrapper.disabled = true;

      const el = document.createElement('civ-select') as any;
      el.name = cfg.name;
      el.options = STATES;
      if (cfg.required) el.required = true;
      if (cfg.disabled) el.disabled = true;
      if (cfg.value) el.value = cfg.value;

      wrapper.appendChild(el);
      container.appendChild(wrapper);
    });

    return container;
  },
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '24px';

    const scales = [
      { attr: 'dense', label: 'Dense' },
      { attr: '', label: 'Default' },
      { attr: 'spacious', label: 'Spacious' },
    ];

    scales.forEach(({ attr, label }) => {
      const section = document.createElement('div');
      if (attr) section.setAttribute('data-civ-scale', attr);
      const p = document.createElement('p');
      p.style.margin = '0 0 8px';
      p.style.fontWeight = '600';
      p.textContent = label;
      section.appendChild(p);

      const field = document.createElement('civ-form-field') as any;
      field.label = 'State of residence';
      field.hint = 'Select where you currently reside';

      const el = document.createElement('civ-select') as any;
      el.name = `${attr || 'default'}-state`;
      el.options = STATES;

      field.appendChild(el);
      section.appendChild(field);
      wrapper.appendChild(section);
    });

    return wrapper;
  },
};

// ── Variants ──────────────────────────────────────────────────

export const OptionGroups: Story = {
  render: () => {
    const wrapper = document.createElement('civ-form-field') as any;
    wrapper.label = 'Department';
    wrapper.hint = 'Select your department';

    const el = document.createElement('civ-select') as any;
    el.name = 'department';
    el.options = [
      { value: 'hr', label: 'Human Resources', group: 'Administration' },
      { value: 'finance', label: 'Finance', group: 'Administration' },
      { value: 'legal', label: 'Legal', group: 'Administration' },
      { value: 'eng', label: 'Engineering', group: 'Technology' },
      { value: 'design', label: 'Design', group: 'Technology' },
      { value: 'security', label: 'Cybersecurity', group: 'Technology' },
      { value: 'policy', label: 'Policy', group: 'Operations' },
      { value: 'outreach', label: 'Public Outreach', group: 'Operations' },
    ];

    wrapper.appendChild(el);
    return wrapper;
  },
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentBenefitsForm: Story = {
  name: 'Usage: Benefits Application',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-form-field label="State of residence" required>
        <civ-select name="state" required></civ-select>
      </civ-form-field>
      <civ-form-field label="Benefit type" hint="Select the type of benefit you are applying for" required>
        <civ-select name="benefit" required></civ-select>
      </civ-form-field>
      <civ-button type="submit" class="civ-mt-4">Continue</civ-button>
    </form>
    <script>
      requestAnimationFrame(() => {
        const selects = document.querySelectorAll('civ-select');
        if (selects[0]) selects[0].options = ${JSON.stringify(STATES)};
        if (selects[1]) selects[1].options = [
          { value: 'health', label: 'Health care' },
          { value: 'education', label: 'Education' },
          { value: 'disability', label: 'Disability compensation' },
          { value: 'housing', label: 'Housing assistance' },
        ];
      });
    </script>
  `,
};

// ── Preset Stories ───────────────────────────────────────────

export const PresetServiceBranch: Story = {
  name: 'Preset: Service Branch',
  render: () => html`
    <civ-form-field label="Branch of service" required>
      <civ-select name="branch" preset="service-branch" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetServiceBranchReserve: Story = {
  name: 'Preset: Service Branch (Reserve)',
  render: () => html`
    <civ-form-field label="Branch of service" hint="Includes reserve components" required>
      <civ-select name="branch" preset="service-branch" preset-variant="reserve" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetUsState: Story = {
  name: 'Preset: US State',
  render: () => html`
    <civ-form-field label="State" required>
      <civ-select name="state" preset="us-state" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetUsStateWithTerritories: Story = {
  name: 'Preset: US State (Territories)',
  render: () => html`
    <civ-form-field label="State or territory" required>
      <civ-select name="state" preset="us-state" preset-variant="territories" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetGender: Story = {
  name: 'Preset: Gender',
  render: () => html`
    <civ-form-field label="Gender" required>
      <civ-select name="gender" preset="gender" required></civ-select>
    </civ-form-field>
  `,
};

export const PresetGenderBinary: Story = {
  name: 'Preset: Gender (Binary)',
  render: () => html`
    <civ-form-field label="Sex" required>
      <civ-select name="sex" preset="gender" preset-variant="binary" required></civ-select>
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

export const PresetDischargeType: Story = {
  name: 'Preset: Discharge Type',
  render: () => html`
    <civ-form-field label="Discharge type" required>
      <civ-select name="discharge" preset="discharge-type" required></civ-select>
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

// ── Declarative <option> slot fallback ────────────────────────

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
      <civ-form-field label="2xs">
        <civ-select width="2xs">
          <option value="1">1</option>
          <option value="2">2</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="xs">
        <civ-select width="xs">
          <option value="CA">CA</option>
          <option value="NY">NY</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="sm (state code)">
        <civ-select width="sm">
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="md">
        <civ-select width="md">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </civ-select>
      </civ-form-field>
      <civ-form-field label="lg">
        <civ-select width="lg">
          <option value="education">Education</option>
          <option value="housing">Housing</option>
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
