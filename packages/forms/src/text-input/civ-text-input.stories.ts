import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-text-input.js';

const meta: Meta = {
  title: 'Forms/Text Input',
  component: 'civ-text-input',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'password', 'search', 'tel', 'url'],
    },
    width: {
      control: 'select',
      options: ['default', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Text input',
    name: 'text-input',
    hint: '',
    error: '',
    placeholder: '',
    type: 'text',
    width: 'default',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-text-input
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      placeholder="${args.placeholder}"
      type="${args.type}"
      width="${args.width}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-text-input>
  `,
};

export const WithHint: Story = {
  args: {
    label: 'Email address',
    name: 'email',
    hint: 'Enter your work email address',
    type: 'email',
  },
  render: (args) => html`
    <civ-text-input
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint}"
      type="${args.type}"
    ></civ-text-input>
  `,
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    name: 'email',
    error: 'Enter a valid email address',
    type: 'email',
  },
  render: (args) => html`
    <civ-text-input
      label="${args.label}"
      name="${args.name}"
      error="${args.error}"
      type="${args.type}"
    ></civ-text-input>
  `,
};

export const Required: Story = {
  args: {
    label: 'Full name',
    name: 'full-name',
    required: true,
  },
  render: (args) => html`
    <civ-text-input
      label="${args.label}"
      name="${args.name}"
      ?required="${args.required}"
    ></civ-text-input>
  `,
};

export const Disabled: Story = {
  args: {
    label: 'Disabled input',
    name: 'disabled',
    value: 'Cannot edit',
    disabled: true,
  },
  render: (args) => html`
    <civ-text-input
      label="${args.label}"
      name="${args.name}"
      value="${args.value}"
      ?disabled="${args.disabled}"
    ></civ-text-input>
  `,
};

export const WidthVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <civ-text-input label="2xs width" name="w-2xs" width="2xs"></civ-text-input>
      <civ-text-input label="xs width" name="w-xs" width="xs"></civ-text-input>
      <civ-text-input label="sm width (ZIP code)" name="w-sm" width="sm"></civ-text-input>
      <civ-text-input label="md width" name="w-md" width="md"></civ-text-input>
      <civ-text-input label="lg width" name="w-lg" width="lg"></civ-text-input>
      <civ-text-input label="xl width" name="w-xl" width="xl"></civ-text-input>
      <civ-text-input label="2xl width" name="w-2xl" width="2xl"></civ-text-input>
      <civ-text-input label="Default (full width)" name="w-default"></civ-text-input>
    </div>
  `,
};

export const InputTypes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <civ-text-input label="Text" name="text" type="text"></civ-text-input>
      <civ-text-input label="Email" name="email" type="email" placeholder="you@example.com"></civ-text-input>
      <civ-text-input label="Password" name="password" type="password"></civ-text-input>
      <civ-text-input label="Phone" name="phone" type="tel" placeholder="(555) 555-5555"></civ-text-input>
      <civ-text-input label="URL" name="url" type="url" placeholder="https://example.com"></civ-text-input>
      <civ-text-input label="Number" name="number" type="number"></civ-text-input>
    </div>
  `,
};

export const InNativeForm: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-text-input label="First name" name="first-name" required></civ-text-input>
      <civ-text-input label="Last name" name="last-name" required></civ-text-input>
      <civ-text-input label="Email" name="email" type="email" required hint="We'll never share your email"></civ-text-input>
      <button type="submit" style="margin-top: 16px; padding: 8px 24px; background: #005ea2; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Submit
      </button>
    </form>
  `,
};

export const ExternalLabel: Story = {
  render: () => html`
    <p style="margin-bottom: 8px; color: #565c65; font-size: 14px;">
      Because CivUI uses Light DOM, external labels work naturally with <code>for</code>/<code>id</code>:
    </p>
    <label for="external-email" style="font-weight: bold;">External label for email</label>
    <civ-text-input id="external-email" name="email" type="email"></civ-text-input>
  `,
};
