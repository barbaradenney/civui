import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-conditional',
  description: 'Declarative show/hide wrapper that reveals its slotted content based on the value of another field. Web listens for `civ-input`/`civ-change` events on the nearest form ancestor; native platforms expect the parent to manage visibility state directly.',
  category: 'form-container',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    when: {
      type: 'string',
      description: 'Name of the field to watch (matches the `name` attribute of a sibling form control)',
      default: '',
    },
    equals: {
      type: 'string',
      description: 'Show content when the watched field exactly equals this value. For booleans, use `equals="true"` / `equals="false"`',
      default: '',
    },
    notEquals: {
      type: 'string',
      description: 'Show content when the watched field does NOT equal this value',
      default: '',
      attribute: 'not-equals',
    },
    includes: {
      type: 'string',
      description: 'Comma-separated list of values. For multi-value fields (checkbox-group), shows when the field includes any of these values',
      default: '',
    },
    hasValue: {
      type: 'boolean',
      description: 'Show content when the watched field has any non-empty value',
      default: false,
      attribute: 'has-value',
    },
    pattern: {
      type: 'string',
      description: 'Regex pattern. Show content when the watched field value matches the pattern',
      default: '',
      attribute: 'matches',
    },
  },

  events: {},

  a11y: {
    role: 'region',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-hidden': 'computed-from-visibility',
    },
  },

  renderOrder: [
    {
      type: 'container',
      children: [{ type: 'slot', bindings: { name: 'default' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
