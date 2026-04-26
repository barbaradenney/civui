import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-text-input.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Text Input',
  component: 'civ-text-input',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'password', 'search', 'tel', 'url'],
    },
    width: {
      control: 'select',
      options: ['default', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Full name',
    name: 'full-name',
    hint: '',
    error: '',
    placeholder: '',
    type: 'text',
    width: 'default',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-text-input
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      placeholder="${args.placeholder}"
      type="${args.type}"
      width="${args.width}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-text-input>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-text-input
      label="Email address"
      name="email"
      hint="Enter your work or personal email address"
      type="email"
    ></civ-text-input>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-text-input
      label="Email address"
      name="email"
      error="Enter a valid email address"
      type="email"
    ></civ-text-input>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-text-input
      label="Full name"
      name="full-name"
      required
    ></civ-text-input>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-text-input
      label="Full name"
      name="full-name"
      value="Jane Doe"
      disabled
    ></civ-text-input>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-text-input label="Normal" name="normal"></civ-text-input>
      <civ-text-input label="With hint" name="hint" hint="Provide your legal first and last name"></civ-text-input>
      <civ-text-input label="With error" name="error" error="Enter your full name"></civ-text-input>
      <civ-text-input label="Required" name="required" required></civ-text-input>
      <civ-text-input label="Disabled" name="disabled" value="Cannot edit" disabled></civ-text-input>
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
        <civ-text-input label="Full name" name="dense-name" hint="Legal first and last name"></civ-text-input>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-text-input label="Full name" name="default-name" hint="Legal first and last name"></civ-text-input>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-text-input label="Full name" name="spacious-name" hint="Legal first and last name"></civ-text-input>
      </div>
    </div>
  `,
};

// ── Width Variants ────────────────────────────────────────────

export const WidthVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-text-input label="2xs width" name="w-2xs" width="2xs"></civ-text-input>
      <civ-text-input label="xs width" name="w-xs" width="xs"></civ-text-input>
      <civ-text-input label="sm width (ZIP code)" name="w-sm" width="sm"></civ-text-input>
      <civ-text-input label="md width" name="w-md" width="md"></civ-text-input>
      <civ-text-input label="lg width" name="w-lg" width="lg"></civ-text-input>
      <civ-text-input label="xl width" name="w-xl" width="xl"></civ-text-input>
      <civ-text-input label="2xl width" name="w-2xl" width="2xl"></civ-text-input>
      <civ-text-input label="Default (full width)" name="w-default"></civ-text-input>
    </div>
  `,
};

// ── Input Types ───────────────────────────────────────────────

export const InputTypes: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-text-input label="Text" name="text" type="text"></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" hint="For example: name@agency.gov"></civ-text-input>
      <civ-text-input label="Password" name="password" type="password"></civ-text-input>
      <civ-text-input label="Phone number" name="phone" type="tel" hint="For example: (555) 555-5555"></civ-text-input>
      <civ-text-input label="Website URL" name="url" type="url" hint="For example: https://agency.gov"></civ-text-input>
      <civ-text-input label="Number" name="number" type="number"></civ-text-input>
    </div>
  `,
};

// ── Mask Presets ──────────────────────────────────────────────

export const MaskSSN: Story = {
  name: 'Mask: Social Security number',
  render: () => html`
    <civ-text-input
      label="Social Security number"
      name="ssn"
      mask="ssn"
      hint="We need this to verify your identity"
      required
    ></civ-text-input>
  `,
};

export const MaskPhoneUS: Story = {
  name: 'Mask: Phone number',
  render: () => html`
    <civ-text-input
      label="Phone number"
      name="phone"
      mask="phone-us"
      hint="For example: (555) 123-4567"
    ></civ-text-input>
  `,
};

export const MaskZip: Story = {
  name: 'Mask: ZIP code',
  render: () => html`
    <civ-text-input
      label="ZIP code"
      name="zip"
      mask="zip"
      width="sm"
    ></civ-text-input>
  `,
};

export const MaskEIN: Story = {
  name: 'Mask: Employer Identification Number',
  render: () => html`
    <civ-text-input
      label="Employer Identification Number"
      name="ein"
      mask="ein"
    ></civ-text-input>
  `,
};

export const MaskCurrency: Story = {
  name: 'Mask: Currency',
  render: () => html`
    <civ-text-input
      label="Annual salary"
      name="salary"
      mask="currency"
    ></civ-text-input>
  `,
};

export const MaskCustom: Story = {
  name: 'Mask: Custom pattern',
  render: () => html`
    <civ-text-input
      label="Reference code"
      name="ref-code"
      mask-pattern="AAA-####"
      hint="For example: ABC-1234"
    ></civ-text-input>
  `,
};

// ── Character Counter ────────────────────────────────────────

export const CharacterCounter: Story = {
  name: 'Character counter',
  render: () => html`
    <civ-text-input
      label="Short bio"
      name="bio"
      maxlength="60"
      hint="A one-line description for the directory"
    ></civ-text-input>
  `,
};

export const CharacterCounterShortLimit: Story = {
  name: 'Character counter — over-limit styling',
  render: () => html`
    <civ-text-input
      label="Headline"
      name="headline"
      maxlength="20"
      value="This headline is way too long for the limit"
    ></civ-text-input>
  `,
};

// ── Declarative Validation ────────────────────────────────────

export const ValidateEmail: Story = {
  render: () => html`
    <civ-text-input
      label="Email address"
      name="email"
      type="email"
      validate="email"
      hint="For example: name@agency.gov"
      required
    ></civ-text-input>
  `,
};

export const ValidateZIP: Story = {
  render: () => html`
    <civ-text-input
      label="ZIP code"
      name="zip"
      validate="zip"
      inputmode="numeric"
      width="xs"
      hint="5-digit ZIP code"
    ></civ-text-input>
  `,
};

// ── Inline icons ──────────────────────────────────────────────

export const LeadingIcon: Story = {
  name: 'Inline: Leading icon',
  render: () => html`
    <civ-text-input
      label="Search"
      name="search"
      type="search"
      leading-icon="search"
      placeholder="Find a benefit"
    ></civ-text-input>
  `,
};

export const TrailingIcon: Story = {
  name: 'Inline: Trailing icon',
  render: () => html`
    <civ-text-input
      label="Username"
      name="username"
      trailing-icon="info"
      trailing-icon-label="More info"
      hint="3-20 characters, letters and numbers only"
    ></civ-text-input>
  `,
};

export const LeadingAndTrailingIcons: Story = {
  name: 'Inline: Leading + trailing icons',
  render: () => html`
    <civ-text-input
      label="Search filings"
      name="filing-search"
      type="search"
      leading-icon="search"
      trailing-icon="info"
      trailing-icon-label="Search tips"
    ></civ-text-input>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentContactForm: Story = {
  name: 'Usage: Government Contact Form',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-text-input label="Full name" name="full-name" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required hint="For example: name@agency.gov" validate="email"></civ-text-input>
      <civ-text-input label="Phone number" name="phone" type="tel" mask="phone-us" hint="For example: (555) 123-4567"></civ-text-input>
      <civ-text-input label="Social Security number" name="ssn" mask="ssn" required hint="We need this to verify your identity"></civ-text-input>
      <civ-button type="submit" class="civ-mt-4">Submit</civ-button>
    </form>
  `,
};
