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

// ── Default ───────────────────────────────────────────────────

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
      <civ-text-input label="Email address" name="email" type="email" required></civ-text-input>
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

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'With Validation',
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
      <civ-text-input label="Email address" name="email" type="email" required validate="email"></civ-text-input>
      <civ-text-input label="Phone number" name="phone" type="tel" hint="For example: (555) 123-4567"></civ-text-input>
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

export const WithError: Story = {
  name: 'Error Summary',
  render: () => html`
    <civ-form form-label="Benefits application">
      <civ-text-input label="Full name" name="fullName" required error="Enter your full name"></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required error="Enter a valid email address"></civ-text-input>
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

export const Required: Story = {
  name: 'Persist Draft',
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

export const Disabled: Story = {
  name: 'Dirty Tracking',
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

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 48px;">
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">Standard form</h3>
        <civ-form form-label="Standard form">
          <civ-text-input label="Full name" name="name" required></civ-text-input>
          <civ-text-input label="Email address" name="email" type="email"></civ-text-input>
          <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
        </civ-form>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">With errors displayed</h3>
        <civ-form form-label="Form with errors">
          <civ-text-input label="Full name" name="name" required error="Enter your full name"></civ-text-input>
          <civ-text-input label="Email address" name="email" type="email" required error="Enter a valid email"></civ-text-input>
          <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
        </civ-form>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-form form-label="Dense form">
          <civ-text-input label="Full name" name="name" required></civ-text-input>
          <civ-text-input label="Email address" name="email" type="email"></civ-text-input>
          <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
        </civ-form>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-form form-label="Default form">
          <civ-text-input label="Full name" name="name" required></civ-text-input>
          <civ-text-input label="Email address" name="email" type="email"></civ-text-input>
          <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
        </civ-form>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-form form-label="Spacious form">
          <civ-text-input label="Full name" name="name" required></civ-text-input>
          <civ-text-input label="Email address" name="email" type="email"></civ-text-input>
          <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
        </civ-form>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

// ── Prefill ──────────────────────────────────────────────────

export const PrefillSrc: Story = {
  name: 'Prefill: Remote Data Source',
  render: () => html`
    <!--
      When prefill-src is set, civ-form fetches JSON from that URL on connect.
      While loading, a "Loading your information..." status message is shown.
      If the fetch fails, an error message with a retry link appears.

      The JSON response must match PrefillData shape:
      {
        "name": { "value": "Jane Doe", "source": "profile" },
        "email": { "value": "jane@agency.gov", "source": "profile", "locked": true }
      }

      Events:
      - civ-prefill-applied: fired after fields are populated
      - civ-prefill-error: fired if the fetch fails

      In this demo, the URL won't resolve, so the error state is shown.
    -->
    <civ-form
      form-label="Prefill from API"
      prefill-src="data:application/json,{}"
      @civ-prefill-applied="${(e: CustomEvent) => {
        console.log('Prefill applied:', e.detail);
      }}"
      @civ-prefill-error="${(e: CustomEvent) => {
        console.log('Prefill error:', e.detail);
      }}"
    >
      <civ-text-input label="Full name" name="name" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required></civ-text-input>
      <civ-text-input label="Phone number" name="phone" type="tel" hint="For example: (555) 123-4567"></civ-text-input>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit
      </button>
    </civ-form>
  `,
};

export const PrefillApplied: Story = {
  name: 'Prefill: Applied Data',
  render: () => html`
    <civ-form
      id="prefill-demo"
      form-label="Prefilled application"
      @civ-prefill-applied="${(e: CustomEvent) => {
        console.log('Prefill applied:', e.detail);
      }}"
    >
      <civ-text-input label="Full name" name="name" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required></civ-text-input>
      <civ-text-input label="Phone number" name="phone" type="tel"></civ-text-input>
      <button
        type="submit"
        class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
      >
        Submit
      </button>
    </civ-form>
  `,
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('#prefill-demo') as any;
    if (form) {
      form.prefillData = {
        name: { value: 'Jane M. Doe', source: 'profile' },
        email: { value: 'jane.doe@agency.gov', source: 'profile', locked: true },
        phone: { value: '(555) 123-4567', source: 'api' },
      };
    }
  },
};

export const GovernmentInquiryForm: Story = {
  name: 'Usage: Government Inquiry Form',
  render: () => html`
    <civ-form
      form-label="General inquiry"
      @civ-submit="${(e: CustomEvent) => {
        alert('Inquiry submitted! Reference: INQ-2026-' + Math.floor(Math.random() * 9999));
      }}"
    >
      <h3 class="civ-heading-md">Submit an inquiry</h3>
      <civ-text-input label="Full name" name="name" required></civ-text-input>
      <civ-text-input label="Email address" name="email" type="email" required validate="email" hint="For example: name@agency.gov"></civ-text-input>
      <civ-text-input label="Phone number" name="phone" type="tel" mask="phone-us" hint="For example: (555) 123-4567"></civ-text-input>
      <civ-textarea label="Describe your question or concern" name="message" required hint="Provide as much detail as possible" maxlength="2000"></civ-textarea>
      <civ-checkbox label="I would like a response by email" name="email-response" checked></civ-checkbox>
      <div class="civ-mt-4">
        <button
          type="submit"
          class="civ-inline-block civ-px-5 civ-py-2.5 civ-bg-primary civ-text-white civ-font-bold civ-border-0 civ-rounded civ-cursor-pointer hover:civ-bg-primary-dark focus-visible:civ-focus-ring-inverse"
        >
          Submit inquiry
        </button>
      </div>
    </civ-form>
  `,
};
