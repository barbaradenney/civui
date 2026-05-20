import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-text-input',
  description: 'Accessible text input with label, hint, error, and width variants. Uses ElementInternals for native form participation.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    type: {
      type: 'enum',
      description: 'HTML input type controlling keyboard and secure entry',
      default: 'text',
      values: ['text', 'email', 'number', 'password', 'search', 'tel', 'url'],
    },
    width: {
      type: 'enum',
      description: 'Width variant',
      default: 'default',
      values: ['default', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    spacing: {
      type: 'enum',
      description: 'Density variant. `default` renders the full label / hint / error chrome. `sm` (compact) renders just the bare `<input>` with the host\'s `aria-label` propagated for screen-reader text. For use in dense surfaces like data-grid cell editors where the surrounding context labels the control. Mask / validation behavior is preserved in compact mode',
      default: 'default',
      values: ['default', 'sm'],
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder text (never use as sole label)',
      default: '',
    },
    pattern: {
      type: 'string',
      description: 'Validation regex pattern',
      default: '',
    },
    maxlength: {
      type: 'number',
      description: 'Maximum character length',
    },
    minlength: {
      type: 'number',
      description: 'Minimum character length',
    },
    hideCharCount: {
      type: 'boolean',
      description: 'When maxlength is set, suppresses the visual character counter and aria-live announcements',
      default: false,
      attribute: 'hide-char-count',
    },
    autocomplete: {
      type: 'string',
      description: 'Autocomplete hint',
      default: '',
    },
    inputmode: {
      type: 'string',
      description: 'Input mode hint for virtual keyboards',
      default: '',
    },
    mask: {
      type: 'enum',
      description: 'Built-in mask preset (blur-mode formatting). Empty string means no mask',
      default: '',
      values: ['', 'ssn', 'phone-us', 'zip', 'zip4', 'ein', 'currency'],
    },
    maskPattern: {
      type: 'string',
      description: 'Custom mask pattern: # = digit, A = letter, * = any printable char. Other chars are literal inserts',
      default: '',
      attribute: 'mask-pattern',
    },
    maskMode: {
      type: 'enum',
      description: 'Mask formatting mode. blur (default) is accessible; live formats as user types',
      default: 'blur',
      values: ['blur', 'live'],
      attribute: 'mask-mode',
    },
    validateType: {
      type: 'enum',
      description: 'Declarative validation preset. Auto-validates on blur. Empty string means no validation',
      default: '',
      values: ['', 'email', 'phone', 'phoneIntl', 'ssn', 'ein', 'routing', 'zip', 'zip4', 'usState', 'url', 'currency', 'alphanumeric'],
      attribute: 'validate',
    },
    prefix: {
      type: 'string',
      description: 'Inline prefix label rendered to the left of the input (e.g. "$"). Mutually exclusive with leadingIcon',
      default: '',
    },
    suffix: {
      type: 'string',
      description: 'Inline suffix label rendered to the right of the input (e.g. ".com"). Mutually exclusive with trailingIcon and the clear button',
      default: '',
    },
    clearable: {
      type: 'boolean',
      description: 'When true and the value is non-empty, renders a clear button on the trailing edge',
      default: false,
    },
    revealPassword: {
      type: 'boolean',
      description: 'When true and type="password", renders an inset eye/eye-slash button on the trailing edge that toggles the rendered input type between "password" and "text". Suppressed for non-password types. Clear button takes precedence when both are active',
      default: false,
      attribute: 'reveal-password',
    },
    leadingIcon: {
      type: 'string',
      description: 'Icon rendered inside the input on the leading edge. Any civ-icon name. Ignored when prefix is set',
      default: '',
      attribute: 'leading-icon',
    },
    leadingIconLabel: {
      type: 'string',
      description: 'Accessible label for the leading icon. When omitted, icon is decorative (aria-hidden)',
      default: '',
      attribute: 'leading-icon-label',
    },
    trailingIcon: {
      type: 'string',
      description: 'Icon rendered inside the input on the trailing edge. Ignored when suffix is set or the clear button is showing',
      default: '',
      attribute: 'trailing-icon',
    },
    trailingIconLabel: {
      type: 'string',
      description: 'Accessible label for the trailing icon. When omitted, icon is decorative',
      default: '',
      attribute: 'trailing-icon-label',
    },
    decimals: {
      type: 'number',
      description: 'Currency-mask only: decimal places to keep ("1,234.56" with 2, "1,234" with 0). `0` is whole-dollar mode for tax-style fields (W-4 line 4c, VA benefits)',
      default: 2,
    },
    min: {
      type: 'number',
      description: 'Currency-mask only: minimum allowed amount. Out-of-range values surface an inline error on blur',
    },
    max: {
      type: 'number',
      description: 'Currency-mask only: maximum allowed amount. Out-of-range values surface an inline error on blur',
    },
    allowNegative: {
      type: 'boolean',
      description: 'Currency-mask only: accept negative amounts (refunds, adjustments). Standard mode rejects values below zero',
      default: false,
      attribute: 'allow-negative',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires on every value change (like native input event)',
      detail: {
        value: { type: 'string', description: 'Current input value' },
      },
    },
    'civ-change': {
      description: 'Fires on committed value change (blur/enter, like native change)',
      detail: {
        value: { type: 'string', description: 'Committed input value' },
      },
    },
  },

  a11y: {
    role: 'textbox',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
    ariaAttributes: {
      'aria-invalid': 'error ? "true" : nothing',
    },
  },

  renderOrder: [
    {
      type: 'label',
      bindings: { text: 'label', required: 'required' },
    },
    {
      type: 'hint',
      condition: 'hint',
      bindings: { text: 'hint' },
    },
    {
      type: 'error',
      condition: 'error',
      bindings: { text: 'error' },
    },
    {
      type: 'input',
      bindings: {
        type: 'type',
        value: 'value',
        placeholder: 'placeholder',
        disabled: 'disabled',
        required: 'required',
        pattern: 'pattern',
        maxlength: 'maxlength',
        minlength: 'minlength',
        autocomplete: 'autocomplete',
        inputmode: 'inputmode',
      },
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: true,
    resetBehavior: 'restore-default-value',
  },

  widths: {
    'default': { webClass: 'civ-w-full', iosPoints: null, androidDp: null },
    '2xs': { webClass: 'civ-w-12', iosPoints: 48, androidDp: 48 },
    'xs': { webClass: 'civ-w-16', iosPoints: 64, androidDp: 64 },
    'sm': { webClass: 'civ-w-24', iosPoints: 96, androidDp: 96 },
    'md': { webClass: 'civ-w-40', iosPoints: 160, androidDp: 160 },
    'lg': { webClass: 'civ-w-60', iosPoints: 240, androidDp: 240 },
    'xl': { webClass: 'civ-w-72', iosPoints: 288, androidDp: 288 },
    '2xl': { webClass: 'civ-w-96', iosPoints: 384, androidDp: 384 },
  },

  platform: {
    web: {
      controlClasses: ['civ-input', 'civ-max-w-full'],
    },
    ios: {
      secureVariant: 'password',
      keyboardType: {
        text: '.default',
        email: '.emailAddress',
        number: '.decimalPad',
        password: '.default',
        search: '.default',
        tel: '.phonePad',
        url: '.URL',
      },
      contentType: {
        email: '.emailAddress',
        tel: '.telephoneNumber',
        url: '.URL',
        password: '.password',
      },
      autocapitalization: {
        email: '.never',
        url: '.never',
        _default: '.sentences',
      },
    },
    android: {
      keyboardType: {
        text: 'KeyboardType.Text',
        email: 'KeyboardType.Email',
        number: 'KeyboardType.Decimal',
        password: 'KeyboardType.Password',
        search: 'KeyboardType.Text',
        tel: 'KeyboardType.Phone',
        url: 'KeyboardType.Uri',
      },
      capitalization: {
        email: 'KeyboardCapitalization.None',
        url: 'KeyboardCapitalization.None',
        _default: 'KeyboardCapitalization.Sentences',
      },
      visualTransformation: {
        password: 'PasswordVisualTransformation()',
        _default: 'VisualTransformation.None',
      },
    },
  },
};

export default schema;
