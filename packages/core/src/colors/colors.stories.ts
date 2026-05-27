import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const swatch = (name: string, token: string, hex: string) => html`
  <div class="civ-flex civ-items-center civ-gap-3 civ-mb-1">
    <div
      style="width: 48px; height: 48px; border-radius: 6px; background: var(${token}); border: 1px solid var(--civ-color-base-lighter);"
    ></div>
    <div>
      <div class="civ-text-body civ-font-semibold">${name}</div>
      <div class="civ-text-small">${hex}</div>
    </div>
  </div>
`;

const paletteSection = (title: string, swatches: ReturnType<typeof html>[]) => html`
  <div class="civ-mb-8">
    <h3 class="civ-heading-md">${title}</h3>
    <div class="civ-flex civ-flex-col civ-gap-2">
      ${swatches}
    </div>
  </div>
`;

export const Primary: Story = {
  render: () => paletteSection('Primary', [
    swatch('Lightest', '--civ-color-primary-lightest', '#d9e8f6'),
    swatch('Lighter', '--civ-color-primary-lighter', '#73b3e7'),
    swatch('Light', '--civ-color-primary-light', '#2378c3'),
    swatch('Default', '--civ-color-primary-DEFAULT', '#005ea2'),
    swatch('Vivid', '--civ-color-primary-vivid', '#0050d8'),
    swatch('Dark', '--civ-color-primary-dark', '#1a4480'),
    swatch('Darker', '--civ-color-primary-darker', '#162e51'),
  ]),
};

export const Error: Story = {
  render: () => paletteSection('Error', [
    swatch('Lightest', '--civ-color-error-lightest', '#faf0f0'),
    swatch('Lighter', '--civ-color-error-lighter', '#f4caca'),
    swatch('Light', '--civ-color-error-light', '#d63e04'),
    swatch('Default', '--civ-color-error-DEFAULT', '#b50909'),
    swatch('Dark', '--civ-color-error-dark', '#8b0a03'),
    swatch('Darkest', '--civ-color-error-darkest', '#5a0602'),
  ]),
};

export const Warning: Story = {
  render: () => paletteSection('Warning', [
    swatch('Lightest', '--civ-color-warning-lightest', '#faf3d1'),
    swatch('Lighter', '--civ-color-warning-lighter', '#fcedb7'),
    swatch('Light', '--civ-color-warning-light', '#fee685'),
    swatch('Default', '--civ-color-warning-DEFAULT', '#e5a000'),
    swatch('Dark', '--civ-color-warning-dark', '#936f38'),
    swatch('Darkest', '--civ-color-warning-darkest', '#6b4c11'),
  ]),
};

export const Success: Story = {
  render: () => paletteSection('Success', [
    swatch('Lightest', '--civ-color-success-lightest', '#ecf3ec'),
    swatch('Lighter', '--civ-color-success-lighter', '#b8e6b8'),
    swatch('Light', '--civ-color-success-light', '#70e17b'),
    swatch('Default', '--civ-color-success-DEFAULT', '#00a91c'),
    swatch('Dark', '--civ-color-success-dark', '#4d8055'),
    swatch('Darkest', '--civ-color-success-darkest', '#1a4d1a'),
  ]),
};

export const Info: Story = {
  render: () => paletteSection('Info', [
    swatch('Lightest', '--civ-color-info-lightest', '#e7f6f8'),
    swatch('Lighter', '--civ-color-info-lighter', '#c5ecf2'),
    swatch('Light', '--civ-color-info-light', '#99deea'),
    swatch('Default', '--civ-color-info-DEFAULT', '#00bde3'),
    swatch('Dark', '--civ-color-info-dark', '#2e6276'),
    swatch('Darkest', '--civ-color-info-darkest', '#1d4554'),
  ]),
};

export const Base: Story = {
  render: () => paletteSection('Base', [
    swatch('Lightest', '--civ-color-base-lightest', '#f0f0f0'),
    swatch('Lighter', '--civ-color-base-lighter', '#dfe1e2'),
    swatch('Light', '--civ-color-base-light', '#a9aeb1'),
    swatch('Default', '--civ-color-base-DEFAULT', '#71767a'),
    swatch('Dark', '--civ-color-base-dark', '#565c65'),
    swatch('Darker', '--civ-color-base-darker', '#3d4551'),
    swatch('Darkest', '--civ-color-base-darkest', '#1b1b1b'),
  ]),
};

export const AllColors: Story = {
  render: () => html`
    <div class="civ-grid civ-gap-8" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
      ${paletteSection('Primary', [
        swatch('Lightest', '--civ-color-primary-lightest', '#d9e8f6'),
        swatch('Lighter', '--civ-color-primary-lighter', '#73b3e7'),
        swatch('Light', '--civ-color-primary-light', '#2378c3'),
        swatch('Default', '--civ-color-primary-DEFAULT', '#005ea2'),
        swatch('Vivid', '--civ-color-primary-vivid', '#0050d8'),
        swatch('Dark', '--civ-color-primary-dark', '#1a4480'),
        swatch('Darker', '--civ-color-primary-darker', '#162e51'),
      ])}
      ${paletteSection('Error', [
        swatch('Lightest', '--civ-color-error-lightest', '#faf0f0'),
        swatch('Lighter', '--civ-color-error-lighter', '#f4caca'),
        swatch('Light', '--civ-color-error-light', '#d63e04'),
        swatch('Default', '--civ-color-error-DEFAULT', '#b50909'),
        swatch('Dark', '--civ-color-error-dark', '#8b0a03'),
        swatch('Darkest', '--civ-color-error-darkest', '#5a0602'),
      ])}
      ${paletteSection('Warning', [
        swatch('Lightest', '--civ-color-warning-lightest', '#faf3d1'),
        swatch('Lighter', '--civ-color-warning-lighter', '#fcedb7'),
        swatch('Light', '--civ-color-warning-light', '#fee685'),
        swatch('Default', '--civ-color-warning-DEFAULT', '#e5a000'),
        swatch('Dark', '--civ-color-warning-dark', '#936f38'),
        swatch('Darkest', '--civ-color-warning-darkest', '#6b4c11'),
      ])}
      ${paletteSection('Success', [
        swatch('Lightest', '--civ-color-success-lightest', '#ecf3ec'),
        swatch('Lighter', '--civ-color-success-lighter', '#b8e6b8'),
        swatch('Light', '--civ-color-success-light', '#70e17b'),
        swatch('Default', '--civ-color-success-DEFAULT', '#00a91c'),
        swatch('Dark', '--civ-color-success-dark', '#4d8055'),
        swatch('Darkest', '--civ-color-success-darkest', '#1a4d1a'),
      ])}
      ${paletteSection('Info', [
        swatch('Lightest', '--civ-color-info-lightest', '#e7f6f8'),
        swatch('Lighter', '--civ-color-info-lighter', '#c5ecf2'),
        swatch('Light', '--civ-color-info-light', '#99deea'),
        swatch('Default', '--civ-color-info-DEFAULT', '#00bde3'),
        swatch('Dark', '--civ-color-info-dark', '#2e6276'),
        swatch('Darkest', '--civ-color-info-darkest', '#1d4554'),
      ])}
      ${paletteSection('Base', [
        swatch('Lightest', '--civ-color-base-lightest', '#f0f0f0'),
        swatch('Lighter', '--civ-color-base-lighter', '#dfe1e2'),
        swatch('Light', '--civ-color-base-light', '#a9aeb1'),
        swatch('Default', '--civ-color-base-DEFAULT', '#71767a'),
        swatch('Dark', '--civ-color-base-dark', '#565c65'),
        swatch('Darker', '--civ-color-base-darker', '#3d4551'),
        swatch('Darkest', '--civ-color-base-darkest', '#1b1b1b'),
      ])}
    </div>
  `,
};

export const SemanticUsage: Story = {
  name: 'Usage: Semantic Colors',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6 civ-max-w-2xl">
      <div>
        <h3 class="civ-heading-sm">Text colors</h3>
        <p class="civ-text-primary">Primary — links and interactive text</p>
        <p class="civ-text-error">Error — validation messages</p>
        <p style="color: var(--civ-color-success-DEFAULT);">Success — confirmation text</p>
        <p class="civ-text-body">Body — default page text</p>
        <p class="civ-text-muted">Muted — secondary text</p>
        <p class="civ-text-caption">Caption — supplementary text</p>
      </div>

      <div>
        <h3 class="civ-heading-sm">Background colors</h3>
        <div class="civ-flex civ-flex-col civ-gap-2">
          <div class="civ-bg-primary-lightest civ-p-3 civ-rounded">civ-bg-primary-lightest — info panels</div>
          <div class="civ-bg-error-lightest civ-p-3 civ-rounded">civ-bg-error-lightest — error summaries</div>
          <div class="civ-bg-warning-lightest civ-p-3 civ-rounded">civ-bg-warning-lightest — warning alerts</div>
          <div class="civ-bg-success-lightest civ-p-3 civ-rounded">civ-bg-success-lightest — success banners</div>
          <div class="civ-bg-info-lightest civ-p-3 civ-rounded">civ-bg-info-lightest — informational callouts</div>
        </div>
      </div>

      <div>
        <h3 class="civ-heading-sm">Border colors</h3>
        <div class="civ-flex civ-flex-col civ-gap-2">
          <div class="civ-border-s-4 civ-border-primary civ-p-3">civ-border-primary — highlighted section</div>
          <div class="civ-border-s-4 civ-border-error civ-p-3">civ-border-error — error field indicator</div>
          <div class="civ-border-s-4 civ-border-warning civ-p-3">civ-border-warning — caution indicator</div>
          <div class="civ-border civ-border-base-light civ-p-3">civ-border-base-light — default container</div>
        </div>
      </div>
    </div>
  `,
};
