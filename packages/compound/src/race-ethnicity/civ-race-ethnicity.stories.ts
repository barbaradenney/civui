import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-race-ethnicity.js';

const meta: Meta = {
  title: 'Forms/Compound/Race & Ethnicity',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Compound component implementing the OMB standard for collecting race
and ethnicity data. Renders ethnicity as a radio group and race as
a checkbox group (multi-select).

This is the standard pattern required on federal forms — ethnicity and
race are collected separately because individuals may identify with
multiple races but select one ethnicity category.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-race-ethnicity
      legend="Race and ethnicity"
      name="demographics"
      required
    ></civ-race-ethnicity>
  `,
};

export const WithCustomLegends: Story = {
  name: 'Custom Section Legends',
  render: () => html`
    <civ-race-ethnicity
      legend="Demographic information"
      ethnicity-legend="What is your ethnicity?"
      race-legend="What is your race?"
      name="demographics"
      required
    ></civ-race-ethnicity>
  `,
};

export const Prefilled: Story = {
  render: () => html`
    <civ-race-ethnicity
      legend="Race and ethnicity"
      name="demographics"
      value='{"ethnicity":"not-hispanic-latino","race":["white","asian"]}'
    ></civ-race-ethnicity>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-race-ethnicity
      legend="Race and ethnicity"
      name="demographics"
      value='{"ethnicity":"hispanic-latino","race":["white"]}'
      disabled
    ></civ-race-ethnicity>
  `,
};
