import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form-group.js';

const meta: Meta = {
  title: 'Forms/Form Group',
  component: 'civ-form-group',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-form-group label="Custom input" input-id="custom" hint="Wraps any input with consistent styling">
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
