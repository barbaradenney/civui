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
      <civ-form-field label="Employer name" required>
        <civ-text-input name="employer" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Job title">
        <civ-text-input name="title"></civ-text-input>
      </civ-form-field>
      <civ-memorable-date legend="Start date" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="End date" name="endDate"></civ-memorable-date>
      <civ-form-field label="Annual income">
        <civ-text-input name="income" inputmode="numeric" mask="currency"></civ-text-input>
      </civ-form-field>
    </civ-repeater>
  `,
};

export const EmploymentDetailed: Story = {
  name: 'Employment: Detailed (SSA Disability)',
  render: () => html`
    <civ-repeater legend="Work history" name="jobs" item-label="job" mode="form-steps">
      <div data-step-label="Employer">
        <civ-form-field label="Employer name" required>
          <civ-text-input name="employer" required></civ-text-input>
        </civ-form-field>
        <civ-address legend="Employer address" name="address"></civ-address>
      </div>
      <div data-step-label="Job details">
        <civ-form-field label="Job title" required>
          <civ-text-input name="title" required></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Main duties" required hint="Describe your day-to-day responsibilities">
          <civ-textarea name="duties" required></civ-textarea>
        </civ-form-field>
        <civ-form-field label="Hours worked per day">
          <civ-text-input name="hoursPerDay" inputmode="numeric" width="xs"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Days worked per week">
          <civ-text-input name="daysPerWeek" inputmode="numeric" width="xs"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Dates and pay">
        <civ-memorable-date legend="Start date" required name="startDate"></civ-memorable-date>
        <civ-memorable-date legend="End date" name="endDate"></civ-memorable-date>
        <civ-form-field label="Pay per month">
          <civ-text-input name="monthlyPay" inputmode="numeric" mask="currency"></civ-text-input>
        </civ-form-field>
      </div>
    </civ-repeater>
  `,
};

export const EmploymentImmigration: Story = {
  name: 'Employment: Immigration (I-485)',
  render: () => html`
    <civ-repeater legend="Employment history (last 5 years)" name="employment" item-label="employer" min="0">
      <civ-form-field label="Employer or company name" required>
        <civ-text-input name="employer" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Your occupation or job title" required>
        <civ-text-input name="occupation" required></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="School name" required>
        <civ-text-input name="school" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="City and state">
        <civ-text-input name="location"></civ-text-input>
      </civ-form-field>
      <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="Date ended" name="endDate"></civ-memorable-date>
      <civ-form-field label="Degree or certificate">
        <civ-text-input name="degree"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Major or field of study">
        <civ-text-input name="major"></civ-text-input>
      </civ-form-field>
    </civ-repeater>
  `,
};

export const EducationFederal: Story = {
  name: 'Education: Federal Employment (SF-171)',
  render: () => html`
    <civ-repeater legend="Education" name="education" item-label="school" mode="form-steps">
      <div data-step-label="School">
        <civ-form-field label="School name" required>
          <civ-text-input name="school" required></civ-text-input>
        </civ-form-field>
        <civ-address legend="School address" name="address"></civ-address>
      </div>
      <div data-step-label="Degree">
        <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
        <civ-memorable-date legend="Date completed or expected" name="endDate"></civ-memorable-date>
        <civ-form-field label="Degree type">
          <civ-text-input name="degreeType"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Major">
          <civ-text-input name="major"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="GPA">
          <civ-text-input name="gpa" width="xs" inputmode="decimal"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Total credit hours">
          <civ-text-input name="creditHours" width="xs" inputmode="numeric"></civ-text-input>
        </civ-form-field>
      </div>
    </civ-repeater>
  `,
};

export const EducationImmigration: Story = {
  name: 'Education: Immigration (I-485)',
  render: () => html`
    <civ-repeater legend="Schools attended (last 5 years)" name="schools" item-label="school" min="0">
      <civ-form-field label="School name" required>
        <civ-text-input name="school" required></civ-text-input>
      </civ-form-field>
      <civ-address legend="School address" name="address"></civ-address>
      <civ-form-field label="Course of study">
        <civ-text-input name="course"></civ-text-input>
      </civ-form-field>
      <civ-memorable-date legend="Date started" required name="startDate"></civ-memorable-date>
      <civ-memorable-date legend="Date ended" name="endDate"></civ-memorable-date>
    </civ-repeater>
  `,
};
