import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form-group.js';

const meta: Meta = {
  title: 'Forms/Layout/Form Group',
  component: 'civ-form-group',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    'input-id': { control: 'text' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Custom input',
    hint: 'Wraps any native or third-party input with consistent label, hint, and error rendering',
    error: '',
    'input-id': 'custom',
    required: false,
  },
  render: (args) => html`
    <civ-form-group
      label="${args.label}"
      hint="${args.hint}"
      error="${args.error}"
      input-id="${args['input-id']}"
      ?required="${args.required}"
    >
      <input type="text" id="custom" class="civ-input" />
    </civ-form-group>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-group label="Username" input-id="username" error="Username is already taken" required>
      <input type="text" id="username" value="admin" class="civ-input" />
    </civ-form-group>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-group label="Case number" input-id="case-number" hint="Found on the top-right of your notice letter" required>
      <input type="text" id="case-number" class="civ-input" />
    </civ-form-group>
  `,
};

export const WithHintAndError: Story = {
  render: () => html`
    <civ-form-group label="Case number" input-id="case-number" hint="Found on the top-right of your notice letter" error="Enter a valid case number in the format A-123-456-789" required>
      <input type="text" id="case-number" value="XYZ" class="civ-input" />
    </civ-form-group>
  `,
};

export const WithNativeSelect: Story = {
  name: 'With Native Select',
  render: () => html`
    <civ-form-group label="Priority level" input-id="priority" hint="Select urgency for your request">
      <select id="priority" class="civ-input civ-select-field">
        <option value="">- Select -</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </civ-form-group>
  `,
};
