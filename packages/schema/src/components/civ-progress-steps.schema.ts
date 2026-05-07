import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-progress-steps',
  description: 'Multi-step progress indicator — renders a horizontal sequence of segments with completed / current / upcoming states. Used to show position in a form wizard.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    steps: {
      type: 'string',
      description: 'JSON array of step objects: `[{id, label, status?}, ...]`. Status can be "complete" | "current" | "upcoming" | "error". Defaults computed from `current` index when omitted',
      default: '[]',
    },
    current: {
      type: 'number',
      description: 'Index of the current step (0-based)',
      default: 0,
    },
    clickable: {
      type: 'boolean',
      description: 'Render completed steps as buttons that navigate back when clicked. Fires civ-step-click',
      default: false,
    },
    errorSteps: {
      type: 'string',
      description: 'JSON array of step IDs to mark as error state, overriding the default sequence',
      default: '[]',
      attribute: 'error-steps',
    },
  },

  events: {
    'civ-step-click': {
      description: 'Fires when a clickable completed step is activated',
      detail: {
        index: { type: 'number', description: 'Index of the clicked step' },
      },
    },
  },

  a11y: {
    role: 'list',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-label': 'progress',
    },
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'ol', role: 'list' },
      children: [
        { type: 'slot', bindings: { name: 'segments' } },
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
