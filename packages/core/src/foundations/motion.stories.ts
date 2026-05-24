import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/toggle';
import '@civui/inputs/checkbox';

const meta: Meta = {
  title: 'Foundations/Motion',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Every transition and animation in CivUI uses tokens
(\`--civ-motion-duration-*\`, \`--civ-motion-easing-*\`) so they can
be tuned globally and disabled under
\`prefers-reduced-motion: reduce\`.

The stories below let you compare durations on the same element and
verify the global reduced-motion override.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const swatchStyle = (token: string) => `
  width: 100%;
  height: 24px;
  background: var(--civ-color-primary-DEFAULT);
  border-radius: var(--civ-border-radius-sm);
  transform: translateX(0);
  transition: transform var(${token}) var(--civ-motion-easing-ease-in-out);
`;

const containerStyle = `
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: var(--civ-spacing-3);
  padding: var(--civ-spacing-2) 0;
`;

const trackStyle = `
  background: var(--civ-color-base-lightest);
  padding: var(--civ-spacing-2);
  border-radius: var(--civ-border-radius-md);
  overflow: hidden;
`;

const triggerMotion = (e: Event) => {
  const root = (e.currentTarget as HTMLElement).closest('[data-motion-root]');
  if (!root) return;
  const bars = root.querySelectorAll<HTMLElement>('[data-motion-bar]');
  bars.forEach((bar) => {
    bar.style.transform = 'translateX(0)';
    // Force a reflow so the next style change re-triggers the transition.
    void bar.offsetWidth;
    bar.style.transform = 'translateX(calc(100% - 100px))';
  });
};

export const DurationScale: Story = {
  name: 'Duration tokens compared',
  render: () => html`
    <div data-motion-root>
      <p class="civ-text-caption civ-mb-3">
        Press <strong>Play</strong> to animate all five bars at once. Each
        bar uses a different <code>--civ-motion-duration-*</code> token so
        you can see how the same easing reads at fast/normal/slow.
      </p>
      <button
        type="button"
        class="civ-text-btn civ-text-btn--inline civ-mb-4"
        @click=${triggerMotion}
      >
        Play
      </button>
      <div style="${containerStyle}">
        <code>instant (0ms)</code>
        <div style="${trackStyle}">
          <div
            data-motion-bar
            style="${swatchStyle('--civ-motion-duration-instant')}; max-width: 100px;"
          ></div>
        </div>
      </div>
      <div style="${containerStyle}">
        <code>fast (100ms)</code>
        <div style="${trackStyle}">
          <div
            data-motion-bar
            style="${swatchStyle('--civ-motion-duration-fast')}; max-width: 100px;"
          ></div>
        </div>
      </div>
      <div style="${containerStyle}">
        <code>normal (200ms)</code>
        <div style="${trackStyle}">
          <div
            data-motion-bar
            style="${swatchStyle('--civ-motion-duration-normal')}; max-width: 100px;"
          ></div>
        </div>
      </div>
      <div style="${containerStyle}">
        <code>slow (300ms)</code>
        <div style="${trackStyle}">
          <div
            data-motion-bar
            style="${swatchStyle('--civ-motion-duration-slow')}; max-width: 100px;"
          ></div>
        </div>
      </div>
      <div style="${containerStyle}">
        <code>slower (500ms)</code>
        <div style="${trackStyle}">
          <div
            data-motion-bar
            style="${swatchStyle('--civ-motion-duration-slower')}; max-width: 100px;"
          ></div>
        </div>
      </div>
    </div>
  `,
};

export const ComponentMotion: Story = {
  name: 'Components using motion tokens',
  render: () => html`
    <p class="civ-text-caption civ-mb-3">
      Click each control to see its tokenized transition. Toggle slides
      at <code>--civ-motion-duration-fast</code>; checkbox check-mark
      uses the same.
    </p>
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-toggle label="Email notifications"></civ-toggle>
      <civ-checkbox label="Subscribe to weekly newsletter"></civ-checkbox>
    </div>
  `,
};

export const ReducedMotion: Story = {
  name: 'Reduced motion (preview)',
  render: () => html`
    <p class="civ-text-caption civ-mb-3">
      When the user's OS reports <code>prefers-reduced-motion: reduce</code>,
      CivUI sets all transition durations to <code>0.01ms</code>
      globally. The same controls still update — they just don't animate.
      This story simulates the override locally.
    </p>
    <style>
      .civ-foundations-reduced-motion-demo,
      .civ-foundations-reduced-motion-demo *,
      .civ-foundations-reduced-motion-demo *::before,
      .civ-foundations-reduced-motion-demo *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    </style>
    <div class="civ-foundations-reduced-motion-demo civ-flex civ-flex-col civ-gap-3">
      <civ-toggle label="Email notifications"></civ-toggle>
      <civ-checkbox label="Subscribe to weekly newsletter"></civ-checkbox>
    </div>
    <p class="civ-text-caption civ-mt-4">
      To verify against the real media query: macOS Accessibility →
      Display → Reduce motion, Windows Visual effects → Animation
      effects off, or Chrome DevTools → Rendering → Emulate
      <code>prefers-reduced-motion: reduce</code>.
    </p>
  `,
};
