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
