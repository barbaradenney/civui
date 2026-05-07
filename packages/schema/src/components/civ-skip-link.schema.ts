import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-skip-link',
  description: 'Keyboard-accessible "skip to main content" link. Visually hidden until focused; first focusable element on the page. Renders an internal anchor (default `#main-content`) so keyboard / screen-reader users can bypass header / nav landmarks. Required for WCAG 2.1 AA.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    href: {
      type: 'string',
      description: 'Internal anchor target. Defaults to `#main-content`. Web-only — native platforms have no anchor concept; iOS uses a `targetId` + `onActivate` callback; Android uses `onActivate` to focus the next view',
      default: '#main-content',
      webOnly: true,
    },
  },

  events: {},

  a11y: {
    role: 'link',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'a' },
      children: [{ type: 'label', bindings: { text: 'label' } }],
    },
  ],

  form: {
    valueMode: 'string',
    formAssociated: false,
    resetBehavior: 'restore-default-value',
  },
};

export default schema;
