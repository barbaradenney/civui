import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-pagination.js';

const meta: Meta = {
  title: 'Layout/Pagination',
  component: 'civ-pagination',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'USWDS-style pagination control. Renders a status range, page-size selector, Previous/Next buttons, and a truncated list of page-number buttons. The component is controlled — listen for civ-page-change to drive the consumer\'s data fetch.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-pagination total-items="100" page-size="25" page="2"></civ-pagination>
  `,
};

export const FewPages: Story = {
  name: 'Few Pages (no truncation)',
  render: () => html`
    <civ-pagination total-items="50" page-size="10" page="3"></civ-pagination>
  `,
};

export const ManyPages: Story = {
  name: 'Many Pages (truncated)',
  render: () => html`
    <civ-pagination total-items="847" page-size="25" page="6"></civ-pagination>
  `,
};

export const NearStart: Story = {
  name: 'Near Start (left side full)',
  render: () => html`
    <civ-pagination total-items="847" page-size="25" page="2"></civ-pagination>
  `,
};

export const NearEnd: Story = {
  name: 'Near End (right side full)',
  render: () => html`
    <civ-pagination total-items="847" page-size="25" page="33"></civ-pagination>
  `,
};

export const Empty: Story = {
  render: () => html`
    <civ-pagination total-items="0" page-size="25"></civ-pagination>
  `,
};

export const CustomItemName: Story = {
  render: () => html`
    <civ-pagination total-items="847" page-size="25" page="3" item-name="application"></civ-pagination>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-pagination total-items="847" page-size="25" page="3" item-name="application"></civ-pagination>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-pagination total-items="847" page-size="25" page="3" item-name="application"></civ-pagination>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-pagination total-items="847" page-size="25" page="3" item-name="application"></civ-pagination>
      </div>
    </div>
  `,
};

export const Interactive: Story = {
  render: () => {
    let page = 1;
    let pageSize = 25;
    const total = 847;
    const onPageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      page = detail.page;
      pageSize = detail.pageSize;
      const el = e.target as HTMLElement;
      (el as any).page = page;
      (el as any).pageSize = pageSize;
      const status = document.querySelector('#interactive-status') as HTMLElement;
      if (status) status.textContent = `Page ${page} of ${Math.ceil(total / pageSize)}`;
    };
    return html`
      <div>
        <p id="interactive-status" class="civ-mb-3">Page 1 of ${Math.ceil(total / pageSize)}</p>
        <civ-pagination
          total-items="${total}"
          page-size="${pageSize}"
          page="${page}"
          @civ-page-change="${onPageChange}"
        ></civ-pagination>
      </div>
    `;
  },
};
