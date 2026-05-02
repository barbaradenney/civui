import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-form.js';
import '@civui/inputs';
import '@civui/controls';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Form/Form',
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
      <civ-form-field label="Full name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required>
        <civ-text-input name="email" type="email" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Message">
        <civ-textarea name="message"></civ-textarea>
      </civ-form-field>
      <civ-button type="submit">Submit</civ-button>
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
      <civ-form-field label="First name" required>
        <civ-text-input name="firstName" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Last name" required>
        <civ-text-input name="lastName" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required>
        <civ-text-input name="email" type="email" required validate="email"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone number" hint="For example: (555) 123-4567">
        <civ-text-input name="phone" type="tel"></civ-text-input>
      </civ-form-field>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <civ-button type="submit">Submit</civ-button>
      </div>
    </civ-form>
  `,
};

export const WithError: Story = {
  name: 'Error Summary',
  render: () => html`
    <civ-form form-label="Benefits application">
      <civ-form-field label="Full name" required error="Enter your full name">
        <civ-text-input name="fullName" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required error="Enter a valid email address">
        <civ-text-input name="email" type="email" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone number" hint="For example: (555) 123-4567">
        <civ-text-input name="phone"></civ-text-input>
      </civ-form-field>
      <civ-button type="submit">Submit application</civ-button>
    </civ-form>
  `,
};

export const Required: Story = {
  name: 'Persist Draft',
  render: () => html`
    <civ-form persist="demo-form" form-label="Draft application">
      <p class="civ-text-sm civ-text-muted civ-mb-4">This form auto-saves your progress to session storage. Refresh the page to see your data restored.</p>
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address">
        <civ-text-input name="email" type="email"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Additional comments">
        <civ-textarea name="comments"></civ-textarea>
      </civ-form-field>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <civ-button type="submit">Submit</civ-button>
        <civ-button type="reset" variant="secondary">Clear saved draft</civ-button>
      </div>
    </civ-form>
  `,
};

export const Disabled: Story = {
  name: 'Dirty Tracking',
  render: () => html`
    <civ-form track-dirty form-label="Profile update">
      <p class="civ-text-sm civ-text-muted civ-mb-4">Modify any field to see the dirty state indicator appear on the form.</p>
      <civ-form-field label="First name">
        <civ-text-input name="firstName" value="Jane"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Last name">
        <civ-text-input name="lastName" value="Doe"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address">
        <civ-text-input name="email" type="email" value="jane.doe@agency.gov"></civ-text-input>
      </civ-form-field>
      <civ-button type="submit">Save changes</civ-button>
    </civ-form>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-12">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Standard form</h3>
        <civ-form form-label="Standard form">
          <civ-form-field label="Full name" required>
            <civ-text-input name="name" required></civ-text-input>
          </civ-form-field>
          <civ-form-field label="Email address">
            <civ-text-input name="email" type="email"></civ-text-input>
          </civ-form-field>
          <civ-button type="submit">Submit</civ-button>
        </civ-form>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With errors displayed</h3>
        <civ-form form-label="Form with errors">
          <civ-form-field label="Full name" required error="Enter your full name">
            <civ-text-input name="name" required></civ-text-input>
          </civ-form-field>
          <civ-form-field label="Email address" required error="Enter a valid email">
            <civ-text-input name="email" type="email" required></civ-text-input>
          </civ-form-field>
          <civ-button type="submit">Submit</civ-button>
        </civ-form>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-form form-label="Dense form">
          <civ-form-field label="Full name" required>
            <civ-text-input name="name" required></civ-text-input>
          </civ-form-field>
          <civ-form-field label="Email address">
            <civ-text-input name="email" type="email"></civ-text-input>
          </civ-form-field>
          <civ-button type="submit">Submit</civ-button>
        </civ-form>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form form-label="Default form">
          <civ-form-field label="Full name" required>
            <civ-text-input name="name" required></civ-text-input>
          </civ-form-field>
          <civ-form-field label="Email address">
            <civ-text-input name="email" type="email"></civ-text-input>
          </civ-form-field>
          <civ-button type="submit">Submit</civ-button>
        </civ-form>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form form-label="Spacious form">
          <civ-form-field label="Full name" required>
            <civ-text-input name="name" required></civ-text-input>
          </civ-form-field>
          <civ-form-field label="Email address">
            <civ-text-input name="email" type="email"></civ-text-input>
          </civ-form-field>
          <civ-button type="submit">Submit</civ-button>
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
      <civ-form-field label="Full name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required>
        <civ-text-input name="email" type="email" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone number" hint="For example: (555) 123-4567">
        <civ-text-input name="phone" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-button type="submit">Submit</civ-button>
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
      <civ-form-field label="Full name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required>
        <civ-text-input name="email" type="email" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone number">
        <civ-text-input name="phone" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-button type="submit">Submit</civ-button>
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

// ── Trauma-informed / sensitive flows ─────────────────────────

export const WithSupportResources: Story = {
  name: 'With Support Resources (crisis footer)',
  render: () => html`
    <civ-form
      form-label="Mental health screening"
      .supportResources="${[
        { label: '988 Suicide & Crisis Lifeline', href: 'tel:988', description: 'Free, confidential, 24/7' },
        { label: 'Veterans Crisis Line', href: 'tel:988', description: 'Press 1 after calling 988' },
        { label: 'Crisis Text Line', href: 'sms:741741', description: 'Text HOME to 741741' },
      ]}"
    >
      <h3 class="civ-heading-md">How have you been feeling this week?</h3>
      <civ-form-field label="Describe any concerns you'd like to share">
        <civ-textarea name="concerns"></civ-textarea>
      </civ-form-field>
      <div class="civ-mt-4">
        <civ-button type="submit">Continue</civ-button>
      </div>
    </civ-form>
  `,
};

export const GovernmentInquiryForm: Story = {
  name: 'Usage: Government Inquiry Form',
  render: () => html`
    <civ-form
      form-label="General inquiry"
      @civ-submit="${() => {
        alert('Inquiry submitted! Reference: INQ-2026-' + Math.floor(Math.random() * 9999));
      }}"
    >
      <h3 class="civ-heading-md">Submit an inquiry</h3>
      <civ-form-field label="Full name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email address" required hint="For example: name@agency.gov">
        <civ-text-input name="email" type="email" required validate="email"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone number" hint="For example: (555) 123-4567">
        <civ-text-input name="phone" type="tel" mask="phone-us"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Describe your question or concern" required hint="Provide as much detail as possible">
        <civ-textarea name="message" required maxlength="2000"></civ-textarea>
      </civ-form-field>
      <civ-checkbox label="I would like a response by email" name="email-response" checked></civ-checkbox>
      <div class="civ-mt-4">
        <civ-button type="submit">Submit inquiry</civ-button>
      </div>
    </civ-form>
  `,
};

// ── Server-side error injection ───────────────────────────────

export const SetServerErrors: Story = {
  name: 'Inject server errors',
  parameters: {
    docs: {
      description: {
        story:
          'After an async submit fails, call `form.setServerErrors({ fieldName: "message" })` to populate the error summary and per-field errors. Behaves exactly like a client-side validation failure (focuses the summary, announces, anchor links). Pass an empty object to clear.',
      },
    },
  },
  render: () => html`
    <civ-form id="server-error-form">
      <civ-form-field label="Email">
        <civ-text-input name="email" type="email"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone">
        <civ-text-input name="phone" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="ZIP">
        <civ-text-input name="zip" inputmode="numeric"></civ-text-input>
      </civ-form-field>
      <div class="civ-mt-4 civ-flex civ-gap-2">
        <civ-button type="submit">Submit (will fail)</civ-button>
        <civ-button
          type="button"
          variant="secondary"
          @click="${() => {
            const f = document.querySelector('#server-error-form') as any;
            f?.clearErrors();
          }}"
        >Clear errors</civ-button>
      </div>
    </civ-form>
    <script>
      (function() {
        const f = document.querySelector('#server-error-form');
        if (!f) return;
        f.addEventListener('civ-submit', () => {
          // Pretend the server rejected the input.
          f.setServerErrors({
            email: 'This email is already registered.',
            phone: 'Please enter a 10-digit number.',
          });
        });
      })();
    </script>
  `,
};
