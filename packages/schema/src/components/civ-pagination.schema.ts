import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-pagination',
  description: 'USWDS-style pagination control. Renders a status range (Showing X–Y of Z), a page-size selector, Previous/Next buttons, and a truncated list of page-number buttons. The component is controlled — listen for `civ-page-change` to drive the consumer\'s data fetch. On viewports ≤480px, page-number buttons collapse to leave only Prev/Next + page-size visible.',
  category: 'navigation',
  extends: 'CivBaseElement',
  isGroup: false,

  props: {
    totalItems: {
      type: 'number',
      description: 'Total item count across all pages. Drives the totalPages computation. When 0, the component renders an empty-state message',
      default: 0,
      attribute: 'total-items',
    },
    pageSize: {
      type: 'number',
      description: 'Items per page. Determines how the totalItems split into pages and the status range',
      default: 25,
      attribute: 'page-size',
    },
    page: {
      type: 'number',
      description: '1-based current page. Clamped to `[1, totalPages]`. The consumer is expected to update this prop in response to `civ-page-change`',
      default: 1,
    },
    pageSizeOptions: {
      type: 'string',
      description: 'Comma-separated list of page-size choices offered in the selector. Invalid or non-positive values are dropped',
      default: '10,25,50,100',
      attribute: 'page-size-options',
    },
    siblingCount: {
      type: 'number',
      description: 'Page-number buttons rendered on each side of the current page before truncation kicks in. Higher values show more pages at once',
      default: 1,
      attribute: 'sibling-count',
    },
    label: {
      type: 'string',
      description: 'Accessible name for the `<nav>` landmark. Falls back to the i18n "Pagination" string when omitted',
      default: '',
    },
    itemName: {
      type: 'string',
      description: 'Singular noun used in status text (e.g. "row", "application"). Surface-level — meaningful labels improve clarity for assistive tech',
      default: 'item',
      attribute: 'item-name',
    },
  },

  events: {
    'civ-page-change': {
      description: 'Fires when the user navigates to a different page — via Previous, Next, a numbered button, or by picking a different page size (in which case `page` resets to 1). The consumer should update its `page` and `pageSize` props in response',
      detail: {
        page: { type: 'number', description: 'The new 1-based page' },
        pageSize: { type: 'number', description: 'The page size in effect at the time of the change' },
        offset: { type: 'number', description: 'Zero-based offset of the first item on the new page — useful for server-side slicing' },
      },
    },
  },

  a11y: {
    role: 'navigation',
    requiredIndicator: 'none',
    errorAnnouncement: 'polite',
  },

  renderOrder: [
    {
      type: 'container',
      bindings: { tag: 'nav' },
      children: [
        { type: 'label' },
        { type: 'select' },
        { type: 'button' },
        { type: 'container' },
        { type: 'button' },
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
