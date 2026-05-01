import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-file-list.js';

const meta: Meta = {
  title: 'Layout/File List',
  component: 'civ-file-list',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ─────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const el = document.createElement('civ-file-list');
    el.files = [
      { name: 'DD214.pdf', size: 2400000, url: '/files/dd214.pdf' },
      { name: 'medical-records.pdf', size: 8100000 },
      { name: 'tax-return-2025.pdf', size: 1200000, url: '/files/tax-return.pdf' },
    ];
    el.label = 'Uploaded documents';
    return html`${el}`;
  },
};

// ── With Download Links ─────────────────────────────────────

export const WithDownloadLinks: Story = {
  name: 'With download links',
  render: () => {
    const el = document.createElement('civ-file-list');
    el.files = [
      { name: 'DD214.pdf', size: 2400000, url: '/files/dd214.pdf' },
      { name: 'medical-records.pdf', size: 8100000, url: '/files/medical-records.pdf' },
      { name: 'proof-of-residence.jpg', size: 3500000, url: '/files/proof-of-residence.jpg' },
    ];
    el.label = 'Supporting documents';
    return html`${el}`;
  },
};

// ── No Links ────────────────────────────────────────────────

export const NoLinks: Story = {
  name: 'No links (plain text)',
  render: () => {
    const el = document.createElement('civ-file-list');
    el.files = [
      { name: 'DD214.pdf', size: 2400000 },
      { name: 'medical-records.pdf', size: 8100000 },
      { name: 'utility-bill.png', size: 950000 },
    ];
    el.label = 'Documents received';
    return html`${el}`;
  },
};

// ── With Label ──────────────────────────────────────────────

export const WithLabel: Story = {
  name: 'With aria-label',
  render: () => {
    const el = document.createElement('civ-file-list');
    el.files = [
      { name: 'passport-scan.pdf', size: 4200000, url: '/files/passport.pdf' },
      { name: 'birth-certificate.pdf', size: 1800000 },
    ];
    el.label = 'Identity verification documents';
    return html`${el}`;
  },
};

// ── Review Page ─────────────────────────────────────────────

export const ReviewPage: Story = {
  name: 'Review page context',
  render: () => {
    const el = document.createElement('civ-file-list');
    el.files = [
      { name: 'DD214.pdf', size: 2400000, url: '/files/dd214.pdf', type: 'application/pdf' },
      { name: 'medical-exam-results.pdf', size: 5300000, url: '/files/medical-exam.pdf', type: 'application/pdf' },
      { name: 'marriage-certificate.jpg', size: 3100000, type: 'image/jpeg' },
      { name: 'bank-statement.pdf', size: 1900000, url: '/files/bank-statement.pdf', type: 'application/pdf' },
    ];
    el.label = 'Uploaded supporting documents';
    return html`
      <div style="max-width: 600px;">
        <h3 style="font-weight: bold; margin-bottom: 4px;">Supporting documents</h3>
        <p style="color: #565c65; font-size: 0.875rem; margin-bottom: 12px;">
          You uploaded the following documents with your application.
        </p>
        ${el}
      </div>
    `;
  },
};
