import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-text-input.js';
import '../ssn/civ-ssn.js';
import '../ein/civ-ein.js';
import '../zip/civ-zip.js';
import '../phone/civ-phone.js';
import '../email/civ-email.js';
import '../currency/civ-currency.js';
import '../routing-number/civ-routing-number.js';
import '../va-file-number/civ-va-file-number.js';
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
    <civ-form-field
      label="${args.label}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-text-input
        name="${args.name}"
        placeholder="${args.placeholder}"
        type="${args.type}"
        width="${args.width}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-text-input>
    </civ-form-field>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-field label="Full name" hint="Enter your legal first and last name">
      <civ-text-input name="full-name"></civ-text-input>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-field label="Full name" error="Enter your full name">
      <civ-text-input name="full-name"></civ-text-input>
    </civ-form-field>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-field label="Full name" required>
      <civ-text-input name="full-name" required></civ-text-input>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-field label="Full name" disabled>
      <civ-text-input name="full-name" value="Jane Doe" disabled></civ-text-input>
    </civ-form-field>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-form-field label="Normal">
        <civ-text-input name="normal"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="With hint" hint="Provide your legal first and last name">
        <civ-text-input name="hint"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="With error" error="Enter your full name">
        <civ-text-input name="error"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Required" required>
        <civ-text-input name="required" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Disabled" disabled>
        <civ-text-input name="disabled" value="Cannot edit" disabled></civ-text-input>
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
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-form-field label="Full name" hint="Legal first and last name">
          <civ-text-input name="dense-name"></civ-text-input>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-field label="Full name" hint="Legal first and last name">
          <civ-text-input name="default-name"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-field label="Full name" hint="Legal first and last name">
          <civ-text-input name="spacious-name"></civ-text-input>
        </civ-form-field>
      </div>
    </div>
  `,
};

// ── Width Variants ────────────────────────────────────────────

export const WidthVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-form-field label="2xs width">
        <civ-text-input name="w-2xs" width="2xs"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="xs width">
        <civ-text-input name="w-xs" width="xs"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="sm width">
        <civ-text-input name="w-sm" width="sm"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="md width">
        <civ-text-input name="w-md" width="md"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="lg width">
        <civ-text-input name="w-lg" width="lg"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="xl width">
        <civ-text-input name="w-xl" width="xl"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="2xl width">
        <civ-text-input name="w-2xl" width="2xl"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Default (full width)">
        <civ-text-input name="w-default"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

// ── Input Types ───────────────────────────────────────────────

export const InputTypes: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-form-field label="Text">
        <civ-text-input name="text" type="text"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Password">
        <civ-text-input name="password" type="password"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Search">
        <civ-text-input name="search" type="search" leading-icon="search"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Number">
        <civ-text-input name="number" type="number"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

// ── Custom Mask Pattern ─────────────────────────────────────

export const MaskCustom: Story = {
  name: 'Mask: Custom pattern',
  render: () => html`
    <civ-form-field label="Reference code" hint="For example: ABC-1234">
      <civ-text-input name="ref-code" mask-pattern="AAA-####"></civ-text-input>
    </civ-form-field>
  `,
};

// ── Character Counter ────────────────────────────────────────

export const CharacterCounter: Story = {
  name: 'Character counter',
  render: () => html`
    <civ-form-field label="Short bio" hint="A one-line description for the directory">
      <civ-text-input name="bio" maxlength="60"></civ-text-input>
    </civ-form-field>
  `,
};

export const CharacterCounterShortLimit: Story = {
  name: 'Character counter — over-limit styling',
  render: () => html`
    <civ-form-field label="Headline">
      <civ-text-input
        name="headline"
        maxlength="20"
        value="This headline is way too long for the limit"
      ></civ-text-input>
    </civ-form-field>
  `,
};

// ── Inline icons ──────────────────────────────────────────────

export const LeadingIcon: Story = {
  name: 'Inline: Leading icon',
  render: () => html`
    <civ-form-field label="Search">
      <civ-text-input
        name="search"
        type="search"
        leading-icon="search"
        placeholder="Find a benefit"
      ></civ-text-input>
    </civ-form-field>
  `,
};

export const TrailingIcon: Story = {
  name: 'Inline: Trailing icon',
  render: () => html`
    <civ-form-field label="Username" hint="3-20 characters, letters and numbers only">
      <civ-text-input
        name="username"
        trailing-icon="info"
        trailing-icon-label="More info"
      ></civ-text-input>
    </civ-form-field>
  `,
};

export const LeadingAndTrailingIcons: Story = {
  name: 'Inline: Leading + trailing icons',
  render: () => html`
    <civ-form-field label="Search filings">
      <civ-text-input
        name="filing-search"
        type="search"
        leading-icon="search"
        trailing-icon="info"
        trailing-icon-label="Search tips"
      ></civ-text-input>
    </civ-form-field>
  `,
};

// ── Prefix / Suffix ─────────────────────────────────────────

export const Prefix: Story = {
  name: 'Prefix',
  render: () => html`
    <civ-form-field label="Social handle">
      <civ-text-input name="handle" prefix="@" width="md"></civ-text-input>
    </civ-form-field>
  `,
};

export const Suffix: Story = {
  name: 'Suffix',
  render: () => html`
    <civ-form-field label="Weight">
      <civ-text-input name="weight" suffix="lbs" inputmode="decimal" width="sm"></civ-text-input>
    </civ-form-field>
  `,
};

// ── Specialized Presets ─────────────────────────────────────────
// Pre-configured text inputs for common government form fields.
// Each provides default label, hint, mask, validation, and inputmode.

export const SSN: Story = {
  name: 'Preset: Social Security Number',
  render: () => html`
    <civ-form-field label="Social Security number" required>
      <civ-ssn name="ssn" required></civ-ssn>
    </civ-form-field>
  `,
};

export const SSNLast4: Story = {
  name: 'Preset: SSN (Last 4)',
  render: () => html`
    <civ-form-field label="Last 4 digits of Social Security number" required>
      <civ-ssn name="ssn" mode="last4" required></civ-ssn>
    </civ-form-field>
  `,
};

export const EIN: Story = {
  name: 'Preset: Employer ID Number',
  render: () => html`
    <civ-form-field label="Employer Identification Number" required>
      <civ-ein name="ein" required></civ-ein>
    </civ-form-field>
  `,
};

export const ZIPCode: Story = {
  name: 'Preset: ZIP Code',
  render: () => html`
    <civ-form-field label="ZIP code" required>
      <civ-zip name="zip" required></civ-zip>
    </civ-form-field>
  `,
};

export const ZIPPlus4: Story = {
  name: 'Preset: ZIP+4',
  render: () => html`
    <civ-form-field label="ZIP+4 code">
      <civ-zip name="zip" extended></civ-zip>
    </civ-form-field>
  `,
};

export const PhoneUS: Story = {
  name: 'Preset: Phone (US)',
  render: () => html`
    <civ-form-field label="Phone number" required>
      <civ-phone name="phone" required></civ-phone>
    </civ-form-field>
  `,
};

export const PhoneInternational: Story = {
  name: 'Preset: Phone (International)',
  render: () => html`
    <civ-form-field label="Phone number">
      <civ-phone name="phone" international></civ-phone>
    </civ-form-field>
  `,
};

export const Email: Story = {
  name: 'Preset: Email',
  render: () => html`
    <civ-form-field label="Email address" required>
      <civ-email name="email" required></civ-email>
    </civ-form-field>
  `,
};

export const Currency: Story = {
  name: 'Preset: Currency',
  render: () => html`
    <civ-form-field label="Annual income">
      <civ-currency name="income"></civ-currency>
    </civ-form-field>
  `,
};

export const RoutingNumber: Story = {
  name: 'Preset: Routing Number',
  render: () => html`
    <civ-form-field label="Routing number" required>
      <civ-routing-number name="routing" required></civ-routing-number>
    </civ-form-field>
  `,
};

export const VAFileNumber: Story = {
  name: 'Preset: VA File Number',
  render: () => html`
    <civ-form-field label="VA file number">
      <civ-va-file-number name="vaFileNumber"></civ-va-file-number>
    </civ-form-field>
  `,
};

export const AllPresets: Story = {
  name: 'All Presets',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2" style="max-width: 480px;">
      <civ-form-field label="Social Security number">
        <civ-ssn name="ssn"></civ-ssn>
      </civ-form-field>
      <civ-form-field label="Employer ID Number">
        <civ-ein name="ein"></civ-ein>
      </civ-form-field>
      <civ-form-field label="ZIP code">
        <civ-zip name="zip"></civ-zip>
      </civ-form-field>
      <civ-form-field label="Phone number">
        <civ-phone name="phone"></civ-phone>
      </civ-form-field>
      <civ-form-field label="Email address">
        <civ-email name="email"></civ-email>
      </civ-form-field>
      <civ-form-field label="Annual income">
        <civ-currency name="income"></civ-currency>
      </civ-form-field>
      <civ-form-field label="Routing number">
        <civ-routing-number name="routing"></civ-routing-number>
      </civ-form-field>
      <civ-form-field label="VA file number">
        <civ-va-file-number name="vaFileNumber"></civ-va-file-number>
      </civ-form-field>
    </div>
  `,
};
