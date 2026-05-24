import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-activity-item',
  description: 'A single entry inside `<civ-activity-timeline>`. Renders the rail dot + connecting segment on the leading edge, then a stack of timestamp / actor / action / optional comment body on the trailing edge. The timestamp is always wrapped in a machine-readable `<time datetime>` element regardless of visual format.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    timestamp: {
      type: 'string',
      description: 'ISO 8601 timestamp string. Required for the `<time datetime>` wrapper to be valid.',
      default: '',
    },
    timestampFormat: {
      type: 'enum',
      description: 'Visual timestamp format. `relative` shows "3 hours ago"; `absolute` shows the locale-formatted date/time; `both` shows the absolute label with the relative phrase in parentheses (default).',
      default: 'both',
      values: ['relative', 'absolute', 'both'],
      attribute: 'timestamp-format',
    },
    actor: {
      type: 'string',
      description: 'Person or system that took the action (e.g. "J. Martinez (Reviewer)", "System").',
      default: '',
    },
    action: {
      type: 'string',
      description: 'Short action label (e.g. "Application submitted", "Approved", "Documentation requested").',
      default: '',
    },
    intent: {
      type: 'enum',
      description: 'Semantic color for the rail dot. Drives the dot background and the default icon inside it.',
      default: 'neutral',
      values: ['success', 'info', 'warning', 'error', 'neutral'],
      reflect: true,
    },
    icon: {
      type: 'string',
      description: 'Override icon name. Empty string suppresses the default intent icon and shows a plain colored dot. Defaults to the intent\'s semantic icon (success → check, info → info, warning → warning, error → error, neutral → no icon).',
      default: '',
    },
  },

  events: {},

  a11y: {
    role: 'listitem',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'timestamp', bindings: { text: 'timestamp' } },
        { type: 'label', condition: 'actor', bindings: { text: 'actor' } },
        { type: 'label', bindings: { text: 'action' } },
        { type: 'slot', bindings: { name: 'default' } },
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
