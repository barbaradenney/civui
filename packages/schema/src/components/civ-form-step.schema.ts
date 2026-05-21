import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-form-step',
  description: 'Single step in a multi-step form wizard. Provides Continue/Complete navigation, optional pause-and-save affordance, and per-step validation gate. Pair with a parent `<civ-form persist="key">` to auto-save field values to sessionStorage.',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    continueLabel: {
      type: 'string',
      description: 'Visible label on the next-step button. Defaults to the i18n string "Continue"',
      default: '',
      attribute: 'continue-label',
    },
    completeLabel: {
      type: 'string',
      description: 'Visible label on the final-step button. Defaults to the i18n string "Submit"',
      default: '',
      attribute: 'complete-label',
    },
    navDisabled: {
      type: 'boolean',
      description: 'Disable the navigation buttons (e.g. while submitting). Independent of `validate`',
      default: false,
      attribute: 'nav-disabled',
    },
    hideNav: {
      type: 'boolean',
      description: 'Suppress the built-in navigation buttons entirely. Use when the consumer renders its own buttons',
      default: false,
      attribute: 'hide-nav',
    },
    progress: {
      type: 'enum',
      description: 'Progress affordance rendered above the step content. minimal = "Step N of M" text only; steps = horizontal step indicator; bar = single progress bar',
      default: 'minimal',
      values: ['minimal', 'steps', 'bar'],
    },
    beforeContinue: {
      type: 'string',
      description: 'Async hook `(stepEl, stepIndex) => Promise<boolean> | boolean` invoked before advancing. Return false to block navigation (e.g. server-side validation failed). Set programmatically (not as an attribute)',
      webOnly: true,
    },
    validate: {
      type: 'boolean',
      description: 'Run native form validation on Continue. When false, lets users advance with invalid fields (used for save-and-resume drafts)',
      default: true,
    },
    sensitive: {
      type: 'boolean',
      description: 'Mark the step as containing sensitive data. Auto-pauses persistence on navigation away and warns before unload',
      default: false,
      reflect: true,
    },
    stepTitle: {
      type: 'string',
      description: 'Optional in-step title rendered above the form fields',
      default: '',
      attribute: 'step-title',
    },
    headerSize: {
      type: 'enum',
      description: 'Size of the step title heading',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
      attribute: 'header-size',
    },
    headingLevel: {
      type: 'number',
      description: 'Aria-level for the step title heading',
      default: 2,
      attribute: 'heading-level',
    },
    showPause: {
      type: 'boolean',
      description: 'Render a "Save and continue later" pause affordance',
      default: false,
      attribute: 'show-pause',
    },
    pauseLabel: {
      type: 'string',
      description: 'Visible label on the pause affordance. Defaults to the i18n string "Save and continue later"',
      default: '',
      attribute: 'pause-label',
    },
  },

  events: {
    'civ-step-change': {
      description: 'Fires when the active step changes. Covers both forward (continue) and backward (back) navigation as well as programmatic jumps',
      detail: {
        current: { type: 'number', description: 'Index of the now-active step' },
        total: { type: 'number', description: 'Total step count' },
        label: { type: 'string', description: 'Visible title of the now-active step' },
      },
    },
    'civ-step-continue': {
      description: 'Fires when the user advances to the next step',
      detail: {
        from: { type: 'number', description: 'Index of the step being left' },
        to: { type: 'number', description: 'Index of the step being entered' },
      },
    },
    'civ-step-back': {
      description: 'Fires when the user navigates back to the previous step',
      detail: {
        from: { type: 'number', description: 'Index of the step being left' },
        to: { type: 'number', description: 'Index of the step being entered' },
      },
    },
    'civ-step-pause': {
      description: 'Fires when the user clicks "Save and continue later"',
      detail: {
        current: { type: 'number', description: 'Index of the step being paused' },
        label: { type: 'string', description: 'Visible title of the step being paused' },
      },
    },
    'civ-step-complete': {
      description: 'Fires when the user submits the final step',
      detail: {
        total: { type: 'number', description: 'Total step count' },
      },
    },
  },

  a11y: {
    role: 'region',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'section' },
      children: [
        { type: 'container', condition: 'stepTitle', bindings: { text: 'stepTitle', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'content' } },
        { type: 'container', condition: '!hideNav', children: [
          { type: 'button', condition: 'showPause', bindings: { label: 'pauseLabel', action: 'pause' } },
          { type: 'button', bindings: { label: 'continueLabel', action: 'continue', disabled: 'navDisabled' } },
        ] },
      ],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
