import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/compound';
import '../conditional/civ-conditional.js';
import '../fieldset/civ-fieldset.js';
import '../section-intro/civ-section-intro.js';
import '../form/civ-form.js';

const meta: Meta = {
  title: 'Patterns/Housing Address',
  parameters: {
    docs: {
      description: {
        component: `
Patterns for collecting addresses from people who may not have permanent housing.
Uses existing CivUI components composed together — no custom component needed.

**Language principles:**
- Never use "homeless" in labels — use "permanent address" or "living situation"
- Don't make assumptions — "I don't have a permanent address" is factual, not judgmental
- Explain why we ask — "We ask this to connect you with the right services"
- Provide alternatives — always give a path forward (general location + contact method)
- Use sensitive tone — \`civ-section-intro tone="sensitive"\` before the questions
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Tier 1: Simple (checkbox + conditional) ──────────────────

export const Simple: Story = {
  name: 'Simple (checkbox + conditional)',
  parameters: {
    docs: {
      description: {
        story:
          'For forms that just need to know if the user has a mailable address. A single checkbox toggles between the full address form and a simplified contact section.',
      },
    },
  },
  render: () => html`
    <civ-section-intro heading="Your mailing address" tone="sensitive">
      <p>We need a mailing address to send you important documents. If you don't have a permanent address, we can work with you on other options.</p>
    </civ-section-intro>

    <civ-checkbox name="noPermanentAddress" label="I don't have a permanent address"></civ-checkbox>

    <civ-conditional when="noPermanentAddress" equals="false">
      <civ-address size="lg" legend="Mailing address" name="address" required></civ-address>
    </civ-conditional>

    <civ-conditional when="noPermanentAddress" equals="true">
      <civ-form-fieldset legend="How would you like to receive mail?" size="lg">
        <civ-radio-group name="mailMethod" tile>
          <civ-radio value="general-delivery" label="USPS General Delivery" description="Free service that holds mail at your local post office for up to 30 days. Just bring a photo ID to pick it up. No PO Box or permanent address required."></civ-radio>
          <civ-radio value="alternate-address" label="Someone else's address" description="A friend, family member, shelter, or organization that can receive mail for you"></civ-radio>
          <civ-radio value="no-mail" label="I can't receive mail" description="We'll use other ways to contact you"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>

      <civ-conditional when="mailMethod" equals="general-delivery">
        <civ-address size="lg" legend="General Delivery post office" name="address" required
          hint="Enter the city, state, and ZIP of the post office where you'll pick up mail. Use 'General Delivery' as the street address."
        ></civ-address>
      </civ-conditional>

      <civ-conditional when="mailMethod" equals="alternate-address">
        <civ-address size="lg" legend="Mailing address" name="address" required
          hint="Enter the address where someone can receive mail on your behalf."
        ></civ-address>
      </civ-conditional>

      <civ-conditional when="mailMethod" equals="no-mail">
        <civ-form-field label="City or area where you currently stay">
          <civ-text-input name="generalLocation"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="State" required>
          <civ-select name="locationState" preset="us-states"></civ-select>
        </civ-form-field>
        <civ-form-field label="Best way to reach you" required hint="Phone number, email, shelter name, or someone who can relay messages">
          <civ-textarea name="contactMethod" rows="3"></civ-textarea>
        </civ-form-field>
      </civ-conditional>
    </civ-conditional>
  `,
};

// ── With support resources ───────────────────────────────────

export const WithSupportResources: Story = {
  name: 'With support resources',
  parameters: {
    docs: {
      description: {
        story:
          'The housing pattern wrapped in a civ-form with support-resources for crisis/housing assistance links. Best practice for sensitive forms.',
      },
    },
  },
  render: () => html`
    <civ-form support-resources="If you or someone you know is experiencing homelessness, call the National Call Center for Homeless Veterans at 1-877-4AID-VET (1-877-424-3838).">
      <civ-section-intro heading="Your mailing address" tone="sensitive">
        <p>We need a way to send you important documents. If you don't have a permanent address, we can work with you on other options.</p>
      </civ-section-intro>

      <civ-checkbox name="noPermanentAddress" label="I don't have a permanent address"></civ-checkbox>

      <civ-conditional when="noPermanentAddress" equals="false">
        <civ-address size="lg" legend="Mailing address" name="address" required></civ-address>
      </civ-conditional>

      <civ-conditional when="noPermanentAddress" equals="true">
        <civ-form-fieldset legend="How would you like to receive mail?" size="lg">
          <civ-radio-group name="mailMethod" tile>
            <civ-radio value="general-delivery" label="USPS General Delivery" description="Free service that holds mail at your local post office for up to 30 days. Just bring a photo ID to pick it up. No PO Box or permanent address required."></civ-radio>
            <civ-radio value="alternate-address" label="Someone else's address" description="A friend, family member, shelter, or organization"></civ-radio>
            <civ-radio value="no-mail" label="I can't receive mail" description="We'll use other ways to contact you"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>

        <civ-conditional when="mailMethod" equals="general-delivery">
          <civ-address size="lg" legend="General Delivery post office" name="address" required
            hint="Enter the city, state, and ZIP of the post office. Use 'General Delivery' as the street address."
          ></civ-address>
        </civ-conditional>

        <civ-conditional when="mailMethod" equals="alternate-address">
          <civ-address size="lg" legend="Mailing address" name="address" required></civ-address>
        </civ-conditional>

        <civ-conditional when="mailMethod" equals="no-mail">
          <civ-form-field label="City or area where you currently stay">
            <civ-text-input name="generalLocation"></civ-text-input>
          </civ-form-field>
          <civ-form-field label="State" required>
            <civ-select name="locationState" preset="us-states"></civ-select>
          </civ-form-field>
          <civ-form-field label="Best way to reach you" required hint="Phone number, email, shelter name, or someone who can relay messages">
            <civ-textarea name="contactMethod" rows="3"></civ-textarea>
          </civ-form-field>
        </civ-conditional>
      </civ-conditional>

      <civ-button type="submit" class="civ-mt-4">Continue</civ-button>
    </civ-form>
  `,
};
