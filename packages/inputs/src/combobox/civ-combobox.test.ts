import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-combobox.js';

const STATES = [
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

afterEach(cleanupFixtures);

describe('civ-combobox', () => {
  it('renders with a label', async () => {
    const el = await fixture('<civ-combobox label="State"></civ-combobox>');

    const label = el.querySelector('label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain('State');
  });

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

  it('renders error with alert role', async () => {
    const el = await fixture('<civ-combobox label="State" error="Required"></civ-combobox>');

    const errorEl = el.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
  });

  it('sets aria-invalid when error is present', async () => {
    const el = await fixture('<civ-combobox label="State" error="Bad"></civ-combobox>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows required indicator', async () => {
    const el = await fixture('<civ-combobox label="State" required></civ-combobox>');

    const requiredMark = el.querySelector('.civ-required-mark');
    expect(requiredMark).not.toBeNull();
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

  it('sets aria-required when required', async () => {
    const el = await fixture('<civ-combobox label="State" required></civ-combobox>');

    const input = el.querySelector('input');
    expect(input!.getAttribute('aria-required')).toBe('true');
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
    expect(label!.id).toBe(labelledBy);
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

  it('applies focus-visible ring class', async () => {
    const el = await fixture('<civ-combobox label="State" name="state"></civ-combobox>') as any;
    el.options = [{ value: 'CA', label: 'California' }];
    await elementUpdated(el);

    const input = el.querySelector('input');
    expect(input!.className).toContain('focus-visible:civ-focus-ring');
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
    expect(el.querySelector('.civ-clear-btn')).not.toBeNull();
  });
});

describe('civ-combobox async loadOptions', () => {
  afterEach(cleanupFixtures);

  /** Resolve once a microtask flush + the requested debounce timeout passes. */
  const flushDebounce = async (ms: number) => {
    await new Promise((r) => setTimeout(r, ms + 10));
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

    // Resolve the OLDER call last — its result must be discarded.
    resolveNew([{ value: 'alp', label: 'Alpha' }]);
    await pendingNew;
    resolveOld([{ value: 'al', label: 'Stale' }]);
    await pendingOld;
    await elementUpdated(el);

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

    (el.querySelector('.civ-clear-btn') as HTMLButtonElement).click();
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
});
