import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-skip-link',
  description: 'Keyboard-accessible "skip to main content" link. Visually hidden until focused; first focusable element on the page. Renders an internal anchor (default `#main-content`) so keyboard / screen-reader users can bypass header / nav landmarks. Required for WCAG 2.1 AA.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Skip-link text (e.g. "Skip to main content"). Preferred over child text content',
      default: '',
    },
    href: {
      type: 'string',
      description: 'Internal anchor target. Defaults to `#main-content`. Web-only. Native platforms have no anchor concept; iOS uses a `targetId` + `onActivate` callback; Android uses `onActivate` to focus the next view',
      default: '#main-content',
      webOnly: true,
    },
  },

  events: {},

  a11y: {
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
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },
};

export default schema;
