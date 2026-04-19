import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-summary.js';

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
