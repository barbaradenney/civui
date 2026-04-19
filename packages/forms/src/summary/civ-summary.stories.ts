import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-summary.js';
import '../signature/civ-signature.js';
import '../../feedback/src/alert/civ-alert.js';

const meta: Meta = {
  title: 'Forms/Summary',
  component: 'civ-summary',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    heading: 'Review your information',
  },
  render: (args) => html`
    <civ-summary heading="${args.heading}"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary');
    if (el) {
      (el as any).sections = [
        {
          heading: 'Personal information',
          editHref: '#step-1',
          items: [
            { label: 'First name', value: 'Jane' },
            { label: 'Last name', value: 'Doe' },
            { label: 'Date of birth', value: 'January 15, 1990' },
          ],
        },
        {
          heading: 'Contact information',
          editHref: '#step-2',
          items: [
            { label: 'Email address', value: 'jane.doe@example.gov' },
            { label: 'Phone number', value: '(555) 123-4567' },
          ],
        },
        {
          heading: 'Mailing address',
          editHref: '#step-3',
          items: [
            { label: 'Street address', value: '1600 Pennsylvania Avenue NW' },
            { label: 'City', value: 'Washington' },
            { label: 'State', value: 'DC' },
            { label: 'ZIP code', value: '20500' },
          ],
        },
      ];
    }
  },
};

export const WithMissingValues: Story = {
  render: () => html`
    <civ-summary heading="Review your information"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary');
    if (el) {
      (el as any).sections = [
        {
          heading: 'Personal information',
          editHref: '#step-1',
          items: [
            { label: 'First name', value: 'Jane' },
            { label: 'Middle name' },
            { label: 'Last name', value: 'Doe' },
            { label: 'Suffix' },
          ],
        },
      ];
    }
  },
};

export const WithArrayValues: Story = {
  render: () => html`
    <civ-summary heading="Review your selections"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary');
    if (el) {
      (el as any).sections = [
        {
          heading: 'Benefits selected',
          editHref: '#step-1',
          items: [
            { label: 'Programs', value: ['Health insurance', 'Dental coverage', 'Vision plan'] },
            { label: 'Dependents', value: ['Jane Doe', 'John Doe Jr.'] },
          ],
        },
      ];
    }
  },
};

export const WithoutEditLinks: Story = {
  render: () => html`
    <civ-summary heading="Submission summary"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary');
    if (el) {
      (el as any).sections = [
        {
          heading: 'Application details',
          items: [
            { label: 'Application number', value: 'APP-2026-04-18-001' },
            { label: 'Submitted on', value: 'April 18, 2026' },
            { label: 'Status', value: 'Pending review' },
          ],
        },
        {
          heading: 'Applicant',
          items: [
            { label: 'Name', value: 'Jane Doe' },
            { label: 'Email', value: 'jane.doe@example.gov' },
          ],
        },
      ];
    }
  },
};

export const Empty: Story = {
  render: () => html`
    <civ-summary heading="Review your information"></civ-summary>
  `,
};

export const FullApplicationReview: Story = {
  name: 'Full Application Review Page',
  render: () => html`
    <civ-summary heading="Review your application"></civ-summary>
    <civ-signature
      legend="Statement of truth"
      name="signature"
      statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
      required
    ></civ-signature>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary');
    if (el) {
      (el as any).sections = [
        {
          heading: 'Personal information',
          editHref: '#/personal',
          items: [
            { label: 'Name', value: 'Jane A. Doe' },
            { label: 'Date of birth', value: 'January 15, 1990' },
            { label: 'Social Security number', value: '●●●-●●-6789' },
          ],
        },
        {
          heading: 'Contact information',
          editHref: '#/contact',
          items: [
            { label: 'Mailing address', value: ['123 Main St', 'Springfield, IL 62701'] },
            { label: 'Home phone', value: '(555) 123-4567' },
            { label: 'Email', value: 'jane.doe@email.com' },
            { label: 'Preferred contact method', value: 'Email' },
          ],
        },
        {
          heading: 'Service history',
          editHref: '#/service',
          items: [
            { label: 'Branch', value: 'Army' },
            { label: 'Service dates', value: 'March 2010 \u2013 September 2018' },
            { label: 'Character of service', value: 'Honorable' },
          ],
        },
        {
          heading: 'Direct deposit',
          editHref: '#/deposit',
          items: [
            { label: 'Account type', value: 'Checking' },
            { label: 'Routing number', value: '●●●●●6789' },
            { label: 'Account number', value: '●●●●●●4321' },
          ],
        },
        {
          heading: 'Supporting documents',
          editHref: '#/documents',
          items: [
            { label: 'Files uploaded', value: ['DD214.pdf', 'medical-records.pdf'] },
          ],
        },
      ];
    }
  },
};

export const ConfirmationPage: Story = {
  name: 'Post-Submission Confirmation',
  render: () => html`
    <civ-alert variant="success" heading="We've received your application">
      Your application was submitted on April 19, 2026. Your confirmation number is APP-2026-04-19-0042.
    </civ-alert>

    <civ-summary heading="What you submitted"></civ-summary>

    <h3 class="civ-heading-md">What happens next</h3>
    <p class="civ-mb-2">We'll review your application and send you a decision within 30 days.</p>
    <p>If we need more information, we'll contact you at jane.doe@email.com.</p>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary');
    if (el) {
      (el as any).sections = [
        {
          heading: 'Applicant',
          items: [
            { label: 'Name', value: 'Jane A. Doe' },
            { label: 'Confirmation number', value: 'APP-2026-04-19-0042' },
            { label: 'Date submitted', value: 'April 19, 2026' },
          ],
        },
      ];
    }
  },
};
