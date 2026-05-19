import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/number/number.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Number/Drupal SDC',
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'quantity',
    label: 'Quantity',
  }),
};

export const WithRange: Story = {
  render: () => render(template, {
    name: 'age',
    label: 'Age',
    min: 0,
    max: 120,
    hint: 'Enter a whole number between 0 and 120',
    required: true,
  }),
};

export const Decimal: Story = {
  render: () => render(template, {
    name: 'weight',
    label: 'Weight (kg)',
    allow_decimal: true,
    min: 0,
  }),
};

export const WithSuffix: Story = {
  render: () => render(template, {
    name: 'discount',
    label: 'Discount applied',
    suffix: '%',
    min: 0,
    max: 100,
  }),
};

export const Negative: Story = {
  render: () => render(template, {
    name: 'temp',
    label: 'Temperature (°C)',
    allow_decimal: true,
    allow_negative: true,
  }),
};

export const WithError: Story = {
  render: () => render(template, {
    name: 'age',
    label: 'Age',
    value: '200',
    min: 0,
    max: 120,
    error: 'Age must be between 0 and 120',
  }),
};

export const Required: Story = {
  render: () => render(template, {
    name: 'count',
    label: 'How many?',
    required: true,
    min: 1,
  }),
};

export const Disabled: Story = {
  render: () => render(template, {
    name: 'qty',
    label: 'Quantity',
    value: '5',
    disabled: true,
  }),
};
