import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
      <civ-radio-group legend="How would you like to receive mail?" size="lg" name="mailMethod">
        <civ-radio value="general-delivery" label="USPS General Delivery" description="Free service that holds mail at your local post office for up to 30 days. Just bring a photo ID to pick it up. Not available at all post offices. Contact your local post office to confirm availability."></civ-radio>
        <civ-radio value="alternate-address" label="Someone else's address" description="A friend, family member, shelter, or organization that can receive mail for you"></civ-radio>
        <civ-radio value="no-mail" label="I can't receive mail" description="We'll use other ways to contact you"></civ-radio>
      </civ-radio-group>

      <civ-conditional when="mailMethod" equals="general-delivery">
        <civ-address variant="general-delivery" size="lg" legend="General Delivery post office" name="address" required></civ-address>
      </civ-conditional>

      <civ-conditional when="mailMethod" equals="alternate-address">
        <civ-address size="lg" legend="Mailing address" name="address" required></civ-address>
      </civ-conditional>

      <civ-conditional when="mailMethod" equals="no-mail">
        <civ-address variant="contact" size="lg" legend="How to reach you" name="contact" required></civ-address>
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
        <civ-radio-group legend="How would you like to receive mail?" size="lg" name="mailMethod">
          <civ-radio value="general-delivery" label="USPS General Delivery" description="Free service that holds mail at your local post office for up to 30 days. Just bring a photo ID to pick it up. Not available at all post offices. Contact your local post office to confirm availability."></civ-radio>
          <civ-radio value="alternate-address" label="Someone else's address" description="A friend, family member, shelter, or organization"></civ-radio>
          <civ-radio value="no-mail" label="I can't receive mail" description="We'll use other ways to contact you"></civ-radio>
        </civ-radio-group>

        <civ-conditional when="mailMethod" equals="general-delivery">
          <civ-address variant="general-delivery" size="lg" legend="General Delivery post office" name="address" required></civ-address>
        </civ-conditional>

        <civ-conditional when="mailMethod" equals="alternate-address">
          <civ-address size="lg" legend="Mailing address" name="address" required></civ-address>
        </civ-conditional>

        <civ-conditional when="mailMethod" equals="no-mail">
          <civ-address variant="contact" size="lg" legend="How to reach you" name="contact" required></civ-address>
        </civ-conditional>
      </civ-conditional>

      <civ-button type="submit" class="civ-mt-4">Continue</civ-button>
    </civ-form>
  `,
};
