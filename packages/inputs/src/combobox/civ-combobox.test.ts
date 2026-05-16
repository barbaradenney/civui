import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-combobox.js';
import '@civui/core';

const STATES = [
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

afterEach(cleanupFixtures);

describe('civ-combobox', () => {
  it('renders a text input with combobox role', async () => {
    const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>');

    const input = el.querySelector('input[role="combobox"]');
    expect(input).not.toBeNull();
  });

  it('sets aria-autocomplete="list"', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('starts with aria-expanded="false"', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens listbox on focus', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    await elementUpdated(el);

    expect(input.getAttribute('aria-expanded')).toBe('true');
    const listbox = el.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
  });

  it('renders options in listbox', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await elementUpdated(el);

    const options = el.querySelectorAll('[role="option"]');
    expect(options.length).toBe(5);
    expect(options[0].textContent).toContain('California');
  });

  it('filters options on input', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'Co';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    const options = el.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2); // Colorado, Connecticut
  });

  it('shows "No results found" when no matches', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ZZZ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    const noResults = el.querySelector('[role="status"]');
    expect(noResults).not.toBeNull();
    expect(noResults!.textContent).toContain('No results found');
  });

  it('selects option on click', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await elementUpdated(el);

    let eventDetail: any = null;
    el.addEventListener('civ-change', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const firstOption = el.querySelector('[role="option"]') as HTMLElement;
    firstOption.click();
    await elementUpdated(el);

    expect(eventDetail).toEqual({ value: 'CA' });
    expect(el.value).toBe('CA');
  });

  it('closes on Escape', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await elementUpdated(el);

    expect(el._open).toBe(false);
  });

  it('navigates with arrow keys', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);
    expect(el._activeIndex).toBe(0);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);
    expect(el._activeIndex).toBe(1);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await elementUpdated(el);
    expect(el._activeIndex).toBe(0);
  });

  it('selects on Enter', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    el._activeIndex = 1;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('CO');
    expect(el._open).toBe(false);
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-combobox label="State" error="Bad"></civ-combobox>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders disabled state', async () => {
    const el = await fixture('<civ-combobox label="State" disabled></civ-combobox>');

    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');

    expect(el.shadowRoot).toBeNull();
  });

  it('has static formAssociated = true', () => {
    const Ctor = customElements.get('civ-combobox') as any;
    expect(Ctor.formAssociated).toBe(true);
  });

  it('sets native required on the inner combobox input', async () => {
    const el = await fixture('<civ-combobox label="State" required></civ-combobox>');

    const input = el.querySelector('input')!;
    expect(input.required).toBe(true);
    expect(input.hasAttribute('required')).toBe(true);
  });

  it('opens dropdown on ArrowUp when closed', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    expect(el._open).toBe(false);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await elementUpdated(el);

    expect(el._open).toBe(true);
  });

  it('uses aria-labelledby on listbox instead of aria-label', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    await elementUpdated(el);

    const listbox = el.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox!.hasAttribute('aria-label')).toBe(false);

    const labelledBy = listbox!.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
  });

  it('sets data-active on the active option', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    el._activeIndex = 1;
    await elementUpdated(el);

    const options = el.querySelectorAll('[role="option"]');
    expect(options[1].hasAttribute('data-active')).toBe(true);
    expect(options[0].hasAttribute('data-active')).toBe(false);
  });

  it('sets aria-live="polite" on no-results status', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'ZZZ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    const noResults = el.querySelector('[role="status"]');
    expect(noResults!.getAttribute('aria-live')).toBe('polite');
  });

  it('renders a real <input> so the global focus ring applies', async () => {
    const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>') as any;
    el.options = [{ value: 'CA', label: 'California' }];
    await elementUpdated(el);

    const input = el.querySelector('input')!;
    expect(input.tagName).toBe('INPUT');
    expect(input.className).toContain('civ-input');
  });

  it('does not use deprecated focus: outline classes', async () => {
    const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>') as any;
    el.options = [{ value: 'CA', label: 'California' }];
    await elementUpdated(el);

    const input = el.querySelector('input');
    expect(input!.className).not.toContain('focus:civ-outline-2');
    expect(input!.className).not.toContain('focus:civ-outline-primary');
    expect(input!.className).not.toContain('focus:civ-outline-offset-0');
  });

  it('Home key moves to first option', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    el._activeIndex = 3;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await elementUpdated(el);

    expect(el._activeIndex).toBe(0);
  });

  it('End key moves to last option', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._open = true;
    el._activeIndex = 1;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await elementUpdated(el);

    expect(el._activeIndex).toBe(4); // last option index
  });

  it('Home/End do nothing when listbox is closed', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    expect(el._open).toBe(false);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await elementUpdated(el);
    expect(el._open).toBe(false);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await elementUpdated(el);
    expect(el._open).toBe(false);
  });

  it('Enter does not preventDefault when listbox is closed', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input.dispatchEvent(event);

    // When closed, Enter should NOT be prevented (allows form submission)
    expect(event.defaultPrevented).toBe(false);
  });

  describe('i18n overrides', () => {
    it('uses custom no-results-text', async () => {
      const el = await fixture('<civ-combobox label="State" no-results-text="Sin resultados"></civ-combobox>') as any;
      el.options = STATES;
      await elementUpdated(el);

      const input = el.querySelector('input') as HTMLInputElement;
      input.value = 'ZZZ';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(el);

      const noResults = el.querySelector('[role="status"]');
      expect(noResults).not.toBeNull();
      expect(noResults!.textContent).toContain('Sin resultados');
    });
  });

  describe('analytics', () => {
    it('fires civ-analytics with select action on option pick', async () => {
      const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>') as any;
      el.options = [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
      ];
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      // Simulate selecting an option
      el._selectOption({ value: 'CA', label: 'California' });

      expect(handler).toHaveBeenCalledOnce();
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.componentName).toBe('civ-combobox');
      expect(detail.action).toBe('select');
      expect(detail.fieldName).toBe('state');
    });

    it('suppresses analytics when disable-analytics is set', async () => {
      const el = await fixture('<civ-combobox label="State" name="state" disable-analytics></civ-combobox>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      el._selectOption({ value: 'CA', label: 'California' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('resets to default value on formResetCallback', async () => {
      const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>') as any;
      el.options = STATES;
      el.value = 'NY';
      el._filter = 'New York';
      await elementUpdated(el);

      // Change selection
      el._selectOption({ value: 'CA', label: 'California' });
      await elementUpdated(el);
      expect(el.value).toBe('CA');

      el.formResetCallback();
      await elementUpdated(el);

      expect(el.value).toBe('');
      expect(el._open).toBe(false);
    });

    it('never includes value in analytics payload', async () => {
      const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>') as any;
      el.options = [{ value: 'CA', label: 'California' }];
      await elementUpdated(el);

      const handler = vi.fn();
      el.addEventListener('civ-analytics', handler as EventListener);

      el._selectOption({ value: 'CA', label: 'California' });

      const detail = handler.mock.calls[0][0].detail;
      expect(detail).not.toHaveProperty('value');
    });
  });
});

describe('civ-combobox width variants', () => {
  afterEach(cleanupFixtures);

  it('defaults to civ-w-full on the input and wrapper', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');
    const input = el.querySelector('input')!;
    const wrapper = el.querySelector('[data-civ-combobox]')!;
    expect(input.className).toContain('civ-w-full');
    expect(wrapper.className).toContain('civ-w-full');
  });

  it('applies sm width to input and wrapper so the listbox follows', async () => {
    const el = await fixture('<civ-combobox label="State" width="sm"></civ-combobox>');
    const input = el.querySelector('input')!;
    const wrapper = el.querySelector('[data-civ-combobox]')!;
    expect(input.className).toContain('civ-w-24');
    // Wrapper carries the same width so the listbox (civ-w-full inside)
    // doesn't overflow the visible field.
    expect(wrapper.className).toContain('civ-w-24');
  });

  it('always includes civ-max-w-full', async () => {
    const el = await fixture('<civ-combobox label="State" width="lg"></civ-combobox>');
    const wrapper = el.querySelector('[data-civ-combobox]')!;
    expect(wrapper.className).toContain('civ-max-w-full');
  });
});

describe('civ-combobox chevron toggle', () => {
  afterEach(cleanupFixtures);

  it('renders an always-visible chevron button', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');
    const chevron = el.querySelector('[data-civ-combobox-chevron]');
    expect(chevron).not.toBeNull();
  });

  it('chevron is decorative (aria-hidden, tabindex -1)', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');
    const chevron = el.querySelector('[data-civ-combobox-chevron]')!;
    expect(chevron.getAttribute('aria-hidden')).toBe('true');
    expect(chevron.getAttribute('tabindex')).toBe('-1');
  });

  it('opens the listbox on click and clears any active filter', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el._filter = 'XYZ';
    await elementUpdated(el);
    expect(el._open).toBe(false);

    const chevron = el.querySelector('[data-civ-combobox-chevron]') as HTMLButtonElement;
    chevron.click();
    await elementUpdated(el);

    expect(el._open).toBe(true);
    expect(el._filter).toBe('');
    // Filter cleared → all options visible.
    expect(el.querySelectorAll('[role="option"]').length).toBe(STATES.length);
  });

  it('closes the listbox on second click', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const chevron = el.querySelector('[data-civ-combobox-chevron]') as HTMLButtonElement;
    chevron.click();
    await elementUpdated(el);
    expect(el._open).toBe(true);

    chevron.click();
    await elementUpdated(el);
    expect(el._open).toBe(false);
  });

  it('reflects open state via data-expanded for the rotation hook', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const chevron = el.querySelector('[data-civ-combobox-chevron]') as HTMLButtonElement;
    expect(chevron.hasAttribute('data-expanded')).toBe(false);

    chevron.click();
    await elementUpdated(el);
    expect(chevron.hasAttribute('data-expanded')).toBe(true);
  });

  it('disabled combobox renders a disabled chevron and does not toggle', async () => {
    const el = await fixture('<civ-combobox label="State" disabled></civ-combobox>') as any;
    el.options = STATES;
    await elementUpdated(el);

    const chevron = el.querySelector('[data-civ-combobox-chevron]') as HTMLButtonElement;
    expect(chevron.disabled).toBe(true);

    chevron.click();
    await elementUpdated(el);
    expect(el._open).toBe(false);
  });

  it('coexists with the clear button when a value is selected', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = STATES;
    el.value = 'CA';
    el._filter = 'California';
    await elementUpdated(el);

    expect(el.querySelector('[data-civ-combobox-chevron]')).not.toBeNull();
    expect(el.querySelector('.civ-close-btn')).not.toBeNull();
  });
});

describe('civ-combobox async loadOptions', () => {
  afterEach(cleanupFixtures);

  /**
   * Resolve once both the debounce timeout AND the microtask queue
   * have drained. The debounce uses setTimeout, but the loader is
   * `async` and queues a microtask before its first `await`, so a
   * single `setTimeout` resolution leaves the loading-state assignment
   * unobserved on slow CI runners.
   *
   * We bump the buffer to 50ms (was 10ms) because under parallel turbo
   * runs the macrotask queue can stall longer than 10ms — the test
   * was occasionally flaking when `setTimeout(fn, ms+10)` returned
   * before `_runLoad`'s `_loading = true` had been observed. Then we
   * pump several microtasks to flush the chain of `await`s inside
   * `_runLoad` (loader call, render, updateComplete).
   */
  const flushDebounce = async (ms: number) => {
    await new Promise((r) => setTimeout(r, ms + 50));
    for (let i = 0; i < 4; i++) await Promise.resolve();
  };

  it('calls loadOptions with the typed query (debounced)', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="50"></civ-combobox>') as any;
    const loader = vi.fn(async () => [{ value: 'a', label: 'Alpha' }]);
    el.loadOptions = loader;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'al';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(loader).not.toHaveBeenCalled(); // not yet — debounce pending
    await flushDebounce(50);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledWith('al');
  });

  it('shows the loading state while a fetch is in flight', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="0"></civ-combobox>') as any;
    let resolve!: (v: any) => void;
    const pending = new Promise<any>((r) => { resolve = r; });
    el.loadOptions = () => pending;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);
    await elementUpdated(el);

    expect(el._loading).toBe(true);
    const status = el.querySelector('[role="status"]');
    expect(status?.textContent?.trim()).toContain('Loading');

    resolve([{ value: 'a', label: 'Alpha' }]);
    await pending;
    await elementUpdated(el);

    expect(el._loading).toBe(false);
    expect(el.querySelectorAll('.civ-combobox-option').length).toBe(1);
  });

  it('discards stale responses when a newer query arrives mid-flight', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="0"></civ-combobox>') as any;
    let resolveOld!: (v: any) => void;
    let resolveNew!: (v: any) => void;
    const pendingOld = new Promise<any>((r) => { resolveOld = r; });
    const pendingNew = new Promise<any>((r) => { resolveNew = r; });
    let call = 0;
    el.loadOptions = () => {
      call++;
      return call === 1 ? pendingOld : pendingNew;
    };
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'al';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);

    input.value = 'alp';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);

    // Resolve the NEWER call first, then the stale one.
    resolveNew([{ value: 'alp', label: 'Alpha' }]);
    await pendingNew;
    await elementUpdated(el);
    await new Promise(r => setTimeout(r, 10));

    // Now resolve the stale response — it should be discarded.
    resolveOld([{ value: 'al', label: 'Stale' }]);
    await pendingOld;
    await elementUpdated(el);
    await new Promise(r => setTimeout(r, 10));

    const labels = Array.from(el.querySelectorAll('.civ-combobox-option')).map((o: any) => o.textContent.trim());
    expect(labels).toEqual(['Alpha']);
  });

  it('shows the error state when loadOptions rejects', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="0"></civ-combobox>') as any;
    el.loadOptions = async () => { throw new Error('Network down'); };
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);
    // wait two microtasks for the rejection to settle
    await Promise.resolve();
    await Promise.resolve();
    await elementUpdated(el);

    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert!.textContent?.trim()).toContain('Network down');
  });

  it('shows the type-to-search prompt when below min-query-length', async () => {
    const el = await fixture('<civ-combobox label="Office" min-query-length="3" load-debounce="0"></civ-combobox>') as any;
    const loader = vi.fn(async () => []);
    el.loadOptions = loader;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'al';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);
    await elementUpdated(el);

    expect(loader).not.toHaveBeenCalled();
    const status = el.querySelector('[role="status"]');
    expect(status?.textContent?.trim()).toContain('at least 3');
  });

  it('triggers a fetch when the user crosses min-query-length', async () => {
    const el = await fixture('<civ-combobox label="Office" min-query-length="2" load-debounce="0"></civ-combobox>') as any;
    const loader = vi.fn(async () => [{ value: 'a', label: 'Alpha' }]);
    el.loadOptions = loader;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);
    expect(loader).not.toHaveBeenCalled();

    input.value = 'al';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);
    expect(loader).toHaveBeenCalledWith('al');
  });

  it('does not call loadOptions for static `options` mode', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>') as any;
    el.options = [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'cal';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    // Local filtering still works — California should appear.
    const opts = el.querySelectorAll('.civ-combobox-option');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain('California');
  });

  it('chevron click triggers an immediate empty-query fetch in remote mode', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="500"></civ-combobox>') as any;
    const loader = vi.fn(async () => [{ value: 'a', label: 'Alpha' }]);
    el.loadOptions = loader;
    await elementUpdated(el);

    const chevron = el.querySelector('[data-civ-combobox-chevron]') as HTMLButtonElement;
    chevron.click();
    // No need to wait for the 500ms debounce — chevron uses immediate path.
    await Promise.resolve();
    await Promise.resolve();
    await elementUpdated(el);

    expect(loader).toHaveBeenCalledWith('');
  });

  it('clear resets remote loading + results state', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="0"></civ-combobox>') as any;
    el.loadOptions = async () => [{ value: 'a', label: 'Alpha' }];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushDebounce(0);
    await Promise.resolve();
    await Promise.resolve();
    await elementUpdated(el);

    // Select the result so the clear button appears.
    (el.querySelector('.civ-combobox-option') as HTMLElement).click();
    await elementUpdated(el);
    expect(el.value).toBe('a');

    (el.querySelector('.civ-close-btn') as HTMLButtonElement).click();
    // Assert state synchronously — the post-clear re-focus would trigger an
    // immediate re-fetch which would repopulate _remoteOptions before any
    // microtask flush.
    expect(el.value).toBe('');
    expect(el._remoteOptions).toEqual([]);
    expect(el._loadError).toBe('');
  });

  it('focus triggers an initial fetch in remote mode when options are empty', async () => {
    const el = await fixture('<civ-combobox label="Office" load-debounce="0"></civ-combobox>') as any;
    const loader = vi.fn(async () => [{ value: 'a', label: 'Alpha' }]);
    el.loadOptions = loader;
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    await Promise.resolve();
    await Promise.resolve();
    await elementUpdated(el);

    expect(loader).toHaveBeenCalledWith('');
  });

  it('wires hint and error IDs into aria-describedby when chrome is set', async () => {
    const el = await fixture(
      '<civ-combobox label="State" hint="Type to filter" error="Required" name="state"></civ-combobox>',
    );
    const input = el.querySelector('input')!;
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(' ');
    expect(ids.length).toBe(2);
    for (const id of ids) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});

describe('civ-combobox — digit-aware filter (time-picker affordance)', () => {
  it('matches by digit-only filter against digit-stripped label', async () => {
    const el = await fixture(`
      <civ-combobox label="Time">
      </civ-combobox>
    `) as any;
    el.options = [
      { value: '02:30', label: '2:30 AM' },
      { value: '14:30', label: '2:30 PM' },
      { value: '09:00', label: '9:00 AM' },
    ];
    await elementUpdated(el);

    // The user types "230" — no colon, no space. Both 2:30 AM and 2:30 PM
    // should match because their digit-only forms are "230am" and "230pm".
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = '230';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    const visible = el.querySelectorAll('.civ-combobox-option');
    const labels = Array.from(visible).map((n: any) => n.textContent.trim());
    expect(labels).toEqual(expect.arrayContaining(['2:30 AM', '2:30 PM']));
    expect(labels).not.toContain('9:00 AM');
  });

  it('still matches by full label substring (existing behavior preserved)', async () => {
    const el = await fixture(`
      <civ-combobox label="Time"></civ-combobox>
    `) as any;
    el.options = [
      { value: '02:30', label: '2:30 AM' },
      { value: '14:30', label: '2:30 PM' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = '2:30';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    expect(el.querySelectorAll('.civ-combobox-option').length).toBe(2);
  });

  it('does NOT fall back to digit-stripped match for pure-letter input', async () => {
    // Typing "AM" should NOT match every morning slot's compact form
    // "1200am" / "100am" / etc. Letter-only filters are full-label only.
    const el = await fixture(`
      <civ-combobox label="Time"></civ-combobox>
    `) as any;
    el.options = [
      { value: '08:00', label: '8:00 AM' },
      { value: '20:00', label: '8:00 PM' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'am';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    // Full-label substring match wins — "am" matches "8:00 am" but
    // not "8:00 pm".
    const labels = Array.from(el.querySelectorAll('.civ-combobox-option')).map((n: any) => n.textContent.trim());
    expect(labels).toEqual(['8:00 AM']);
  });
});

describe('civ-combobox — blur reconciliation', () => {
  it('clears the typed filter on blur when no option is selected', async () => {
    const el = await fixture(`
      <civ-combobox label="Pick"></civ-combobox>
    `) as any;
    el.options = [
      { value: 'a', label: 'Apple' },
      { value: 'b', label: 'Banana' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'zzz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    // Form value is empty, but display still shows the typed text.
    expect(el.value).toBe('');
    expect(input.value).toBe('zzz');

    // Blur — focus moves outside the wrapper.
    input.dispatchEvent(new Event('blur'));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await elementUpdated(el);

    // Now the display is cleared.
    expect(input.value).toBe('');
  });

  it('snaps back to the selected option label on blur', async () => {
    const el = await fixture(`
      <civ-combobox label="Pick" value="a"></civ-combobox>
    `) as any;
    el.options = [
      { value: 'a', label: 'Apple' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    // User mid-typing alters the display.
    input.value = 'Banan';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(el);

    // Filter cleared the value (typing started fresh).
    expect(el.value).toBe('');

    // Re-select via JS to simulate a state where value still matches a known option.
    el.value = 'a';
    await elementUpdated(el);

    input.dispatchEvent(new Event('blur'));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await elementUpdated(el);

    expect(input.value).toBe('Apple');
  });
});

describe('civ-combobox — Tab commits the highlighted option', () => {
  it('selects the active option when Tab is pressed with the listbox open', async () => {
    const el = await fixture(`
      <civ-combobox label="Pick"></civ-combobox>
    `) as any;
    el.options = [
      { value: 'a', label: 'Apple' },
      { value: 'b', label: 'Banana' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    input.focus();
    // Open the listbox via ArrowDown.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);
    // Advance to the second option.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await elementUpdated(el);

    // Tab away — should commit 'b' (Banana), not silently discard.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe('b');
    expect(input.value).toBe('Banana');
  });

  it('Tab without an active option just closes the listbox (no change)', async () => {
    const el = await fixture(`
      <civ-combobox label="Pick"></civ-combobox>
    `) as any;
    el.options = [
      { value: 'a', label: 'Apple' },
    ];
    await elementUpdated(el);

    const input = el.querySelector('input') as HTMLInputElement;
    // Tab with listbox closed — no-op.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe('');
  });
});

describe('civ-combobox — inputmode prop', () => {
  it('omits the inputmode attribute when unset (browser default)', async () => {
    const el = await fixture(`<civ-combobox label="Pick"></civ-combobox>`) as any;
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.hasAttribute('inputmode')).toBe(false);
  });

  it('forwards inputmode="numeric" to the inner input', async () => {
    const el = await fixture(`<civ-combobox label="Pick" inputmode="numeric"></civ-combobox>`) as any;
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });
});
