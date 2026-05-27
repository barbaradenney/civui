import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/actions/button';

const meta: Meta = {
  title: 'Foundations/Icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "CivUI's built-in icon set — inline SVG, `currentColor`-aware, scales with `font-size`. See `/docs/foundations/icons` for the conceptual overview and the full registration / opt-in-Material-Symbols path.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const BUILT_IN_ICONS = [
  'plus', 'minus', 'check', 'check-circle', 'close', 'search',
  'error', 'warning', 'info', 'help', 'loading',
  'download', 'edit', 'trash', 'copy', 'print', 'share', 'open',
  'mail', 'phone', 'home', 'menu', 'settings', 'person', 'user',
  'document', 'calendar',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-back',
  'more-vert', 'more-horiz', 'unfold-more', 'view-column',
  'external-link',
];

export const Gallery: Story = {
  name: 'Built-in icon gallery',
  render: () => html`
    <div
      class="civ-grid civ-gap-4"
      style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));"
    >
      ${BUILT_IN_ICONS.map(
        (name) => html`
          <div
            class="civ-flex civ-flex-col civ-items-center civ-gap-2 civ-p-3"
            style="border: 1px solid var(--civ-color-base-lighter); border-radius: var(--civ-border-radius-md);"
          >
            <civ-icon name="${name}" size="lg"></civ-icon>
            <code class="civ-text-caption">${name}</code>
          </div>
        `,
      )}
    </div>
  `,
};

export const Sizes: Story = {
  name: 'Sizes — sm through 2xl',
  render: () => html`
    <div class="civ-flex civ-items-end civ-gap-6">
      <div class="civ-flex civ-flex-col civ-items-center civ-gap-1">
        <civ-icon name="check-circle" size="sm"></civ-icon>
        <code class="civ-text-caption">sm</code>
      </div>
      <div class="civ-flex civ-flex-col civ-items-center civ-gap-1">
        <civ-icon name="check-circle" size="md"></civ-icon>
        <code class="civ-text-caption">md</code>
      </div>
      <div class="civ-flex civ-flex-col civ-items-center civ-gap-1">
        <civ-icon name="check-circle" size="lg"></civ-icon>
        <code class="civ-text-caption">lg</code>
      </div>
      <div class="civ-flex civ-flex-col civ-items-center civ-gap-1">
        <civ-icon name="check-circle" size="xl"></civ-icon>
        <code class="civ-text-caption">xl</code>
      </div>
      <div class="civ-flex civ-flex-col civ-items-center civ-gap-1">
        <civ-icon name="check-circle" size="2xl"></civ-icon>
        <code class="civ-text-caption">2xl</code>
      </div>
    </div>
  `,
};

export const InheritsColor: Story = {
  name: 'Inherits color from currentColor',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <div class="civ-flex civ-items-center civ-gap-2 civ-text-success">
        <civ-icon name="check-circle"></civ-icon>
        <span>Inherits civ-text-success</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-2 civ-text-error">
        <civ-icon name="error"></civ-icon>
        <span>Inherits civ-text-error</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-2 civ-text-warning">
        <civ-icon name="warning"></civ-icon>
        <span>Inherits civ-text-warning</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-2 civ-text-info">
        <civ-icon name="info"></civ-icon>
        <span>Inherits civ-text-info</span>
      </div>
      <div class="civ-flex civ-items-center civ-gap-2 civ-text-primary">
        <civ-icon name="open"></civ-icon>
        <span>Inherits civ-text-primary</span>
      </div>
    </div>
  `,
};

export const ScalesWithFontSize: Story = {
  name: 'Scales with font-size',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <p class="civ-text-sm">
        <civ-icon name="check"></civ-icon>
        Small text — icon scales to match.
      </p>
      <p>
        <civ-icon name="check"></civ-icon>
        Body text — icon at base size.
      </p>
      <p class="civ-text-xl">
        <civ-icon name="check"></civ-icon>
        Heading text — icon grows automatically.
      </p>
      <p class="civ-text-3xl">
        <civ-icon name="check"></civ-icon>
        Display text — same prop, larger icon.
      </p>
    </div>
  `,
};

export const AccessibleVsDecorative: Story = {
  name: 'Decorative vs. labelled',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-text-caption civ-mb-2">
          Decorative — no <code>label</code>, gets <code>aria-hidden="true"</code>. Used when the
          surrounding text already conveys meaning.
        </p>
        <span class="civ-flex civ-items-center civ-gap-2">
          <civ-icon name="check-circle" class="civ-text-success"></civ-icon>
          <span>Application submitted</span>
        </span>
      </div>
      <div>
        <p class="civ-text-caption civ-mb-2">
          Meaningful — with <code>label</code>, gets <code>role="img"</code> +
          <code>aria-label</code>. Used when the icon stands alone.
        </p>
        <button
          class="civ-text-btn civ-text-btn--inline"
          type="button"
        >
          <civ-icon name="trash" label="Remove dependent" class="civ-text-error"></civ-icon>
        </button>
      </div>
    </div>
  `,
};

export const InContext: Story = {
  name: 'In context — buttons, alerts, list items',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-text-caption civ-mb-2">Inside an alert</p>
        <div
          class="civ-flex civ-items-start civ-gap-2 civ-p-3"
          style="background: var(--civ-color-warning-lightest); border-inline-start: 4px solid var(--civ-color-warning-DEFAULT); border-radius: var(--civ-border-radius-md);"
          role="status"
        >
          <civ-icon name="warning" class="civ-text-warning" label="Warning"></civ-icon>
          <div>
            <p class="civ-font-semibold civ-m-0">Session expiring soon</p>
            <p class="civ-text-caption civ-m-0">You'll be signed out in 2 minutes.</p>
          </div>
        </div>
      </div>
      <div>
        <p class="civ-text-caption civ-mb-2">Inside a button</p>
        <civ-button label="Continue" icon-end="arrow-right"></civ-button>
      </div>
      <div>
        <p class="civ-text-caption civ-mb-2">In a list-item status</p>
        <ul class="civ-list-none civ-p-0 civ-space-y-1" style="max-width: 320px;">
          <li class="civ-list-item civ-list-item--success">
            <div class="civ-list-item__content civ-flex civ-items-center civ-gap-2">
              <civ-icon name="check-circle" class="civ-text-success"></civ-icon>
              <span>Step 1 of 3</span>
            </div>
          </li>
          <li class="civ-list-item">
            <div class="civ-list-item__content civ-flex civ-items-center civ-gap-2">
              <civ-icon name="loading"></civ-icon>
              <span>Step 2 of 3 (in progress)</span>
            </div>
          </li>
          <li class="civ-list-item">
            <div class="civ-list-item__content civ-flex civ-items-center civ-gap-2 civ-opacity-disabled">
              <span style="display: inline-block; width: 1em; height: 1em;"></span>
              <span>Step 3 of 3 (locked)</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
};
