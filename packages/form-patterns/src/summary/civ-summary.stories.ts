import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-summary.js';
import '@civui/compound';
import '@civui/ui/link';
import '@civui/ui/divider';

const meta: Meta = {
  title: 'Forms/Patterns/Summary',
  component: 'civ-summary',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

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
      ];
    }
  },
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'With Missing Values',
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

export const WithError: Story = {
  name: 'Without Edit Links',
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
            { label: 'Application number', value: 'APP-2026-04-19-001' },
            { label: 'Submitted on', value: 'April 19, 2026' },
            { label: 'Status', value: 'Pending review' },
          ],
        },
      ];
    }
  },
};

export const Required: Story = {
  name: 'With Array Values',
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

export const Disabled: Story = {
  name: 'Empty State',
  render: () => html`
    <civ-summary heading="Review your information"></civ-summary>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-12">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With edit links</h3>
        <civ-summary heading="Editable summary" id="summary-editable"></civ-summary>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Read-only (no edit links)</h3>
        <civ-summary heading="Confirmation summary" id="summary-readonly"></civ-summary>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Empty</h3>
        <civ-summary heading="No data yet"></civ-summary>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const editable = canvasElement.querySelector('#summary-editable') as any;
    if (editable) {
      editable.sections = [
        { heading: 'Personal info', editHref: '#', items: [{ label: 'Name', value: 'Jane Doe' }] },
      ];
    }
    const readonly = canvasElement.querySelector('#summary-readonly') as any;
    if (readonly) {
      readonly.sections = [
        { heading: 'Submission', items: [{ label: 'Reference', value: 'APP-001' }, { label: 'Date', value: 'April 19, 2026' }] },
      ];
    }
  },
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-summary heading="Summary" id="dense-summary"></civ-summary>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-summary heading="Summary" id="default-summary"></civ-summary>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-summary heading="Summary" id="spacious-summary"></civ-summary>
      </div>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const sections = [
      { heading: 'Applicant', editHref: '#', items: [{ label: 'Name', value: 'Jane Doe' }, { label: 'Email', value: 'jane@example.gov' }] },
    ];
    canvasElement.querySelectorAll('civ-summary').forEach((el: any) => {
      el.sections = sections;
    });
  },
};

// ── Prefill Scenarios ────────────────────────────────────────

export const PrefillHubPage: Story = {
  name: 'Prefill: Hub Page with Status',
  render: () => html`
    <civ-summary heading="Your application"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary') as any;
    if (el) {
      el.sections = [
        {
          heading: 'Personal information',
          editHref: '/profile/settings',
          status: 'complete',
          locked: true,
          items: [
            { label: 'Name', value: 'Jane M. Doe' },
            { label: 'Date of birth', value: 'March 15, 1985' },
            { label: 'SSN', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
          ],
        },
        {
          heading: 'Contact information',
          editHref: '#/contact',
          status: 'in-progress',
          items: [
            { label: 'Phone', value: '(555) 123-4567' },
            { label: 'Email', value: 'jane@example.com' },
          ],
        },
        {
          heading: 'Service history',
          editHref: '#/service',
          status: 'not-started',
          items: [],
        },
        {
          heading: 'Disabilities',
          status: 'cannot-start',
          items: [],
        },
      ];
    }
  },
};

export const PrefillConflict: Story = {
  name: 'Prefill: Conflict Resolution',
  render: () => html`
    <civ-summary heading="Contact information"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary') as any;
    if (el) {
      el.sections = [
        {
          heading: 'Phone number',
          editHref: '#/contact/phone',
          status: 'in-progress',
          items: [
            { label: 'Phone numbers on file', value: '3 found', action: { label: 'Choose one', href: '#/contact/phone' } },
          ],
        },
        {
          heading: 'Email address',
          editHref: '#/contact/email',
          status: 'complete',
          items: [
            { label: 'Email', value: 'jane@example.com' },
          ],
        },
      ];
    }
  },
};

export const PrefillReviewPage: Story = {
  name: 'Prefill: Review Page with Source Tags',
  render: () => html`
    <civ-summary heading="Review your application"></civ-summary>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-summary') as any;
    if (el) {
      el.sections = [
        {
          heading: 'Personal information',
          editHref: '/profile/settings',
          locked: true,
          items: [
            { label: 'Name', value: 'Jane M. Doe' },
            { label: 'Date of birth', value: 'March 15, 1985' },
            { label: 'SSN', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
          ],
        },
        {
          heading: 'Contact information',
          editHref: '#/contact',
          items: [
            { label: 'Phone', value: '(555) 987-6543' },
            { label: 'Email', value: 'updated@example.com' },
          ],
        },
        {
          heading: 'Service history',
          editHref: '#/service',
          items: [
            { label: 'Branch', value: 'Army' },
            { label: 'Dates', value: ['Jan 2005 \u2013 Dec 2010', 'Mar 2012 \u2013 Jun 2015'] },
          ],
        },
      ];
    }
  },
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentApplicationReview: Story = {
  name: 'Usage: Full Application Review',
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
            { label: 'Social Security number', value: '\u25CF\u25CF\u25CF-\u25CF\u25CF-6789' },
          ],
        },
        {
          heading: 'Contact information',
          editHref: '#/contact',
          items: [
            { label: 'Mailing address', value: ['123 Main St', 'Springfield, IL 62701'] },
            { label: 'Home phone', value: '(555) 123-4567' },
            { label: 'Email', value: 'jane.doe@email.com' },
          ],
        },
        {
          heading: 'Direct deposit',
          editHref: '#/deposit',
          items: [
            { label: 'Account type', value: 'Checking' },
            { label: 'Routing number', value: '\u25CF\u25CF\u25CF\u25CF\u25CF6789' },
            { label: 'Account number', value: '\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF4321' },
          ],
        },
      ];
    }
  },
};
