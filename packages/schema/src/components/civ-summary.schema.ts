import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-summary',
  description: 'Read-only review/summary page. Renders form data as structured sections with label/value pairs and per-section edit links. Use at the end of a multi-step form (review page) or mid-form (hub pages with status indicators).',
  category: 'feedback',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    heading: {
      type: 'string',
      description: 'Main heading rendered above the sections',
      default: '',
    },
    headingLevel: {
      type: 'number',
      description: 'Semantic heading level (2–6) for the main heading on web — section headings auto-render one level below. Web-only: native platforms expose headings via `accessibilityAddTraits(.isHeader)` (iOS) or semantic headings (Android) without numeric levels',
      default: 2,
      attribute: 'heading-level',
      webOnly: true,
    },
    sections: {
      type: 'array',
      description: 'Section definitions: `{ heading, editHref?, items: [{ label, value }] }`. Each platform passes a typed/native array (Lit: `SummarySection[]`; iOS: `[SummarySectionData]`; Android: `List<CivSummarySection>`). JS property only on web (no HTML attribute reflection)',
      webOnly: true,
    },
  },

  events: {
    'civ-edit': {
      description: 'Fires (cancelable) when the user clicks any edit link. Call `preventDefault()` to suppress the default `<a>` navigation — useful for SPA routers. Detail includes the matched section, optional item, and the link href',
      detail: {
        section: { type: 'object', description: 'The full SummarySection that was clicked' },
        item: { type: 'object', description: 'The clicked SummaryItem when the click was on an item-level edit link (omitted for section-level edit links)' },
        href: { type: 'string', description: 'The href attribute of the clicked link' },
      },
    },
  },

  a11y: {
    role: 'region',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'section' },
      children: [
        { type: 'label', condition: 'heading', bindings: { text: 'heading', headingLevel: 'headingLevel' } },
        { type: 'container', bindings: { repeat: 'sections' } },
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
