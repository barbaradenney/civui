import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-form.js';
import '../text-input/civds-text-input.js';
import '../textarea/civds-textarea.js';

const meta: Meta = {
  title: 'Forms/Form',
  component: 'civds-form',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civds-form>
      <civds-text-input label="Full name" name="name" required></civds-text-input>
      <civds-text-input label="Email" name="email" type="email" required></civds-text-input>
      <civds-textarea label="Message" name="message"></civds-textarea>
      <button
        type="submit"
        class="civds-inline-block civds-px-5 civds-py-2.5 civds-bg-primary civds-text-white civds-font-bold civds-border-0 civds-rounded civds-cursor-pointer hover:civds-bg-primary-dark"
      >
        Submit
      </button>
    </civds-form>
  `,
};

export const WithValidation: Story = {
  render: () => html`
    <civds-form
      @civds-submit="${(e: CustomEvent) => {
        console.log('Form submitted!', e.detail);
        alert('Form submitted successfully!');
      }}"
      @civds-invalid="${(e: CustomEvent) => {
        console.log('Validation failed:', e.detail.errors);
      }}"
    >
      <civds-text-input label="First name" name="firstName" required></civds-text-input>
      <civds-text-input label="Last name" name="lastName" required></civds-text-input>
      <civds-text-input label="Email address" name="email" type="email" required></civds-text-input>
      <civds-text-input label="Phone" name="phone"></civds-text-input>
      <div class="civds-mt-4 civds-flex civds-gap-2">
        <button
          type="submit"
          class="civds-inline-block civds-px-5 civds-py-2.5 civds-bg-primary civds-text-white civds-font-bold civds-border-0 civds-rounded civds-cursor-pointer hover:civds-bg-primary-dark"
        >
          Submit
        </button>
        <button
          type="reset"
          class="civds-inline-block civds-px-5 civds-py-2.5 civds-bg-white civds-text-base-darkest civds-font-bold civds-border civds-border-base-light civds-rounded civds-cursor-pointer"
        >
          Reset
        </button>
      </div>
    </civds-form>
  `,
};

export const WithResetButton: Story = {
  render: () => html`
    <civds-form>
      <civds-text-input label="Username" name="username" required></civds-text-input>
      <civds-text-input label="Password" name="password" type="password" required></civds-text-input>
      <div class="civds-mt-4 civds-flex civds-gap-2">
        <button
          type="submit"
          class="civds-inline-block civds-px-5 civds-py-2.5 civds-bg-primary civds-text-white civds-font-bold civds-border-0 civds-rounded civds-cursor-pointer"
        >
          Login
        </button>
        <button
          type="reset"
          class="civds-inline-block civds-px-5 civds-py-2.5 civds-bg-white civds-text-base-darkest civds-font-bold civds-border civds-border-base-light civds-rounded civds-cursor-pointer"
        >
          Clear
        </button>
      </div>
    </civds-form>
  `,
};
