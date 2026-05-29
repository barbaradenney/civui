import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-link-card',
  description: 'Interactive card-shaped link. Entire card surface is clickable. Renders a heading, description, optional eyebrow text, and leading / trailing icons. Use for navigation hubs (gov.uk task list pattern, dashboard tiles).',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    disabled: {
      type: 'boolean',
      description: 'Renders the card disabled — non-interactive and dimmed',
      default: false,
      reflect: true,
    },
    href: {
      type: 'string',
      description: 'Card destination',
      default: '',
    },
    heading: {
      type: 'string',
      description: 'Card heading (primary text)',
      default: '',
    },
    description: {
      type: 'string',
      description: 'Body text rendered below the heading',
      default: '',
    },
    variant: {
      type: 'enum',
      description: 'Visual treatment. `primary` (default) = solid fill; `secondary` = light fill; `tertiary` = bordered with no fill; `critical` / `danger` = emphasized error treatments',
      default: 'primary',
      values: ['primary', 'secondary', 'tertiary', 'critical', 'danger'],
    },
    color: {
      type: 'enum',
      description: 'Color palette. Empty (default) inherits from the variant; the other values are aesthetic colors (not semantic status). Same palette as civ-tag and civ-card so categorization carries across components',
      default: '',
      values: ['', 'blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'],
    },
    spacing: {
      type: 'enum',
      description: 'Inner padding density',
      default: 'default',
      values: ['default', 'sm'],
    },
    iconStart: {
      type: 'string',
      description: 'Leading icon name',
      default: '',
      attribute: 'icon-start',
    },
    iconEnd: {
      type: 'string',
      description: 'Trailing icon name (defaults to chevron / arrow on most variants)',
      default: '',
      attribute: 'icon-end',
    },
    eyebrow: {
      type: 'string',
      description: 'Small text rendered above the heading (e.g. category label, status)',
      default: '',
    },
  },

  events: {
    'civ-analytics': {
      description: 'Analytics tracking event fired on interaction',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action that triggered the event' },
      },
    },
  },

  a11y: {
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'a' },
      children: [
        { type: 'label', condition: 'iconStart', bindings: { text: 'iconStart' } },
        { type: 'label', condition: 'eyebrow', bindings: { text: 'eyebrow' } },
        { type: 'label', condition: 'heading', bindings: { text: 'heading' } },
        { type: 'label', condition: 'description', bindings: { text: 'description' } },
        { type: 'label', condition: 'iconEnd', bindings: { text: 'iconEnd' } },
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
