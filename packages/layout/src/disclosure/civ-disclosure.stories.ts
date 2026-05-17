import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-disclosure.js';
import '@civui/inputs/ssn';
import '@civui/inputs/text-input';

const meta: Meta = {
  title: 'Layout/Disclosure',
  component: 'civ-disclosure',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Inline expandable content with a clickable trigger. Use it for "Why we ask?"
justifications next to PII fields, definitions of jargon, or any supplementary
text that doesn't need to be visible by default.

Built on the native \`<details>\`/\`<summary>\` elements so it works without
JavaScript and is announced as a disclosure widget by assistive tech. Content
is passed via the default slot.

The visual contract is fixed — chevron caret beside the label, 90° rotation on
open, single button-like trigger size — so every disclosure on a page reads
as the same affordance.
        `,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    open: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-disclosure>
      <p>
        We use your Social Security number to verify your identity and
        match your records with our system. We never share it with third
        parties without your consent.
      </p>
    </civ-disclosure>
  `,
};

export const NextToASensitiveField: Story = {
  name: 'Next to a sensitive field',
  render: () => html`
    <civ-ssn label="Social Security number" name="ssn" required></civ-ssn>
    <civ-disclosure>
      <p>
        We use your Social Security number to verify your identity and
        prevent duplicate accounts. It is encrypted in transit and at rest.
      </p>
    </civ-disclosure>
  `,
};

export const CustomLabel: Story = {
  name: 'Custom label',
  render: () => html`
    <civ-disclosure label="What does this mean?">
      <p>
        A <strong>spouse equivalent</strong> includes a registered domestic
        partner, civil union partner, or a person you cohabit with in a
        marriage-like relationship.
      </p>
    </civ-disclosure>
  `,
};

export const OpenByDefault: Story = {
  name: 'Open by default',
  render: () => html`
    <civ-disclosure open label="About this question">
      <p>
        This disclosure was opened by default — most consumers should leave
        it closed so the page stays scannable. Use the open state only for
        announcements that need to be visible on first load.
      </p>
    </civ-disclosure>
  `,
};
