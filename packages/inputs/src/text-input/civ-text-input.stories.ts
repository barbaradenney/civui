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
    <civ-text-input label="${args.label}" name="${args.name}" hint="${args.hint}" error="${args.error}" placeholder="${args.placeholder}" type="${args.type}" width="${args.width}" ?required="${args.required}" ?disabled="${args.disabled}"></civ-text-input>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-text-input label="Full name" name="full-name" hint="Enter your legal first and last name"></civ-text-input>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-text-input label="Full name" name="full-name" error="Enter your full name"></civ-text-input>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-text-input label="Full name" name="full-name" required></civ-text-input>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-text-input label="Full name" name="full-name" value="Jane Doe" disabled></civ-text-input>
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
      <civ-text-input label="sm width" name="w-sm" width="sm"></civ-text-input>
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
      <civ-text-input label="Password" name="password" type="password"></civ-text-input>
      <civ-text-input label="Search" name="search" type="search" leading-icon="search"></civ-text-input>
      <civ-text-input label="Number" name="number" type="number"></civ-text-input>
    </div>
  `,
};

// ── Custom Mask Pattern ─────────────────────────────────────

export const MaskCustom: Story = {
  name: 'Mask: Custom pattern',
  render: () => html`
    <civ-text-input label="Reference code" name="ref-code" hint="For example: ABC-1234" mask-pattern="AAA-####"></civ-text-input>
  `,
};

// ── Character Counter ────────────────────────────────────────

export const CharacterCounter: Story = {
  name: 'Character counter',
  render: () => html`
    <civ-text-input label="Short bio" name="bio" hint="A one-line description for the directory" maxlength="60"></civ-text-input>
  `,
};

export const CharacterCounterShortLimit: Story = {
  name: 'Character counter — over-limit styling',
  render: () => html`
    <civ-text-input label="Headline" name="headline" value="This headline is way too long for the limit" maxlength="20"></civ-text-input>
  `,
};

// ── Inline icons ──────────────────────────────────────────────

export const LeadingIcon: Story = {
  name: 'Inline: Leading icon',
  render: () => html`
    <civ-text-input label="Search" name="search" type="search" leading-icon="search" placeholder="Find a benefit"></civ-text-input>
  `,
};

export const TrailingIcon: Story = {
  name: 'Inline: Trailing icon',
  render: () => html`
    <civ-text-input label="Username" name="username" hint="3-20 characters, letters and numbers only" trailing-icon="info" trailing-icon-label="More info"></civ-text-input>
  `,
};

export const LeadingAndTrailingIcons: Story = {
  name: 'Inline: Leading + trailing icons',
  render: () => html`
    <civ-text-input label="Search filings" name="filing-search" type="search" leading-icon="search" trailing-icon="info" trailing-icon-label="Search tips"></civ-text-input>
  `,
};

export const Clearable: Story = {
  name: 'Inline: Clearable',
  render: () => html`
    <civ-text-input
      label="Search filings"
      name="filing-search"
      type="search"
      leading-icon="search"
      value="VA disability"
      clearable
    ></civ-text-input>
    <p class="civ-mt-3 civ-text-sm">
      Type to see the clear button appear. Suppresses any trailing icon while the value is non-empty.
    </p>
  `,
};

export const TrailingActionSlot: Story = {
  name: 'Inline: Trailing action slot (escape hatch)',
  render: () => html`
    <civ-text-input label="API key" name="api-key" value="sk-abc123def456ghi789">
      <button
        data-trailing-action
        type="button"
        class="civ-input-action"
        aria-label="Copy API key"
        @click=${(e: Event) => {
          const host = (e.currentTarget as HTMLElement).closest('civ-text-input');
          if (host && 'value' in host) navigator.clipboard?.writeText(String(host.value ?? ''));
        }}
      >
        <civ-icon name="content_copy" aria-hidden="true"></civ-icon>
      </button>
    </civ-text-input>
    <p class="civ-mt-3 civ-text-sm">
      Use the <code>data-trailing-action</code> slot for affordances we don't ship as props (copy, paste, scan, generate, units toggle). Apply <code>.civ-input-action</code> to match the input chrome.
    </p>
  `,
};

// ── Prefix / Suffix ─────────────────────────────────────────

export const Prefix: Story = {
  name: 'Prefix',
  render: () => html`
    <civ-text-input label="Social handle" name="handle" prefix="@" width="md"></civ-text-input>
  `,
};

export const Suffix: Story = {
  name: 'Suffix',
  render: () => html`
    <civ-text-input label="Weight" name="weight" suffix="lbs" inputmode="decimal" width="sm"></civ-text-input>
  `,
};

// ── Specialized Presets ─────────────────────────────────────────
// Pre-configured text inputs for common government form fields.
// Each provides default label, hint, mask, validation, and inputmode.

export const SSN: Story = {
  name: 'Preset: SSN (Social Security Number)',
  render: () => html`
    <civ-ssn label="Social Security number" name="ssn" required></civ-ssn>
  `,
};

export const SSNLast4: Story = {
  name: 'Preset: SSN (Last 4)',
  render: () => html`
    <civ-ssn label="Last 4 digits of Social Security number" name="ssn" required mode="last4"></civ-ssn>
  `,
};

export const EIN: Story = {
  name: 'Preset: EIN (Employer ID Number)',
  render: () => html`
    <civ-ein label="Employer Identification Number" name="ein" required></civ-ein>
  `,
};

export const ZIPCode: Story = {
  name: 'Preset: ZIP Code',
  render: () => html`
    <civ-zip label="ZIP code" name="zip" required></civ-zip>
  `,
};

export const ZIPPlus4: Story = {
  name: 'Preset: ZIP+4',
  render: () => html`
    <civ-zip label="ZIP+4 code" name="zip" extended></civ-zip>
  `,
};

export const PhoneUS: Story = {
  name: 'Preset: Phone (US)',
  render: () => html`
    <civ-phone label="Phone number" name="phone" required></civ-phone>
  `,
};

export const PhoneInternational: Story = {
  name: 'Preset: Phone (International)',
  render: () => html`
    <civ-phone label="Phone number" name="phone" international></civ-phone>
  `,
};

export const Email: Story = {
  name: 'Preset: Email',
  render: () => html`
    <civ-email label="Email address" name="email" required></civ-email>
  `,
};

export const Currency: Story = {
  name: 'Preset: Currency',
  render: () => html`
    <civ-currency label="Annual income" name="income"></civ-currency>
  `,
};

export const RoutingNumber: Story = {
  name: 'Preset: Routing Number',
  render: () => html`
    <civ-routing-number label="Routing number" name="routing" required></civ-routing-number>
  `,
};

export const VAFileNumber: Story = {
  name: 'Preset: VA File Number',
  render: () => html`
    <civ-va-file-number label="VA file number" name="vaFileNumber"></civ-va-file-number>
  `,
};

export const AllPresets: Story = {
  name: 'All Presets',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2" style="max-width: 480px;">
      <civ-ssn label="Social Security number" name="ssn"></civ-ssn>
      <civ-ein label="Employer ID Number" name="ein"></civ-ein>
      <civ-zip label="ZIP code" name="zip"></civ-zip>
      <civ-phone label="Phone number" name="phone"></civ-phone>
      <civ-email label="Email address" name="email"></civ-email>
      <civ-currency label="Annual income" name="income"></civ-currency>
      <civ-routing-number label="Routing number" name="routing"></civ-routing-number>
      <civ-va-file-number label="VA file number" name="vaFileNumber"></civ-va-file-number>
    </div>
  `,
};

// ── spacing="sm" — compact mode for dense surfaces ────────────

export const Spacing: Story = {
  name: 'Spacing — default vs sm',
  parameters: {
    docs: {
      description: {
        story:
          '`spacing="sm"` renders just the bare `<input>` with no label / hint / error chrome. ' +
          'The host\'s `aria-label` is propagated to the inner control so screen readers still hear a name. ' +
          'For dense surfaces like data-grid cell editors. Mask + validate behavior is preserved.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">Default</p>
        <civ-text-input label="Applicant name" name="name-default" hint="First and last"></civ-text-input>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">spacing="sm"</p>
        <p class="civ-m-0 civ-mb-2 civ-text-sm">Bare input, no chrome. aria-label on the host names the control for AT.</p>
        <civ-text-input spacing="sm" aria-label="Applicant name" name="name-compact"></civ-text-input>
      </div>
    </div>
  `,
};
