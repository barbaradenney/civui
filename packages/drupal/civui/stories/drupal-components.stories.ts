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
import '@civui/compound';

// ── Twig template imports ───────────────────────────────────

// Inputs
// @ts-ignore
import TextInputTwig from '../components/text-input/text-input.twig';
// @ts-ignore
import TextareaTwig from '../components/textarea/textarea.twig';
// @ts-ignore
import SelectTwig from '../components/select/select.twig';
// @ts-ignore
import ComboboxTwig from '../components/combobox/combobox.twig';
// @ts-ignore
import DatePickerTwig from '../components/date-picker/date-picker.twig';
// @ts-ignore
import DateRangePickerTwig from '../components/date-range-picker/date-range-picker.twig';
// @ts-ignore
import MemorableDateTwig from '../components/memorable-date/memorable-date.twig';
// @ts-ignore
import FileUploadTwig from '../components/file-upload/file-upload.twig';
// @ts-ignore
import SsnTwig from '../components/ssn/ssn.twig';
// @ts-ignore
import EinTwig from '../components/ein/ein.twig';
// @ts-ignore
import PhoneTwig from '../components/phone/phone.twig';
// @ts-ignore
import EmailTwig from '../components/email/email.twig';
// @ts-ignore
import ZipTwig from '../components/zip/zip.twig';
// @ts-ignore
import CurrencyTwig from '../components/currency/currency.twig';
// @ts-ignore
import RoutingNumberTwig from '../components/routing-number/routing-number.twig';
// @ts-ignore
import VaFileNumberTwig from '../components/va-file-number/va-file-number.twig';
// @ts-ignore
import CountryTwig from '../components/country/country.twig';
// @ts-ignore
import YesNoTwig from '../components/yes-no/yes-no.twig';

// Controls
// @ts-ignore
import CheckboxTwig from '../components/checkbox/checkbox.twig';
// @ts-ignore
import RadioTwig from '../components/radio/radio.twig';
// @ts-ignore
import ToggleTwig from '../components/toggle/toggle.twig';
// @ts-ignore
import CheckboxGroupTwig from '../components/checkbox-group/checkbox-group.twig';
// @ts-ignore
import RadioGroupTwig from '../components/radio-group/radio-group.twig';
// @ts-ignore
import SegmentedControlTwig from '../components/segmented-control/segmented-control.twig';

// Actions
// @ts-ignore
import ButtonTwig from '../components/button/button.twig';
// @ts-ignore
import ActionButtonTwig from '../components/action-button/action-button.twig';
// @ts-ignore
import LinkTwig from '../components/link/link.twig';
// @ts-ignore
import LinkCardTwig from '../components/link-card/link-card.twig';
// @ts-ignore
import ActionLinkTwig from '../components/action-link/action-link.twig';

// Feedback
// @ts-ignore
import AlertTwig from '../components/alert/alert.twig';
// @ts-ignore
import BadgeTwig from '../components/badge/badge.twig';
// @ts-ignore
import CountTwig from '../components/count/count.twig';

// Layout
// @ts-ignore
import CardTwig from '../components/card/card.twig';
// @ts-ignore
import DividerTwig from '../components/divider/divider.twig';
// @ts-ignore
import InputGroupTwig from '../components/input-group/input-group.twig';
// @ts-ignore
import ButtonGroupTwig from '../components/button-group/button-group.twig';
// @ts-ignore
import PageHeaderTwig from '../components/page-header/page-header.twig';
// @ts-ignore
import TagTwig from '../components/tag/tag.twig';
// @ts-ignore
import ListTwig from '../components/list/list.twig';
// @ts-ignore
import ListItemTwig from '../components/list-item/list-item.twig';
// @ts-ignore
import ImagePreviewTwig from '../components/image-preview/image-preview.twig';
// @ts-ignore
import DataFieldTwig from '../components/data-field/data-field.twig';
// @ts-ignore
import IconTwig from '../components/icon/icon.twig';
// @ts-ignore
import FilterChipTwig from '../components/filter-chip/filter-chip.twig';
// @ts-ignore
import FilterChipGroupTwig from '../components/filter-chip-group/filter-chip-group.twig';
// @ts-ignore
import FormGroupTwig from '../components/form-group/form-group.twig';

// Overlays
// @ts-ignore
import ModalTwig from '../components/modal/modal.twig';
// @ts-ignore
import ActionSheetTwig from '../components/action-sheet/action-sheet.twig';

// Compound
// @ts-ignore
import AddressTwig from '../components/address/address.twig';
// @ts-ignore
import NameTwig from '../components/name/name.twig';
// @ts-ignore
import DirectDepositTwig from '../components/direct-deposit/direct-deposit.twig';
// @ts-ignore
import SignatureTwig from '../components/signature/signature.twig';
// @ts-ignore
import RaceEthnicityTwig from '../components/race-ethnicity/race-ethnicity.twig';
// @ts-ignore
import RelationshipTwig from '../components/relationship/relationship.twig';
// @ts-ignore
import MarriageHistoryTwig from '../components/marriage-history/marriage-history.twig';
// @ts-ignore
import ServiceHistoryTwig from '../components/service-history/service-history.twig';

// Form Patterns
// @ts-ignore
import FormTwig from '../components/form/form.twig';
// @ts-ignore
import FormFieldTwig from '../components/form-field/form-field.twig';
// @ts-ignore
import FormFieldsetTwig from '../components/form-fieldset/form-fieldset.twig';
// @ts-ignore
import FieldsetTwig from '../components/fieldset/fieldset.twig';
// @ts-ignore
import ConditionalTwig from '../components/conditional/conditional.twig';
// @ts-ignore
import FormStepTwig from '../components/form-step/form-step.twig';
// @ts-ignore
import RepeaterTwig from '../components/repeater/repeater.twig';
// @ts-ignore
import SectionIntroTwig from '../components/section-intro/section-intro.twig';
// @ts-ignore
import ProgressBarTwig from '../components/progress-bar/progress-bar.twig';
// @ts-ignore
import ProgressStepsTwig from '../components/progress-steps/progress-steps.twig';
// @ts-ignore
import SummaryTwig from '../components/summary/summary.twig';
// @ts-ignore
import PrefillNoticeTwig from '../components/prefill-notice/prefill-notice.twig';

// Navigation
// @ts-ignore
import SkipLinkTwig from '../components/skip-link/skip-link.twig';

const meta: Meta = {
  title: 'Drupal/SDC Preview',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Live preview of all 69 CivUI Drupal Single Directory Components. These Twig templates are compiled by vite-plugin-twig-drupal and render real CivUI web components.',
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

// ═══════════════════════════════════════════════════════════════
// ── Inputs ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const TextInput: Story = {
  name: 'civui:text-input',
  render: () => render(TextInputTwig, {
    name: 'email',
    type: 'email',
    required: true,
    autocomplete: 'email',
  }),
};

export const Textarea: Story = {
  name: 'civui:textarea',
  render: () => render(TextareaTwig, {
    name: 'comments',
    rows: 4,
    maxlength: 500,
  }),
};

export const Select: Story = {
  name: 'civui:select',
  render: () => render(SelectTwig, {
    name: 'state',
    preset: 'us-state',
    required: true,
  }),
};

export const Combobox: Story = {
  name: 'civui:combobox',
  render: () => render(ComboboxTwig, {
    name: 'facility',
    placeholder: 'Search...',
  }),
};

export const DatePicker: Story = {
  name: 'civui:date-picker',
  render: () => render(DatePickerTwig, {
    name: 'appointment',
    min: '2026-01-01',
    max: '2026-12-31',
  }),
};

export const DateRangePicker: Story = {
  name: 'civui:date-range-picker',
  render: () => render(DateRangePickerTwig, {
    name: 'service_dates',
    min: '2026-01-01',
  }),
};

export const MemorableDate: Story = {
  name: 'civui:memorable-date',
  render: () => render(MemorableDateTwig, {
    name: 'dob',
    required: true,
  }),
};

export const FileUpload: Story = {
  name: 'civui:file-upload',
  render: () => render(FileUploadTwig, {
    name: 'documents',
    accept: '.pdf,.jpg',
    multiple: true,
  }),
};

export const SSN: Story = {
  name: 'civui:ssn',
  render: () => render(SsnTwig, {
    name: 'ssn',
    required: true,
  }),
};

export const EIN: Story = {
  name: 'civui:ein',
  render: () => render(EinTwig, {
    name: 'ein',
    required: true,
  }),
};

export const Phone: Story = {
  name: 'civui:phone',
  render: () => render(PhoneTwig, {
    name: 'phone',
    required: true,
  }),
};

export const Email: Story = {
  name: 'civui:email',
  render: () => render(EmailTwig, {
    name: 'email',
    required: true,
  }),
};

export const Zip: Story = {
  name: 'civui:zip',
  render: () => render(ZipTwig, {
    name: 'zip',
    required: true,
  }),
};

export const Currency: Story = {
  name: 'civui:currency',
  render: () => render(CurrencyTwig, {
    name: 'income',
  }),
};

export const RoutingNumber: Story = {
  name: 'civui:routing-number',
  render: () => render(RoutingNumberTwig, {
    name: 'routing',
  }),
};

export const VaFileNumber: Story = {
  name: 'civui:va-file-number',
  render: () => render(VaFileNumberTwig, {
    name: 'va_file_number',
  }),
};

export const Country: Story = {
  name: 'civui:country',
  render: () => render(CountryTwig, {
    name: 'country',
    us_first: true,
  }),
};

export const YesNo: Story = {
  name: 'civui:yes-no',
  render: () => render(YesNoTwig, {
    legend: 'Are you a veteran?',
    name: 'veteran',
    required: true,
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Controls ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Checkbox: Story = {
  name: 'civui:checkbox',
  render: () => render(CheckboxTwig, {
    label: 'I agree to the terms and conditions',
    name: 'agree',
    required: true,
  }),
};

export const Radio: Story = {
  name: 'civui:radio',
  render: () => render(RadioTwig, {
    label: 'Option A',
    name: 'choice',
    value: 'a',
  }),
};

export const Toggle: Story = {
  name: 'civui:toggle',
  render: () => render(ToggleTwig, {
    label: 'Enable notifications',
    name: 'notifications',
  }),
};

export const CheckboxGroup: Story = {
  name: 'civui:checkbox-group',
  render: () => {
    const children = [
      CheckboxTwig({ label: 'Healthcare', name: 'benefits', value: 'healthcare' }),
      CheckboxTwig({ label: 'Education', name: 'benefits', value: 'education' }),
      CheckboxTwig({ label: 'Housing', name: 'benefits', value: 'housing' }),
    ].join('');
    return render(CheckboxGroupTwig, { default: children });
  },
};

export const RadioGroup: Story = {
  name: 'civui:radio-group',
  render: () => {
    const children = [
      RadioTwig({ label: 'Email', name: 'contact', value: 'email' }),
      RadioTwig({ label: 'Phone', name: 'contact', value: 'phone' }),
      RadioTwig({ label: 'Mail', name: 'contact', value: 'mail' }),
    ].join('');
    return render(RadioGroupTwig, { default: children });
  },
};

export const SegmentedControl: Story = {
  name: 'civui:segmented-control',
  render: () => render(SegmentedControlTwig, {
    legend: 'View',
    name: 'view',
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Actions ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Button: Story = {
  name: 'civui:button',
  render: () => render(ButtonTwig, {
    label: 'Submit application',
    type: 'submit',
  }),
};

export const ActionButton: Story = {
  name: 'civui:action-button',
  render: () => render(ActionButtonTwig, {
    label: 'Save draft',
    variant: 'tertiary',
  }),
};

export const Link: Story = {
  name: 'civui:link',
  render: () => render(LinkTwig, {
    label: 'View all benefits',
    href: '#/benefits',
    variant: 'secondary',
  }),
};

export const LinkCard: Story = {
  name: 'civui:link-card',
  render: () => render(LinkCardTwig, {
    href: '#/benefits/healthcare',
    heading: 'VA Health Care',
    description: 'Apply for VA health care benefits and manage your health online.',
  }),
};

export const ActionLink: Story = {
  name: 'civui:action-link',
  render: () => render(ActionLinkTwig, {
    type: 'phone',
    number: '8005271000',
    label: 'VA benefits hotline',
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Feedback ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Alert: Story = {
  name: 'civui:alert',
  render: () => render(AlertTwig, {
    variant: 'success',
    heading: 'Application submitted',
    label: 'Your application has been received and is being processed.',
  }),
};

export const Badge: Story = {
  name: 'civui:badge',
  render: () => render(BadgeTwig, {
    label: 'Active',
    variant: 'success',
  }),
};

export const Count: Story = {
  name: 'civui:count',
  render: () => render(CountTwig, {
    count: 5,
    variant: 'info',
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Layout ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Card: Story = {
  name: 'civui:card',
  render: () => render(CardTwig, {
    heading: 'Benefits summary',
    default: '<p>You are currently enrolled in VA health care and education benefits.</p>',
  }),
};

export const Divider: Story = {
  name: 'civui:divider',
  render: () => render(DividerTwig, {}),
};

export const InputGroup: Story = {
  name: 'civui:input-group',
  render: () => {
    const city = FormFieldTwig({
      label: 'City',
      required: true,
      default: TextInputTwig({ name: 'city', required: true }),
    });
    const state = FormFieldTwig({
      label: 'State',
      required: true,
      default: SelectTwig({ name: 'state', preset: 'us-state', required: true }),
    });
    return render(InputGroupTwig, { default: city + state });
  },
};

export const ButtonGroup: Story = {
  name: 'civui:button-group',
  render: () => {
    const children = [
      ButtonTwig({ label: 'Continue', type: 'submit' }),
      ButtonTwig({ label: 'Save draft', variant: 'secondary' }),
      ButtonTwig({ label: 'Cancel', variant: 'tertiary' }),
    ].join('');
    return render(ButtonGroupTwig, { default: children });
  },
};

export const PageHeader: Story = {
  name: 'civui:page-header',
  render: () => render(PageHeaderTwig, {
    default: '<h1>Apply for VA health care</h1><p>VA Form 10-10EZ</p>',
  }),
};

export const Tag: Story = {
  name: 'civui:tag',
  render: () => render(TagTwig, {
    label: 'Healthcare',
    variant: 'blue',
  }),
};

export const List: Story = {
  name: 'civui:list',
  render: () => {
    const items = [
      ListItemTwig({ heading: 'Claim #1234', description: 'Submitted January 15, 2026' }),
      ListItemTwig({ heading: 'Claim #5678', description: 'Submitted March 3, 2026' }),
      ListItemTwig({ heading: 'Claim #9012', description: 'Submitted April 20, 2026' }),
    ].join('');
    return render(ListTwig, { dividers: true, default: items });
  },
};

export const ListItem: Story = {
  name: 'civui:list-item',
  render: () => {
    const badge = BadgeTwig({ label: 'Pending', variant: 'info' });
    return render(ListItemTwig, {
      heading: 'Claim #1234',
      description: 'Submitted January 15, 2026',
      end: badge,
    });
  },
};

export const ImagePreview: Story = {
  name: 'civui:image-preview',
  render: () => render(ImagePreviewTwig, {
    src: 'https://picsum.photos/seed/civui/400/300',
    alt: 'Sample uploaded document',
    filename: 'dd214-scan.jpg',
    file_size: '1.2 MB',
  }),
};

export const DataField: Story = {
  name: 'civui:data-field',
  render: () => render(DataFieldTwig, {
    label: 'Mailing address',
    value: '123 Main St, Springfield, VA 22150',
    href: '#/edit-address',
  }),
};

export const Icon: Story = {
  name: 'civui:icon',
  render: () => render(IconTwig, {
    name: 'check',
    label: 'Check',
  }),
};

export const FilterChip: Story = {
  name: 'civui:filter-chip',
  render: () => render(FilterChipTwig, {
    label: 'Healthcare',
    name: 'filter',
    value: 'healthcare',
  }),
};

export const FilterChipGroup: Story = {
  name: 'civui:filter-chip-group',
  render: () => {
    const chips = [
      FilterChipTwig({ label: 'Healthcare', name: 'filter', value: 'healthcare' }),
      FilterChipTwig({ label: 'Education', name: 'filter', value: 'education' }),
      FilterChipTwig({ label: 'Housing', name: 'filter', value: 'housing' }),
    ].join('');
    return render(FilterChipGroupTwig, { default: chips });
  },
};

export const FormGroup: Story = {
  name: 'civui:form-group',
  render: () => {
    const firstName = FormFieldTwig({
      label: 'First name',
      required: true,
      default: TextInputTwig({ name: 'first_name', required: true }),
    });
    const lastName = FormFieldTwig({
      label: 'Last name',
      required: true,
      default: TextInputTwig({ name: 'last_name', required: true }),
    });
    return render(FormGroupTwig, { default: firstName + lastName });
  },
};

// ═══════════════════════════════════════════════════════════════
// ── Overlays ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Modal: Story = {
  name: 'civui:modal',
  render: () => render(ModalTwig, {
    heading: 'Confirm submission',
    heading_level: 3,
    open: true,
    default: '<p>Are you sure you want to submit this application? This action cannot be undone.</p>',
  }),
};

export const ActionSheet: Story = {
  name: 'civui:action-sheet',
  render: () => {
    const actions = [
      ButtonTwig({ label: 'Edit', variant: 'secondary' }),
      ButtonTwig({ label: 'Delete', variant: 'secondary', danger: true }),
      ButtonTwig({ label: 'Cancel', variant: 'tertiary' }),
    ].join('');
    return render(ActionSheetTwig, { open: true, default: actions });
  },
};

// ═══════════════════════════════════════════════════════════════
// ── Compound ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Address: Story = {
  name: 'civui:address',
  render: () => render(AddressTwig, {
    legend: 'Mailing address',
    name: 'mailing',
    required: true,
  }),
};

export const Name: Story = {
  name: 'civui:name',
  render: () => render(NameTwig, {
    legend: 'Veteran name',
    name: 'veteran',
    required: true,
  }),
};

export const DirectDeposit: Story = {
  name: 'civui:direct-deposit',
  render: () => render(DirectDepositTwig, {
    legend: 'Direct deposit information',
    name: 'deposit',
    required: true,
  }),
};

export const Signature: Story = {
  name: 'civui:signature',
  render: () => render(SignatureTwig, {
    legend: 'Veteran signature',
    name: 'signature',
    statement: 'I certify the information above is accurate and complete to the best of my knowledge and belief.',
    required: true,
  }),
};

export const RaceEthnicity: Story = {
  name: 'civui:race-ethnicity',
  render: () => render(RaceEthnicityTwig, {
    legend: 'Race, ethnicity, and origin',
    name: 'race_ethnicity',
    required: true,
  }),
};

export const Relationship: Story = {
  name: 'civui:relationship',
  render: () => render(RelationshipTwig, {
    legend: 'Dependent relationship',
    name: 'relationship',
    preset: 'dependent',
    required: true,
  }),
};

export const MarriageHistory: Story = {
  name: 'civui:marriage-history',
  render: () => render(MarriageHistoryTwig, {
    legend: 'Marriage history',
    name: 'marriage',
    required: true,
  }),
};

export const ServiceHistory: Story = {
  name: 'civui:service-history',
  render: () => render(ServiceHistoryTwig, {
    legend: 'Service history',
    name: 'service',
    required: true,
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Form Patterns ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const Form: Story = {
  name: 'civui:form',
  render: () => {
    const nameField = FormFieldTwig({
      label: 'Full name',
      required: true,
      default: TextInputTwig({ name: 'fullName', required: true, autocomplete: 'name' }),
    });
    const emailField = FormFieldTwig({
      label: 'Email address',
      hint: 'Work email preferred',
      required: true,
      default: TextInputTwig({ name: 'email', type: 'email', required: true, autocomplete: 'email' }),
    });
    const submit = ButtonTwig({ label: 'Submit', type: 'submit' });
    return render(FormTwig, { default: nameField + emailField + submit });
  },
};

export const FormField: Story = {
  name: 'civui:form-field',
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

export const FormFieldset: Story = {
  name: 'civui:form-fieldset',
  render: () => {
    const children = [
      RadioTwig({ label: 'Email', name: 'contact_method', value: 'email' }),
      RadioTwig({ label: 'Phone', name: 'contact_method', value: 'phone' }),
      RadioTwig({ label: 'Mail', name: 'contact_method', value: 'mail' }),
    ].join('');
    const radioGroup = RadioGroupTwig({ default: children });
    return render(FormFieldsetTwig, {
      legend: 'Preferred contact method',
      required: true,
      default: radioGroup,
    });
  },
};

export const Fieldset: Story = {
  name: 'civui:fieldset',
  render: () => {
    const firstName = FormFieldTwig({
      label: 'First name',
      required: true,
      default: TextInputTwig({ name: 'first_name', required: true }),
    });
    const lastName = FormFieldTwig({
      label: 'Last name',
      required: true,
      default: TextInputTwig({ name: 'last_name', required: true }),
    });
    return render(FieldsetTwig, {
      legend: 'Personal information',
      default: firstName + lastName,
    });
  },
};

export const Conditional: Story = {
  name: 'civui:conditional',
  render: () => {
    const conditionalContent = FormFieldTwig({
      label: 'VA file number',
      default: TextInputTwig({ name: 'va_file', required: true }),
    });
    return render(ConditionalTwig, {
      when: 'veteran',
      equals: 'yes',
      default: conditionalContent,
    });
  },
};

export const FormStep: Story = {
  name: 'civui:form-step',
  render: () => {
    const nameField = FormFieldTwig({
      label: 'Full name',
      required: true,
      default: TextInputTwig({ name: 'fullName', required: true }),
    });
    return render(FormStepTwig, { default: nameField });
  },
};

export const Repeater: Story = {
  name: 'civui:repeater',
  render: () => render(RepeaterTwig, {
    legend: 'Dependents',
    name: 'dependents',
    item_label: 'Dependent',
    mode: 'detail',
  }),
};

export const SectionIntro: Story = {
  name: 'civui:section-intro',
  render: () => render(SectionIntroTwig, {
    heading: 'Personal information',
    heading_level: 3,
    default: '<p>We need some basic information to process your application.</p>',
  }),
};

export const ProgressBar: Story = {
  name: 'civui:progress-bar',
  render: () => render(ProgressBarTwig, {
    value: 40,
    label: 'Progress',
    status: '2 of 5',
  }),
};

export const ProgressSteps: Story = {
  name: 'civui:progress-steps',
  render: () => render(ProgressStepsTwig, {
    current: 1,
  }),
};

export const Summary: Story = {
  name: 'civui:summary',
  render: () => {
    const fields = [
      DataFieldTwig({ label: 'Full name', value: 'Jane Doe', href: '#/edit' }),
      DataFieldTwig({ label: 'Email', value: 'jane@agency.gov', href: '#/edit' }),
      DataFieldTwig({ label: 'Phone', value: '(800) 555-1234', href: '#/edit' }),
    ].join('');
    return render(SummaryTwig, {
      heading: 'Review your information',
      default: fields,
    });
  },
};

export const PrefillNotice: Story = {
  name: 'civui:prefill-notice',
  render: () => render(PrefillNoticeTwig, {
    profile_href: '#/profile',
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Navigation ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const SkipLink: Story = {
  name: 'civui:skip-link',
  render: () => render(SkipLinkTwig, {
    label: 'Skip to main content',
    href: '#main-content',
  }),
};

// ═══════════════════════════════════════════════════════════════
// ── Complete Form Example ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export const CompleteDrupalForm: Story = {
  name: 'Complete Drupal form',
  render: () => {
    const nameInput = TextInputTwig({ name: 'fullName', required: true, autocomplete: 'name' });
    const emailInput = TextInputTwig({ name: 'email', type: 'email', required: true, autocomplete: 'email' });
    const nameField = FormFieldTwig({ label: 'Full name', required: true, default: nameInput });
    const emailField = FormFieldTwig({ label: 'Email address', hint: 'Work email preferred', required: true, default: emailInput });
    const stateField = FormFieldTwig({
      label: 'State',
      required: true,
      default: SelectTwig({ name: 'state', preset: 'us-state', required: true }),
    });
    const certify = CheckboxTwig({ label: 'I certify the information above is accurate', name: 'certify', required: true });
    const submit = ButtonTwig({ label: 'Submit application', type: 'submit' });
    const save = ButtonTwig({ label: 'Save draft', variant: 'secondary' });

    return html`
      <div style="max-width: 600px;">
        <h2 style="margin-bottom: 16px;">Drupal SDC Form Example</h2>
        ${unsafeHTML(nameField)}
        ${unsafeHTML(emailField)}
        ${unsafeHTML(stateField)}
        ${unsafeHTML(certify)}
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          ${unsafeHTML(submit)}
          ${unsafeHTML(save)}
        </div>
      </div>
    `;
  },
};
