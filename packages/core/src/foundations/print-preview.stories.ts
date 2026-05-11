import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';

const meta: Meta = {
  title: 'Foundations/Print Preview',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Shows how form components render when printed. CivUI applies
\`@media print\` rules that hide interactive UI (buttons, dropzones,
toggles, progress bars), clean up borders, and tighten spacing for paper.

**To test actual print output:** use your browser's Print Preview (Ctrl+P / Cmd+P).

The stories below simulate print styles so you can preview the result
directly in Storybook without printing.
        `,
      },
    },
  },
  decorators: [
    (story) => html`
      <style>
        /* Simulate print styles in Storybook preview */
        .civ-print-preview .civ-dropzone,
        .civ-print-preview .civ-btn,
        .civ-print-preview civ-action-button,
        .civ-print-preview civ-button,
        .civ-print-preview [data-civ-combobox] button,
        .civ-print-preview .civ-combobox-chevron,
        .civ-print-preview .civ-toggle-track,
        .civ-print-preview .civ-close-btn,
        .civ-print-preview .civ-skip-link,
        .civ-print-preview .civ-progress-track {
          display: none !important;
        }

        .civ-print-preview .civ-input,
        .civ-print-preview .civ-select-field,
        .civ-print-preview textarea {
          border: 1px solid #000 !important;
          box-shadow: none !important;
          background: none !important;
        }

        .civ-print-preview .civ-label,
        .civ-print-preview .civ-legend {
          font-size: 10pt !important;
        }

        .civ-print-preview .civ-hint {
          font-size: 9pt !important;
          color: #333 !important;
        }

        .civ-print-preview .civ-mb-4 {
          margin-bottom: 8pt !important;
        }

        .civ-print-preview *:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        .civ-print-preview .civ-check-input {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      </style>
      <div class="civ-print-preview" style="max-width: 720px; font-family: serif;">
        ${story()}
      </div>
    `,
  ],
};

export default meta;
type Story = StoryObj;

export const TextInputs: Story = {
  name: 'Text Inputs',
  render: () => html`
    <h2 class="civ-text-lg civ-font-bold civ-mb-4">Text Inputs — Print Preview</h2>

    <civ-text-input label="Full legal name" name="name" value="Jane A. Smith" hint="As it appears on your government-issued ID" required></civ-text-input>

    <civ-text-input label="Email address" name="email" value="jane.smith@example.gov" type="email"></civ-text-input>

    <civ-text-input label="Social Security number" name="ssn" value="***-**-6789" hint="For example: 123-45-6789" mask="ssn"></civ-text-input>

    <civ-text-input label="Phone number" name="phone" value="(555) 123-4567" mask="phone-us"></civ-text-input>
  `,
};

export const TextareaAndSelect: Story = {
  name: 'Textarea & Select',
  render: () => html`
    <h2 class="civ-text-lg civ-font-bold civ-mb-4">Textarea &amp; Select — Print Preview</h2>

    <civ-textarea label="Describe your condition" name="condition" value="Lower back pain that limits my ability to stand for more than 20 minutes. Diagnosed in 2019 by Dr. Johnson at the VA Medical Center." hint="Include how it affects your daily activities" rows="4"></civ-textarea>

    <civ-form-field label="State of residence">
      <civ-select name="state" value="CA">
        <option value="">- Select -</option>
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </civ-select>
    </civ-form-field>
  `,
};

export const SelectionControls: Story = {
  name: 'Checkboxes & Radios',
  render: () => html`
    <h2 class="civ-text-lg civ-font-bold civ-mb-4">Selection Controls — Print Preview</h2>

    <civ-radio-group legend="Preferred contact method" required name="contact" value="email">
      <civ-radio value="email" label="Email"></civ-radio>
      <civ-radio value="phone" label="Phone"></civ-radio>
      <civ-radio value="mail" label="US Mail"></civ-radio>
    </civ-radio-group>

    <civ-checkbox-group legend="Benefits you are applying for" name="benefits" value="disability,education">
      <civ-checkbox value="disability" label="Disability compensation"></civ-checkbox>
      <civ-checkbox value="education" label="Education benefits"></civ-checkbox>
      <civ-checkbox value="healthcare" label="VA healthcare"></civ-checkbox>
      <civ-checkbox value="housing" label="Housing assistance"></civ-checkbox>
    </civ-checkbox-group>

    <civ-yes-no legend="Are you a US citizen?" name="citizen" value="yes"></civ-yes-no>
  `,
};

export const DateFields: Story = {
  name: 'Date Fields',
  render: () => html`
    <h2 class="civ-text-lg civ-font-bold civ-mb-4">Date Fields — Print Preview</h2>

    <civ-memorable-date legend="Date of birth" hint="For example: January 15 1990" required name="dob" value="1990-01-15"></civ-memorable-date>

    <civ-date-picker label="Appointment date" name="appointment" value="2026-05-15"></civ-date-picker>
  `,
};

export const CompoundFields: Story = {
  name: 'Compound Fields (Address, Name)',
  render: () => html`
    <h2 class="civ-text-lg civ-font-bold civ-mb-4">Compound Fields — Print Preview</h2>

    <civ-name
      legend="Veteran's name"
      value='{"first":"Jane","middle":"A","last":"Smith","suffix":""}'
      show-middle
    ></civ-name>

    <civ-address
      legend="Mailing address"
      value='{"street1":"123 Main Street","street2":"Apt 4B","city":"Springfield","state":"VA","zip":"22150","country":"US"}'
    ></civ-address>
  `,
};

export const CompleteForm: Story = {
  name: 'Complete Form (Paper Filing)',
  render: () => html`
    <h2 class="civ-text-lg civ-font-bold civ-mb-4">Benefits Application — Print Preview</h2>
    <p class="civ-text-sm civ-text-muted civ-mb-4">This demonstrates how a complete form renders when printed. Interactive elements are hidden; only labels and values remain.</p>

    <civ-name
      legend="Applicant name"
      value='{"first":"Jane","middle":"A","last":"Smith","suffix":""}'
      show-middle
    ></civ-name>

    <civ-memorable-date legend="Date of birth" required name="dob" value="1990-01-15"></civ-memorable-date>

    <civ-text-input label="Social Security number" name="ssn" value="***-**-6789" required mask="ssn"></civ-text-input>

    <civ-text-input label="Email address" name="email" value="jane.smith@example.gov" type="email"></civ-text-input>

    <civ-text-input label="Phone number" name="phone" value="(555) 123-4567" mask="phone-us"></civ-text-input>

    <civ-address
      legend="Mailing address"
      value='{"street1":"123 Main Street","street2":"","city":"Springfield","state":"VA","zip":"22150","country":"US"}'
    ></civ-address>

    <civ-yes-no legend="Are you a US citizen?" required name="citizen" value="yes"></civ-yes-no>

    <civ-radio-group legend="Preferred contact method" required name="contact" value="email">
      <civ-radio value="email" label="Email"></civ-radio>
      <civ-radio value="phone" label="Phone"></civ-radio>
      <civ-radio value="mail" label="US Mail"></civ-radio>
    </civ-radio-group>

    <civ-checkbox-group legend="Benefits you are applying for" required name="benefits" value="disability,education">
      <civ-checkbox value="disability" label="Disability compensation"></civ-checkbox>
      <civ-checkbox value="education" label="Education benefits"></civ-checkbox>
      <civ-checkbox value="healthcare" label="VA healthcare"></civ-checkbox>
    </civ-checkbox-group>

    <civ-textarea label="Additional information" name="notes" value="I am filing this claim based on service-connected injuries sustained during deployment in 2018. Medical records are available through the VA Medical Center in Richmond, VA." hint="Describe any supporting details for your application" rows="4"></civ-textarea>
  `,
};
