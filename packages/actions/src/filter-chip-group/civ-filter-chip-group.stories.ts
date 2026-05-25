import type { Meta, StoryObj } from '@storybook/web-components-vite';
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

export const AppointmentTimeSlots: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use single-select chip groups to let users pick an available appointment time. Pair with a date picker or segmented control for the date, then show available slots as chips. Unavailable times are `disabled`. The compact `spacing="sm"` keeps the layout tight when there are many slots.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 1.5rem; max-width: 480px;">
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 700;">Monday, May 5</p>
        <civ-filter-chip-group mode="single" label="Available times for May 5">
          <civ-filter-chip label="9:00 AM" value="mon-0900" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="9:30 AM" value="mon-0930" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="10:00 AM" value="mon-1000" spacing="sm" disabled></civ-filter-chip>
          <civ-filter-chip label="10:30 AM" value="mon-1030" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="11:00 AM" value="mon-1100" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="1:00 PM" value="mon-1300" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="1:30 PM" value="mon-1330" spacing="sm" disabled></civ-filter-chip>
          <civ-filter-chip label="2:00 PM" value="mon-1400" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="2:30 PM" value="mon-1430" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="3:00 PM" value="mon-1500" spacing="sm"></civ-filter-chip>
        </civ-filter-chip-group>
      </div>
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 700;">Tuesday, May 6</p>
        <civ-filter-chip-group mode="single" label="Available times for May 6">
          <civ-filter-chip label="9:00 AM" value="tue-0900" spacing="sm" disabled></civ-filter-chip>
          <civ-filter-chip label="9:30 AM" value="tue-0930" spacing="sm" disabled></civ-filter-chip>
          <civ-filter-chip label="10:00 AM" value="tue-1000" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="10:30 AM" value="tue-1030" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="11:00 AM" value="tue-1100" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="1:00 PM" value="tue-1300" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="1:30 PM" value="tue-1330" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="2:00 PM" value="tue-1400" spacing="sm" disabled></civ-filter-chip>
        </civ-filter-chip-group>
      </div>
      <div>
        <p style="margin: 0 0 0.5rem; font-weight: 700;">Wednesday, May 7</p>
        <civ-filter-chip-group mode="single" label="Available times for May 7">
          <civ-filter-chip label="9:00 AM" value="wed-0900" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="10:00 AM" value="wed-1000" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="11:00 AM" value="wed-1100" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="2:00 PM" value="wed-1400" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="3:00 PM" value="wed-1500" spacing="sm"></civ-filter-chip>
        </civ-filter-chip-group>
      </div>
    </div>
  `,
};

export const AppointmentWithSelection: Story = {
  name: 'Appointment — Pre-selected',
  parameters: {
    docs: {
      description: {
        story:
          'Shows a selected time slot with primary chip style for stronger visual emphasis. The selected chip uses `chip-style="primary"` to stand out as the confirmed choice.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px;">
      <p style="margin: 0 0 0.5rem; font-weight: 700;">Monday, May 5</p>
      <civ-filter-chip-group mode="single" label="Available times for May 5">
        <civ-filter-chip label="9:00 AM" value="0900" spacing="sm" emphasis="primary"></civ-filter-chip>
        <civ-filter-chip label="9:30 AM" value="0930" spacing="sm" emphasis="primary"></civ-filter-chip>
        <civ-filter-chip label="10:00 AM" value="1000" spacing="sm" emphasis="primary" disabled></civ-filter-chip>
        <civ-filter-chip label="10:30 AM" value="1030" spacing="sm" emphasis="primary" selected></civ-filter-chip>
        <civ-filter-chip label="11:00 AM" value="1100" spacing="sm" emphasis="primary"></civ-filter-chip>
        <civ-filter-chip label="1:00 PM" value="1300" spacing="sm" emphasis="primary"></civ-filter-chip>
        <civ-filter-chip label="1:30 PM" value="1330" spacing="sm" emphasis="primary" disabled></civ-filter-chip>
        <civ-filter-chip label="2:00 PM" value="1400" spacing="sm" emphasis="primary"></civ-filter-chip>
      </civ-filter-chip-group>
    </div>
  `,
};

export const PrimaryStyleGroup: Story = {
  name: 'Primary-style chips',
  render: () => html`
    <civ-filter-chip-group mode="multi" label="Filter by category">
      <civ-filter-chip label="Healthcare" value="health" emphasis="primary" selected></civ-filter-chip>
      <civ-filter-chip label="Education" value="education" emphasis="primary"></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing" emphasis="primary" selected></civ-filter-chip>
    </civ-filter-chip-group>
  `,
};
