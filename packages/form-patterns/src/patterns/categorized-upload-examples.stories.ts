import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '../repeater/civ-repeater.js';
import '../fieldset/civ-fieldset.js';
import '../conditional/civ-conditional.js';

const meta: Meta = {
  title: 'Forms/Patterns/Categorized Upload',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Government forms often require uploaded documents to be categorized.
The user selects a document type before uploading, ensuring every
file is properly labeled for processing.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Single categorized document ────────────────────────────────

export const SingleDocument: Story = {
  name: 'Single categorized document',
  render: () => html`
    <civ-fieldset legend="Upload supporting document">
      <civ-select label="Document type" name="docType" required>
          <option value="">- Select -</option>
          <option value="dd214">DD214 (Discharge papers)</option>
          <option value="medical">Medical records</option>
          <option value="buddy">Buddy statement</option>
          <option value="other">Other</option>
        </civ-select>

      <civ-conditional when="docType" has-value>
        <civ-file-upload
          name="document"
          accept=".pdf,.jpg,.png"
          hint="Upload a PDF, JPG, or PNG file"
          required
        ></civ-file-upload>
      </civ-conditional>
    </civ-fieldset>
  `,
};

// ── Single with "Other" description ────────────────────────────

export const SingleWithOther: Story = {
  name: 'Single with "Other" description',
  render: () => html`
    <civ-fieldset legend="Upload supporting document">
      <civ-select label="Document type" name="docType" required>
          <option value="">- Select -</option>
          <option value="dd214">DD214 (Discharge papers)</option>
          <option value="medical">Medical records</option>
          <option value="buddy">Buddy statement</option>
          <option value="other">Other</option>
        </civ-select>

      <civ-conditional when="docType" equals="other">
        <civ-text-input label="Describe the document" name="docDescription" required></civ-text-input>
      </civ-conditional>

      <civ-conditional when="docType" has-value>
        <civ-file-upload
          name="document"
          accept=".pdf,.jpg,.png"
          hint="Upload a PDF, JPG, or PNG file"
          required
        ></civ-file-upload>
      </civ-conditional>
    </civ-fieldset>
  `,
};

// ── Multiple categorized documents ─────────────────────────────

export const MultipleDocuments: Story = {
  name: 'Multiple categorized documents (repeater)',
  render: () => html`
    <civ-repeater
      legend="Supporting documents"
      name="documents"
      item-label="document"
      min="0"
      max="10"
    >
      <civ-select label="Document type" name="docType" required>
          <option value="">- Select -</option>
          <option value="dd214">DD214 (Discharge papers)</option>
          <option value="medical">Medical records</option>
          <option value="buddy">Buddy statement</option>
          <option value="id">Government-issued ID</option>
          <option value="other">Other</option>
        </civ-select>

      <civ-conditional when="docType" equals="other">
        <civ-text-input label="Describe the document" name="docDescription" required></civ-text-input>
      </civ-conditional>

      <civ-conditional when="docType" has-value>
        <civ-file-upload
          name="file"
          accept=".pdf,.jpg,.png"
          hint="Upload a PDF, JPG, or PNG file"
          required
        ></civ-file-upload>
      </civ-conditional>
    </civ-repeater>
  `,
};

// ── VA disability claim evidence ───────────────────────────────

export const VADisabilityEvidence: Story = {
  name: 'VA disability claim evidence',
  render: () => html`
    <civ-repeater
      legend="Evidence to support your claim"
      name="evidence"
      item-label="document"
      min="1"
      max="20"
    >
      <civ-select label="Type of evidence" name="evidenceType" required>
          <option value="">- Select -</option>
          <option value="service-treatment">Service treatment records</option>
          <option value="va-medical">VA medical records</option>
          <option value="private-medical">Private medical records</option>
          <option value="disability-benefits-questionnaire">Disability Benefits Questionnaire (DBQ)</option>
          <option value="buddy-statement">Buddy/lay statement</option>
          <option value="nexus-letter">Nexus letter</option>
          <option value="dd214">DD214 or other separation documents</option>
          <option value="other">Other supporting evidence</option>
        </civ-select>

      <civ-conditional when="evidenceType" equals="other">
        <civ-textarea label="Description of evidence" name="evidenceDescription" hint="Briefly describe what this document is" required></civ-textarea>
      </civ-conditional>

      <civ-conditional when="evidenceType" has-value>
        <civ-file-upload
          name="file"
          accept=".pdf,.jpg,.png,.tiff"
          hint="Upload a PDF, JPG, PNG, or TIFF file (max 25 MB)"
          max-size="26214400"
          required
        ></civ-file-upload>
      </civ-conditional>
    </civ-repeater>
  `,
};

// ── ID document upload (front + back) ──────────────────────────

export const IDDocumentUpload: Story = {
  name: 'ID document upload (front + back)',
  render: () => html`
    <civ-fieldset legend="Government-issued ID">
      <civ-select label="ID type" name="idType" required>
          <option value="">- Select -</option>
          <option value="drivers-license">Driver's license</option>
          <option value="state-id">State ID card</option>
          <option value="passport">U.S. Passport</option>
          <option value="military-id">Military ID (CAC)</option>
        </civ-select>

      <civ-conditional when="idType" has-value>
        <civ-file-upload
          name="idFront"
          accept="image/*"
          capture="environment"
          hint="Take a photo or upload an image of the front"
          required
        ></civ-file-upload>

        <civ-conditional when="idType" not-equals="passport">
          <civ-file-upload
            name="idBack"
            accept="image/*"
            capture="environment"
            hint="Take a photo or upload an image of the back"
            required
          ></civ-file-upload>
        </civ-conditional>
      </civ-conditional>
    </civ-fieldset>
  `,
};
