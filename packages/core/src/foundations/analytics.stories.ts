import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/controls/checkbox';
import '@civui/inputs/toggle';
import '@civui/actions/button';

const meta: Meta = {
  title: 'Foundations/Analytics',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Every interactive component fires a bubbling \`civ-analytics\` event
with a structured payload — \`componentName\`, \`action\`,
\`fieldName\`, \`label\`, \`timestamp\`, optional \`details\`.

The stories below wire a local listener that logs each event so you
can see the payload shape without leaving the page. Field values are
never included — PII-flagged components set \`piiMasked: true\` in
the detail.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const renderEventLog = () => {
  const id = `analytics-${Math.random().toString(36).slice(2, 8)}`;
  requestAnimationFrame(() => {
    const root = document.getElementById(`${id}-root`);
    const log = document.getElementById(`${id}-log`);
    if (!root || !log) return;
    root.addEventListener('civ-analytics', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const line = document.createElement('pre');
      line.style.margin = '0';
      line.style.fontSize = '12px';
      line.textContent = JSON.stringify(
        {
          componentName: detail.componentName,
          action: detail.action,
          fieldName: detail.fieldName,
          label: detail.label,
          ...(detail.piiMasked !== undefined ? { piiMasked: detail.piiMasked } : {}),
          ...(detail.details ? { details: detail.details } : {}),
        },
        null,
        2,
      );
      log.insertBefore(line, log.firstChild);
      const lines = log.querySelectorAll('pre');
      if (lines.length > 8) lines[lines.length - 1].remove();
    });
  });
  return id;
};

export const InteractAndWatch: Story = {
  name: 'Interact and watch the event payload',
  render: () => {
    const id = renderEventLog();
    return html`
      <div id="${id}-root" class="civ-grid civ-gap-4" style="grid-template-columns: 1fr 1fr;">
        <div class="civ-flex civ-flex-col civ-gap-3">
          <p class="civ-text-caption civ-mb-0">Interactive controls</p>
          <civ-text-input label="Full name" name="name"></civ-text-input>
          <civ-select label="State of residence" name="state">
            <option value="">- Select -</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </civ-select>
          <civ-checkbox label="Subscribe to updates" name="subscribe"></civ-checkbox>
          <civ-toggle label="Email notifications" name="notifications"></civ-toggle>
          <civ-button label="Submit"></civ-button>
        </div>
        <div>
          <p class="civ-text-caption civ-mb-2">civ-analytics events</p>
          <div
            id="${id}-log"
            class="civ-p-3"
            style="background: var(--civ-color-base-lightest); border-radius: var(--civ-border-radius-md); min-height: 240px; max-height: 320px; overflow: auto; display: flex; flex-direction: column; gap: var(--civ-spacing-2);"
            aria-live="off"
          ></div>
        </div>
      </div>
    `;
  },
};

export const OptOut: Story = {
  name: 'Opt out with disable-analytics',
  parameters: {
    docs: {
      description: {
        story:
          'Add <code>disable-analytics</code> to any component to suppress its <code>civ-analytics</code> events. Useful for fields you don\'t want in your funnel, or for debugging.',
      },
    },
  },
  render: () => {
    const id = renderEventLog();
    return html`
      <div id="${id}-root" class="civ-grid civ-gap-4" style="grid-template-columns: 1fr 1fr;">
        <div class="civ-flex civ-flex-col civ-gap-3">
          <p class="civ-text-caption civ-mb-0">
            Type into both fields. Only the first one fires events.
          </p>
          <civ-text-input
            label="Tracked field"
            name="tracked"
            hint="Fires civ-analytics on every change"
          ></civ-text-input>
          <civ-text-input
            label="Untracked field"
            name="untracked"
            hint="Has disable-analytics — no events"
            disable-analytics
          ></civ-text-input>
        </div>
        <div>
          <p class="civ-text-caption civ-mb-2">civ-analytics events</p>
          <div
            id="${id}-log"
            class="civ-p-3"
            style="background: var(--civ-color-base-lightest); border-radius: var(--civ-border-radius-md); min-height: 240px; max-height: 320px; overflow: auto; display: flex; flex-direction: column; gap: var(--civ-spacing-2);"
            aria-live="off"
          ></div>
        </div>
      </div>
    `;
  },
};
