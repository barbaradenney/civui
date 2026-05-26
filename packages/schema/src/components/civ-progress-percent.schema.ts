import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-progress-percent',
  description: 'Percentage progress bar. Single horizontal track with a fill from 0 to 100. Used for upload progress, multi-step form completion percentage, or any continuous-progress metric.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    value: {
      type: 'number',
      description: 'Current progress value (0-100)',
      default: 0,
    },
    label: {
      type: 'string',
      description: 'Visible label rendered above the bar. Also used as aria-label when hidePercent is false',
      default: 'Progress',
    },
    status: {
      type: 'enum',
      description: 'Visual status. Empty = neutral primary fill; success = complete green; error = red error fill',
      default: '',
      values: ['', 'success', 'error'],
    },
    hidePercent: {
      type: 'boolean',
      description: 'When true, omits the numeric percentage. Default false — the percent value renders alongside the label',
      default: false,
      attribute: 'hide-percent',
    },
  },

  events: {},

  a11y: {
    role: 'progressbar',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-valuenow': 'value',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', bindings: { text: 'label' } },
        { type: 'container', bindings: { width: 'value', role: 'progressbar' } },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
