import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-form-group.js';

const meta: Meta = {
  title: 'Forms/Form Group',
  component: 'civds-form-group',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civds-form-group label="Custom input" input-id="custom" hint="Wraps any input with consistent styling">
      <input type="text" id="custom" style="width: 100%; padding: 6px 8px; border: 1px solid #a9aeb1; border-radius: 4px;" />
    </civds-form-group>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-form-group label="Username" input-id="username" error="Username is already taken" required>
      <input type="text" id="username" value="admin" style="width: 100%; padding: 6px 8px; border: 1px solid #b50909; border-left: 4px solid #b50909; border-radius: 4px;" />
    </civds-form-group>
  `,
};
