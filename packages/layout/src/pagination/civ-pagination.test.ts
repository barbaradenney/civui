import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-pagination.js';

afterEach(cleanupFixtures);

describe('civ-pagination', () => {
  it('renders empty state when totalItems is 0', async () => {
    const el = await fixture('<civ-pagination total-items="0" page-size="10"></civ-pagination>');
    expect(el.querySelector('.civ-pagination__empty')).not.toBeNull();
    expect(el.querySelector('.civ-pagination__list')).toBeNull();
  });

  it('computes totalPages correctly', async () => {
    const el = await fixture('<civ-pagination total-items="847" page-size="25"></civ-pagination>') as any;
    expect(el.totalPages).toBe(34); // ceil(847 / 25)
  });

  it('clamps currentPage when page exceeds totalPages', async () => {
    const el = await fixture('<civ-pagination total-items="50" page-size="25" page="99"></civ-pagination>') as any;
    expect(el.currentPage).toBe(2);
  });

  it('clamps currentPage to at least 1', async () => {
    const el = await fixture('<civ-pagination total-items="50" page-size="25" page="0"></civ-pagination>') as any;
    expect(el.currentPage).toBe(1);
  });

  it('computes currentRange', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="3"></civ-pagination>') as any;
    expect(el.currentRange).toEqual({ start: 51, end: 75 });
  });

  it('caps end of range at totalItems on last page', async () => {
    const el = await fixture('<civ-pagination total-items="847" page-size="25" page="34"></civ-pagination>') as any;
    expect(el.currentRange).toEqual({ start: 826, end: 847 });
  });

  it('renders status text with start, end, and total', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="2"></civ-pagination>');
    const status = el.querySelector('.civ-pagination__status') as HTMLElement;
    expect(status.textContent).toContain('26');
    expect(status.textContent).toContain('50');
    expect(status.textContent).toContain('100');
  });

  it('disables Previous on the first page', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="1"></civ-pagination>');
    const prev = el.querySelector('.civ-pagination__prev') as HTMLElement;
    expect(prev.hasAttribute('disabled')).toBe(true);
  });

  it('disables Next on the last page', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="4"></civ-pagination>');
    const next = el.querySelector('.civ-pagination__next') as HTMLElement;
    expect(next.hasAttribute('disabled')).toBe(true);
  });

  it('fires civ-page-change when Next is clicked', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="1"></civ-pagination>');
    const handler = vi.fn();
    el.addEventListener('civ-page-change', handler);

    // Click the inner native button so the click reaches the host's handler the same way a real user click does.
    const next = el.querySelector('.civ-pagination__next button') as HTMLButtonElement;
    next.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ page: 2, pageSize: 25, offset: 25 });
  });

  it('fires civ-page-change when Previous is clicked', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="3"></civ-pagination>');
    const handler = vi.fn();
    el.addEventListener('civ-page-change', handler);

    const prev = el.querySelector('.civ-pagination__prev button') as HTMLButtonElement;
    prev.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ page: 2, pageSize: 25, offset: 25 });
  });

  it('fires civ-page-change when a numbered page is clicked', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="1"></civ-pagination>');
    const handler = vi.fn();
    el.addEventListener('civ-page-change', handler);

    const pageBtns = Array.from(el.querySelectorAll<HTMLButtonElement>('.civ-pagination__page'));
    // First button is "1" (current), so click the second button.
    pageBtns[1].click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.page).toBeGreaterThan(1);
  });

  it('does not fire when clicking the current page', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="2"></civ-pagination>');
    const handler = vi.fn();
    el.addEventListener('civ-page-change', handler);

    const current = el.querySelector('.civ-pagination__page[aria-current="page"]') as HTMLButtonElement;
    current.click();

    expect(handler).not.toHaveBeenCalled();
  });

  it('marks the current page with aria-current="page"', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="2"></civ-pagination>');
    const current = el.querySelector('[aria-current="page"]') as HTMLButtonElement;
    expect(current).not.toBeNull();
    expect(current.textContent?.trim()).toBe('2');
  });

  it('shows truncation gap for far-apart pages', async () => {
    const el = await fixture('<civ-pagination total-items="1000" page-size="25" page="20"></civ-pagination>');
    const gaps = el.querySelectorAll('.civ-pagination__gap');
    expect(gaps.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all pages when total is small', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25"></civ-pagination>');
    const pageBtns = el.querySelectorAll('.civ-pagination__page');
    expect(pageBtns.length).toBe(4); // 100/25 = 4 pages
  });

  it('fires civ-page-change resetting to page 1 when page-size changes', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page="3"></civ-pagination>');
    const pageHandler = vi.fn();
    el.addEventListener('civ-page-change', pageHandler);

    const select = el.querySelector('.civ-pagination__page-size-select') as HTMLSelectElement;
    select.value = '50';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(pageHandler).toHaveBeenCalledOnce();
    expect(pageHandler.mock.calls[0][0].detail).toEqual({ page: 1, pageSize: 50, offset: 0 });
  });

  it('renders the page-size select with the configured options', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" page-size-options="5,10,25,50"></civ-pagination>');
    const options = el.querySelectorAll('.civ-pagination__page-size-select option');
    expect(options.length).toBe(4);
    expect(Array.from(options).map((o) => (o as HTMLOptionElement).value)).toEqual(['5', '10', '25', '50']);
  });

  it('exposes role="navigation" via <nav> with an aria-label', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25" label="Results pages"></civ-pagination>');
    const nav = el.querySelector('nav.civ-pagination') as HTMLElement;
    expect(nav.tagName).toBe('NAV');
    expect(nav.getAttribute('aria-label')).toBe('Results pages');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-pagination total-items="100" page-size="25"></civ-pagination>');
    expect(el.shadowRoot).toBeNull();
  });
});
