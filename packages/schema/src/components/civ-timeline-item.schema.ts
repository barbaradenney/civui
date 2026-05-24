import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-timeline-item',
  description: 'A single entry inside `<civ-timeline>`. Renders the rail dot + connecting segment on the leading edge, then a stack of timestamp / actor / action / optional comment body on the trailing edge. The timestamp is wrapped in a machine-readable `<time datetime>` element when parseable, regardless of visual format.',
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
      description: 'Person, system, department, version, or other label associated with the entry (e.g. "J. Martinez (Reviewer)", "System", "v2.4.1"). Optional.',
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
      description: 'Override icon name. When unset, the intent\'s semantic icon is used (success → check, info → info, warning → warning, error → error, neutral → no icon). Empty string explicitly suppresses the icon and shows a plain colored dot.',
      // No `default` field: the absence of a value means "use the
      // intent's default icon"; supplying `''` is the explicit
      // suppress sentinel, supplying a name overrides.
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
