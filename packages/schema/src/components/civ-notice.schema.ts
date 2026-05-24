import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-notice',
  description: 'Icon-prefixed emphasis text for highlighting a specific passage inside longer content — legal, safety, or financial consequences a reader could miss in flowing prose. Based on GOV.UK\'s "warning text" pattern, extended with semantic intents (info / warning / error / success / neutral) so the same affordance handles emphasis across the system. Distinct from `civ-alert` (notification with dismiss + ARIA live region) and `civ-callout` (panel with background + larger padding). Notice is the lightweight inline variant: no background, no dismiss, no heading slot — just a large semantic icon and bold paragraphs.',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    intent: {
      type: 'enum',
      description: 'Severity / color treatment. Drives the default icon and the icon\'s color. `info` is the default; `neutral` is a gray variant for emphasis without status meaning.',
      values: ['info', 'warning', 'error', 'success', 'neutral'],
      default: 'info',
      reflect: true,
    },
    spacing: {
      type: 'enum',
      description: '`default` renders the GOV.UK-presence version (large icon + bold lg text); `sm` is the inline-compact variant for body-prose placements where the affordance shouldn\'t dominate the surrounding reading flow.',
      values: ['default', 'sm'],
      default: 'default',
      reflect: true,
    },
    noticeStyle: {
      type: 'enum',
      description: 'Visual weight. `primary` (default) uses the heavier filled-icon variants (`info-fill` / `warning-fill` / `error-fill` / `check-circle-fill`) for full emphasis — the established notice treatment. `secondary` uses the lighter outlined glyphs (`info` / `warning` / `error` / `check-circle`) for a more passive callout when the placement competes with surrounding chrome. When `icon` is overridden the consumer\'s glyph is used regardless; `noticeStyle` only picks the *default* glyph for the intent.',
      values: ['primary', 'secondary'],
      default: 'primary',
      attribute: 'notice-style',
      reflect: true,
    },
    icon: {
      type: 'string',
      description: 'Override the default icon for this intent. Any icon name from the CivUI icon library works — use it when the notice is communicating something beyond the five built-in semantic intents (e.g. `calendar`, `mail`, `document`, `lock`, `phone`). When unset, the default is picked from `noticeStyle`: primary gives `info-fill` / `warning-fill` / `error-fill` / `check-circle-fill` / `info-fill`; secondary gives `info` / `warning` / `error` / `check-circle` / `info`.',
      default: '',
    },
    header: {
      type: 'string',
      description: 'Optional bold heading rendered above the body. Rendered as `<p role="heading" aria-level="N">` so the heading is announced to screen readers without forcing a specific `<h*>` level into the page outline.',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Heading level (2–6) applied to the `header` when set. Default is 3.',
      default: 3,
      attribute: 'heading-level',
      webOnly: true,
    },
    body: {
      type: 'string',
      description: 'Body text rendered below the header. For rich body content with inline links, use `civ-callout` instead — `civ-notice` owns its HTML so the surface stays consistent.',
      default: '',
    },
    srPrefix: {
      type: 'string',
      description: 'Optional visually-hidden screen-reader prefix (e.g. `Warning:`). Empty by default — teams opt in per placement when the severity needs to be announced verbally before the header text.',
      default: '',
      attribute: 'sr-prefix',
    },
  },

  events: {},

  a11y: {
    role: 'group',
    requiredIndicator: 'none',
    errorAnnouncement: 'none',
    describedBy: [],
  },

  renderOrder: [
    {
      type: 'container',
      children: [
        { type: 'label', bindings: { icon: 'icon' } },
        { type: 'label', condition: 'srPrefix', bindings: { text: 'srPrefix' } },
        { type: 'label', condition: 'header', bindings: { text: 'header' } },
        { type: 'label', condition: 'body', bindings: { text: 'body' } },
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
      controlClasses: ['civ-notice'],
    },
    ios: {
      // SwiftUI: HStack with Image(systemName:) + VStack { Text(header).bold(); Text(body) }
    },
    android: {
      // Compose: Row { Icon(); Column { Text(header, FontWeight.Bold); Text(body) } }
    },
  },
};

export default schema;
