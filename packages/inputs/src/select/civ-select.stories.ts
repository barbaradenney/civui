import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-select.js';
import '@civui/ui';

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
    const el = document.createElement('civ-select') as any;
    el.label = args.label;
    el.name = args.name;
    el.value = args.value;
    el.hint = args.hint;
    el.error = args.error;
    el.emptyLabel = args.emptyLabel;
    el.options = STATES;
    el.required = args.required;
    el.disabled = args.disabled;
    return el;
  },
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.hint = 'Select the state where you currently live';
    el.options = STATES;
    return el;
  },
};

export const WithError: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.error = 'Select a state to continue';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Required: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Disabled: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.disabled = true;
    el.value = 'CA';
    el.options = STATES;
    return el;
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
      const el = document.createElement('civ-select') as any;
      el.label = cfg.label;
      el.name = cfg.name;
      el.options = STATES;
      if (cfg.hint) el.hint = cfg.hint;
      if (cfg.error) el.error = cfg.error;
      if (cfg.required) el.required = true;
      if (cfg.disabled) el.disabled = true;
      if (cfg.value) el.value = cfg.value;
      container.appendChild(el);
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

      const el = document.createElement('civ-select') as any;
      el.label = 'State of residence';
      el.name = `${attr || 'default'}-state`;
      el.hint = 'Select where you currently reside';
      el.options = STATES;
      section.appendChild(el);
      wrapper.appendChild(section);
    });

    return wrapper;
  },
};

// ── Variants ──────────────────────────────────────────────────

export const OptionGroups: Story = {
  render: () => {
    const el = document.createElement('civ-select') as any;
    el.label = 'Department';
    el.name = 'department';
    el.hint = 'Select your department';
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
    return el;
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
      <civ-select label="State of residence" name="state" required></civ-select>
      <civ-select label="Benefit type" name="benefit" required hint="Select the type of benefit you are applying for"></civ-select>
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

// ── Declarative <option> slot fallback ────────────────────────

export const SlottedOptions: Story = {
  name: 'Declarative <option> slot',
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
      <civ-select label="2xs" width="2xs">
        <option value="1">1</option>
        <option value="2">2</option>
      </civ-select>
      <civ-select label="xs" width="xs">
        <option value="CA">CA</option>
        <option value="NY">NY</option>
      </civ-select>
      <civ-select label="sm (state code)" width="sm">
        <option value="CA">California</option>
        <option value="NY">New York</option>
      </civ-select>
      <civ-select label="md" width="md">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </civ-select>
      <civ-select label="lg" width="lg">
        <option value="education">Education</option>
        <option value="housing">Housing</option>
      </civ-select>
      <civ-select label="default (full width)">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </civ-select>
    </div>
  `,
};
