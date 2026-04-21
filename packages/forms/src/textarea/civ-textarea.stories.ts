import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-textarea.js';

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
    <civ-textarea
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint || ''}"
      error="${args.error || ''}"
      placeholder="${args.placeholder || ''}"
      rows="${args.rows || 5}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-textarea>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-textarea
      label="Reason for applying"
      name="reason"
      hint="Describe why you are applying for this benefit in your own words"
    ></civ-textarea>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-textarea
      label="Reason for applying"
      name="reason"
      error="Enter a reason for applying"
      required
    ></civ-textarea>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-textarea
      label="Description of incident"
      name="description"
      required
    ></civ-textarea>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-textarea
      label="Previous submission"
      name="previous"
      value="This field cannot be edited after submission."
      disabled
    ></civ-textarea>
  `,
};

export const WithCharacterCount: Story = {
  render: () => html`
    <civ-textarea
      label="Personal statement"
      name="statement"
      hint="Summarize your qualifications"
      maxlength="500"
    ></civ-textarea>
  `,
};

export const WithWordCount: Story = {
  render: () => html`
    <civ-textarea
      label="Personal statement"
      name="statement"
      hint="Describe your qualifications in 250 words or fewer"
      maxwords="250"
      rows="8"
    ></civ-textarea>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <civ-textarea label="Normal" name="normal"></civ-textarea>
      <civ-textarea label="With hint" name="hint" hint="Provide additional details about your situation"></civ-textarea>
      <civ-textarea label="With error" name="error" error="This field is required" required></civ-textarea>
      <civ-textarea label="Required" name="required" required></civ-textarea>
      <civ-textarea label="Disabled" name="disabled" value="Cannot be edited" disabled></civ-textarea>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-textarea label="Additional comments" name="dense-comments" hint="Provide any relevant details"></civ-textarea>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-textarea label="Additional comments" name="default-comments" hint="Provide any relevant details"></civ-textarea>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-textarea label="Additional comments" name="spacious-comments" hint="Provide any relevant details"></civ-textarea>
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
      <civ-textarea
        label="Reason for appeal"
        name="appeal-reason"
        hint="Explain why you believe the decision was incorrect. Include relevant dates and reference numbers."
        maxlength="2000"
        rows="8"
        required
      ></civ-textarea>
      <button type="submit" style="margin-top: 16px; padding: 8px 24px; background: #005ea2; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Submit appeal
      </button>
    </form>
  `,
};
