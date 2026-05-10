import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './text-input/civ-text-input.js';
import './select/civ-select.js';
import './textarea/civ-textarea.js';
import '@civui/controls';

const meta: Meta = {
  title: 'Foundations/Density',
  tags: ['autodocs'],
  argTypes: {
    scale: {
      control: 'select',
      options: ['default', 'spacious', 'dense'],
      description: 'Set data-civ-scale on the wrapper to switch density',
    },
  },
};

export default meta;
type Story = StoryObj;

const formTemplate = () => html`
  <civ-form-field label="Full name" hint="First and last name" required>
    <civ-text-input name="name" required></civ-text-input>
  </civ-form-field>
  <civ-form-field label="Email address" hint="We'll use this to contact you" required>
    <civ-text-input name="email" type="email" required></civ-text-input>
  </civ-form-field>
  <civ-form-field label="State">
    <civ-select
      name="state"
      .options="${[
        { value: 'ca', label: 'California' },
        { value: 'ny', label: 'New York' },
        { value: 'tx', label: 'Texas' },
      ]}"
    ></civ-select>
  </civ-form-field>
  <civ-form-field label="Comments" hint="Optional feedback">
    <civ-textarea name="comments" rows="3" maxlength="200"></civ-textarea>
  </civ-form-field>
  <civ-checkbox
    label="I agree to the terms"
    name="terms"
    required
  ></civ-checkbox>
`;

/**
 * Switch density with the `scale` control. The same form components
 * automatically resize their fonts, padding, and spacing based on
 * the `data-civ-scale` attribute on a parent element.
 */
export const Interactive: Story = {
  args: { scale: 'default' },
  render: (args) => html`
    <div data-civ-scale="${args.scale}">
      <p class="civ-text-sm civ-mb-4" style="color: var(--civ-color-base-dark);">
        Current density: <strong>${args.scale}</strong>
      </p>
      ${formTemplate()}
    </div>
  `,
};

/**
 * All three densities rendered side-by-side for visual comparison.
 * Notice how font sizes, input padding, and vertical spacing all
 * respond to the density scale without any component changes.
 */
export const SideBySide: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; align-items: start;">
      <div data-civ-scale="spacious">
        <h3 class="civ-text-lg civ-font-bold civ-mb-4" style="color: var(--civ-color-primary-dark);">
          Spacious
        </h3>
        ${formTemplate()}
      </div>
      <div>
        <h3 class="civ-text-lg civ-font-bold civ-mb-4" style="color: var(--civ-color-primary-dark);">
          Default
        </h3>
        ${formTemplate()}
      </div>
      <div data-civ-scale="dense">
        <h3 class="civ-text-lg civ-font-bold civ-mb-4" style="color: var(--civ-color-primary-dark);">
          Dense
        </h3>
        ${formTemplate()}
      </div>
    </div>
  `,
};
