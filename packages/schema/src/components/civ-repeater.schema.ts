import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-repeater',
  description: 'Repeating-section orchestration for "Add another N" patterns. Wraps a templated child structure and lets the user dynamically add / remove / reorder instances. Renders as a fieldset with per-instance remove buttons (inline mode) or as a sequence of form-steps (form-steps mode).',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: true,

  props: {
    legend: {
      type: 'string',
      description: 'Top-level legend rendered above the repeated instances',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'When set, promotes the legend to a heading via role="heading" + aria-level=N',
      attribute: 'heading-level',
    },
    size: {
      type: 'enum',
      description: 'Visual size of the legend',
      values: ['sm', 'md', 'lg', 'xl'],
    },
    itemLabel: {
      type: 'string',
      description: 'Singular noun for the repeated thing — interpolated into "Add another {item}" and remove labels',
      default: 'item',
      attribute: 'item-label',
    },
    mode: {
      type: 'enum',
      description: 'Layout mode. inline = stacked instances visible at once; form-steps = each instance is a separate form-step in a wizard',
      default: 'inline',
      values: ['inline', 'form-steps'],
    },
    formStepsSensitive: {
      type: 'boolean',
      description: 'In form-steps mode, treat the repeater as a sensitive flow — auto-pause / save state on navigation away',
      default: false,
      attribute: 'form-steps-sensitive',
    },
    formStepsShowPause: {
      type: 'boolean',
      description: 'In form-steps mode, render an explicit "Save and continue later" affordance on each step',
      default: false,
      attribute: 'form-steps-show-pause',
    },
    min: {
      type: 'number',
      description: 'Minimum number of instances. Below this, remove buttons are hidden',
      default: 1,
    },
    max: {
      type: 'number',
      description: 'Maximum number of instances. 0 = no limit. Above this, the "Add another" button is hidden',
      default: 0,
    },
  },

  events: {
    'civ-repeater-add': {
      description: 'Fires when a new instance is added',
      detail: {
        index: { type: 'number', description: 'Index of the new instance' },
      },
    },
    'civ-repeater-remove': {
      description: 'Fires when an instance is removed',
      detail: {
        index: { type: 'number', description: 'Index of the removed instance' },
      },
    },
    'civ-repeater-form-steps-open': {
      description: 'Fires when an instance opens for editing in form-steps mode (either a new instance being added or an existing one re-opened)',
      detail: {
        index: { type: 'number', description: 'Index of the instance being opened' },
        isNew: { type: 'boolean', description: 'True when this is a freshly-added instance (not a re-edit of an existing one)' },
      },
    },
    'civ-repeater-form-steps-close': {
      description: 'Fires when the form-steps editor closes — either via Save or Cancel',
      detail: {
        index: { type: 'number', description: 'Index of the instance being closed' },
        action: { type: 'string', description: 'Either "save" (committed) or "cancel" (aborted, edits discarded)' },
      },
    },
  },

  a11y: {
    role: 'group',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'fieldset' },
      children: [
        { type: 'label', bindings: { text: 'legend', required: 'required' } },
        { type: 'hint', condition: 'hint', bindings: { text: 'hint' } },
        { type: 'error', condition: 'error', bindings: { text: 'error' } },
        // Each instance renders the templated child plus a remove button (when count > min)
        { type: 'slot', bindings: { name: 'instances' } },
        // Add button rendered when count < max (or max = 0)
        { type: 'button', bindings: { label: '"Add another {itemLabel}"', action: 'add' } },
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
