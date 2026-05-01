import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/actions';
import '@civui/layout';
import '@civui/feedback';
import '@civui/overlays';
import '@civui/form-patterns';
import '@civui/navigation';

// Import Twig templates — vite-plugin-twig-drupal compiles these to JS functions
// @ts-ignore
import TextInputTwig from '../components/text-input/text-input.twig';
// @ts-ignore
import ButtonTwig from '../components/button/button.twig';
// @ts-ignore
import AlertTwig from '../components/alert/alert.twig';
// @ts-ignore
import FormFieldTwig from '../components/form-field/form-field.twig';
// @ts-ignore
import CheckboxTwig from '../components/checkbox/checkbox.twig';
// @ts-ignore
import LinkTwig from '../components/link/link.twig';
// @ts-ignore
import SelectTwig from '../components/select/select.twig';
// @ts-ignore
import SsnTwig from '../components/ssn/ssn.twig';
// @ts-ignore
import ActionLinkTwig from '../components/action-link/action-link.twig';

const meta: Meta = {
  title: 'Drupal/SDC Preview',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Live preview of CivUI Drupal Single Directory Components. These Twig templates are compiled by vite-plugin-twig-drupal and render real CivUI web components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** Render a compiled Twig function to Lit html */
function render(twigFn: (ctx: Record<string, any>) => string, props: Record<string, any> = {}) {
  const rendered = twigFn(props);
  return html`${unsafeHTML(rendered)}`;
}

// ── Inputs ───────────────────────────────────────────────────

export const TextInput: Story = {
  name: 'civui:text-input',
  render: () => render(TextInputTwig, {
    name: 'email',
    type: 'email',
    placeholder: 'name@agency.gov',
    required: true,
    autocomplete: 'email',
  }),
};

export const TextInputWithFormField: Story = {
  name: 'civui:form-field + text-input',
  render: () => {
    const input = TextInputTwig({ name: 'email', type: 'email', required: true, autocomplete: 'email' });
    return render(FormFieldTwig, {
      label: 'Email address',
      hint: 'Work email preferred',
      required: true,
      default: input,
    });
  },
};

export const Select: Story = {
  name: 'civui:select',
  render: () => render(SelectTwig, {
    name: 'state',
    preset: 'us-state',
    required: true,
  }),
};

export const SSN: Story = {
  name: 'civui:ssn',
  render: () => render(SsnTwig, {
    name: 'ssn',
    required: true,
  }),
};

// ── Controls ─────────────────────────────────────────────────

export const Checkbox: Story = {
  name: 'civui:checkbox',
  render: () => render(CheckboxTwig, {
    label: 'I certify this information is correct',
    name: 'certify',
    value: 'true',
    required: true,
  }),
};

// ── Actions ──────────────────────────────────────────────────

export const Buttons: Story = {
  name: 'civui:button variants',
  render: () => html`
    <div style="display: flex; gap: 8px;">
      ${render(ButtonTwig, { label: 'Submit', type: 'submit' })}
      ${render(ButtonTwig, { label: 'Save draft', variant: 'secondary' })}
      ${render(ButtonTwig, { label: 'Cancel', variant: 'tertiary' })}
      ${render(ButtonTwig, { label: 'Delete', variant: 'secondary', danger: true })}
    </div>
  `,
};

export const Links: Story = {
  name: 'civui:link variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${render(LinkTwig, { label: 'View all benefits', href: '#/benefits', variant: 'secondary' })}
      ${render(LinkTwig, { label: 'Go back', href: '#/previous', variant: 'back' })}
      ${render(LinkTwig, { label: 'Visit VA.gov', href: 'https://va.gov', new_tab: true })}
    </div>
  `,
};

export const ActionLinks: Story = {
  name: 'civui:action-link',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${render(ActionLinkTwig, { type: 'phone', number: '8005271000', label: 'VA benefits hotline' })}
      ${render(ActionLinkTwig, { type: 'email', address: 'help@va.gov' })}
      ${render(ActionLinkTwig, { type: 'download', href: '#/form.pdf', label: 'VA Form 21-526EZ', file_size: '2.4 MB' })}
    </div>
  `,
};

// ── Feedback ─────────────────────────────────────────────────

export const Alerts: Story = {
  name: 'civui:alert variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${render(AlertTwig, { variant: 'info', heading: 'Information', label: 'Your session expires in 5 minutes.' })}
      ${render(AlertTwig, { variant: 'warning', heading: 'Warning', label: 'Some fields are incomplete.' })}
      ${render(AlertTwig, { variant: 'error', heading: 'Error', label: 'Please fix the errors below.' })}
      ${render(AlertTwig, { variant: 'success', heading: 'Success', label: 'Your application was submitted.' })}
    </div>
  `,
};

// ── Complete form ────────────────────────────────────────────

export const CompleteDrupalForm: Story = {
  name: 'Complete Drupal form',
  render: () => {
    const nameInput = TextInputTwig({ name: 'fullName', required: true, autocomplete: 'name' });
    const emailInput = TextInputTwig({ name: 'email', type: 'email', required: true, autocomplete: 'email' });
    const nameField = FormFieldTwig({ label: 'Full name', required: true, default: nameInput });
    const emailField = FormFieldTwig({ label: 'Email address', hint: 'Work email preferred', required: true, default: emailInput });
    const certify = CheckboxTwig({ label: 'I certify the information above is accurate', name: 'certify', required: true });
    const submit = ButtonTwig({ label: 'Submit application', type: 'submit' });
    const save = ButtonTwig({ label: 'Save draft', variant: 'secondary' });

    return html`
      <div style="max-width: 600px;">
        <h2 style="margin-bottom: 16px;">Drupal SDC Form Example</h2>
        ${unsafeHTML(nameField)}
        ${unsafeHTML(emailField)}
        ${unsafeHTML(certify)}
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          ${unsafeHTML(submit)}
          ${unsafeHTML(save)}
        </div>
      </div>
    `;
  },
};
