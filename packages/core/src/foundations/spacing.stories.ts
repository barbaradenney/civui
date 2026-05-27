import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/layout/card';
import '@civui/layout/divider';
import '@civui/layout/page-header';
import '@civui/feedback/alert';
import '@civui/data/metric-tile';
import '@civui/data/metric-group';

const meta: Meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const SCALE_ROWS = [
  { token: '0', value: '0px', use: '— (margin-reset)' },
  { token: '0.5', value: '3px', use: 'tightest inline gaps' },
  { token: '1', value: '5px', use: 'hint→input, error→input' },
  { token: '1.5', value: '8px', use: 'input→inline action button' },
  { token: '2', value: '10px', use: 'heading-sm→body, alert internals' },
  { token: '3', value: '15px', use: 'heading-md→body, modal sections' },
  { token: '4', value: '20px', use: 'standard between-blocks cadence' },
  { token: '5', value: '25px', use: 'rare — data-grid bulk actions' },
  { token: '6', value: '30px', use: 'heading-xl→body, page-header bottom' },
  { token: '8', value: '40px', use: 'rare — major page sections' },
  { token: '10', value: '50px', use: 'rare — hero inner padding' },
  { token: '12', value: '60px', use: 'rare — back-to-top offset' },
  { token: '20', value: '100px', use: 'rare — back-to-top offset' },
];

export const Scale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <p class="civ-text-caption">
        CivUI's spacing scale is <strong>5px-based</strong>, not the
        default Tailwind 4px scale. <code>civ-p-4</code> renders 20px
        of padding, not 16px. The workhorses are
        <code>0 / 1 / 2 / 3 / 4 / 6</code> — reach for these by
        default. Larger steps (<code>5, 8, 10, 12, 20</code>) are
        sparse-use; <code>2.5</code> and <code>16</code> are reserved
        but currently unused in production CSS.
      </p>

      <table class="civ-table civ-table--bordered civ-table--sm">
        <thead>
          <tr>
            <th>Token</th>
            <th>Px</th>
            <th>Typical use</th>
            <th>Visual</th>
          </tr>
        </thead>
        <tbody>
          ${SCALE_ROWS.map(
            (row) => html`
              <tr>
                <td><code>${row.token}</code></td>
                <td>${row.value}</td>
                <td>${row.use}</td>
                <td>
                  <div
                    class="civ-bg-primary"
                    style="height: 12px; width: ${row.value};"
                  ></div>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    </div>
  `,
};

export const RhythmTiers: Story = {
  name: 'Rhythm Tiers',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <p class="civ-text-caption">
        Components fall into one of three vertical-rhythm tiers, set
        by whether the component owns its own position in the page
        flow or relies on a parent layout's <code>gap</code>. The
        coloured tracks below show the standard cadence between
        sibling components.
      </p>

      <div class="civ-flex civ-flex-col civ-gap-8">
        <div>
          <p class="civ-text-caption civ-mb-2">
            <strong>Tier 1 — top-of-page (mb-6, 30px).</strong>
            <code>civ-page-header</code>, <code>civ-heading-xl</code>.
            Creates breathing room before the first content block.
          </p>
          <div
            class="civ-p-4"
            style="border: 1px dashed var(--civ-color-base-light);"
          >
            <civ-page-header>
              <h1 data-heading>Apply for compensation</h1>
              <p data-subheading>Step 1 of 4 — Personal information</p>
            </civ-page-header>
            <p class="civ-text-body">
              First content block of the page. The 30px gap above
              (set by civ-page-header's own civ-mb-6) is the cadence
              you should see between any page-header and its first
              real content.
            </p>
          </div>
        </div>

        <div>
          <p class="civ-text-caption civ-mb-2">
            <strong>Tier 2 — block stack (mb-4, 20px).</strong>
            <code>civ-fieldset</code>, <code>civ-card</code>,
            <code>civ-alert</code>, <code>civ-form-error-summary</code>,
            <code>civ-input-group</code>. Each owns its bottom margin so
            consumers can drop them in a vertical stack and get
            consistent rhythm without thinking.
          </p>
          <div
            class="civ-p-4"
            style="border: 1px dashed var(--civ-color-base-light);"
          >
            <civ-alert intent="info">
              <span slot="heading">Alert with its own mb-4</span>
              <p>Followed by 20px of space before the card.</p>
            </civ-alert>
            <civ-card>
              <h3 slot="data-card-header">Card with its own mb-4</h3>
              <p>Followed by 20px of space before the next block.</p>
            </civ-card>
            <civ-card>
              <h3 slot="data-card-header">Another card</h3>
              <p>Each block carries its own mb-4. Consumer adds no margins.</p>
            </civ-card>
          </div>
        </div>

        <div>
          <p class="civ-text-caption civ-mb-2">
            <strong>Tier 3 — gap-controlled (no mb).</strong>
            <code>civ-metric-tile</code>, <code>civ-link-card</code>,
            <code>civ-callout</code>, <code>civ-list-item</code>,
            <code>civ-data-grid</code> and most data-display
            components. These typically live inside a flex / grid
            parent that controls the gap. Adding <code>civ-mb-4</code>
            to them would double-space when nested in a
            <code>civ-gap-4</code> parent.
          </p>
          <div
            class="civ-p-4"
            style="border: 1px dashed var(--civ-color-base-light);"
          >
            <civ-metric-group columns="3">
              <civ-metric-tile label="Pending" value="3"></civ-metric-tile>
              <civ-metric-tile label="In review" value="12"></civ-metric-tile>
              <civ-metric-tile label="Approved" value="48"></civ-metric-tile>
            </civ-metric-group>
            <p class="civ-text-caption civ-mt-2">
              The metric-tiles above are laid out by
              <code>civ-metric-group</code>'s grid + gap — they don't
              carry margin-bottom themselves.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const HeadingInnerMargin: Story = {
  name: 'Heading Inner Margin',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <p class="civ-text-caption">
        A separate rhythm applies INSIDE a section: the gap between
        a heading and the content immediately below it. The inner
        margin scales with the heading size — heading-xl gets more
        breathing room before its body than heading-sm does. This
        is a recipe, baked into the heading classes; new headings
        shouldn't override.
      </p>

      <div class="civ-flex civ-flex-col civ-gap-6">
        <div style="border: 1px dashed var(--civ-color-base-light); padding: 1rem;">
          <h1 class="civ-heading-xl">Heading XL → 30px below (mb-6)</h1>
          <p class="civ-text-body">Body text immediately below.</p>
        </div>
        <div style="border: 1px dashed var(--civ-color-base-light); padding: 1rem;">
          <h2 class="civ-heading-lg">Heading LG → 20px below (mb-4)</h2>
          <p class="civ-text-body">Body text immediately below.</p>
        </div>
        <div style="border: 1px dashed var(--civ-color-base-light); padding: 1rem;">
          <h3 class="civ-heading-md">Heading MD → 15px below (mb-3)</h3>
          <p class="civ-text-body">Body text immediately below.</p>
        </div>
        <div style="border: 1px dashed var(--civ-color-base-light); padding: 1rem;">
          <h4 class="civ-heading-sm">Heading SM → 10px below (mb-2)</h4>
          <p class="civ-text-body">Body text immediately below.</p>
        </div>
      </div>
    </div>
  `,
};

export const FourIsNotSixteenPx: Story = {
  name: '4 Is Not 16px',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <p class="civ-text-caption">
        The biggest spacing gotcha for anyone arriving from default
        Tailwind: <code>civ-p-4</code> is <strong>20px</strong>, not
        16px. CivUI's scale is 5px-based, so each step is 25% larger
        than the equivalent default-Tailwind step. If your mockups
        called for 16px padding, reach for <code>civ-p-3</code> (15px)
        — the closest CivUI value.
      </p>

      <div class="civ-flex civ-flex-col civ-gap-3">
        <div>
          <p class="civ-text-caption civ-mb-1">civ-p-3 (15px)</p>
          <div
            class="civ-p-3 civ-bg-primary-lightest"
            style="border: 1px solid var(--civ-color-primary-DEFAULT);"
          >
            What 16px-default-Tailwind looks like in CivUI (15px).
          </div>
        </div>
        <div>
          <p class="civ-text-caption civ-mb-1">civ-p-4 (20px) — the CivUI default for block padding</p>
          <div
            class="civ-p-4 civ-bg-primary-lightest"
            style="border: 1px solid var(--civ-color-primary-DEFAULT);"
          >
            What you get when you write civ-p-4 (20px, not 16px).
          </div>
        </div>
      </div>
    </div>
  `,
};
