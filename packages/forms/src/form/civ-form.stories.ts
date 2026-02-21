import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form.js';
import '../text-input/civ-text-input.js';
import '../textarea/civ-textarea.js';

const meta: Meta = {
  title: 'Forms/Form',
  component: 'civ-form',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-form>
      <civ-text-input label="Full name" name="name" required></civ-text-input>
      <civ-text-input label="Email" name="email" type="email" required></civ-text-input>
      <civ-textarea label="Message" name="message"></civ-textarea>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit
      </button>
    </civ-form>
  `,
};

export const WithValidation: Story = {
  render: () => html`
    <civ-form
      @civ-submit="${(e: CustomEvent) => {
        console.log('Form submitted!', e.detail);
        alert('Form submitted successfully!');
      }}"
      @civ-invalid="${(e: CustomEvent) => {
        console.log('Validation failed:', e.detail.errors);
      }}"
    >
      <civ-text-input label="First name" name="firstName" required></civ-text-input>
      <civ-text-input label="Last name" name="lastName" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required></civ-text-input>
      <civ-text-input label="Phone" name="phone"></civ-text-input>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <button
          type="submit"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
        >
          Submit
        </button>
        <button
          type="reset"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-white civ-text-base-darkest civ-font-bold civ-border civ-border-base-light civ-rounded civ-cursor-pointer"
        >
          Reset
        </button>
      </div>
    </civ-form>
  `,
};

export const WithResetButton: Story = {
  render: () => html`
    <civ-form>
      <civ-text-input label="Username" name="username" required></civ-text-input>
      <civ-text-input label="Password" name="password" type="password" required></civ-text-input>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <button
          type="submit"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer focus-visible:civ-focus-ring-inverse"
        >
          Login
        </button>
        <button
          type="reset"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-white civ-text-base-darkest civ-font-bold civ-border civ-border-base-light civ-rounded civ-cursor-pointer"
        >
          Clear
        </button>
      </div>
    </civ-form>
  `,
};
