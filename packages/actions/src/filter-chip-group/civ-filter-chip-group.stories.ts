import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-filter-chip-group.js';
import '../filter-chip/civ-filter-chip.js';

const meta: Meta = {
  title: 'Actions/Filter Chip Group',
  component: 'civ-filter-chip-group',
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multi'],
    },
    label: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Coordinates a row of `civ-filter-chip` children. Adds roving tabindex (one Tab stop, arrow keys to navigate), enforces single-select if `mode="single"`, and emits an aggregated `civ-change` with the full selected value(s).',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { mode: 'multi', label: 'Filter by category' },
  render: (args) => html`
    <civ-filter-chip-group mode="${args.mode}" label="${args.label}">
      <civ-filter-chip label="Healthcare" value="health"></civ-filter-chip>
      <civ-filter-chip label="Education" value="education"></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing"></civ-filter-chip>
      <civ-filter-chip label="Employment" value="employment"></civ-filter-chip>
    </civ-filter-chip-group>
  `,
};

export const SingleSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'In `mode="single"` only one chip can be selected at a time — toggling a new chip deselects siblings (radio-like). Useful for view modes or sort orders.',
      },
    },
  },
  render: () => html`
    <civ-filter-chip-group mode="single" label="Sort by">
      <civ-filter-chip label="Newest" value="newest" selected></civ-filter-chip>
      <civ-filter-chip label="Oldest" value="oldest"></civ-filter-chip>
      <civ-filter-chip label="A → Z" value="alpha"></civ-filter-chip>
    </civ-filter-chip-group>
  `,
};

export const MultiSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default `mode="multi"` lets each chip toggle independently. Pair with a count suffix to show how many results match each filter.',
      },
    },
  },
  render: () => html`
    <civ-filter-chip-group mode="multi" label="Filter by category">
      <civ-filter-chip label="Healthcare" value="health" count="24"></civ-filter-chip>
      <civ-filter-chip label="Education" value="education" count="12"></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing" count="8"></civ-filter-chip>
      <civ-filter-chip label="Employment" value="employment" count="3"></civ-filter-chip>
    </civ-filter-chip-group>
  `,
};

export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tab once into the group, then use **Arrow keys** to move across chips. **Home** jumps to first, **End** to last. Disabled chips are skipped. Try it: focus the first chip and press `→`.',
      },
    },
  },
  render: () => html`
    <civ-filter-chip-group mode="multi" label="Status filter">
      <civ-filter-chip label="Open" value="open" selected></civ-filter-chip>
      <civ-filter-chip label="In review" value="review"></civ-filter-chip>
      <civ-filter-chip label="Approved" value="approved"></civ-filter-chip>
      <civ-filter-chip label="Closed" value="closed" disabled></civ-filter-chip>
      <civ-filter-chip label="Archived" value="archived"></civ-filter-chip>
    </civ-filter-chip-group>
  `,
};

export const PrimaryStyleGroup: Story = {
  name: 'Primary-style chips',
  render: () => html`
    <civ-filter-chip-group mode="multi" label="Filter by category">
      <civ-filter-chip label="Healthcare" value="health" chip-style="primary" selected></civ-filter-chip>
      <civ-filter-chip label="Education" value="education" chip-style="primary"></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing" chip-style="primary" selected></civ-filter-chip>
    </civ-filter-chip-group>
  `,
};
