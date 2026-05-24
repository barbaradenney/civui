import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-filterable-list',
  description: 'Container that adds client-side text filtering and matching-count announcements over an arbitrary list of items. Items expose their searchable text via a configurable data attribute. Result counts are announced to screen readers on a debounce.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    label: {
      type: 'string',
      description: 'Accessible label for the filterable region (rendered on the wrapper for assistive tech)',
      default: '',
    },
    noResultsMessage: {
      type: 'string',
      description: 'Message shown when zero items match the active filters / query',
      default: '',
      attribute: 'no-results-message',
    },
    announceDelay: {
      type: 'number',
      description: 'Debounce in ms before the matching-count is announced to screen readers. Tuned so rapid keystrokes don\'t spam the live region',
      default: 300,
      attribute: 'announce-delay',
    },
    resultCountHidden: {
      type: 'boolean',
      description: 'When true, suppresses the visible result count. The screen-reader announcement still fires',
      default: false,
      attribute: 'result-count-hidden',
    },
    filterAttribute: {
      type: 'string',
      description: 'HTML attribute on each item that holds the searchable text (default: `data-filter`). Items without this attribute are filtered out of search but still counted',
      default: 'data-filter',
      attribute: 'filter-attribute',
    },
  },

  events: {
    'civ-filter': {
      description: 'Fires after each filter pass with the matching counts',
      detail: {
        query: { type: 'string', description: 'Current search query' },
        matchCount: { type: 'number', description: 'Number of items currently visible' },
        totalCount: { type: 'number', description: 'Total number of items in the list (visible + filtered out)' },
      },
    },
  },

  a11y: {
    role: 'region',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
    ariaAttributes: {
      'aria-label': 'label',
    },
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'div', role: 'region' },
      children: [
        { type: 'slot', bindings: { name: 'filters' } },
        { type: 'slot', bindings: { name: 'default' } },
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
