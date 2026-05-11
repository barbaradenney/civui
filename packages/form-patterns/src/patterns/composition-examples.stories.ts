import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/compound';
import '../repeater/civ-repeater.js';

const meta: Meta = {
  title: 'Forms/Patterns/Composition Examples',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ── Employment History ──────────────────────────────────────────

export const EmploymentBasic: Story = {
  name: 'Employment: Basic (VA/HUD)',
  render: () => html`
    <civ-repeater legend="Employment history" name="jobs" item-label="employer" min="0">
      <civ-text-input label="Employer name" name="employer" required></civ-text-input>
      <civ-text-input label="Job title" name="title"></civ-text-input>
      <civ-memorable-date legend="Start date" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="End date" name="endDate"></civ-memorable-date>
      <civ-text-input label="Annual income" name="income" inputmode="numeric" mask="currency"></civ-text-input>
    </civ-repeater>
  `,
};

export const EmploymentDetailed: Story = {
  name: 'Employment: Detailed (SSA Disability)',
  render: () => html`
    <civ-repeater legend="Work history" name="jobs" item-label="job" mode="form-steps">
      <div data-step-label="Employer">
        <civ-text-input label="Employer name" name="employer" required></civ-text-input>
        <civ-address legend="Employer address" name="address"></civ-address>
      </div>
      <div data-step-label="Job details">
        <civ-text-input label="Job title" name="title" required></civ-text-input>
        <civ-textarea label="Main duties" name="duties" hint="Describe your day-to-day responsibilities" required></civ-textarea>
        <civ-text-input label="Hours worked per day" name="hoursPerDay" inputmode="numeric" width="xs"></civ-text-input>
        <civ-text-input label="Days worked per week" name="daysPerWeek" inputmode="numeric" width="xs"></civ-text-input>
      </div>
      <div data-step-label="Dates and pay">
        <civ-memorable-date legend="Start date" required name="startDate"></civ-memorable-date>
        <civ-memorable-date legend="End date" name="endDate"></civ-memorable-date>
        <civ-text-input label="Pay per month" name="monthlyPay" inputmode="numeric" mask="currency"></civ-text-input>
      </div>
    </civ-repeater>
  `,
};

export const EmploymentImmigration: Story = {
  name: 'Employment: Immigration (I-485)',
  render: () => html`
    <civ-repeater legend="Employment history (last 5 years)" name="employment" item-label="employer" min="0">
      <civ-text-input label="Employer or company name" name="employer" required></civ-text-input>
      <civ-text-input label="Your occupation or job title" name="occupation" required></civ-text-input>
      <civ-address legend="Employer address" name="address"></civ-address>
      <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="Date ended" hint="Leave blank if this is your current job" name="endDate"></civ-memorable-date>
    </civ-repeater>
  `,
};

// ── Education History ───────────────────────────────────────────

export const EducationBasic: Story = {
  name: 'Education: Basic (VA)',
  render: () => html`
    <civ-repeater legend="Education history" name="education" item-label="school" min="0">
      <civ-text-input label="School name" name="school" required></civ-text-input>
      <civ-text-input label="City and state" name="location"></civ-text-input>
      <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="Date ended" name="endDate"></civ-memorable-date>
      <civ-text-input label="Degree or certificate" name="degree"></civ-text-input>
      <civ-text-input label="Major or field of study" name="major"></civ-text-input>
    </civ-repeater>
  `,
};

export const EducationFederal: Story = {
  name: 'Education: Federal Employment (SF-171)',
  render: () => html`
    <civ-repeater legend="Education" name="education" item-label="school" mode="form-steps">
      <div data-step-label="School">
        <civ-text-input label="School name" name="school" required></civ-text-input>
        <civ-address legend="School address" name="address"></civ-address>
      </div>
      <div data-step-label="Degree">
        <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
        <civ-memorable-date legend="Date completed or expected" name="endDate"></civ-memorable-date>
        <civ-text-input label="Degree type" name="degreeType"></civ-text-input>
        <civ-text-input label="Major" name="major"></civ-text-input>
        <civ-text-input label="GPA" name="gpa" width="xs" inputmode="decimal"></civ-text-input>
        <civ-text-input label="Total credit hours" name="creditHours" width="xs" inputmode="numeric"></civ-text-input>
      </div>
    </civ-repeater>
  `,
};

export const EducationImmigration: Story = {
  name: 'Education: Immigration (I-485)',
  render: () => html`
    <civ-repeater legend="Schools attended (last 5 years)" name="schools" item-label="school" min="0">
      <civ-text-input label="School name" name="school" required></civ-text-input>
      <civ-address legend="School address" name="address"></civ-address>
      <civ-text-input label="Course of study" name="course"></civ-text-input>
      <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="Date ended" name="endDate"></civ-memorable-date>
    </civ-repeater>
  `,
};
