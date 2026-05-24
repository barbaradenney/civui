import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/email';
import '@civui/inputs/phone';
import '@civui/inputs/radio';
import '@civui/inputs/memorable-date';

const meta: Meta = {
  title: 'Foundations/Internationalization',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
580+ translatable locale strings — labels, hints, validator messages,
ARIA announcements — overridable via \`setLocaleStrings()\`. CSS uses
logical properties throughout so layouts mirror under
\`dir="rtl"\` without any extra configuration.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const RtlMirror: Story = {
  name: 'RTL — layout mirrors automatically',
  parameters: {
    docs: {
      description: {
        story:
          'Set <code>dir="rtl"</code> on any container — labels move to the right, hints and errors align inline-start, the asterisk-style "(required)" marker flips. Arrow-key navigation in radio groups reverses too.',
      },
    },
  },
  render: () => html`
    <div
      class="civ-grid civ-gap-4"
      style="grid-template-columns: 1fr 1fr; align-items: start;"
    >
      <div dir="ltr" lang="en">
        <p class="civ-text-caption civ-mb-2">LTR (English)</p>
        <civ-text-input
          label="Full name"
          name="name-ltr"
          required
          hint="As it appears on your ID"
        ></civ-text-input>
        <civ-radio-group
          legend="Preferred contact"
          name="contact-ltr"
          required
          class="civ-mt-3"
        >
          <civ-radio value="email" label="Email"></civ-radio>
          <civ-radio value="phone" label="Phone"></civ-radio>
        </civ-radio-group>
      </div>
      <div dir="rtl" lang="ar">
        <p class="civ-text-caption civ-mb-2">RTL (Arabic)</p>
        <civ-text-input
          label="الاسم الكامل"
          name="name-rtl"
          required
          hint="كما يظهر على بطاقة هويتك"
        ></civ-text-input>
        <civ-radio-group
          legend="طريقة التواصل المفضلة"
          name="contact-rtl"
          required
          class="civ-mt-3"
        >
          <civ-radio value="email" label="بريد إلكتروني"></civ-radio>
          <civ-radio value="phone" label="هاتف"></civ-radio>
        </civ-radio-group>
      </div>
    </div>
  `,
};

export const LocaleAwareDates: Story = {
  name: 'Locale-aware dates',
  parameters: {
    docs: {
      description: {
        story:
          '<code>civ-memorable-date</code> and <code>civ-date-picker</code> accept a <code>locale</code> prop. Month names, weekday headers, and formatted display come from <code>Intl.DateTimeFormat</code>.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-text-caption civ-mb-2">English (en-US)</p>
        <civ-memorable-date
          legend="Date of birth"
          name="dob-en"
          locale="en-US"
          required
        ></civ-memorable-date>
      </div>
      <div lang="es">
        <p class="civ-text-caption civ-mb-2">Spanish (es-ES)</p>
        <civ-memorable-date
          legend="Fecha de nacimiento"
          name="dob-es"
          locale="es-ES"
          required
        ></civ-memorable-date>
      </div>
      <div lang="fr">
        <p class="civ-text-caption civ-mb-2">French (fr-FR)</p>
        <civ-memorable-date
          legend="Date de naissance"
          name="dob-fr"
          locale="fr-FR"
          required
        ></civ-memorable-date>
      </div>
    </div>
  `,
};

export const ComponentPropsBeatLocale: Story = {
  name: 'Component props always win',
  parameters: {
    docs: {
      description: {
        story:
          "<code>setLocaleStrings()</code> sets the default for every component, but a per-instance prop overrides it. Useful when one specific field needs a custom label without affecting the rest of the form.",
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <div>
        <p class="civ-text-caption civ-mb-1">Default label (from locale)</p>
        <civ-phone name="phone-default"></civ-phone>
      </div>
      <div>
        <p class="civ-text-caption civ-mb-1">
          Per-instance override: <code>label="Daytime phone number"</code>
        </p>
        <civ-phone label="Daytime phone number" name="phone-custom"></civ-phone>
      </div>
    </div>
  `,
};

export const LogicalPropertiesDemo: Story = {
  name: 'Logical properties (RTL-safe spacing)',
  parameters: {
    docs: {
      description: {
        story:
          'Tailwind utilities with <code>-s</code> / <code>-e</code> suffixes (<code>civ-ms-2</code>, <code>civ-me-2</code>, <code>civ-border-s-4</code>) map to <code>margin-inline-start</code> / <code>margin-inline-end</code>. They flip automatically under <code>dir="rtl"</code>, unlike physical <code>-l</code> / <code>-r</code> classes.',
      },
    },
  },
  render: () => html`
    <div
      class="civ-grid civ-gap-4"
      style="grid-template-columns: 1fr 1fr; align-items: start;"
    >
      <div dir="ltr">
        <p class="civ-text-caption civ-mb-2">LTR</p>
        <div
          class="civ-p-3 civ-border-s-4"
          style="background: var(--civ-color-info-lighter); border-color: var(--civ-color-info-DEFAULT);"
        >
          <span class="civ-font-semibold">civ-border-s-4</span> renders on
          the inline-start edge.
        </div>
      </div>
      <div dir="rtl">
        <p class="civ-text-caption civ-mb-2">RTL</p>
        <div
          class="civ-p-3 civ-border-s-4"
          style="background: var(--civ-color-info-lighter); border-color: var(--civ-color-info-DEFAULT);"
        >
          نفس الحدّ ينعكس تلقائيًا إلى الجانب البادئ.
        </div>
      </div>
    </div>
  `,
};
