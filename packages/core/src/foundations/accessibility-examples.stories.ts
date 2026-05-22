import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/controls/radio';
import '@civui/actions/button';
import '@civui/actions/link';
import '@civui/actions/skip-link';
import '@civui/feedback/alert';
import { announce } from '@civui/core';

const meta: Meta = {
  title: 'Foundations/Accessibility',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
CivUI's accessibility primitives are mostly invisible until you need
them — the global focus ring, the W3C Two-Color halo, the live-region
announcer, the skip-link that appears on Tab.

The stories below let you exercise each one without leaving the page.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const FocusRing: Story = {
  name: 'Focus ring — tab through to see it',
  parameters: {
    docs: {
      description: {
        story:
          'Press <kbd>Tab</kbd> to move focus across the controls. The ring is applied automatically by a global rule on every native interactive element — no class required. Two colors (dark band + yellow halo) meet WCAG 2.2 SC 2.4.13 against both light and dark backgrounds.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
      <civ-button label="Primary"></civ-button>
      <civ-button variant="secondary" label="Secondary"></civ-button>
      <a href="#" class="civ-link">Link</a>
      <button class="civ-text-btn civ-text-btn--chip">Text button</button>
      <input
        type="text"
        class="civ-input"
        placeholder="Plain input"
        style="max-width: 200px;"
        aria-label="Plain input"
      />
    </div>
  `,
};

export const FocusRingInverse: Story = {
  name: 'Focus ring — inverse on dark backgrounds',
  parameters: {
    docs: {
      description: {
        story:
          'On dark surfaces, opt the ring into the inverted treatment with <code>focus-visible:civ-focus-ring-inverse</code>. The light band + dark halo flips so contrast stays above 3:1.',
      },
    },
  },
  render: () => html`
    <div
      class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center civ-p-4"
      style="background: var(--civ-color-base-darkest); border-radius: var(--civ-border-radius-md);"
    >
      <button
        class="civ-btn civ-btn--primary focus-visible:civ-focus-ring-inverse"
        type="button"
        style="color: var(--civ-color-base-lightest);"
      >
        Tab to focus me
      </button>
      <a
        href="#"
        class="focus-visible:civ-focus-ring-inverse"
        style="color: var(--civ-color-primary-lighter);"
      >
        Link on dark
      </a>
    </div>
  `,
};

export const SkipLinkAffordance: Story = {
  name: 'Skip link — first Tab on a fresh page',
  parameters: {
    docs: {
      description: {
        story:
          "The skip link is visually hidden until it receives focus. Click the preview and press <kbd>Tab</kbd> — the link reveals itself at the top of the viewport. Activating it jumps focus to the <code>#main-content</code> landmark.",
      },
    },
  },
  render: () => html`
    <div
      style="position: relative; min-height: 200px; border: 1px dashed var(--civ-color-base-lighter); padding: var(--civ-spacing-3);"
    >
      <civ-skip-link href="#story-main" label="Skip to main content"></civ-skip-link>
      <nav
        class="civ-flex civ-gap-3 civ-mb-4"
        aria-label="Demo header"
      >
        <a href="#" class="civ-link">Benefits</a>
        <a href="#" class="civ-link">Claims</a>
        <a href="#" class="civ-link">Profile</a>
        <a href="#" class="civ-link">Sign out</a>
      </nav>
      <main id="story-main" tabindex="-1">
        <h2 class="civ-heading-lg">Main content</h2>
        <p>
          Activating the skip link moves focus here, bypassing the four
          nav links above.
        </p>
      </main>
    </div>
  `,
};

export const ScreenReaderAnnouncer: Story = {
  name: 'Screen reader announcer — polite vs. assertive',
  parameters: {
    docs: {
      description: {
        story:
          'CivUI ships a shared live-region queue. Use <code>announce(msg)</code> for status updates and <code>announce(msg, "assertive")</code> for urgent alerts. Turn on your screen reader (VoiceOver: Cmd+F5, NVDA: Insert+Q) to hear the announcement.',
      },
    },
  },
  render: () => {
    const onPolite = () => announce('3 results found.');
    const onAssertive = () => announce('Session expires in 2 minutes.', 'assertive');
    return html`
      <div class="civ-flex civ-flex-col civ-gap-3" style="max-width: 480px;">
        <p class="civ-text-caption">
          Trigger each announcement and listen via your screen reader.
          The visible page does not change — the message is sent to
          the shared <code>aria-live</code> region.
        </p>
        <div class="civ-flex civ-gap-2">
          <civ-button
            label="Announce politely"
            variant="secondary"
            @click=${onPolite}
          ></civ-button>
          <civ-button
            label="Announce assertively"
            danger
            @click=${onAssertive}
          ></civ-button>
        </div>
      </div>
    `;
  },
};

export const ErrorIdentification: Story = {
  name: 'Error identification — text + color, never just color',
  parameters: {
    docs: {
      description: {
        story:
          'Validation errors are announced via <code>role="alert"</code> and rendered with an icon + descriptive text + border color. Removing the color still leaves the user with enough information to find and fix the field (3.3.1, 3.3.3).',
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px;">
      <civ-text-input
        label="Email address"
        name="email-bad"
        type="email"
        value="not-an-email"
        error="Enter an email address in the format name@example.com."
        required
      ></civ-text-input>
      <civ-text-input
        label="ZIP code"
        name="zip"
        value="ABC"
        error="ZIP code must be 5 digits. For example: 22150."
        required
        class="civ-mt-3"
      ></civ-text-input>
    </div>
  `,
};

export const KeyboardOnly: Story = {
  name: 'Keyboard-only flow',
  parameters: {
    docs: {
      description: {
        story:
          'Try this with the mouse hidden. Tab through, use arrow keys inside the radio group (and watch them reverse when the container is RTL), and submit with Enter.',
      },
    },
  },
  render: () => html`
    <form class="civ-flex civ-flex-col civ-gap-3" style="max-width: 480px;">
      <civ-text-input
        label="Full name"
        name="kbd-name"
        autocomplete="name"
        required
      ></civ-text-input>
      <civ-select label="State of residence" name="kbd-state">
        <option value="">- Select -</option>
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </civ-select>
      <civ-radio-group legend="Preferred contact method" name="kbd-contact" required>
        <civ-radio value="email" label="Email"></civ-radio>
        <civ-radio value="phone" label="Phone"></civ-radio>
        <civ-radio value="mail" label="US Mail"></civ-radio>
      </civ-radio-group>
      <civ-button label="Submit"></civ-button>
    </form>
  `,
};
