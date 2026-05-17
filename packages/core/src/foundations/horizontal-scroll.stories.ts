import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/actions/filter-chip';
import '@civui/actions/filter-chip-group';

const meta: Meta = {
  title: 'Foundations/Horizontal Scroll',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A CSS utility (`.civ-scroll-x`) — not a component — for content that needs to scroll horizontally on narrow viewports: tab strips, filter chip rows, toolbar overflow, wide tables. See `/docs/foundations/horizontal-scroll` for the full pattern docs.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const wrapperStyle = 'border: 1px dashed var(--civ-color-base-light); padding: var(--civ-spacing-2); max-width: 360px;';

export const Default: Story = {
  name: 'Default (filter chip overflow)',
  render: () => html`
    <div style="${wrapperStyle}">
      <div class="civ-scroll-x">
        <div class="civ-flex civ-gap-2" style="flex-wrap: nowrap;">
          <civ-filter-chip label="In review" selected></civ-filter-chip>
          <civ-filter-chip label="Approved"></civ-filter-chip>
          <civ-filter-chip label="Denied"></civ-filter-chip>
          <civ-filter-chip label="Pending"></civ-filter-chip>
          <civ-filter-chip label="Returned"></civ-filter-chip>
          <civ-filter-chip label="Archived"></civ-filter-chip>
          <civ-filter-chip label="Withdrawn"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const WithSnap: Story = {
  name: 'With Scroll-Snap',
  render: () => html`
    <div style="${wrapperStyle}">
      <div class="civ-scroll-x civ-scroll-x--snap">
        <div class="civ-flex civ-gap-2" style="flex-wrap: nowrap;">
          <civ-filter-chip class="civ-scroll-x__item" label="In review" selected></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Approved"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Denied"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Pending"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Returned"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Archived"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const WithFade: Story = {
  name: 'With Edge Fade',
  render: () => html`
    <div style="${wrapperStyle}">
      <div class="civ-scroll-x civ-scroll-x--fade">
        <div class="civ-flex civ-gap-2" style="flex-wrap: nowrap;">
          <civ-filter-chip label="In review" selected></civ-filter-chip>
          <civ-filter-chip label="Approved"></civ-filter-chip>
          <civ-filter-chip label="Denied"></civ-filter-chip>
          <civ-filter-chip label="Pending"></civ-filter-chip>
          <civ-filter-chip label="Returned"></civ-filter-chip>
          <civ-filter-chip label="Archived"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const SnapAndFade: Story = {
  name: 'Snap + Fade',
  render: () => html`
    <div style="${wrapperStyle}">
      <div class="civ-scroll-x civ-scroll-x--snap civ-scroll-x--fade">
        <div class="civ-flex civ-gap-2" style="flex-wrap: nowrap;">
          <civ-filter-chip class="civ-scroll-x__item" label="In review" selected></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Approved"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Denied"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Pending"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Returned"></civ-filter-chip>
          <civ-filter-chip class="civ-scroll-x__item" label="Archived"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const BareScrollbar: Story = {
  name: 'Bare Scrollbar (native, hidden on Safari)',
  render: () => html`
    <div style="${wrapperStyle}">
      <div class="civ-scroll-x civ-scroll-x--bare-scrollbar">
        <div class="civ-flex civ-gap-2" style="flex-wrap: nowrap;">
          <civ-filter-chip label="In review" selected></civ-filter-chip>
          <civ-filter-chip label="Approved"></civ-filter-chip>
          <civ-filter-chip label="Denied"></civ-filter-chip>
          <civ-filter-chip label="Pending"></civ-filter-chip>
          <civ-filter-chip label="Returned"></civ-filter-chip>
          <civ-filter-chip label="Archived"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const TableScrollPattern: Story = {
  name: 'Pattern A — Wide Table (role=region, tabindex)',
  render: () => html`
    <div style="${wrapperStyle}">
      <div
        class="civ-scroll-x"
        role="region"
        aria-label="Applications table"
        tabindex="0"
      >
        <table style="border-collapse: collapse; min-width: 600px;">
          <caption class="civ-sr-only">Applications</caption>
          <thead>
            <tr>
              <th style="text-align: start; padding: var(--civ-spacing-2);">ID</th>
              <th style="text-align: start; padding: var(--civ-spacing-2);">Applicant</th>
              <th style="text-align: start; padding: var(--civ-spacing-2);">Type</th>
              <th style="text-align: start; padding: var(--civ-spacing-2);">Status</th>
              <th style="text-align: start; padding: var(--civ-spacing-2);">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: var(--civ-spacing-2);">A-001</td>
              <td style="padding: var(--civ-spacing-2);">Smith, John</td>
              <td style="padding: var(--civ-spacing-2);">Disability</td>
              <td style="padding: var(--civ-spacing-2);">In review</td>
              <td style="padding: var(--civ-spacing-2);">2026-05-15</td>
            </tr>
            <tr>
              <td style="padding: var(--civ-spacing-2);">A-002</td>
              <td style="padding: var(--civ-spacing-2);">Doe, Jane</td>
              <td style="padding: var(--civ-spacing-2);">Pension</td>
              <td style="padding: var(--civ-spacing-2);">Approved</td>
              <td style="padding: var(--civ-spacing-2);">2026-05-14</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
};
