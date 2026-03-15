import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-form',
  description: 'Form container that provides validation, error summary with anchor links, submit/reset handling, and FormData collection. Validates on submit, not on blur.',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    action: {
      type: 'string',
      description: 'Form submission URL (for progressive enhancement)',
      default: '',
    },
    method: {
      type: 'enum',
      description: 'HTTP method for form submission',
      default: 'post',
      values: ['get', 'post'],
    },
    formLabel: {
      type: 'string',
      description: 'Accessible label for the form region',
      default: '',
      attribute: 'form-label',
    },
  },

  events: {
    'civ-submit': {
      description: 'Fires on successful validation and form submission',
      detail: {
        formData: { type: 'string', description: 'Form data as key-value record' },
      },
    },
    'civ-invalid': {
      description: 'Fires when validation fails',
      detail: {
        errors: { type: 'string[]', description: 'Array of validation error objects' },
      },
    },
  },

  a11y: {
    role: 'form',
    requiredIndicator: 'none',
    errorAnnouncement: 'assertive',
  },

  renderOrder: [
    {
      type: 'slot',
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
