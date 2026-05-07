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
      description: 'Step list. On web: JSON-encoded array of `{id, label, status?}` (HTML attributes are strings). On native: a typed `[String]` / `List<String>` of step labels. Conceptually the same data, different wire format per platform',
      default: '[]',
      webOnly: true,
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
      description: 'Step IDs to render in error state. Web: JSON-encoded array string; native: typed list. See `steps` for the same wire-format note',
      default: '[]',
      attribute: 'error-steps',
      webOnly: true,
    },
  },

  events: {
    'civ-step-click': {
      description: 'Fires when a clickable completed step is activated',
      detail: {
        step: { type: 'number', description: 'Index of the clicked step' },
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
