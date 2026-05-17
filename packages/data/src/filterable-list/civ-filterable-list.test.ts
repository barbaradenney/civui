import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-filterable-list.js';
import '@civui/layout/list';

afterEach(cleanupFixtures);

function createList(html: string) {
  return fixture(html) as Promise<HTMLElement>;
}

const GLOSSARY_HTML = `
  <civ-filterable-list label="Test glossary">
    <div data-filterable-list-filters>
      <input type="text" data-filterable-list-search />
    </div>
    <civ-list>
      <civ-list-item data-filter="Accessibility" data-filter-letter="A" heading="Accessibility"></civ-list-item>
      <civ-list-item data-filter="Benefits" data-filter-letter="B" heading="Benefits"></civ-list-item>
      <civ-list-item data-filter="Claims" data-filter-letter="C" heading="Claims"></civ-list-item>
      <civ-list-item data-filter="Disability" data-filter-letter="D" heading="Disability"></civ-list-item>
    </civ-list>
  </civ-filterable-list>
`;

describe('civ-filterable-list', () => {
  it('renders with Light DOM', async () => {
    const el = await createList(GLOSSARY_HTML);
    expect(el.shadowRoot).toBeNull();
  });

  it('counts total items on init', async () => {
    const el = await createList(GLOSSARY_HTML) as any;
    await elementUpdated(el);
    expect(el.totalCount).toBe(4);
    expect(el.matchCount).toBe(4);
  });

  it('has accessible region role and label', async () => {
    const el = await createList(GLOSSARY_HTML);
    await elementUpdated(el);
    const region = el.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region!.getAttribute('aria-label')).toBe('Test glossary');
  });

  it('has a status region with aria-live', async () => {
    const el = await createList(GLOSSARY_HTML);
    await elementUpdated(el);
    const status = el.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(status!.getAttribute('aria-live')).toBe('polite');
  });

  describe('text search via JS API', () => {
    it('filters items by search term', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.search('access');
      await elementUpdated(el);

      expect(el.matchCount).toBe(1);
      const items = el.querySelectorAll('civ-list-item');
      expect(items[0].hasAttribute('hidden')).toBe(false);
      expect(items[1].hasAttribute('hidden')).toBe(true);
      expect(items[2].hasAttribute('hidden')).toBe(true);
      expect(items[3].hasAttribute('hidden')).toBe(true);
    });

    it('is case insensitive', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.search('BENEFITS');
      await elementUpdated(el);

      expect(el.matchCount).toBe(1);
    });

    it('clears search when empty string', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.search('access');
      await elementUpdated(el);
      expect(el.matchCount).toBe(1);

      el.search('');
      await elementUpdated(el);
      expect(el.matchCount).toBe(4);
    });
  });

  describe('named filters via JS API', () => {
    it('filters by named attribute', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.setFilter('letter', 'A');
      await elementUpdated(el);

      expect(el.matchCount).toBe(1);
      const items = el.querySelectorAll('civ-list-item');
      expect(items[0].hasAttribute('hidden')).toBe(false); // Accessibility
      expect(items[1].hasAttribute('hidden')).toBe(true);
    });

    it('supports array values for multi-select', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.setFilter('letter', ['A', 'C']);
      await elementUpdated(el);

      expect(el.matchCount).toBe(2);
    });

    it('clears a named filter', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.setFilter('letter', 'A');
      await elementUpdated(el);
      expect(el.matchCount).toBe(1);

      el.clearFilter('letter');
      await elementUpdated(el);
      expect(el.matchCount).toBe(4);
    });
  });

  describe('AND composition', () => {
    it('composes search and named filter with AND', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.setFilter('letter', 'A');
      el.search('xyz-no-match');
      await elementUpdated(el);

      expect(el.matchCount).toBe(0);
    });
  });

  describe('clearAllFilters', () => {
    it('resets everything', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.setFilter('letter', 'A');
      el.search('access');
      await elementUpdated(el);
      expect(el.matchCount).toBe(1);

      el.clearAllFilters();
      await elementUpdated(el);
      expect(el.matchCount).toBe(4);
    });
  });

  describe('no results', () => {
    it('shows no results message when zero matches', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.search('zzzzz');
      await elementUpdated(el);

      expect(el.matchCount).toBe(0);
      const noResults = el.querySelector('.civ-filterable-list__no-results');
      expect(noResults).not.toBeNull();
      expect(noResults!.textContent).toContain('No results found');
    });

    it('sets data-civ-no-results on host', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.search('zzzzz');
      await elementUpdated(el);
      expect(el.hasAttribute('data-civ-no-results')).toBe(true);

      el.search('');
      await elementUpdated(el);
      expect(el.hasAttribute('data-civ-no-results')).toBe(false);
    });

    it('uses custom no-results message', async () => {
      const el = await createList(`
        <civ-filterable-list no-results-message="Nothing here">
          <civ-list>
            <civ-list-item data-filter="Test" heading="Test"></civ-list-item>
          </civ-list>
        </civ-filterable-list>
      `) as any;
      await elementUpdated(el);

      el.search('zzz');
      await elementUpdated(el);

      const noResults = el.querySelector('.civ-filterable-list__no-results');
      expect(noResults!.textContent).toContain('Nothing here');
    });
  });

  describe('civ-filter event', () => {
    it('dispatches civ-filter after filtering', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-filter', handler);

      el.search('access');
      await elementUpdated(el);

      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.matchCount).toBe(1);
      expect(detail.totalCount).toBe(4);
      expect(detail.query).toBe('access');
    });
  });

  describe('result count display', () => {
    it('shows count when filters active', async () => {
      const el = await createList(GLOSSARY_HTML) as any;
      await elementUpdated(el);

      el.search('a');
      await elementUpdated(el);

      const count = el.querySelector('.civ-filterable-list__count');
      expect(count).not.toBeNull();
    });

    it('hides count when resultCountHidden', async () => {
      const el = await createList(`
        <civ-filterable-list result-count-hidden>
          <civ-list>
            <civ-list-item data-filter="Test" heading="Test"></civ-list-item>
          </civ-list>
        </civ-filterable-list>
      `) as any;
      await elementUpdated(el);

      el.search('test');
      await elementUpdated(el);

      const count = el.querySelector('.civ-filterable-list__count');
      expect(count).toBeNull();
    });
  });
});
