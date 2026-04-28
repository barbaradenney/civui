import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-textarea.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Textarea',
  component: 'civ-textarea',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    maxlength: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Additional comments',
    name: 'comments',
    hint: '',
    error: '',
    placeholder: '',
    rows: 5,
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-form-field
      label="${args.label}"
      hint="${args.hint || ''}"
      error="${args.error || ''}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-textarea
        name="${args.name}"
        placeholder="${args.placeholder || ''}"
        rows="${args.rows || 5}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-textarea>
    </civ-form-field>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-field label="Reason for applying" hint="Describe why you are applying for this benefit in your own words">
      <civ-textarea name="reason"></civ-textarea>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-field label="Reason for applying" error="Enter a reason for applying" required>
      <civ-textarea name="reason" required></civ-textarea>
    </civ-form-field>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-field label="Description of incident" required>
      <civ-textarea name="description" required></civ-textarea>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-field label="Previous submission" disabled>
      <civ-textarea
        name="previous"
        value="This field cannot be edited after submission."
        disabled
      ></civ-textarea>
    </civ-form-field>
  `,
};

export const WithCharacterCount: Story = {
  render: () => html`
    <civ-form-field label="Personal statement" hint="Summarize your qualifications">
      <civ-textarea name="statement" maxlength="500"></civ-textarea>
    </civ-form-field>
  `,
};

export const WithWordCount: Story = {
  render: () => html`
    <civ-form-field label="Personal statement" hint="Describe your qualifications in 250 words or fewer">
      <civ-textarea name="statement" maxwords="250" rows="8"></civ-textarea>
    </civ-form-field>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-form-field label="Normal">
        <civ-textarea name="normal"></civ-textarea>
      </civ-form-field>
      <civ-form-field label="With hint" hint="Provide additional details about your situation">
        <civ-textarea name="hint"></civ-textarea>
      </civ-form-field>
      <civ-form-field label="With error" error="This field is required" required>
        <civ-textarea name="error" required></civ-textarea>
      </civ-form-field>
      <civ-form-field label="Required" required>
        <civ-textarea name="required" required></civ-textarea>
      </civ-form-field>
      <civ-form-field label="Disabled" disabled>
        <civ-textarea name="disabled" value="Cannot be edited" disabled></civ-textarea>
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
        <civ-form-field label="Additional comments" hint="Provide any relevant details">
          <civ-textarea name="dense-comments"></civ-textarea>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-field label="Additional comments" hint="Provide any relevant details">
          <civ-textarea name="default-comments"></civ-textarea>
        </civ-form-field>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-field label="Additional comments" hint="Provide any relevant details">
          <civ-textarea name="spacious-comments"></civ-textarea>
        </civ-form-field>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentAppealForm: Story = {
  name: 'Usage: Appeal Justification',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-form-field
        label="Reason for appeal"
        hint="Explain why you believe the decision was incorrect. Include relevant dates and reference numbers."
        required
      >
        <civ-textarea
          name="appeal-reason"
          maxlength="2000"
          rows="8"
          required
        ></civ-textarea>
      </civ-form-field>
      <civ-button type="submit" class="civ-mt-4">Submit appeal</civ-button>
    </form>
  `,
};

// ── Declarative length validation ─────────────────────────────

export const ValidateLength: Story = {
  name: 'Validate: length (min + max)',
  render: () => html`
    <civ-form-field label="Why you're applying" hint="Tell us in a few sentences. Minimum 20 characters, maximum 500.">
      <civ-textarea
        name="why"
        validate="length"
        minlength="20"
        maxlength="500"
      ></civ-textarea>
    </civ-form-field>
  `,
};

export const ValidateMinLength: Story = {
  name: 'Validate: length (min only)',
  render: () => html`
    <civ-form-field label="Describe what happened" hint="Please give us at least 50 characters of detail.">
      <civ-textarea
        name="what-happened"
        validate="length"
        minlength="50"
      ></civ-textarea>
    </civ-form-field>
  `,
};
