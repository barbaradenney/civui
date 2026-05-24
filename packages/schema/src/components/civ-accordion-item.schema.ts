import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-accordion-item',
  description: 'One full-width expandable row inside `<civ-accordion>`. Composes the same visual language as `<civ-disclosure>` — chevron caret beside the label, 90° rotation on open — but renders as a full-row trigger with a larger tap target. `headingLevel` (1–6) optionally wraps the label in an `<h1>`–`<h6>` for screen-reader rotor navigation; visual treatment stays constant across all levels.',
  category: 'ui',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Header text rendered on the full-width trigger row',
      default: '',
    },
    open: {
      type: 'boolean',
      description: 'Whether the panel is currently expanded',
      default: false,
      reflect: true,
    },
    disabled: {
      type: 'boolean',
      description: 'Disables interaction; the row is dimmed and not toggleable',
      default: false,
      reflect: true,
    },
    headingLevel: {
      type: 'number',
      description: 'Wrap the label in an `<h1>`–`<h6>` for screen-reader rotor navigation. Accepts integers 1–6; values outside that range fall back to a plain `<span>` and trigger a dev-mode warning. Visual treatment stays constant across all levels — the heading element only affects assistive-tech navigation. Web-only; native platforms expose disclosure semantics through their own header conventions.',
      attribute: 'heading-level',
      webOnly: true,
    },
  },

  events: {
    'civ-toggle': {
      description: 'Fires when the open/closed state changes. Non-bubbling and non-composed (mirrors `civ-disclosure`) so accordion items inside a `<civ-form>` do not leak into form-level listeners.',
      detail: {
        open: { type: 'boolean', description: 'Whether the panel is now open' },
      },
    },
    'civ-analytics': {
      description: 'Analytics tracking event on toggle',
      detail: {
        componentName: { type: 'string', description: 'Tag name of the dispatcher' },
        action: { type: 'string', description: 'The user action (`change`)' },
        details: { type: 'object', description: '{ open: boolean }. The resulting state' },
      },
    },
  },

  a11y: {
    // Native composition: the outer `<details>` exposes `role="group"`
    // and the inner `<summary>` exposes `role="button"` with the
    // current expanded state. Native (iOS / Android) implementations
    // must combine both — a container with disclosure semantics AND a
    // button-role activator — to match the web reference.
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'details' },
      children: [
        {
          type: 'container',
          bindings: { tag: 'summary' },
          children: [
            { type: 'label', bindings: { text: 'label' } },
          ],
        },
        { type: 'slot' },
      ],
    },
  ],

  form: {
    valueMode: 'none',
    formAssociated: false,
    resetBehavior: 'none',
  },

  platform: {
    web: {
      controlClasses: ['civ-accordion-item'],
    },
    ios: {
      // SwiftUI DisclosureGroup
    },
    android: {
      // Compose ExpandableCard / animated visibility
    },
  },
};

export default schema;
