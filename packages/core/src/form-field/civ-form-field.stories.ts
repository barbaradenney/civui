import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Core/Form Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
\`<civ-form-field>\` wraps a single form control with a label, hint, and error message.
Every form input (text-input, textarea, select, combobox, date-picker, file-upload)
should be wrapped in a form-field.

\`<civ-form-fieldset>\` does the same for group controls (radio-group, checkbox-group,
segmented-control, yes-no, memorable-date, date-range-picker) using a native
\`<fieldset>\` + \`<legend>\` instead of a \`<label>\`.

Both components:
- Render label/hint/error with consistent spacing via \`renderFormHeader()\`
- Cascade \`required\` and \`disabled\` to the child control
- Wire \`aria-describedby\`, \`aria-invalid\`, and \`aria-required\` to the child's native input
- Provide the outer \`civ-mb-4\` spacing between fields

**Self-contained components** (checkbox, toggle, and all compound components like
address, name, signature) render their own labels and do NOT need wrappers.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── civ-form-field ─────────────────────────────────────────────

export const BasicTextField: Story = {
  name: 'Text Input',
  render: () => html`
    <civ-form-field label="Full legal name" hint="As it appears on your government-issued ID" required>
      <civ-text-input name="name" required></civ-text-input>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`
    <civ-form-field label="Email address" error="Enter a valid email address" required>
      <civ-text-input type="email" name="email" value="not-an-email" required></civ-text-input>
    </civ-form-field>
  `,
};

export const Textarea: Story = {
  name: 'Textarea',
  render: () => html`
    <civ-form-field label="Describe your condition" hint="Include how it affects your daily activities">
      <civ-textarea name="condition" rows="4"></civ-textarea>
    </civ-form-field>
  `,
};

export const Select: Story = {
  name: 'Select',
  render: () => html`
    <civ-form-field label="Branch of service" required>
      <civ-select name="branch" required>
        <option value="army">Army</option>
        <option value="navy">Navy</option>
        <option value="airforce">Air Force</option>
        <option value="marines">Marines</option>
        <option value="coastguard">Coast Guard</option>
        <option value="spaceforce">Space Force</option>
      </civ-select>
    </civ-form-field>
  `,
};

export const DatePicker: Story = {
  name: 'Date Picker',
  render: () => html`
    <civ-form-field label="Appointment date" hint="Select your preferred date">
      <civ-date-picker name="appointment"></civ-date-picker>
    </civ-form-field>
  `,
};

export const FileUpload: Story = {
  name: 'File Upload',
  render: () => html`
    <civ-form-field label="Supporting documents" hint="Upload DD-214, medical records, or other evidence">
      <civ-file-upload name="docs" accept=".pdf,.jpg,.png" multiple></civ-file-upload>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => html`
    <civ-form-field label="Social Security number" disabled>
      <civ-text-input name="ssn" value="***-**-6789" disabled></civ-text-input>
    </civ-form-field>
  `,
};

// ── civ-form-fieldset ──────────────────────────────────────────

export const RadioGroup: Story = {
  name: 'Fieldset: Radio Group',
  render: () => html`
    <civ-form-fieldset legend="Preferred contact method" hint="We'll use this to reach you about your claim" required>
      <civ-radio-group name="contact" required>
        <civ-radio value="email" label="Email"></civ-radio>
        <civ-radio value="phone" label="Phone"></civ-radio>
        <civ-radio value="mail" label="US Mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const CheckboxGroup: Story = {
  name: 'Fieldset: Checkbox Group',
  render: () => html`
    <civ-form-fieldset legend="Benefits you are applying for" required>
      <civ-checkbox-group name="benefits" required>
        <civ-checkbox value="disability" label="Disability compensation"></civ-checkbox>
        <civ-checkbox value="education" label="Education benefits"></civ-checkbox>
        <civ-checkbox value="healthcare" label="VA healthcare"></civ-checkbox>
      </civ-checkbox-group>
    </civ-form-fieldset>
  `,
};

export const YesNo: Story = {
  name: 'Fieldset: Yes/No',
  render: () => html`
    <civ-form-fieldset legend="Are you a US citizen?" required>
      <civ-yes-no name="citizen" required></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const MemorableDate: Story = {
  name: 'Fieldset: Memorable Date',
  render: () => html`
    <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990" required>
      <civ-memorable-date name="dob" required></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

export const FieldsetWithError: Story = {
  name: 'Fieldset: With Error',
  render: () => html`
    <civ-form-fieldset legend="Preferred contact method" error="Select a contact method" required>
      <civ-radio-group name="contact" required>
        <civ-radio value="email" label="Email"></civ-radio>
        <civ-radio value="phone" label="Phone"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

// ── Complete form example ──────────────────────────────────────

export const CompleteForm: Story = {
  name: 'Complete Form Example',
  render: () => html`
    <div style="max-width: 640px;">
      <civ-form-field label="Full legal name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>

      <civ-form-field label="Email address" hint="We'll send your confirmation here" required>
        <civ-text-input type="email" name="email" required></civ-text-input>
      </civ-form-field>

      <civ-form-field label="Phone number">
        <civ-text-input name="phone" mask="phone-us"></civ-text-input>
      </civ-form-field>

      <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990" required>
        <civ-memorable-date name="dob" required></civ-memorable-date>
      </civ-form-fieldset>

      <civ-form-fieldset legend="Are you a veteran?" required>
        <civ-yes-no name="veteran" required></civ-yes-no>
      </civ-form-fieldset>

      <civ-form-field label="Additional notes">
        <civ-textarea name="notes" rows="3"></civ-textarea>
      </civ-form-field>
    </div>
  `,
};
