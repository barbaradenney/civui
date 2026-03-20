import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form-group.js';

const meta: Meta = {
  title: 'Forms/Form Group',
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
    hint: 'Wraps any input with consistent styling',
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
      <input type="text" id="custom" style="width: 100%; padding: 6px 8px; border: 1px solid #a9aeb1; border-radius: 4px;" />
    </civ-form-group>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-group label="Username" input-id="username" error="Username is already taken" required>
      <input type="text" id="username" value="admin" style="width: 100%; padding: 6px 8px; border: 1px solid #b50909; border-left: 4px solid #b50909; border-radius: 4px;" />
    </civ-form-group>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-group label="Social Security number" input-id="ssn" hint="For example: 123-45-6789" required>
      <input type="text" id="ssn" inputmode="numeric" pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}" style="width: 100%; padding: 6px 8px; border: 1px solid #a9aeb1; border-radius: 4px;" />
    </civ-form-group>
  `,
};

export const WithHintAndError: Story = {
  render: () => html`
    <civ-form-group label="Case number" input-id="case-number" hint="Found on the top-right of your notice letter" error="Enter a valid case number in the format A-123-456-789" required>
      <input type="text" id="case-number" value="XYZ" style="width: 100%; padding: 6px 8px; border: 1px solid #b50909; border-left: 4px solid #b50909; border-radius: 4px;" />
    </civ-form-group>
  `,
};
