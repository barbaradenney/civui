import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/layout/file-list';
import '@civui/layout/image-preview';
import '@civui/feedback/alert';
import '@civui/actions/action-link';

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
  render: () => {
    const template = html`
      <div style="max-width: 600px;">
        <h3 style="font-weight: bold; margin-bottom: 4px;">Supporting documents</h3>
        <p style="margin-bottom: 12px;">
          <civ-link href="#/documents" variant="tertiary">Change</civ-link>
        </p>
        <civ-file-list label="Uploaded documents"></civ-file-list>
      </div>
    `;

    setTimeout(() => {
      const el = document.querySelector('civ-file-list');
      if (el) {
        (el as any).files = [
          { name: 'DD214.pdf', size: 2400000, url: '#/files/dd214.pdf' },
          { name: 'medical-records.pdf', size: 8100000, url: '#/files/medical.pdf' },
          { name: 'buddy-statement.pdf', size: 340000, url: '#/files/buddy.pdf' },
        ];
      }
    }, 0);

    return template;
  },
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
  render: () => {
    const template = html`
      <div style="max-width: 600px;">
        <civ-alert variant="success" heading="We've received your application">
          You submitted your application on May 1, 2026.
        </civ-alert>

        <h3 style="font-weight: bold; margin-top: 24px; margin-bottom: 12px;">Documents submitted</h3>
        <civ-file-list label="Submitted documents"></civ-file-list>

        <p style="margin-top: 16px;">
          <civ-action-link type="download" href="#/receipt.pdf" label="Download confirmation receipt" file-size="45 KB"></civ-action-link>
        </p>
      </div>
    `;

    setTimeout(() => {
      const el = document.querySelector('civ-file-list');
      if (el) {
        (el as any).files = [
          { name: 'DD214.pdf', size: 2400000 },
          { name: 'medical-records.pdf', size: 8100000 },
          { name: 'id-front.jpg', size: 1800000 },
        ];
      }
    }, 0);

    return template;
  },
};

// ── Mixed files and images ─────────────────────────────────────

export const MixedFilesAndImages: Story = {
  name: 'Mixed documents and photos',
  render: () => {
    const template = html`
      <div style="max-width: 600px;">
        <h3 style="font-weight: bold; margin-bottom: 12px;">Evidence submitted</h3>

        <h4 style="font-weight: bold; margin-bottom: 8px;">Documents</h4>
        <civ-file-list id="doc-list" label="Document files"></civ-file-list>

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
    `;

    setTimeout(() => {
      const el = document.querySelector('#doc-list');
      if (el) {
        (el as any).files = [
          { name: 'insurance-claim.pdf', size: 450000, url: '#/files/claim.pdf' },
          { name: 'police-report.pdf', size: 1200000, url: '#/files/report.pdf' },
          { name: 'repair-estimate.pdf', size: 890000, url: '#/files/estimate.pdf' },
        ];
      }
    }, 0);

    return template;
  },
};
