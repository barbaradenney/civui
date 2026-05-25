import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-alert',
  description: 'Status / informational banner with semantic variants (info / success / warning / error / neutral). Includes optional dismiss, heading, slim layout, and primary or secondary visual treatments. Native platforms expose the same variants with platform-idiomatic icons.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    intent: {
      type: 'enum',
      description: 'Semantic tone. Drives icon and color palette',
      default: 'info',
      values: ['info', 'success', 'warning', 'error'],
    },
    emphasis: {
      type: 'enum',
      description: 'Visual treatment. `primary` = filled with stronger emphasis; `secondary` = subtle background (default); `tertiary` = transparent with a colored leading border',
      default: 'secondary',
      values: ['primary', 'secondary', 'tertiary'],
      attribute: 'emphasis',
    },
    heading: {
      type: 'string',
      description: 'Optional heading rendered above the body content',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2–6) for the alert heading. Web-only. Native platforms use platform-idiomatic header semantics',
      default: 4,
      attribute: 'heading-level',
      webOnly: true,
    },
    dismissible: {
      type: 'boolean',
      description: 'Render a dismiss (×) button. Fires `civ-dismiss` (cancelable) when clicked',
      default: false,
    },
    slim: {
      type: 'boolean',
      description: '**Deprecated** — use `spacing="sm"` instead. Compact single-line layout (no heading, smaller padding). Both attributes currently produce the same `.civ-alert--sm` chrome but `slim` fires a one-time dev-mode console warning so consumers can migrate. The boolean will be removed in a future release.',
      default: false,
    },
    spacing: {
      type: 'enum',
      description: 'Vertical padding. `default` for standalone alerts; `sm` for nested/dense contexts',
      default: 'default',
      values: ['default', 'sm'],
    },
    collapsible: {
      type: 'boolean',
      description: 'Wrap heading + body in a native `<details>`/`<summary>` so the body collapses behind a clickable chevron. Requires `heading` — the heading is the toggle. Combines with `dismissible` (close button + chevron both fit in the heading row). Without `heading` the prop is a dev-mode no-op.',
      default: false,
      reflect: true,
    },
    open: {
      type: 'boolean',
      description: 'When `collapsible`, controls and reflects the expanded state. Set initially to start open; the component flips it on each user toggle and fires `civ-toggle`.',
      default: false,
      reflect: true,
    },
    fullWidth: {
      type: 'boolean',
      description: 'Render as a persistent site-wide banner. ARIA role auto-switches from `alert`/`status` (live region) to `region` (landmark) and `aria-label` is auto-derived from `heading`. Inner content centers to `--civ-site-max-width` (default 80rem) so the banner spans the viewport edge-to-edge. Place as the first child of `<body>` or your outermost site wrapper.',
      default: false,
      reflect: true,
      attribute: 'full-width',
    },
  },

  events: {
    'civ-dismiss': {
      description: 'Fires (cancelable) when the user clicks the dismiss button. Call `preventDefault()` to keep the alert visible (e.g. while async cleanup runs)',
      detail: {},
    },
    'civ-toggle': {
      description: 'Fires when a `collapsible` alert is expanded or collapsed by the user',
      detail: {
        open: { type: 'boolean', description: 'New expanded state' },
      },
    },
  },

  a11y: {
    role: 'status',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'slot', bindings: { name: 'default' } },
        { type: 'button', condition: 'dismissible', bindings: { action: 'dismiss' } },
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
