import type { Meta, StoryObj } from '@storybook/web-components';
import './civ-combobox.js';

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
    noResultsText: { control: 'text' },
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
    noResultsText: 'No results found',
    required: false,
    disabled: false,
  },
  render: (args) => {
    const el = document.createElement('civ-combobox') as any;
    el.label = args.label;
    el.name = args.name;
    el.placeholder = args.placeholder;
    el.hint = args.hint;
    el.error = args.error;
    el.value = args.value;
    el.noResultsText = args.noResultsText;
    el.options = STATES;
    el.required = args.required;
    el.disabled = args.disabled;
    return el;
  },
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.hint = 'Type to search or use arrow keys to browse';
    el.options = STATES;
    return el;
  },
};

export const WithError: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.error = 'Select a valid state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Required: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'State of residence';
    el.name = 'state';
    el.required = true;
    el.options = STATES;
    return el;
  },
};

export const Disabled: Story = {
  render: () => {
    const el = document.createElement('civ-combobox') as any;
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
      { label: 'With hint', name: 'hint', hint: 'Type to search' },
      { label: 'With error', name: 'error', error: 'Select a state', required: true },
      { label: 'Required', name: 'required', required: true },
      { label: 'Disabled', name: 'disabled', disabled: true, value: 'TX' },
    ];

    configs.forEach((cfg) => {
      const el = document.createElement('civ-combobox') as any;
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

      const el = document.createElement('civ-combobox') as any;
      el.label = 'State of residence';
      el.name = `${attr || 'default'}-state`;
      el.hint = 'Type to search states';
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
    const el = document.createElement('civ-combobox') as any;
    el.label = 'Office location';
    el.name = 'office';
    el.placeholder = 'Search offices...';
    el.options = [
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
    return el;
  },
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentOfficeSearch: Story = {
  name: 'Usage: Office Location Search',
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.label = 'Nearest field office';
    el.name = 'office';
    el.hint = 'Search by city or office name to find appointments';
    el.placeholder = 'Type a city or office name...';
    el.required = true;
    el.options = [
      { value: 'dc-hq', label: 'Washington DC - Headquarters', group: 'East Coast' },
      { value: 'ny-field', label: 'New York - Federal Plaza', group: 'East Coast' },
      { value: 'boston', label: 'Boston - JFK Federal Building', group: 'East Coast' },
      { value: 'sf-field', label: 'San Francisco - Federal Building', group: 'West Coast' },
      { value: 'la-field', label: 'Los Angeles - Federal Building', group: 'West Coast' },
      { value: 'chicago', label: 'Chicago - Dirksen Building', group: 'Midwest' },
      { value: 'denver', label: 'Denver - Byron Rogers Building', group: 'Mountain' },
    ];
    return el;
  },
};

// ── Width variants ────────────────────────────────────────────

export const WidthVariants: Story = {
  name: 'Width variants',
  render: () => {
    const wrap = document.createElement('div');
    wrap.className = 'civ-flex civ-flex-col civ-gap-4';
    for (const w of ['xs', 'sm', 'md', 'lg', 'default']) {
      const el = document.createElement('civ-combobox') as any;
      el.setAttribute('label', `Width: ${w}`);
      if (w !== 'default') el.setAttribute('width', w);
      el.options = STATES;
      wrap.appendChild(el);
    }
    return wrap;
  },
};

// ── Chevron toggle (decorative — present on every combobox) ───

export const ChevronToggle: Story = {
  name: 'Chevron toggle',
  parameters: {
    docs: {
      description: {
        story:
          'Click the trailing chevron to open the full unfiltered list — same affordance as a native <select>. The chevron is decorative (aria-hidden, tabindex=-1); keyboard users still use ArrowDown/ArrowUp to open. Coexists with the clear button when a value is selected.',
      },
    },
  },
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.setAttribute('label', 'State');
    el.setAttribute('name', 'state');
    el.options = STATES;
    return el;
  },
};

// ── Async loadOptions ─────────────────────────────────────────

const SAMPLE_AGENCIES = [
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

export const AsyncLoading: Story = {
  name: 'Async: remote loadOptions',
  parameters: {
    docs: {
      description: {
        story:
          'When `loadOptions` is set the combobox switches into remote mode. The function is called (debounced, 300ms by default) with the typed query and is expected to return matching options. Loading, error, and below-min-query states each get their own dropdown message. Stale responses are discarded automatically so a slow network response never overwrites newer results.',
      },
    },
  },
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.setAttribute('label', 'Federal agency');
    el.setAttribute('name', 'agency');
    el.setAttribute('hint', 'Type to search across federal agencies');
    el.setAttribute('placeholder', 'Type an agency name...');
    el.loadOptions = async (q: string) => {
      // Simulated network latency
      await new Promise((r) => setTimeout(r, 400));
      const lower = q.toLowerCase();
      return SAMPLE_AGENCIES.filter((a) => a.label.toLowerCase().includes(lower));
    };
    return el;
  },
};

export const AsyncWithMinQuery: Story = {
  name: 'Async: with min-query-length',
  parameters: {
    docs: {
      description: {
        story:
          'Set `min-query-length` so the loader is not called for vague short queries. The dropdown shows a "Type at least N characters" prompt until the threshold is met.',
      },
    },
  },
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.setAttribute('label', 'Federal agency');
    el.setAttribute('name', 'agency');
    el.setAttribute('min-query-length', '3');
    el.setAttribute('placeholder', 'Type at least 3 characters...');
    el.loadOptions = async (q: string) => {
      await new Promise((r) => setTimeout(r, 250));
      const lower = q.toLowerCase();
      return SAMPLE_AGENCIES.filter((a) => a.label.toLowerCase().includes(lower));
    };
    return el;
  },
};

export const AsyncError: Story = {
  name: 'Async: error state',
  parameters: {
    docs: {
      description: {
        story:
          'When `loadOptions` rejects, the dropdown shows the error message in a `role="alert"` region. Customize via `loading-error-text`.',
      },
    },
  },
  render: () => {
    const el = document.createElement('civ-combobox') as any;
    el.setAttribute('label', 'Federal agency');
    el.setAttribute('name', 'agency');
    el.loadOptions = async () => {
      await new Promise((r) => setTimeout(r, 400));
      throw new Error('Network unavailable');
    };
    return el;
  },
};
