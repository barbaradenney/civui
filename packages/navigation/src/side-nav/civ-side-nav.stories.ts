import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-side-nav.js';
import './civ-side-nav-item.js';

const meta: Meta = {
  title: 'Navigation/Side Nav',
  component: 'civ-side-nav',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Vertical hierarchical left-rail navigation. Leaf rows render as links
with a leading-edge primary-color rail when \`current\`. Parents with
nested children render as **disclosure buttons** with a leading
chevron caret that rotates 90° on open — click anywhere on the row
to expand or collapse.

On first paint, any parent containing a descendant with \`current\`
is automatically expanded so the active page is visible. After that,
the user (or the consumer, via the \`open\` prop) drives expand state.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const wrapStyle = 'max-width: 280px; padding: 1rem; background: var(--civ-color-surface); border-inline-end: 1px solid var(--civ-color-border);';

export const Default: Story = {
  name: 'Default (flat list of leaf links)',
  render: () => html`
    <div style="${wrapStyle}">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/introduction" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item href="/installation" label="Installation"></civ-side-nav-item>
        <civ-side-nav-item href="/components" label="Components" current></civ-side-nav-item>
        <civ-side-nav-item href="/tokens" label="Design tokens"></civ-side-nav-item>
        <civ-side-nav-item href="/accessibility" label="Accessibility"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const Nested: Story = {
  name: 'Nested (auto-expands the active section)',
  render: () => html`
    <div style="${wrapStyle}">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/introduction" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item label="Components">
          <civ-side-nav-item href="/components/button" label="Button"></civ-side-nav-item>
          <civ-side-nav-item href="/components/text-input" label="Text input" current></civ-side-nav-item>
          <civ-side-nav-item href="/components/select" label="Select"></civ-side-nav-item>
          <civ-side-nav-item href="/components/checkbox" label="Checkbox"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item label="Design tokens">
          <civ-side-nav-item href="/tokens/color" label="Color"></civ-side-nav-item>
          <civ-side-nav-item href="/tokens/spacing" label="Spacing"></civ-side-nav-item>
          <civ-side-nav-item href="/tokens/typography" label="Typography"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/accessibility" label="Accessibility"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const MultipleSectionsOpen: Story = {
  name: 'Multiple sections open',
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Multi-expand by default — opening one section does not collapse
      others. Each parent owns its own <code>open</code> state.
    </p>
    <div style="${wrapStyle}">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item label="Components" open>
          <civ-side-nav-item href="/components/button" label="Button"></civ-side-nav-item>
          <civ-side-nav-item href="/components/text-input" label="Text input" current></civ-side-nav-item>
          <civ-side-nav-item href="/components/select" label="Select"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item label="Design tokens" open>
          <civ-side-nav-item href="/tokens/color" label="Color"></civ-side-nav-item>
          <civ-side-nav-item href="/tokens/spacing" label="Spacing"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/accessibility" label="Accessibility"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const CollapsedByDefault: Story = {
  name: 'All sections collapsed',
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Without a <code>current</code> descendant or an explicit
      <code>open</code> on a parent, sections start collapsed.
    </p>
    <div style="${wrapStyle}">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/introduction" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item label="Components">
          <civ-side-nav-item href="/components/button" label="Button"></civ-side-nav-item>
          <civ-side-nav-item href="/components/text-input" label="Text input"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item label="Design tokens">
          <civ-side-nav-item href="/tokens/color" label="Color"></civ-side-nav-item>
          <civ-side-nav-item href="/tokens/spacing" label="Spacing"></civ-side-nav-item>
        </civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const WithDisabled: Story = {
  name: 'With disabled rows',
  render: () => html`
    <div style="${wrapStyle}">
      <civ-side-nav label="Application sections">
        <civ-side-nav-item href="/start" label="Get started" current></civ-side-nav-item>
        <civ-side-nav-item href="/personal" label="Personal information"></civ-side-nav-item>
        <civ-side-nav-item href="/income" label="Income"></civ-side-nav-item>
        <civ-side-nav-item label="Review" disabled>
          <civ-side-nav-item href="/review/summary" label="Summary"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/submit" label="Submit" disabled></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const LargeSpacing: Story = {
  name: 'spacing="lg" — WCAG AAA touch targets',
  render: () => html`
    <p class="civ-italic civ-mb-3">
      <code>spacing="lg"</code> bumps every row to the WCAG 2.5.5 AAA
      44px tap-target floor. Padding only — typography is unchanged
      so it still reads as quiet secondary navigation. Combine with
      <code>emphasis="primary"</code> for the mobile-primary look.
    </p>
    <div style="${wrapStyle}">
      <civ-side-nav label="Sections" spacing="lg">
        <civ-side-nav-item href="/start" label="Get started" current></civ-side-nav-item>
        <civ-side-nav-item href="/personal" label="Personal information"></civ-side-nav-item>
        <civ-side-nav-item href="/income" label="Income"></civ-side-nav-item>
        <civ-side-nav-item href="/submit" label="Submit"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const PrimaryEmphasis: Story = {
  name: 'emphasis="primary" — bold typography (matches civ-nav)',
  render: () => html`
    <p class="civ-italic civ-mb-3">
      <code>emphasis="primary"</code> swaps in
      <code>civ-nav</code>'s bold base-sized body text so the rail
      reads as primary navigation rather than a quiet sub-nav.
      Typography only — padding is unchanged.
    </p>
    <div style="${wrapStyle}">
      <civ-side-nav label="Site sections" emphasis="primary">
        <civ-side-nav-item href="/home" label="Home" current></civ-side-nav-item>
        <civ-side-nav-item href="/benefits" label="Benefits"></civ-side-nav-item>
        <civ-side-nav-item href="/services" label="Services"></civ-side-nav-item>
        <civ-side-nav-item href="/contact" label="Contact us"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const MobilePrimary: Story = {
  name: 'Mobile-primary (spacing=lg + emphasis=primary)',
  render: () => html`
    <p class="civ-italic civ-mb-3">
      The composed mobile-primary look — 44px AAA tap targets plus
      bold body-sized typography. Use this when the side-nav IS the
      primary navigation of the surface (mobile app shell, drawer
      navigation, fingertip-heavy government deployment).
    </p>
    <div style="${wrapStyle}">
      <civ-side-nav label="App navigation" spacing="lg" emphasis="primary">
        <civ-side-nav-item href="/dashboard" label="Dashboard" current></civ-side-nav-item>
        <civ-side-nav-item href="/claims" label="My claims"></civ-side-nav-item>
        <civ-side-nav-item href="/messages" label="Messages"></civ-side-nav-item>
        <civ-side-nav-item href="/documents" label="Documents"></civ-side-nav-item>
        <civ-side-nav-item href="/settings" label="Settings"></civ-side-nav-item>
      </civ-side-nav>
    </div>
  `,
};

export const DocumentationLayout: Story = {
  name: 'Documentation page layout',
  render: () => html`
    <p class="civ-italic civ-mb-3">
      Typical documentation page composition — side rail on the left,
      content on the right. The active page's parent section
      auto-expands.
    </p>
    <div style="display: grid; grid-template-columns: 240px 1fr; gap: 2rem; align-items: start;">
      <civ-side-nav label="Documentation">
        <civ-side-nav-item href="/intro" label="Introduction"></civ-side-nav-item>
        <civ-side-nav-item label="Components">
          <civ-side-nav-item href="/button" label="Button" current></civ-side-nav-item>
          <civ-side-nav-item href="/input" label="Text input"></civ-side-nav-item>
          <civ-side-nav-item href="/select" label="Select"></civ-side-nav-item>
        </civ-side-nav-item>
        <civ-side-nav-item href="/tokens" label="Design tokens"></civ-side-nav-item>
      </civ-side-nav>
      <article>
        <h1 class="civ-mt-0">Button</h1>
        <p>The Button component is the primary action affordance in CivUI…</p>
      </article>
    </div>
  `,
};
