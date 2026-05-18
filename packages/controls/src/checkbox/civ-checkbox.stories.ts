import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-checkbox.js';
import './civ-checkbox-group.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Controls/Checkbox',
  component: 'civ-checkbox',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    description: { control: 'text' },
    checked: { control: 'boolean' },
    tile: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────
// Note: standalone civ-checkbox does NOT need wrapping (self-contained)

export const Default: Story = {
  args: {
    label: 'I agree to the terms and conditions',
    name: 'agree',
    checked: false,
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-checkbox
      label="${args.label}"
      name="${args.name}"
      ?checked="${args.checked}"
      ?tile="${args.tile}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-checkbox>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-checkbox
      label="Subscribe to email updates"
      name="subscribe"
      hint="We will send you a weekly digest of important announcements"
    ></civ-checkbox>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-checkbox
      label="I certify this information is correct"
      name="certify"
      error="You must certify before submitting"
      required
    ></civ-checkbox>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-checkbox
      label="I agree to the privacy policy"
      name="privacy"
      required
    ></civ-checkbox>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-checkbox label="Previously accepted" name="locked" disabled checked></civ-checkbox>
  `,
};

export const WithDescription: Story = {
  render: () => html`
    <civ-checkbox
      label="Email notifications"
      name="email-notifications"
      description="Receive weekly updates about your application status"
    ></civ-checkbox>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-checkbox label="Normal (unchecked)" name="normal"></civ-checkbox>
      <civ-checkbox label="Checked" name="checked" checked></civ-checkbox>
      <civ-checkbox label="With hint" name="hint" hint="Additional context for this option"></civ-checkbox>
      <civ-checkbox label="With error" name="error" error="You must select this option" required></civ-checkbox>
      <civ-checkbox label="Disabled (unchecked)" name="disabled-off" disabled></civ-checkbox>
      <civ-checkbox label="Disabled (checked)" name="disabled-on" disabled checked></civ-checkbox>
      <civ-checkbox label="Indeterminate" name="indeterminate" indeterminate></civ-checkbox>
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
        <civ-checkbox label="I agree to the terms and conditions" name="dense-agree"></civ-checkbox>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-checkbox label="I agree to the terms and conditions" name="default-agree"></civ-checkbox>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-checkbox label="I agree to the terms and conditions" name="spacious-agree"></civ-checkbox>
      </div>
    </div>
  `,
};

// ── Group Variants ────────────────────────────────────────────
// Note: civ-checkbox-group is self-contained — pass `legend` directly.

export const Group: Story = {
  render: () => html`
    <civ-checkbox-group legend="Notification preferences" hint="Select all that apply">
      <civ-checkbox label="Email" name="notifications" value="email"></civ-checkbox>
      <civ-checkbox label="Text message" name="notifications" value="sms"></civ-checkbox>
      <civ-checkbox label="Push notifications" name="notifications" value="push"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupWithError: Story = {
  render: () => html`
    <civ-checkbox-group legend="Notification preferences" error="Select at least one method" required>
      <civ-checkbox label="Email" name="notifications" value="email"></civ-checkbox>
      <civ-checkbox label="Text message" name="notifications" value="sms"></civ-checkbox>
      <civ-checkbox label="Push notifications" name="notifications" value="push"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupTileVariant: Story = {
  render: () => html`
    <civ-checkbox-group legend="Benefits you are applying for" hint="Select all that apply">
      <civ-checkbox
        label="Health care"
        name="benefits"
        value="health"
        description="Medical, dental, and vision coverage"
      ></civ-checkbox>
      <civ-checkbox
        label="Education"
        name="benefits"
        value="education"
        description="GI Bill and tuition assistance"
      ></civ-checkbox>
      <civ-checkbox
        label="Housing assistance"
        name="benefits"
        value="housing"
        description="Home loan guaranty and housing grants"
      ></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <civ-checkbox-group legend="Available days" name="days" orientation="horizontal">
      <civ-checkbox label="Mon" value="mon"></civ-checkbox>
      <civ-checkbox label="Tue" value="tue"></civ-checkbox>
      <civ-checkbox label="Wed" value="wed"></civ-checkbox>
      <civ-checkbox label="Thu" value="thu"></civ-checkbox>
      <civ-checkbox label="Fri" value="fri"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupListVariant: Story = {
  name: 'Group: List variant (joined tiles)',
  parameters: {
    docs: {
      description: {
        story: `
Set \`variant="list"\` on the group to collapse the gap between tiles.
Adjacent tiles share a single 1px border and only the first / last tile
keep rounded corners — useful for dense option lists like demographic
selection or multi-select preferences.

Only takes effect with \`tile\` (the default) and vertical orientation.
        `,
      },
    },
  },
  render: () => html`
    <civ-checkbox-group legend="Race" hint="Select one or more" name="race" variant="list">
      <civ-checkbox label="American Indian or Alaska Native" value="aian"></civ-checkbox>
      <civ-checkbox label="Asian" value="asian"></civ-checkbox>
      <civ-checkbox label="Black or African American" value="black"></civ-checkbox>
      <civ-checkbox label="Native Hawaiian or Other Pacific Islander" value="nhpi"></civ-checkbox>
      <civ-checkbox label="White" value="white"></civ-checkbox>
      <civ-checkbox label="Prefer not to answer" value="skip"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentCertificationForm: Story = {
  name: 'Usage: Certification Checkboxes',
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        alert('Submitted: ' + JSON.stringify(Object.fromEntries(fd)));
      }}
    >
      <civ-checkbox-group legend="Certifications" hint="You must agree to all statements below" required name="certifications">
        <civ-checkbox label="I certify that all information provided is true and complete" value="truth"></civ-checkbox>
        <civ-checkbox label="I understand that false statements may result in penalties" value="penalties"></civ-checkbox>
        <civ-checkbox label="I agree to notify the agency of any changes to my information" value="notify"></civ-checkbox>
      </civ-checkbox-group>
      <civ-button type="submit" class="civ-mt-4">Submit</civ-button>
    </form>
  `,
};

// ── Indeterminate ────────────────────────────────────────────

export const Indeterminate: Story = {
  name: 'Indeterminate (Select All)',
  parameters: {
    docs: {
      description: {
        story:
          'A parent "Select all" checkbox becomes indeterminate when some — but not all — child checkboxes are checked. Clicking the parent toggles all children on or off.',
      },
    },
  },
  render: () => html`
    <fieldset class="civ-border-0 civ-p-0 civ-m-0">
      <legend class="civ-label civ-mb-2">Manage notifications</legend>
      <civ-checkbox
        label="Select all"
        name="select-all"
        indeterminate
        @civ-change=${(e: Event) => {
          const target = e.target as HTMLElement;
          const checked = (target as any).checked;
          const children = target
            .closest('fieldset')!
            .querySelectorAll<any>('civ-checkbox:not([name="select-all"])');
          children.forEach((cb: any) => {
            cb.checked = checked;
          });
          (target as any).indeterminate = false;
        }}
      ></civ-checkbox>
      <div class="civ-ps-6 civ-border-s-2 civ-border-base-lighter civ-ms-4">
        ${['Email', 'Text message', 'Push notification'].map(
          (label) => html`
            <civ-checkbox
              label="${label}"
              name="notifications"
              value="${label.toLowerCase().replace(/\s/g, '-')}"
              checked
              @civ-change=${(e: Event) => {
                const fieldset = (e.target as HTMLElement).closest('fieldset')!;
                const children = fieldset.querySelectorAll<any>(
                  'civ-checkbox:not([name="select-all"])',
                );
                const selectAll = fieldset.querySelector<any>(
                  'civ-checkbox[name="select-all"]',
                );
                const checkedCount = Array.from(children).filter(
                  (cb: any) => cb.checked,
                ).length;
                selectAll.checked = checkedCount === children.length;
                selectAll.indeterminate =
                  checkedCount > 0 && checkedCount < children.length;
              }}
            ></civ-checkbox>
          `,
        )}
      </div>
    </fieldset>
  `,
};

// ── Selection bounds ──────────────────────────────────────────

export const MinSelections: Story = {
  name: 'Minimum selections required',
  parameters: {
    docs: {
      description: {
        story:
          'Setting `min-selections` (above 0) implicitly marks the group as required and surfaces a `valueMissing` validity error until the threshold is met. The hint chain auto-appends "Select at least N." Validation surfaces only on submit / `checkValidity()` — checkboxes can still be unchecked mid-flow.',
      },
    },
  },
  render: () => html`
    <civ-checkbox-group legend="Preferred contact methods" hint="We'll use these to reach you about your application." name="contact" min-selections="2">
      <civ-checkbox label="Email" value="email"></civ-checkbox>
      <civ-checkbox label="Phone" value="phone"></civ-checkbox>
      <civ-checkbox label="Postal mail" value="mail"></civ-checkbox>
      <civ-checkbox label="Text message" value="sms"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const MinAndMaxSelections: Story = {
  name: 'Min and max selections',
  parameters: {
    docs: {
      description: {
        story:
          '`min-selections` and `max-selections` work together. `max-selections` blocks the over-pick interactively; `min-selections` blocks submit until met.',
      },
    },
  },
  render: () => html`
    <civ-checkbox-group legend="Languages spoken" name="languages" min-selections="1" max-selections="3">
      <civ-checkbox label="English" value="en"></civ-checkbox>
      <civ-checkbox label="Spanish" value="es"></civ-checkbox>
      <civ-checkbox label="Tagalog" value="tl"></civ-checkbox>
      <civ-checkbox label="Vietnamese" value="vi"></civ-checkbox>
      <civ-checkbox label="Chinese" value="zh"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

// ── spacing="sm" — compact mode for dense surfaces ────────────

export const Spacing: Story = {
  name: 'Spacing — default vs sm',
  parameters: {
    docs: {
      description: {
        story:
          '`spacing="sm"` forces tile chrome off, drops hint / description / required-mark, and renders a 20px input ' +
          '(half the default tap-target). When `label` is empty, only the bare `<input>` is rendered and the host\'s ' +
          '`aria-label` is propagated for screen-reader text — the pattern data-grid uses for selection checkboxes.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">Default (tile)</p>
        <civ-checkbox label="I agree to the terms" name="agree-default"></civ-checkbox>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">spacing="sm" + label (column-toggle pattern)</p>
        <p class="civ-m-0 civ-mb-2 civ-text-sm">Visible label, no tile chrome. Used by civ-column-visibility for the toggle panel.</p>
        <div class="civ-flex civ-flex-col civ-gap-1">
          <civ-checkbox spacing="sm" label="Application ID" checked></civ-checkbox>
          <civ-checkbox spacing="sm" label="Applicant" checked></civ-checkbox>
          <civ-checkbox spacing="sm" label="Status"></civ-checkbox>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-bold">spacing="sm" + aria-label only (data-grid row-select pattern)</p>
        <p class="civ-m-0 civ-mb-2 civ-text-sm">Bare input, no visible chrome. aria-label names the control for AT.</p>
        <div class="civ-flex civ-gap-2 civ-items-center">
          <civ-checkbox spacing="sm" aria-label="Select row 1"></civ-checkbox>
          <civ-checkbox spacing="sm" aria-label="Select row 2" checked></civ-checkbox>
          <civ-checkbox spacing="sm" aria-label="Select row 3" indeterminate></civ-checkbox>
          <civ-checkbox spacing="sm" aria-label="Select row 4" disabled></civ-checkbox>
        </div>
      </div>
    </div>
  `,
};
