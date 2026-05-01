import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/layout/image-preview';
import '@civui/feedback/alert';
import '@civui/actions/action-link';
import '@civui/navigation/link';

const meta: Meta = {
  title: 'Forms/Patterns/File Display',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Patterns for displaying uploaded files across the form lifecycle:
review pages, confirmation pages, and summary sections.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Review page file list ──────────────────────────────────────

export const ReviewPageFiles: Story = {
  name: 'Review page — file list with downloads',
  render: () => html`
    <div style="max-width: 600px;">
      <h3 style="font-weight: bold; margin-bottom: 4px;">Supporting documents</h3>
      <p style="margin-bottom: 12px;">
        <civ-link href="#/documents" variant="tertiary">Change</civ-link>
      </p>
      <civ-data-field label="DD214" value="DD214.pdf (2.3 MB)" href="#/files/dd214.pdf"></civ-data-field>
      <civ-data-field label="Medical records" value="medical-records.pdf (7.7 MB)" href="#/files/medical.pdf"></civ-data-field>
      <civ-data-field label="Buddy statement" value="buddy-statement.pdf (332 KB)" href="#/files/buddy.pdf"></civ-data-field>
    </div>
  `,
};

// ── Review page with image previews ────────────────────────────

export const ReviewPageImages: Story = {
  name: 'Review page — image previews',
  render: () => html`
    <div style="max-width: 600px;">
      <h3 style="font-weight: bold; margin-bottom: 4px;">ID documents</h3>
      <p style="margin-bottom: 12px;">
        <civ-link href="#/id-upload" variant="tertiary">Change</civ-link>
      </p>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <civ-image-preview
          src="https://picsum.photos/seed/id-front/400/250"
          alt="Front of driver's license"
          filename="id-front.jpg"
          file-size="1.8 MB"
          size="sm"
        ></civ-image-preview>
        <civ-image-preview
          src="https://picsum.photos/seed/id-back/400/250"
          alt="Back of driver's license"
          filename="id-back.jpg"
          file-size="1.6 MB"
          size="sm"
        ></civ-image-preview>
      </div>
    </div>
  `,
};

// ── Confirmation page ──────────────────────────────────────────

export const ConfirmationPage: Story = {
  name: 'Confirmation page — submitted files',
  render: () => html`
    <div style="max-width: 600px;">
      <civ-alert variant="success" heading="We've received your application">
        You submitted your application on May 1, 2026.
      </civ-alert>

      <h3 style="font-weight: bold; margin-top: 24px; margin-bottom: 12px;">Documents submitted</h3>
      <civ-data-field label="DD214" value="DD214.pdf (2.3 MB)"></civ-data-field>
      <civ-data-field label="Medical records" value="medical-records.pdf (7.7 MB)"></civ-data-field>
      <civ-data-field label="ID photo" value="id-front.jpg (1.7 MB)"></civ-data-field>

      <p style="margin-top: 16px;">
        <civ-action-link type="download" href="#/receipt.pdf" label="Download confirmation receipt" file-size="45 KB"></civ-action-link>
      </p>
    </div>
  `,
};

// ── Mixed files and images ─────────────────────────────────────

export const MixedFilesAndImages: Story = {
  name: 'Mixed documents and photos',
  render: () => html`
    <div style="max-width: 600px;">
      <h3 style="font-weight: bold; margin-bottom: 12px;">Evidence submitted</h3>

      <h4 style="font-weight: bold; margin-bottom: 8px;">Documents</h4>
      <civ-data-field label="Insurance claim" value="insurance-claim.pdf (439 KB)" href="#/files/claim.pdf"></civ-data-field>
      <civ-data-field label="Police report" value="police-report.pdf (1.1 MB)" href="#/files/report.pdf"></civ-data-field>
      <civ-data-field label="Repair estimate" value="repair-estimate.pdf (869 KB)" href="#/files/estimate.pdf"></civ-data-field>

      <h4 style="font-weight: bold; margin-top: 16px; margin-bottom: 8px;">Photos</h4>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <civ-image-preview
          src="https://picsum.photos/seed/damage1/400/300"
          alt="Damage photo 1"
          filename="damage-front.jpg"
          file-size="3.2 MB"
          size="sm"
        ></civ-image-preview>
        <civ-image-preview
          src="https://picsum.photos/seed/damage2/400/300"
          alt="Damage photo 2"
          filename="damage-side.jpg"
          file-size="2.8 MB"
          size="sm"
        ></civ-image-preview>
        <civ-image-preview
          src="https://picsum.photos/seed/damage3/400/300"
          alt="Damage photo 3"
          filename="damage-rear.jpg"
          file-size="3.1 MB"
          size="sm"
        ></civ-image-preview>
      </div>
    </div>
  `,
};
