import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
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
