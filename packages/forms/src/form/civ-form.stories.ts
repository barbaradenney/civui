import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-form.js';
import '../text-input/civ-text-input.js';
import '../textarea/civ-textarea.js';
import '../select/civ-select.js';
import '../checkbox/civ-checkbox.js';

const meta: Meta = {
  title: 'Forms/Layout/Form',
  component: 'civ-form',
  tags: ['autodocs'],
  argTypes: {
    action: { control: 'text' },
    method: {
      control: 'select',
      options: ['get', 'post'],
    },
    'form-label': { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    action: '',
    method: 'post',
    'form-label': 'Contact form',
  },
  render: (args) => html`
    <civ-form
      action="${args.action}"
      method="${args.method}"
      form-label="${args['form-label']}"
    >
      <civ-text-input label="Full name" name="name" required></civ-text-input>
      <civ-text-input label="Email" name="email" type="email" required></civ-text-input>
      <civ-textarea label="Message" name="message"></civ-textarea>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit
      </button>
    </civ-form>
  `,
};

export const WithValidation: Story = {
  render: () => html`
    <civ-form
      @civ-submit="${(e: CustomEvent) => {
        console.log('Form submitted!', e.detail);
        alert('Form submitted successfully!');
      }}"
      @civ-invalid="${(e: CustomEvent) => {
        console.log('Validation failed:', e.detail.errors);
      }}"
    >
      <civ-text-input label="First name" name="firstName" required></civ-text-input>
      <civ-text-input label="Last name" name="lastName" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required></civ-text-input>
      <civ-text-input label="Phone" name="phone"></civ-text-input>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <button
          type="submit"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
        >
          Submit
        </button>
      </div>
    </civ-form>
  `,
};

export const ErrorSummary: Story = {
  render: () => html`
    <civ-form form-label="Benefits application">
      <civ-text-input label="Full name" name="fullName" required error="Enter your full name"></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required error="Enter a valid email address"></civ-text-input>
      <civ-select
        label="State of residence"
        name="state"
        required
        error="Select your state of residence"
        options='[{"label":"Select one","value":""},{"label":"California","value":"CA"},{"label":"New York","value":"NY"},{"label":"Texas","value":"TX"}]'
      ></civ-select>
      <civ-text-input label="Phone number" name="phone" hint="For example: (555) 123-4567"></civ-text-input>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit application
      </button>
    </civ-form>
  `,
};

export const PersistDraft: Story = {
  render: () => html`
    <civ-form persist="demo-form" form-label="Draft application">
      <p class="civ-text-sm civ-text-muted civ-mb-4">This form auto-saves your progress to session storage. Refresh the page to see your data restored.</p>
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email"></civ-text-input>
      <civ-textarea label="Additional comments" name="comments"></civ-textarea>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <button
          type="submit"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
        >
          Submit
        </button>
        <button
          type="reset"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-white civ-text-primary civ-font-bold civ-border civ-border-primary civ-rounded civ-cursor-pointer hover:civ-bg-primary-lighter focus-visible:civ-focus-ring"
        >
          Clear saved draft
        </button>
      </div>
    </civ-form>
  `,
};

export const DirtyTracking: Story = {
  render: () => html`
    <civ-form track-dirty form-label="Profile update">
      <p class="civ-text-sm civ-text-muted civ-mb-4">Modify any field to see the dirty state indicator appear on the form.</p>
      <civ-text-input label="First name" name="firstName" value="Jane"></civ-text-input>
      <civ-text-input label="Last name" name="lastName" value="Doe"></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" value="jane.doe@agency.gov"></civ-text-input>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Save changes
      </button>
    </civ-form>
  `,
};

export const Prefill: Story = {
  render: () => html`
    <civ-form prefill form-label="Prefilled inquiry">
      <p class="civ-text-sm civ-text-muted civ-mb-4">
        This form reads URL query parameters to prefill fields. Add <code>?topic=benefits&amp;name=Jane</code> to the URL to see it in action.
      </p>
      <civ-text-input label="Full name" name="name"></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email"></civ-text-input>
      <civ-select
        label="Topic"
        name="topic"
        options='[{"label":"Select one","value":""},{"label":"Benefits","value":"benefits"},{"label":"Claims","value":"claims"},{"label":"General inquiry","value":"general"}]'
      ></civ-select>
      <civ-textarea label="Message" name="message"></civ-textarea>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit inquiry
      </button>
    </civ-form>
  `,
};
